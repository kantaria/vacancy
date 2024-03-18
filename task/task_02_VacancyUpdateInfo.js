const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const extractHighestSalary = require('../utils/extractHighestSalary');
const extractCurrencySymbol = require('../utils/extractCurrencySymbol');



async function fetchVacancyDetails(url, headers) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const { data } = await axios.get(url, { headers: getHeaders() });
      const $ = cheerio.load(data);

      // Создаем объект деталей вакансии...
      const details = {
        hh_vacancy_title: $('h1[data-qa="vacancy-title"]').text() || null,
        hh_vacancy_salary: extractHighestSalary($('span[data-qa="vacancy-salary-compensation-type-net"]').text()),
        hh_vacancy_currency: extractCurrencySymbol($('span[data-qa="vacancy-salary-compensation-type-net"]').text()) || null,
        hh_vacancy_experience: $('[data-qa="vacancy-experience"]').text() || null,
        hh_vacancy_view_employment_mode: $('[data-qa="vacancy-view-employment-mode"]').text().split(',').map(text => text.trim()).filter(text => text.length > 0) || null,
        hh_vacancy_view_accept_temporary: $('[data-qa="vacancy-view-accept-temporary"]').text().replace('Возможно временное оформление:', '').trim().split(',').map(text => text.trim()).filter(text => text.length > 0) || null,
        hh_vacancy_description: $('[data-qa="vacancy-description"]').text() || null,
        hh_vacancy_skills: $('[data-qa="bloko-tag bloko-tag_inline skills-element"]').map((i, el) => $(el).text()).get() || null,
        hh_vacancy_logo: $('img.vacancy-company-logo-image-redesigned').attr('src') || null,
        hh_vacancy_company_name: $('a[data-qa="vacancy-company-name"]').first().text() || null,
        hh_vacancy_company_url: "https://hh.ru"+$('a[data-qa="vacancy-company-name"]').attr('href') || null,
        hh_vacancy_address: $('[data-qa="vacancy-view-raw-address"]').first().text() || null,
      };

      return details; // Возвращаем детали вакансии
    } catch (error) {
      console.error(`Attempt ${attempt} failed for URL ${url}: ${error}`);
      if (attempt === 5) {
        return null; // Возвращаем null после всех попыток
      }
    }
  }
}

const task_02_VacancyUpdateInfo = async (urls) => {
  let urlsGen = [];
  let promises = urls.map((url) => fetchVacancyDetails(url, getHeaders()));

  // Ожидаем выполнение всех промисов
  const results = await Promise.allSettled(promises);
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value !== null) {
      console.log(`Result for URL ${urls[index]}:`, result.value);
      urlsGen.push(result.value);
    } else {
      console.log(`Error processing URL ${urls[index]}:`, result.reason);
    }
  });

  console.log('All URLs processed.');
  return urlsGen; // Возвращаем массив обработанных результатов
};


module.exports = task_02_VacancyUpdateInfo;
