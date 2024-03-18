// routes/scrapingRoutes.js
const express = require('express');
const router = express.Router();
const { VacancyLinksGathering_01 } = require('../services/VacancyLinksGathering_01');


router.get('/api/start-scraping', (req, res) => {
  const {
    searchQueries
  } = req.body;

  if (!searchQueries || !Array.isArray(searchQueries) || searchQueries.length === 0) {
    return res.status(400).send('Неверный формат данных. Ожидается массив запросов.');
  }
  try {
    res.json({
      message: 'Запускаем процессы для переданных запросов'
    });
    // Запускаем вызов функции, которая будет отправлять запросы на поиск вакансий из массива searchQueries
    VacancyLinksGathering_01(searchQueries)
  } catch (error) {
    console.error('Ошибка при запуске процессов:', error);
    res.status(500).send('Произошла ошибка при запуске процессов.', error); // И здесь та же проблема, если произойдет ошибка
  }
});

module.exports = router;