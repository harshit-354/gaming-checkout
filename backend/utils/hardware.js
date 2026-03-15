const CPU_SCORES = {
  'Intel Core i5-10300H': 44,
  'Intel Core i5-11260H': 52,
  'Intel Core i5-12500H': 74,
  'Intel Core i7-13650HX': 96,
  'AMD Ryzen 5 5600H': 58,
  'AMD Ryzen 7 5800H': 76,
  'AMD Ryzen 7 6800H': 82,
  'Intel Core i3-10100F': 40,
  'Intel Core i5-10400F': 48,
  'Intel Core i5-12400F': 78,
  'AMD Ryzen 5 3600': 56,
  'AMD Ryzen 5 5600': 72,
  'AMD Ryzen 7 5700X': 84
};

const GPU_SCORES = {
  'NVIDIA GTX 1650': 38,
  'NVIDIA RTX 3050': 58,
  'NVIDIA RTX 3060': 72,
  'NVIDIA RTX 4060': 90,
  'AMD RX 570': 36,
  'AMD RX 6600': 64,
  'AMD RX 7600': 86,
  'Intel UHD Graphics': 12
};

const LAPTOP_LIBRARY = [
  { model: 'Acer Nitro 5 GTX 1650 8GB', cpu: 'Intel Core i5-10300H', gpu: 'NVIDIA GTX 1650', ram: 8 },
  { model: 'Acer Nitro 5 RTX 3050 16GB', cpu: 'Intel Core i5-12500H', gpu: 'NVIDIA RTX 3050', ram: 16 },
  { model: 'ASUS TUF A15 RTX 3050 16GB', cpu: 'AMD Ryzen 7 6800H', gpu: 'NVIDIA RTX 3050', ram: 16 },
  { model: 'HP Victus GTX 1650 8GB', cpu: 'AMD Ryzen 5 5600H', gpu: 'NVIDIA GTX 1650', ram: 8 },
  { model: 'Lenovo Legion 5 RTX 3060 16GB', cpu: 'AMD Ryzen 7 5800H', gpu: 'NVIDIA RTX 3060', ram: 16 },
  { model: 'Dell G15 RTX 3050 16GB', cpu: 'Intel Core i5-11260H', gpu: 'NVIDIA RTX 3050', ram: 16 },
  { model: 'MSI GF63 GTX 1650 8GB', cpu: 'Intel Core i5-11400H', gpu: 'NVIDIA GTX 1650', ram: 8 },
  { model: 'ASUS ROG Strix RTX 4060 16GB', cpu: 'Intel Core i7-13650HX', gpu: 'NVIDIA RTX 4060', ram: 16 }
];

function scoreToGrade(ratio) {
  if (ratio >= 1.15) return { grade: 'Excellent', tone: 'good' };
  if (ratio >= 0.95) return { grade: 'Good', tone: 'good' };
  if (ratio >= 0.8) return { grade: 'Playable', tone: 'warn' };
  return { grade: 'Poor', tone: 'bad' };
}

function estimatePerformance(game, hardware) {
  const cpuScore = CPU_SCORES[hardware.cpu] || Number(hardware.cpuScore) || 30;
  const gpuScore = GPU_SCORES[hardware.gpu] || Number(hardware.gpuScore) || 25;
  const ram = Number(hardware.ram) || 8;

  const cpuRatio = cpuScore / game.requirements.recommended.cpuScore;
  const gpuRatio = gpuScore / game.requirements.recommended.gpuScore;
  const ramRatio = ram / game.requirements.recommended.ram;
  const overall = (cpuRatio * 0.35) + (gpuRatio * 0.45) + (ramRatio * 0.2);
  const status = scoreToGrade(overall);

  const low = Math.max(20, Math.round(30 + overall * 35));
  const medium = Math.max(18, Math.round(low * 0.8));
  const high = Math.max(15, Math.round(low * 0.65));

  return {
    canRun:
      cpuScore < game.requirements.minimum.cpuScore ||
      gpuScore < game.requirements.minimum.gpuScore ||
      ram < game.requirements.minimum.ram
        ? 'Possibly, but one or more components are below minimum'
        : 'Yes',
    performance: status.grade,
    tone: status.tone,
    recommendedPreset: overall >= 1.05 ? 'High' : overall >= 0.85 ? 'Medium' : 'Low',
    fps: {
      low: `${low}-${low + 10} FPS`,
      medium: `${medium}-${medium + 8} FPS`,
      high: `${high}-${high + 7} FPS`
    },
    warning: ram < game.requirements.recommended.ram
      ? `${ram} GB RAM may cause stutter in heavier areas.`
      : 'No major bottleneck detected.'
  };
}

module.exports = {
  CPU_SCORES,
  GPU_SCORES,
  LAPTOP_LIBRARY,
  estimatePerformance
};
