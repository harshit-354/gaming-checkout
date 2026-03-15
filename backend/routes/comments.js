const express = require('express');
const Game = require('../models/Game');
const seedGames = require('../data/seedGames');

const router = express.Router();

router.get('/:slug', async (req, res) => {
  const game = await Game.findOne({ slug: req.params.slug }).lean();
  if (!game) {
    const seeded = seedGames.find((item) => item.slug === req.params.slug);
    return res.json(seeded?.comments || []);
  }

  res.json((game.comments || []).slice().reverse());
});

router.post('/:slug', async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ message: 'Username and message are required.' });
  }

  const game = await Game.findOne({ slug: req.params.slug });
  if (!game) {
    return res.status(201).json({ username, message, createdAt: new Date() });
  }

  const comment = { username, message, createdAt: new Date() };
  game.comments.unshift(comment);
  await game.save();

  res.status(201).json(comment);
});

module.exports = router;
