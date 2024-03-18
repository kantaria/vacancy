const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const { createSingleBar } = require('../config/progressBarConfig');
const task_02_VacancyUpdateInfo = require('./task_02_VacancyUpdateInfo');

const BASE_URL = process.env.BASE_URL;
const headers = getHeaders();
const progressBar = createSingleBar();

async function fetchWithRetry(url, attempts = 3) {
    try {
        const response = await axios.get(url, { headers });
        return response;
    } catch (error) {
        if (attempts <= 1) {
            console.warn('Достигнуто максимальное количество попыток запроса.');
            return null;
        }
        console.warn(`Ошибка запроса. Осталось попыток: ${attempts - 1}. Повторная попытка...`);
        return await fetchWithRetry(url, attempts - 1);
    }
}

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

    progressBar.start(pages, 0);

    for (let page = 1; page <= pages; page++) {
        const url = `${BASE_URL}?ored_clusters=true&search_field=name&search_field=company_name&search_field=description&text=${searchQuery}&enable_snippets=false&L_save_area=true&page=${page}`;
        const response = await fetchWithRetry(url);
        if (response) {
            const links = await getLinks(response.data);
            if (links.length > 0) {
                // Отправка собранных ссылок на обработку в task_02 и ожидание результата
                console.log(links);
                console.log("~~~~~~~~~~~~ " + searchQuery + " ~~~~~~~~~~~~~");
                await task_02_VacancyUpdateInfo( links, searchQuery );
            }
        } else {
            console.warn(`Пропускаем страницу ${page} из-за ошибок запроса.`);
        }
        progressBar.update(page);
    }

    progressBar.stop();
    console.log(`Сбор ссылок по запросу "${searchQuery}" завершен.`);
}

module.exports = { task_01_VacancyLinksGathering };
