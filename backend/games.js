const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');
const DownloadToken = require('../models/DownloadToken');
const { authMiddleware } = require('./auth');
const fs = require('fs');
const path = require('path');

// configure multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname,'..','uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Create game (admin only)
router.post('/', authMiddleware, upload.fields([{name:'images'},{name:'gameFile'}]), async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Admin only');
  const { title, description, genre, release, platform, trailer, fileSize } = req.body;
  const slug = title.toLowerCase().replace(/\s+/g,'-');
  const images = (req.files['images']||[]).map(f=>`/uploads/${path.basename(f.path)}`);
  const gameFile = req.files['gameFile'] && req.files['gameFile'][0] ? `/uploads/${path.basename(req.files['gameFile'][0].path)}` : '';
  const g = new Game({ title, slug, description, genre, release, platform, trailer, fileSize, images, storagePath: gameFile});
  await g.save();
  res.json(g);
});

// List games
router.get('/', async (req,res)=> {
  const q = req.query.q;
  const filter = q ? { title: new RegExp(q,'i') } : {};
  const games = await Game.find(filter);
  res.json(games);
});

// Get single
router.get('/:slug', async (req,res)=> {
  const g = await Game.findOne({ slug: req.params.slug });
  if (!g) return res.status(404).send('Not found');
  res.json(g);
});

// Generate secure download token (protected)
router.post('/:id/generate-download', authMiddleware, async (req,res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).send('Not found');
  const token = uuidv4();
  const expires = new Date(Date.now() + 1000*60*60*24); // 24h
  await new DownloadToken({ game: game._id, token, expiresAt: expires }).save();
  // return a link to /api/games/download/:token
  res.json({ url: `${process.env.CLIENT_URL}/api/games/download/${token}` });
});

// Download handler (no auth) - checks token
router.get('/download/:token', async (req,res) => {
  const t = await DownloadToken.findOne({ token: req.params.token });
  if(!t || t.expiresAt < new Date()) return res.status(410).send('Token expired or invalid');
  const game = await Game.findById(t.game);
  if (!game || !game.storagePath) return res.status(404).send('Game file missing');
  // increment downloads
  game.downloads = (game.downloads||0)+1; await game.save();
  const filePath = path.join(__dirname,'..', game.storagePath.replace('/uploads/','uploads/'));
  res.download(filePath, (err)=> {
    if (err) console.error(err);
  });
});

module.exports = router;
const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  title: String,
  description: String,
  genre: String,
  fileSize: String,
  systemRequirements: Object,
  trailer: String,
  images: [String]
});

module.exports = mongoose.model("Game", GameSchema);
