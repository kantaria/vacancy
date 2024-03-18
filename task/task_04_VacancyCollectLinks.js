require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');


async function task_04_VacancyCollectLinks(details) {
    let vacancyDetails = { details };

    try {
        let processedVacancies = 0;
        for (let vacancy of vacancies) {
          // Проверяем, есть ли уже контактные ссылки для этой вакансии
          if (vacancy.details && vacancy.details.contactLinks && vacancy.details.contactLinks.length > 0) {
            continue; // Пропускаем эту вакансию, так как ссылки уже собраны
          }
    
          if (!vacancy.details || !vacancy.details.hh_company_url) {
            continue;
          }
          let companyURL = vacancy.details.hh_company_url.startsWith('http') ? vacancy.details.hh_company_url : `https://${vacancy.details.hh_company_url}`;
          let domain = new URL(companyURL).hostname.replace('www.', '');
          try {
            // Собираем ссылки для текущей вакансии
            const contactLinks = await fetchContactLinks(companyURL, domain);
            // Обновляем документ вакансии с собранными ссылками
            vacancy.details.contactLinks = contactLinks;
            await vacancy.save(); // Сохраняем изменения в базу данных
          } catch (error) {
    
            continue; // Пропускаем текущую итерацию в случае ошибки
          }
          processedVacancies++;
          console.log(`Обработано вакансий: ${processedVacancies}/${vacancies.length}`);
        }
      } catch (error) {
        console.error(`Ошибка при сборе контактных ссылок: ${error}`);
      }
}

module.exports = task_04_VacancyCollectLinks;