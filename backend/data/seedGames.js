const games = [
  {
    slug: 'assassins-creed',
    title: "Assassin's Creed",
    year: 2007,
    genres: ['Action-Adventure', 'Stealth', 'Parkour'],
    heroTag: 'Become the blade in a crowded ancient world.',
    description: 'A stealth-focused historical action game with strong atmosphere and social stealth systems.',
    structuredRatings: { story: 8.2, gameplay: 8.0, graphics: 7.6, optimization: 8.8, replayability: 7.4 },
    bugStatus: { label: 'Stable', note: 'Runs reliably on most systems.' },
    valueRating: { score: 8.5, advice: 'Strong value for stealth fans.' },
    playerTypes: { bestFor: ['Story lovers', 'Stealth players'], notIdealFor: ['Competitive players'] },
    timeCommitment: { mainStory: '15 hours', mainPlusSide: '22 hours', completionist: '31 hours' },
    requirements: {
      minimum: { cpuScore: 24, gpuScore: 22, ram: 4 },
      recommended: { cpuScore: 45, gpuScore: 42, ram: 8 }
    }
  },
  {
    slug: 'dishonored',
    title: 'Dishonored',
    year: 2012,
    genres: ['Stealth', 'Immersive Sim', 'Action'],
    heroTag: 'Supernatural stealth with creative freedom in every mission.',
    description: 'An immersive stealth game that rewards player choice.',
    structuredRatings: { story: 8.7, gameplay: 9.2, graphics: 8.1, optimization: 8.4, replayability: 9.0 },
    bugStatus: { label: 'Minor Bugs', note: 'Mostly stable with occasional stutter on older hardware.' },
    valueRating: { score: 9.1, advice: 'Excellent value with deep replayability.' },
    playerTypes: { bestFor: ['Stealth players', 'Replay-focused players'], notIdealFor: ['Players wanting only open-world exploration'] },
    timeCommitment: { mainStory: '12 hours', mainPlusSide: '18 hours', completionist: '28 hours' },
    requirements: {
      minimum: { cpuScore: 30, gpuScore: 28, ram: 4 },
      recommended: { cpuScore: 48, gpuScore: 46, ram: 8 }
    }
  },
  {
    slug: 'watch-dogs-2',
    title: 'Watch Dogs 2',
    year: 2016,
    genres: ['Open World', 'Hacking', 'Action'],
    heroTag: 'Hack the city and improvise every mission.',
    description: 'A lively sandbox with hacking mechanics and modern city exploration.',
    structuredRatings: { story: 7.8, gameplay: 8.8, graphics: 8.6, optimization: 7.2, replayability: 8.3 },
    bugStatus: { label: 'Minor Bugs', note: 'Can show streaming stutter in busier districts.' },
    valueRating: { score: 8.4, advice: 'Worth buying if you enjoy modern sandbox games.' },
    playerTypes: { bestFor: ['Open-world players', 'Experimenters'], notIdealFor: ['Players wanting linear campaigns only'] },
    timeCommitment: { mainStory: '19 hours', mainPlusSide: '31 hours', completionist: '47 hours' },
    requirements: {
      minimum: { cpuScore: 44, gpuScore: 38, ram: 8 },
      recommended: { cpuScore: 62, gpuScore: 56, ram: 16 }
    }
  },
  {
    slug: 'darksiders-2',
    title: 'Darksiders 2',
    year: 2012,
    genres: ['Action RPG', 'Hack and Slash', 'Adventure'],
    heroTag: 'Fast combat, dungeon puzzles, and fantasy scale.',
    description: 'A fantasy action-adventure with loot, dungeons, and stylish combat.',
    structuredRatings: { story: 7.9, gameplay: 8.4, graphics: 7.8, optimization: 8.7, replayability: 8.1 },
    bugStatus: { label: 'Stable', note: 'Generally stable on modern hardware.' },
    valueRating: { score: 8.8, advice: 'A very good buy for action-adventure fans.' },
    playerTypes: { bestFor: ['Action fans', 'Single-player players'], notIdealFor: ['Competitive players'] },
    timeCommitment: { mainStory: '21 hours', mainPlusSide: '28 hours', completionist: '40 hours' },
    requirements: {
      minimum: { cpuScore: 28, gpuScore: 24, ram: 4 },
      recommended: { cpuScore: 46, gpuScore: 40, ram: 8 }
    }
  },
  {
    slug: 'call-of-duty-modern-warfare',
    title: 'Call of Duty: Modern Warfare',
    year: 2019,
    genres: ['FPS', 'Action', 'Military'],
    heroTag: 'Cinematic gunplay with demanding modern visuals.',
    description: 'A polished shooter campaign with strong presentation and demanding hardware needs.',
    structuredRatings: { story: 7.5, gameplay: 9.0, graphics: 9.1, optimization: 7.0, replayability: 7.8 },
    bugStatus: { label: 'Minor Bugs', note: 'Patches can occasionally disrupt consistency.' },
    valueRating: { score: 7.3, advice: 'Best bought when discounted unless you specifically want the campaign.' },
    playerTypes: { bestFor: ['Shooter fans', 'Cinematic campaign players'], notIdealFor: ['Story-first exploration players'] },
    timeCommitment: { mainStory: '7 hours', mainPlusSide: '10 hours', completionist: '15 hours' },
    requirements: {
      minimum: { cpuScore: 46, gpuScore: 40, ram: 8 },
      recommended: { cpuScore: 70, gpuScore: 62, ram: 16 }
    }
  }
];

module.exports = games;
