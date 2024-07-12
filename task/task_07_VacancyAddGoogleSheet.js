const { getAuthenticatedClient } = require('../utils/googleAuth');
const { appendToGoogleSheet, checkIfDuplicate } = require('../utils/googleSheets');
const Vacancy = require('../models/vacancy');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');
const moment = require('moment');

const isDuplicate = async (vacancy) => {
  const existingVacancy = await Vacancy.findOne({
    'details.hh_vacancy_company_name': vacancy.details.hh_vacancy_company_name,
    'details.hh_vacancy_description': vacancy.details.hh_vacancy_description,
  });
  return !!existingVacancy;
};

async function task_07_VacancyAddGoogleSheet(vacancy) {
  try {
    log('Добавление в Google Sheets, company_emails:', vacancy.details.company_emails);
    if (!vacancy.details.company_emails || vacancy.details.company_emails.length === 0) {
      log(`Vacancy ID ${vacancy.details.vacancy_id} has no company emails. Skipping.`);
      return;
    }

    if (await isDuplicate(vacancy)) {
      log(`Vacancy ID ${vacancy.details.vacancy_id} is a duplicate. Skipping.`);
      return;
    }

    const auth = await getAuthenticatedClient();
    log('Authenticated successfully');

    vacancy.createdAt = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm');

    await appendToGoogleSheet(auth, vacancy);
    log(`Запись добавлена в Google Sheets: ${vacancy.details.vacancy_id}`);
  } catch (error) {
    handleError(error, 'Ошибка при добавлении записи в Google Sheets');
  }
}

module.exports = task_07_VacancyAddGoogleSheet;
