const PRICE_CATALOG = require('../data/priceCatalog');

const CACHE_TTL_MS = Number(process.env.PRICE_CACHE_MS || 1000 * 60 * 60 * 6);
const COUNTRY_CODE = (process.env.ITAD_COUNTRY || 'IN').toUpperCase();
const ITAD_API_KEY = process.env.ITAD_API_KEY || '';
const ITAD_BASE = 'https://api.isthereanydeal.com';
const cache = new Map();
let intervalStarted = false;

function withAuth(url) {
  const finalUrl = new URL(url);
  if (ITAD_API_KEY) {
    finalUrl.searchParams.set('key', ITAD_API_KEY);
  }
  const headers = { 'Content-Type': 'application/json' };
  if (ITAD_API_KEY) {
    headers['X-API-Key'] = ITAD_API_KEY;
    headers.Authorization = `Bearer ${ITAD_API_KEY}`;
  }
  return { url: finalUrl.toString(), headers };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

function formatMoney(price) {
  if (!price || typeof price.amount !== 'number') return null;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: price.currency || 'USD',
      maximumFractionDigits: 2
    }).format(price.amount);
  } catch (_) {
    return `${price.currency || 'USD'} ${price.amount}`;
  }
}

function buildFallbackSnapshot(slug, extra = {}) {
  const meta = PRICE_CATALOG[slug];
  if (!meta || !meta.paid) {
    return {
      supported: false,
      live: false,
      message: 'Live price tracking is only shown for paid licensed games.',
      stores: [],
      lastUpdated: new Date().toISOString(),
      ...extra
    };
  }

  return {
    supported: true,
    live: false,
    message: 'Store links are ready. Add ITAD_API_KEY in backend/.env to pull live prices automatically.',
    source: 'Store links fallback',
    bestDeal: null,
    historicalLow: null,
    stores: meta.stores.map((store) => ({
      store: store.label,
      currentPrice: null,
      regularPrice: null,
      cut: null,
      url: store.url,
      note: 'Live price unavailable until the API key is configured.'
    })),
    lastUpdated: new Date().toISOString(),
    ...extra
  };
}

async function lookupGameId(title) {
  const request = withAuth(`${ITAD_BASE}/lookup/id/title/v1`);
  const payload = await fetchJson(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify([title])
  });
  return payload?.[title] || null;
}

function mapDealEntry(entry) {
  if (!entry?.shop?.name) return null;
  return {
    store: entry.shop.name,
    currentPrice: formatMoney(entry.price),
    regularPrice: formatMoney(entry.regular),
    cut: typeof entry.cut === 'number' ? entry.cut : null,
    url: entry.url || null,
    isBestCurrent: false,
    isHistoricalLow: false,
    note: entry.voucher ? `Voucher: ${entry.voucher}` : null
  };
}

async function fetchOverview(id) {
  const request = withAuth(`${ITAD_BASE}/games/overview/v2?country=${COUNTRY_CODE}&vouchers=true`);
  const payload = await fetchJson(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify([id])
  });
  return Array.isArray(payload?.prices) ? payload.prices.find((item) => item.id === id) || payload.prices[0] : null;
}

async function fetchDeals(id) {
  const request = withAuth(`${ITAD_BASE}/games/prices/v3?country=${COUNTRY_CODE}&vouchers=true&capacity=6`);
  const payload = await fetchJson(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify([id])
  });
  return Array.isArray(payload) ? payload.find((item) => item.id === id) || payload[0] : null;
}

async function pullLiveSnapshot(slug) {
  const meta = PRICE_CATALOG[slug];
  if (!meta || !meta.paid) {
    return buildFallbackSnapshot(slug);
  }
  if (!ITAD_API_KEY) {
    return buildFallbackSnapshot(slug);
  }

  const gameId = await lookupGameId(meta.title);
  if (!gameId) {
    return buildFallbackSnapshot(slug, { message: 'Could not match this title in the live price provider yet.' });
  }

  const [overview, dealsPayload] = await Promise.all([
    fetchOverview(gameId),
    fetchDeals(gameId)
  ]);

  const storeMap = new Map();
  const currentDeal = overview?.current || null;
  const historicalLow = overview?.lowest || null;

  const currentEntry = mapDealEntry(currentDeal);
  if (currentEntry) {
    currentEntry.isBestCurrent = true;
    storeMap.set(currentEntry.store, currentEntry);
  }

  (dealsPayload?.deals || []).forEach((deal) => {
    const mapped = mapDealEntry(deal);
    if (!mapped) return;
    const existing = storeMap.get(mapped.store);
    if (!existing) {
      storeMap.set(mapped.store, mapped);
      return;
    }
    if (existing.currentPrice === null && mapped.currentPrice !== null) {
      storeMap.set(mapped.store, { ...existing, ...mapped });
    }
  });

  if (historicalLow?.shop?.name) {
    const historicalStore = historicalLow.shop.name;
    const existing = storeMap.get(historicalStore) || { store: historicalStore, url: null };
    storeMap.set(historicalStore, {
      ...existing,
      historicalLow: formatMoney(historicalLow.price),
      historicalLowCut: typeof historicalLow.cut === 'number' ? historicalLow.cut : null,
      historicalLowAt: historicalLow.timestamp || null,
      isHistoricalLow: true
    });
  }

  const stores = Array.from(storeMap.values())
    .sort((a, b) => (b.isBestCurrent === true) - (a.isBestCurrent === true) || (b.cut || 0) - (a.cut || 0))
    .slice(0, 6);

  return {
    supported: true,
    live: true,
    source: 'IsThereAnyDeal API',
    message: 'Live legal deal data loaded from the configured price provider.',
    bestDeal: currentDeal ? {
      store: currentDeal.shop?.name || null,
      currentPrice: formatMoney(currentDeal.price),
      regularPrice: formatMoney(currentDeal.regular),
      cut: typeof currentDeal.cut === 'number' ? currentDeal.cut : null,
      url: currentDeal.url || overview?.urls?.game || null
    } : null,
    historicalLow: historicalLow ? {
      store: historicalLow.shop?.name || null,
      price: formatMoney(historicalLow.price),
      regularPrice: formatMoney(historicalLow.regular),
      cut: typeof historicalLow.cut === 'number' ? historicalLow.cut : null,
      timestamp: historicalLow.timestamp || null
    } : null,
    stores,
    lastUpdated: new Date().toISOString(),
    titleMatched: meta.title,
    country: COUNTRY_CODE
  };
}

async function getPriceSnapshot(slug, { forceRefresh = false } = {}) {
  const cached = cache.get(slug);
  if (!forceRefresh && cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const data = await pullLiveSnapshot(slug);
    cache.set(slug, { cachedAt: Date.now(), data });
    return data;
  } catch (error) {
    const fallback = buildFallbackSnapshot(slug, {
      message: 'Price tracker could not refresh right now. Store links are still available below.',
      error: error.message
    });
    cache.set(slug, { cachedAt: Date.now(), data: fallback });
    return fallback;
  }
}

function startPriceRefreshLoop() {
  if (intervalStarted) return;
  intervalStarted = true;
  setInterval(() => {
    Object.keys(PRICE_CATALOG).forEach((slug) => {
      if (PRICE_CATALOG[slug]?.paid) {
        getPriceSnapshot(slug, { forceRefresh: true }).catch(() => {});
      }
    });
  }, CACHE_TTL_MS).unref();
}

module.exports = {
  getPriceSnapshot,
  startPriceRefreshLoop,
  PRICE_CATALOG
};
