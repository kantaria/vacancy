const fetchContactLinks = require('../utils/fetchContactLinks');
const task_05_VacancyScrapeCompanyContacts = require('./task_05_VacancyScrapeCompanyContacts');

async function task_04_VacancyCollectLinks(details) {
    let vacancy = details;

    if (!vacancy.details.hh_company_url) {
        return false;
    } else {
        try {
            let companyURL = vacancy.details.hh_company_url.startsWith('http') ? vacancy.details.hh_company_url : `https://${vacancy.details.hh_company_url}`;
            let domain = new URL(companyURL).hostname.replace('www.', '');
            const contactLinks = await fetchContactLinks(companyURL, domain);
            vacancy.details.contactLinks = contactLinks;
            await task_05_VacancyScrapeCompanyContacts(vacancy);
        } catch (error) {
            console.error(`Ошибка при сборе контактных ссылок: ${error}`);
        }
    }
}

module.exports = task_04_VacancyCollectLinks;