// routes/scrapingRoutes.js
const express = require('express');
const router = express.Router();
const { VacancyLinksGathering_01 } = require('../services/VacancyLinksGathering_01');
const Vacancy = require('../models/Vacancy');

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

router.get('/api/contact-links', async (req, res) => {
  try {
    const vacancies = await Vacancy.find({}, 'details.contactLinks -_id'); // Извлекаем только contactLinks из всех записей
    const contactLinksArray = vacancies.map(v => v.details.contactLinks).flat(); // Преобразуем в одномерный массив
    res.json(contactLinksArray);
  } catch (error) {
    console.error('Ошибка при получении contact links:', error);
    res.status(500).send('Произошла ошибка при получении данных');
  }
});

router.get('/api/company-url', async (req, res) => {
  try {
    const vacancies = await Vacancy.find({}, 'details.hh_company_url -_id'); // Извлекаем только contactLinks из всех записей
    const companyUrlArray = vacancies.map(v => v.details.hh_company_url).flat(); // Преобразуем в одномерный массив
    res.json(companyUrlArray);
  } catch (error) {
    console.error('Ошибка при получении contact links:', error);
    res.status(500).send('Произошла ошибка при получении данных');
  }
});

module.exports = router;