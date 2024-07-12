const cheerio = require('cheerio');
const axios = require('axios');
const getHeaders = require('../config/headers');
const { asyncLimiter, fetchContactLinks } = require('../utils/asyncUtils');
const Vacancy = require('../models/vacancy');
const task_07_VacancyAddGoogleSheet = require('./task_07_VacancyAddGoogleSheet');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');

const initialStatus = {
  Preparation: true,
  ReadyToApply: false,
  Applied: false,
  TestTask: false,
  Interview: false,
  AwaitingResponse: false,
  Offered: false,
  Signed: false,
  Trash: false,
  Rejected: false,
};

const fetchContacts = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: getHeaders(),
      httpsAgent: new (require('https')).Agent({ rejectUnauthorized: false }),
    });
    const $ = cheerio.load(data);
    const contacts = extractContacts($);
    return contacts;
  } catch (error) {
    handleError(error, 'Error fetching contacts');
    return {
      emails: [],
    };
  }
};

const extractContacts = ($) => {
  const emails = new Set();
  const emailRegex = /\b[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b/g;

  const text = $('body').text();
  let emailMatch;

  while ((emailMatch = emailRegex.exec(text)) !== null) {
    emails.add(emailMatch[0]);
  }

  return {
    emails: [...emails],
  };
};

async function task_05_VacancyScrapeCompanyContacts(details) {
  let vacancy = details;

  const existingCompanyUrls = new Set(
    (await Vacancy.find({}, 'details.hh_company_url')).map((vacancy) => vacancy.details.hh_company_url)
  );

  if (existingCompanyUrls.has(vacancy.details.hh_company_url)) {
    log(`Запись с URL компании уже ранее добавлена в базу данных: ${vacancy.details.hh_company_url}`);
    return;
  }

  vacancy.details.company_emails = new Set();

  const linkBatches = [];
  for (let i = 0; i < vacancy.details.contactLinks.length; i += 5) {
    linkBatches.push(vacancy.details.contactLinks.slice(i, i + 5));
  }

  let processedLinks = 0;
  for (const batch of linkBatches) {
    log(`Обработка пакета ссылок для вакансии ${vacancy.details.hh_company_url}. Количество ссылок в пакете: ${batch.length}`);

    const tasks = batch.map((link) => async () => await fetchContacts(link));
    const contactsBatch = await asyncLimiter(tasks, 5);

    contactsBatch.forEach((result) => {
      result.emails?.forEach((email) => vacancy.details.company_emails.add(email));
    });

    processedLinks += batch.length;
    log(`Обработано ссылок для вакансии ${vacancy.details.hh_company_url}: ${processedLinks}/${vacancy.details.contactLinks.length}`);
  }

  vacancy.details.company_emails = [...vacancy.details.company_emails];

  log('company_emails:', vacancy.details.company_emails);

  if (vacancy.details.company_emails.length > 0) {
    try {
      const vacancyData = vacancy;
      const vacancySave = new Vacancy({
        ...vacancyData,
        status: initialStatus,
      });
      await vacancySave.save();
      await task_07_VacancyAddGoogleSheet(vacancy);
    } catch (error) {
      handleError(error, 'Error adding vacancy');
    }
  } else {
    log('Поле company_emails пустое. Вакансия не будет сохранена в базу данных.');
  }
}

module.exports = task_05_VacancyScrapeCompanyContacts;
