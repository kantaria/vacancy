const { getAuthenticatedClient } = require('../utils/googleAuth');
const { appendToGoogleSheet } = require('../utils/googleSheets');
require('dotenv').config();
const moment = require('moment'); // Для форматирования даты

async function task_07_VacancyAddGoogleSheet(vacancy) {
  try {
    if (!vacancy.details.company_emails || vacancy.details.company_emails.length === 0) {
      console.log(`Vacancy ID ${vacancy.details.vacancy_id} has no company emails. Skipping.`);
      return;
    }

    const auth = await getAuthenticatedClient();
    console.log('Authenticated successfully');
    
    // Форматирование createdAt
    vacancy.createdAt = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm');
    
    await appendToGoogleSheet(auth, vacancy);
    console.log(`Запись добавлена в Google Sheets: ${vacancy.details.vacancy_id}`);
  } catch (error) {
    console.log(`Ошибка при добавлении записи в Google Sheets: ${error.message}`);
  }
}

module.exports = task_07_VacancyAddGoogleSheet;