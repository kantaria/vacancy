const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const asyncLimiter = require('../utils/asyncLimiter');
const Vacancy = require('../models/vacancy');
const task_06_VacancyAddNotion = require('./task_06_VacancyAddNotion');

const fetchContacts = async (url) => {
  try {
    // Определите максимальный размер ответа в байтах
    const MAX_SIZE = 10 * 1024 * 1024; // 25 MB

    // Создаем Promise, который отклоняется через 3 секунды
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Превышено время ожидания запроса'));
      }, 3000); // 3 секунды в миллисекундах
    });

    // Используем Promise.race для гонки между запросом и таймаутом
    const response = await Promise.race([
      axios.get(url, {
        headers: getHeaders(), // Предполагаем, что getHeaders() определена где-то в вашем коде
        maxContentLength: MAX_SIZE,
        maxBodyLength: MAX_SIZE,
      }),
      timeoutPromise
    ]);

    // Обрабатываем ответ
    const $ = cheerio.load(response.data);
    const contacts = extractContacts($); // Предполагаем, что extractContacts($) определена где-то в вашем коде
    return contacts;
  } catch (error) {
    if (error.response && error.response.status === 413) {
      console.error('Ошибка: Размер полученного ответа превышает установленный лимит.');
    } else if (error.message === 'Превышено время ожидания запроса') {
      console.error('Ошибка: Время ожидания запроса превысило 3 секунды.');
    } else {
      console.error('Ошибка при извлечении контактов:', error.message);
    }

    return {
      phones: [],
      emails: []
    };
  }
};


const extractContacts = ($) => {
  const phones = new Set(); // Используем Set для уникальности
  const emails = new Set();
  const phoneRegex = /\+\d{1,3}[- ]?(?:\d{1,4}[- ]?)?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}/g;
  const emailRegex = /\b[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b/g;

  const text = $('body').text();
  let phoneMatch;
  let emailMatch;

  while ((phoneMatch = phoneRegex.exec(text)) !== null) {
    // Удаляем пробелы из номеров телефонов
    const cleanedPhone = phoneMatch[0].replace(/[\s-]/g, '');
    // Добавляем в Set только если длина номера >= 9
    if (cleanedPhone.length >= 9) {
      phones.add(cleanedPhone);
    }
  }

  while ((emailMatch = emailRegex.exec(text)) !== null) {
    emails.add(emailMatch[0]);
  }

  return {
    phones: [...phones],
    emails: [...emails]
  };
};

async function task_05_VacancyScrapeCompanyContacts(details) {
  let vacancy = details;

  // Инициализируем как Set для уникальности
  vacancy.details.company_phones = new Set();
  vacancy.details.company_emails = new Set();
      
  const linkBatches = [];
  for (let i = 0; i < vacancy.details.contactLinks.length; i += 5) {
    linkBatches.push(vacancy.details.contactLinks.slice(i, i + 5));
  }

  let processedLinks = 0;
  for (const batch of linkBatches) {
    // heapdump.writeSnapshot('./logs/' + Date.now() + '.heapsnapshot');
    console.log(`Обработка пакета ссылок для вакансии ${vacancy.details.hh_company_url}. Количество ссылок в пакете: ${batch.length}`);
    
    const tasks = batch.map(link => async () => await fetchContacts(link));
    let contactsBatch = await asyncLimiter(tasks, 5);
    
    contactsBatch.forEach(result => {
      result.phones?.forEach(phone => vacancy.details.company_phones.add(phone));
      result.emails?.forEach(email => vacancy.details.company_emails.add(email));
    });
    // heapdump.writeSnapshot('./logs/' + Date.now() + '.heapsnapshot');
    contactsBatch = null;

    processedLinks += batch.length;
    console.log(`Обработано ссылок для вакансии ${vacancy.details.hh_company_url}: ${processedLinks}/${vacancy.details.contactLinks.length}`);
  }

  // Конвертируем Set обратно в массивы
  vacancy.details.company_phones = [...vacancy.details.company_phones];
  vacancy.details.company_emails = [...vacancy.details.company_emails];

  try {
    const vacancyData = vacancy; // Получаем данные вакансии из тела запроса
    vacancyData.notionStatus = true; // Add notionStatus property
    const vacancySave = new Vacancy(vacancyData); // Создаем новый экземпляр модели Vacancy с полученными данными
    await vacancySave.save(); // Сохраняем вакансию в базу данных
    await task_06_VacancyAddNotion(vacancy); // Добавляем вакансию в Notion
    } catch (error) {
        console.error('Ошибка при добавлении вакансии:', error);
    }
  // Save vacancy to DB
}

module.exports = task_05_VacancyScrapeCompanyContacts;