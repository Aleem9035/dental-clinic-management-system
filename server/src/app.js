require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// health check (used by Render)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ success: false, status: 'error', database: 'disconnected' });
  }
});

app.use('/api/doctors', require('./routes/doctors'));

// unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;