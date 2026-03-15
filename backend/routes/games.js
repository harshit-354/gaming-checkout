const express = require('express');
const Game = require('../models/Game');
const seedGames = require('../data/seedGames');
const { LAPTOP_LIBRARY, CPU_SCORES, GPU_SCORES, estimatePerformance } = require('../utils/hardware');
const { getPriceSnapshot } = require('../utils/priceTracker');

const router = express.Router();

function withFallback(games) {
  return games?.length ? games : seedGames;
}

router.get('/', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const games = withFallback(await Game.find().lean());
  const filtered = !query
    ? games
    : games.filter((game) => {
        const text = `${game.title} ${(game.genres || []).join(' ')} ${game.heroTag || ''}`.toLowerCase();
        return text.includes(query);
      });

  res.json(filtered);
});

router.get('/hardware/library', (req, res) => {
  res.json({ laptops: LAPTOP_LIBRARY, cpuScores: CPU_SCORES, gpuScores: GPU_SCORES });
});


router.get('/:slug/prices', async (req, res) => {
  const snapshot = await getPriceSnapshot(req.params.slug, {
    forceRefresh: req.query.refresh === '1'
  });

  if (!snapshot.supported) {
    return res.status(200).json(snapshot);
  }

  res.json(snapshot);
});

router.get('/:slug', async (req, res) => {
  const dbGame = await Game.findOne({ slug: req.params.slug }).lean();
  const game = dbGame || seedGames.find((item) => item.slug === req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }

  res.json(game);
});

router.post('/:slug/compatibility', async (req, res) => {
  const dbGame = await Game.findOne({ slug: req.params.slug }).lean();
  const game = dbGame || seedGames.find((item) => item.slug === req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }

  let hardware = req.body;
  if (req.body.laptop) {
    const laptop = LAPTOP_LIBRARY.find((item) => item.model.toLowerCase() === req.body.laptop.trim().toLowerCase());
    if (laptop) {
      hardware = laptop;
    }
  }

  const result = estimatePerformance(game, hardware);
  res.json(result);
});

module.exports = router;
