// routes/scrapingRoutes.js
const express = require('express');
const router = express.Router();
const Vacancy = require('../models/vacancy');
const { VacancyLinksGathering_01 } = require('../services/VacancyLinksGathering_01');
const { removeVacancyDuplicates } = require('../services/RemoveVacancyDuplicates');

// В файле routes/scrapingRoutes.js
router.get('/api/start-scraping', async (req, res) => {
  const userIP = req.ip; // Получаем IP пользователя
  const { searchQueries } = req.body;

  if (!searchQueries || !Array.isArray(searchQueries) || searchQueries.length === 0) {
    return res.status(400).send('Неверный формат данных. Ожидается массив запросов.');
  }

  // Проверяем, есть ли уже активные процессы для этого IP
  const existingProcess = await Vacancy.findOne({ userIP, scrapingInProgress: true });

  if (existingProcess) {
    return res.status(429).send(`Процесс уже запущен для данного IP: . Пожалуйста, дождитесь его завершения.`);
  }

  try {
    // Если процесса нет, добавляем запись о новом процессе
    const newProcess = new Vacancy({
      userIP,
      scrapingInProgress: true,
      // Остальные поля модели, если требуется
    });
    await newProcess.save();

    res.json({ message: 'Запускаем процессы для переданных запросов' });
    
    // Здесь запускаем процесс сбора данных и после его завершения обновляем флаг scrapingInProgress
    // Пример:
    VacancyLinksGathering_01(searchQueries, userIP)
      .then(() => {
        Vacancy.findOneAndUpdate({ userIP, scrapingInProgress: true }, { $set: { scrapingInProgress: false }})
          .then(() => console.log(`Процесс завершен для ${userIP}`))
          .catch(err => console.error(err));
      })
      .catch(error => {
        console.error('Ошибка при запуске процессов:', error);
        // Обновляем флаг scrapingInProgress в случае ошибки тоже
        Vacancy.findOneAndUpdate({ userIP, scrapingInProgress: true }, { $set: { scrapingInProgress: false }})
          .catch(err => console.error(err));
      });
  } catch (error) {
    console.error('Ошибка при запуске процессов:', error);
    res.status(500).send('Произошла ошибка при запуске процессов.');
  }
});


router.post('/api/reset-scraping-flag', async (req, res) => {
  const { userIP } = req.body; // Предполагаем, что IP пользователя будет передан в теле запроса

  if (!userIP) {
    return res.status(400).send('Необходимо указать IP пользователя.');
  }

  try {
    // Находим и обновляем запись, устанавливая scrapingInProgress в false
    const updated = await Vacancy.updateMany({ userIP, scrapingInProgress: true }, { $set: { scrapingInProgress: false }});

    if (updated.matchedCount === 0) {
      return res.status(404).send('Процессы для данного IP не найдены или уже сброшены.');
    }

    res.json({ message: `Флаг scrapingInProgress успешно сброшен для IP: ${userIP}`, updatedCount: updated.modifiedCount });
  } catch (error) {
    console.error('Ошибка при сбросе флага scrapingInProgress:', error);
    res.status(500).send('Произошла ошибка при сбросе флага scrapingInProgress.');
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
    const vacancies = await Vacancy.find({}, 'details.hh_company_url -_id'); // Извлекаем только hh_company_url из всех записей
    // Преобразуем в одномерный массив, фильтруем null значения и удаляем дубликаты
    const companyUrlArray = [...new Set(vacancies
      .map(v => v.details.hh_company_url)
      .filter(url => url !== "null")
      .flat())];
    res.json(companyUrlArray);
  } catch (error) {
    console.error('Ошибка при получении company urls:', error);
    res.status(500).send('Произошла ошибка при получении данных');
  }
});

router.get('/api/company-details', async (req, res) => {
  try {
    const vacancies = await Vacancy.find(); // Извлекаем все записи вакансий
    const detailsArray = vacancies.map(vacancy => vacancy); // Преобразуем в массив деталей
    res.json(detailsArray); // Возвращаем массив деталей в ответе
  } catch (error) {
    console.error('Ошибка при получении деталей вакансий:', error);
    res.status(500).send('Произошла ошибка при получении деталей вакансий');
  }
});

router.get('/api/remove-duplicates', async (req, res) => {
  try {
      const { deletedCount, deletedUrls } = await removeVacancyDuplicates();
      res.status(200).json({
          message: `Успешно удалено дубликатов вакансий: ${deletedCount}`,
          deletedUrls: deletedUrls
      });
  } catch (error) {
      console.error('Ошибка при удалении дубликатов вакансий:', error);
      res.status(500).send('Произошла ошибка при удалении дубликатов вакансий');
  }
});

router.get('/api/company-skills', async (req, res) => {
  try {
    const vacancies = await Vacancy.find({}, 'details.hh_vacancy_skills -_id'); // Извлекаем только contactLinks из всех записей
    const vacancySkills = vacancies.map(v => v.details.hh_vacancy_skills).flat(); // Преобразуем в одномерный массив
    res.json(vacancySkills);
  } catch (error) {
    console.error('Ошибка при получении skills:', error);
    res.status(500).send('Произошла ошибка при получении данных');
  }
});

module.exports = router;