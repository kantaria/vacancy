const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const { fetchWithRetry } = require('../utils/apiUtils');
const task_02_VacancyUpdateInfo = require('./task_02_VacancyUpdateInfo');
const Vacancy = require('../models/vacancy');

const BASE_URL = process.env.BASE_URL;
const headers = getHeaders();

async function getLinks(html) {
  const $ = cheerio.load(html);
  const links = [];
  $('a.bloko-link').each((index, element) => {
    const link = $(element).attr('href');
    if (link && link.startsWith('https://hh.ru/vacancy')) {
      links.push(link);
    }
  });
  return links;
}

async function task_01_VacancyLinksGathering(searchQuery) {
  const pages = parseInt(process.env.MAX_PAGES, 10);
  console.log(`Начало сбора ссылок по запросу: "${searchQuery}"...`);

  for (let page = 1; page <= pages; page++) {
    const url = `${BASE_URL}?ored_clusters=true&search_field=name&search_field=company_name&search_field=description&text=${searchQuery}&enable_snippets=false&L_save_area=true&page=${page}`;
    const response = await fetchWithRetry(url, 3, headers);
    if (response) {
      const links = await getLinks(response.data);
      if (links.length > 0) {
        await task_02_VacancyUpdateInfo(links, searchQuery);
      }
    } else {
      console.warn(`Пропускаем страницу ${page} из-за ошибок запроса.`);
    }
  }

  console.log(`Сбор ссылок по запросу "${searchQuery}" завершен.`);
}

module.exports = { task_01_VacancyLinksGathering };
