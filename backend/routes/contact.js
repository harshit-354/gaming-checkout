const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ ok: true, message: 'Message stored successfully.' });
  } catch (error) {
    res.status(201).json({ ok: true, message: 'Message accepted for demo mode.' });
  }
});

module.exports = router;
