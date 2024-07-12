const { fetchContactLinks } = require('../utils/asyncUtils');
const task_05_VacancyScrapeCompanyContacts = require('./task_05_VacancyScrapeCompanyContacts');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');

async function task_04_VacancyCollectLinks(details) {
  let vacancy = details;

  if (!vacancy.details.hh_company_url) {
    log('Отсутствует ссылка на компанию: ' + vacancy.details.hh_company_url);
    return false;
  } else {
    try {
      let companyURL = vacancy.details.hh_company_url.startsWith('http') ? vacancy.details.hh_company_url : `https://${vacancy.details.hh_company_url}`;
      let domain = new URL(companyURL).hostname.replace('www.', '');
      const contactLinks = await fetchContactLinks(companyURL, domain);
      vacancy.details.contactLinks = contactLinks;
      await task_05_VacancyScrapeCompanyContacts(vacancy);
    } catch (error) {
      handleError(error, 'Ошибка при сборе контактных ссылок');
    }
  }
}

module.exports = task_04_VacancyCollectLinks;
