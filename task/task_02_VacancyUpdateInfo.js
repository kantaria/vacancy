const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const Vacancy = require('../models/vacancy');
const { extractHighestSalary, extractCurrencySymbol, convertCurrencyToRUB } = require('../utils/currencyUtils');
const task_03_VacancyUpdateInfoCompanyDetails = require('./task_03_VacancyUpdateInfoCompanyDetails');
const uniqid = require('uniqid');
const fs = require('fs');
const path = require('path');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');

const modelsPath = path.join(__dirname, '../models');
fs.readdir(modelsPath, (err, files) => {
  if (err) {
    handleError(err, 'Ошибка чтения каталога models:');
  } else {
    log('Содержимое каталога models:', files);
  }
});

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

async function fetchVacancyDetails(url, searchQuery, existingCompanyUrls) {
  try {
    const { data } = await axios.get(url, { headers: getHeaders() });
    const $ = cheerio.load(data);

    const companyUrl = "https://hh.ru" + $('a[data-qa="vacancy-company-name"]').attr('href') || null;

    if (existingCompanyUrls.has(companyUrl)) {
      log(`Запись с URL компании уже ранее добавлена в базу данных: ${companyUrl}`);
      return null;
    }

    const employmentModes = $('[data-qa="vacancy-view-employment-mode"]').text().split(',').map(text => text.trim()).filter(text => text.length > 0);

    const invalidModes = ["Стажировка", "Вахтовый метод"];
    const hasInvalidMode = employmentModes.some(mode => invalidModes.includes(mode));

    if (hasInvalidMode) {
      log(`Vacancy ${url} is excluded due to employment mode containing "Стажировка" or "Вахтовый метод".`);
      return null;
    }

    let salary = extractHighestSalary($('span[data-qa="vacancy-salary-compensation-type-net"]').text());
    let currency = extractCurrencySymbol($('span[data-qa="vacancy-salary-compensation-type-net"]').text()) || 'RUB';

    if (currency !== 'RUB') {
      salary = await convertCurrencyToRUB(salary, currency);
    }

    const details = {
      globalUrl: url,
      vacancy_id: uniqid.time(),
      searchRequest: searchQuery,
      hh_vacancy_title: $('h1[data-qa="vacancy-title"]').text() || null,
      hh_vacancy_salary: salary,
      hh_vacancy_experience: $('[data-qa="vacancy-experience"]').text() || null,
      hh_vacancy_view_employment_mode: employmentModes,
      hh_vacancy_description: $('[data-qa="vacancy-description"]').text() || null,
      hh_vacancy_skills: $('[data-qa="bloko-tag bloko-tag_inline skills-element"]').map((i, el) => $(el).text()).get() || null,
      hh_vacancy_company_name: $('a[data-qa="vacancy-company-name"]').first().text() || null,
      hh_vacancy_company_url: companyUrl || null,
    };

    if (details.hh_vacancy_company_url) {
      await task_03_VacancyUpdateInfoCompanyDetails(details);
    } else {
      log(`Вакансия без деталей о компании, пропускаем: ${details.hh_vacancy_company_name}`);
    }

    return details;
  } catch (error) {
    handleError(error, `Failed to fetch vacancy details for URL ${url}`);
    return null;
  }
}

const task_02_VacancyUpdateInfo = async (urls, searchQuery) => {
  const existingCompanyUrls = new Set(
    (await Vacancy.find({}, 'details.hh_company_url')).map(vacancy => vacancy.details.hh_company_url)
  );

  for (const url of urls) {
    const details = await fetchVacancyDetails(url, searchQuery, existingCompanyUrls);
    if (details) {
      const vacancy = new Vacancy({
        details,
        status: initialStatus,
      });
      await vacancy.save();
    }
  }
  log('All URLs processed.');
  return true;
};

module.exports = task_02_VacancyUpdateInfo;
