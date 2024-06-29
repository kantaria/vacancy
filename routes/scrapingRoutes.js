// routes/scrapingRoutes.js
const express = require('express');
const router = express.Router();
const { VacancyLinksGathering_01 } = require('../services/VacancyLinksGathering_01');
const task_08_AddDatabaseToGoogleSheet = require('../task/task_08_AddDatabaseToGoogleSheet');
const Vacancy = require('../models/vacancy');

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

router.post('/api/vacancies', async (req, res) => {
  try {
      const vacancyData = req.body; // Получаем данные вакансии из тела запроса
      const vacancy = new Vacancy(vacancyData); // Создаем новый экземпляр модели Vacancy с полученными данными
      await vacancy.save(); // Сохраняем вакансию в базу данных

      res.status(201).json({
          message: 'Вакансия успешно добавлена',
          vacancyId: vacancy._id // Возвращаем ID добавленной вакансии
      });
  } catch (error) {
      console.error('Ошибка при добавлении вакансии:', error);
      res.status(500).send('Произошла ошибка при добавлении вакансии');
  }
});

router.get('/api/add-database-to-google-sheets', async (req, res) => {
  try {
    await task_08_AddDatabaseToGoogleSheet();
    res.json({
      message: 'Все записи из базы данных добавлены в Google Sheets'
    });
  } catch (error) {
    console.error('Ошибка при добавлении записей в Google Sheets:', error);
    res.status(500).send('Произошла ошибка при добавлении записей в Google Sheets');
  }
});


module.exports = router;