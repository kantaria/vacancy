// routes/scrapingRoutes.js
const express = require('express');
const router = express.Router();

router.get('/api/start-scraping', (req, res) => {
  console.log('Scraping started...');
  res.send('Scraping started...');
});

module.exports = router;