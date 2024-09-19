const express = require('express');
const path = require('path');
const { getTradingSignals } = require('./bot');

const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// API endpoint for trading signals
app.get('/api/signals', async (req, res) => {
  try {
    const signals = await getTradingSignals();
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trading signals' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
