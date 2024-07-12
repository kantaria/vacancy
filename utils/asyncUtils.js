const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const isValidLink = require('./isValidLink');
const handleError = require('./errorHandler');
const log = require('./logger');

// Функция для ограничения количества одновременно выполняющихся асинхронных задач
async function asyncLimiter(tasks, limit) {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = Promise.resolve().then(task);
    results.push(p);

    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}

// Функция для получения контактных ссылок с сайта
const fetchContactLinks = async (companyURL, domain, linksVisited = new Set(), links = [companyURL]) => {
  log('start Fetching Contact Links');
  if (linksVisited.has(companyURL) || links.length >= 50) {
    return links;
  }

  try {
    if (!isValidLink(companyURL)) {
      return links;
    }

    const data = await axios(companyURL, { headers: getHeaders() });
    linksVisited.add(companyURL);

    const $ = cheerio.load(data.data);
    $('a[href^="/"], a[href^="http"]').each((i, el) => {
      if (links.length >= 50) {
        return false;
      }

      const link = $(el).attr('href');
      const fullLink = new URL(link, companyURL).href;

      if (isValidLink(fullLink) && new URL(fullLink).hostname.includes(domain) && !linksVisited.has(fullLink) && !links.includes(fullLink)) {
        links.push(fullLink);
      }
    });
    return links;
  } catch (error) {
    handleError(error, 'An error occurred while fetching contact links');
    return links;
  }
};

module.exports = {
  asyncLimiter,
  fetchContactLinks,
};
