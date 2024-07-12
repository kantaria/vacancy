const express = require('express');
const router = express.Router();
const { VacancyLinksGathering_01 } = require('../services/VacancyLinksGathering_01');
const task_08_AddDatabaseToGoogleSheet = require('../task/task_08_AddDatabaseToGoogleSheet');
const Vacancy = require('../models/vacancy');
const { getChatGPTResponse } = require('../task/task_09_ai');
const { evaluateVacancies } = require('../task/task_09_evaluate_resumes');
const task_10_AddDatabaseToExcelFile = require('../task/task_10_AddDatabaseToExcelFile');
const { countMatchingVacancies, updateLimitRating } = require('../utils/vacancyUtils');
const { updateVacanciesWithGlobalField } = require('../utils/vacancyUpdateUtils');
const { displayCurrencyRates } = require('../utils/currencyUtils');
const updateNotionRecord = require('../task/task_11_UpdateNotionRecord');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');

// Проверка на дубликаты
const isDuplicate = async (vacancy) => {
  const existingVacancy = await Vacancy.findOne({
    'details.hh_vacancy_company_name': vacancy.details.hh_vacancy_company_name,
    'details.hh_vacancy_description': vacancy.details.hh_vacancy_description,
  });
  return !!existingVacancy;
};

router.post('/api/chatgpt', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Prompt is required');
  }

  try {
    const response = await getChatGPTResponse(prompt);
    if (response) {
      res.json({ response });
    } else {
      res.status(500).send('Error getting response from ChatGPT');
    }
  } catch (error) {
    handleError(error, 'Error in /api/chatgpt route');
    res.status(500).send('Internal Server Error');
  }
});


router.post('/api/evaluate-vacancies', async (req, res) => {
  const { limit } = req.body;

  if (!limit || typeof limit !== 'number' || limit <= 0) {
    return res.status(400).send('Valid limit is required');
  }

  try {
    const result = await evaluateVacancies(limit);
    res.json(result);
  } catch (error) {
    handleError(error, 'Error in /api/evaluate-vacancies route');
    res.status(500).send('Internal Server Error');
  }
});

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
    VacancyLinksGathering_01(searchQueries);
  } catch (error) {
    handleError(error, 'Ошибка при запуске процессов');
    res.status(500).send('Произошла ошибка при запуске процессов.');
  }
});



router.post('/api/vacancies', async (req, res) => {
  try {
    const vacancyData = req.body;

    if (!vacancyData.details.company_emails || vacancyData.details.company_emails.length === 0) {
      return res.status(400).json({ message: 'Поле company_emails пустое. Вакансия не будет сохранена в базу данных.' });
    }

    if (await isDuplicate(vacancyData)) {
      return res.status(400).json({ message: 'Вакансия с такими данными уже существует' });
    }

    const vacancy = new Vacancy(vacancyData);
    await vacancy.save();

    res.status(201).json({
      message: 'Вакансия успешно добавлена',
      vacancyId: vacancy._id
    });
  } catch (error) {
    handleError(error, 'Error adding vacancy');
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
    handleError(error, 'Ошибка при добавлении записей в Google Sheets');
    res.status(500).send('Произошла ошибка при добавлении записей в Google Sheets');
  }
});

router.get('/api/add-database-to-excel', async (req, res) => {
  try {
    await task_10_AddDatabaseToExcelFile();
    res.json({
      message: 'Все записи из базы данных добавлены в Excel файл'
    });
  } catch (error) {
    handleError(error, 'Ошибка при добавлении записей в Excel');
    res.status(500).send('Произошла ошибка при добавлении записей в Excel');
  }
});

router.post('/api/count-vacancies', async (req, res) => {
  try {
    const count = await countMatchingVacancies();
    res.json({
      message: `Количество подходящих записей: ${count}`
    });
  } catch (error) {
    handleError(error, 'Ошибка при подсчете записей');
    res.status(500).send('Произошла ошибка при подсчете записей');
  }
});

router.post('/api/update-vacancies-with-global-field', async (req, res) => {
  try {
    await updateVacanciesWithGlobalField();
    res.json({
      message: 'Все вакансии обновлены с новым полем hh_global.'
    });
  } catch (error) {
    handleError(error, 'Ошибка при обновлении вакансий');
    res.status(500).send('Произошла ошибка при обновлении вакансий');
  }
});

router.get('/api/currency-rates', async (req, res) => {
  try {
    const rates = await displayCurrencyRates();
    res.json(rates);
  } catch (error) {
    handleError(error, 'Ошибка при получении курсов валют');
    res.status(500).send('Не удалось получить курсы валют.');
  }
});

router.post('/api/update-notion-record', async (req, res) => {
  const { vacancy } = req.body;

  if (!vacancy) {
    return res.status(400).send('Vacancy data is required');
  }

  try {
    await updateNotionRecord(vacancy);
    res.status(200).send('Запись обновлена');
  } catch (error) {
    handleError(error, 'Ошибка в маршруте /api/update-notion-record');
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

router.post('/api/vacancies/details', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'ID вакансии отсутствует в запросе' });
    }
    const vacancy = await Vacancy.findById(id);
    if (!vacancy) {
      return res.status(404).json({ message: 'Вакансия не найдена' });
    }
    res.json(vacancy);
  } catch (error) {
    handleError(error, 'Ошибка при получении информации о вакансии');
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

module.exports = router;
