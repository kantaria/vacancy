require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios'); // Используем для HTTP-запросов
const connectDB = require('../config/mongoDB');
const task_05_VacancyScrapeCompanyContacts = require('../task/task_05_VacancyScrapeCompanyContacts');
const ProgressBar = require('progress');

connectDB();

async function fetchVacancyDetails() {
  try {
    const response = await axios.get('http://localhost:3000/api/company-details'); // Замените URL на ваш фактический адрес API
    if (response.data && response.status === 200) {
      return response.data;
    } else {
      console.error('Не удалось получить данные о вакансиях');
      return [];
    }
  } catch (error) {
    console.error('Ошибка при запросе данных о вакансиях:', error);
    return [];
  }
}

async function stressTest() {
  const vacancies = await fetchVacancyDetails();

  if (vacancies.length === 0) {
    console.log('Нет данных о вакансиях для обработки.');
    return;
  }

  const bar = new ProgressBar(':bar :current/:total', { total: vacancies.length });

  console.log(`Начинаем стресс-тестирование для ${vacancies.length} вакансий.`);

  const startTime = process.hrtime.bigint();

  for (const vacancy of vacancies) {
    // Теперь передаём полные данные details в функцию
    await task_05_VacancyScrapeCompanyContacts(vacancy);
    bar.tick();
  }

  const endTime = process.hrtime.bigint();
  const duration = (endTime - startTime) / BigInt(1000000); // Преобразуем в миллисекунды

  console.log(`Стресс-тест завершен за ${duration} мс.`);
}

stressTest().then(() => {
  mongoose.disconnect();
});
