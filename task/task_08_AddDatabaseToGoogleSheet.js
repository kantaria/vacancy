const { google } = require('googleapis');
const { getAuthenticatedClient } = require('../utils/googleAuth');
const { getFirstEmptyRow, checkIfDuplicate } = require('../utils/googleSheets');
const Vacancy = require('../models/vacancy');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');
const moment = require('moment');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function appendVacancyToGoogleSheet(auth, vacancy, sheets, spreadsheetId, sheetName) {
  if (!vacancy.details.company_emails || vacancy.details.company_emails.length === 0) {
    log(`Vacancy ID ${vacancy._id} has no company emails. Skipping.`);
    return;
  }

  try {
    const firstEmptyRow = await getFirstEmptyRow(sheets, spreadsheetId, sheetName);
    const range = `${sheetName}!A${firstEmptyRow}`;

    const formattedDate = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm');

    const values = [
      [
        vacancy.details.hh_vacancy_title || '',
        vacancy.details.searchRequest || '',
        vacancy.details.hh_vacancy_salary || '',
        vacancy.details.hh_vacancy_experience || '',
        (vacancy.details.hh_vacancy_view_employment_mode || []).join(', '),
        cleanText(vacancy.details.hh_vacancy_description || ''),
        (vacancy.details.hh_vacancy_skills || []).join(', '),
        vacancy.details.hh_vacancy_company_name || '',
        vacancy.details.hh_vacancy_company_url || '',
        vacancy.details.hh_company_url || '',
        (vacancy.details.contactLinks || []).join(', '),
        (vacancy.details.company_emails || []).join(', '),
        vacancy.details.hh_global || '',
        vacancy.rating || '',
        vacancy._id || '',
        formattedDate
      ]
    ];

    const resource = { values };

    if (!spreadsheetId || !range || !resource.values) {
      log('Missing required parameters: spreadsheetId, range, or resource values.');
      return;
    }

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource,
      });
    } catch (error) {
      handleError(error, 'Error appending data to Google Sheet');
    }
  } catch (error) {
    handleError(error, 'Error fetching spreadsheet metadata or first empty row');
  }
}

async function task_08_AddDatabaseToGoogleSheet() {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Clean2';
    log('Authenticated successfully');

    const vacancies = await Vacancy.find({});
    const totalVacancies = vacancies.length;
    const batchSize = 10;
    const delayMs = 1100;

    for (let i = 0; i < totalVacancies; i += batchSize) {
      const batch = vacancies.slice(i, i + batchSize);
      for (const vacancy of batch) {
        vacancy.createdAt = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm');
        await appendVacancyToGoogleSheet(auth, vacancy, sheets, spreadsheetId, sheetName);
        await delay(delayMs);
      }
    }

    log('Все записи добавлены в Google Sheets.');
  } catch (error) {
    handleError(error, 'Ошибка при добавлении записей в Google Sheets');
  }
}

module.exports = task_08_AddDatabaseToGoogleSheet;
