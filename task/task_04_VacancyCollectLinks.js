const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const isValidLink = require('../utils/isValidLink');


const fetchContactLinks = async (companyURL, domain, linksVisited = new Set(), links = [companyURL]) => {
    console.log("start fetching links");
    if (linksVisited.has(companyURL) || links.length >= 50) {
      return links;
    }
  
    try {
      if (!isValidLink(companyURL)) {
        return links;
      }

      // Вызываем нашу функцию с тайм-аутом 500 мс
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
      console.error("An error occurred: ", error.message);
      return links;
    }
  };



async function task_04_VacancyCollectLinks(details) {
    let vacancy = details;

    if (!vacancy.details.hh_company_url) {
        console.log('Отсутствует ссылка на компанию: ' + vacancy.details.hh_company_url);
        return false;
    } else {
        try {
            let companyURL = vacancy.details.hh_company_url.startsWith('http') ? vacancy.details.hh_company_url : `https://${vacancy.details.hh_company_url}`;
            let domain = new URL(companyURL).hostname.replace('www.', '');
            // Собираем ссылки для текущей вакансии
            const contactLinks = await fetchContactLinks(companyURL, domain);
            // Обновляем документ вакансии с собранными ссылками
            vacancy.details.contactLinks = contactLinks;
            console.log(`Собрано ${contactLinks.length} контактных ссылок для вакансии: ${JSON.stringify(vacancy.details, null, 2)}`);
        } catch (error) {
            console.error(`Ошибка при сборе контактных ссылок: ${error}`);
        }
    }
}

module.exports = task_04_VacancyCollectLinks;