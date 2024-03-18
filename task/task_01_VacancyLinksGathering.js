const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const cliProgress = require('cli-progress');

const BASE_URL = process.env.BASE_URL;
const headers = getHeaders();

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
    const titleSpan = $(element).find('span.serp-item__title');
    if (titleSpan.length > 0) {
      const link = $(element).attr('href');
      if (link) {
        links.push(link);
      }
    }
  });
  return links;
}

async function task_01_VacancyLinksGathering(searchQuery) {
  const allLinks = [];

  try {
    const formattedSearchQuery = searchQuery.replace(/\s+/g, '+');
    const pages = parseInt(process.env.MAX_PAGES, 10);

    // Выводим информацию о начале сбора ссылок с указанием запроса
    console.log(`Начало сбора ссылок по запросу: "${searchQuery}"...`);

    const progressBar = new cliProgress.SingleBar({
      format: 'Прогресс |{bar}| {percentage}% | ETA: {eta_formatted} | {value}/{total}',
    }, cliProgress.Presets.shades_classic);
    progressBar.start(pages, 0);

    for (let page = 1; page <= pages; page++) {
      const url = `${BASE_URL}?ored_clusters=true&search_field=name&search_field=company_name&search_field=description&text=${formattedSearchQuery}&enable_snippets=false&L_save_area=true&page=${page}`;
      const response = await fetchWithRetry(url);
      if (response) {
        const links = await getLinks(response.data);
        allLinks.push(...links);
      } else {
        console.warn(`Пропускаем страницу ${page} из-за ошибок запроса.`);
      }
      progressBar.update(page);
    }

    progressBar.stop();
    console.log(`Всего собрано ${allLinks.length} ссылок по запросу: "${searchQuery}".`);
    return allLinks;
  } catch (error) {
    console.error(`Ошибка в task_01_VacancyLinksGathering: ${error}`);
    throw error;
  }
}


module.exports = { task_01_VacancyLinksGathering };
