const { google } = require('googleapis');
const { getAuthenticatedClient } = require('../utils/googleAuth');
const { getFirstEmptyRow } = require('../utils/googleSheets');
const Vacancy = require('../models/vacancy');
require('dotenv').config();
const cleanText = require('../utils/cleanText'); // Добавим импорт cleanText
const moment = require('moment'); // Для форматирования даты

// Функция для добавления задержки
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function appendVacancyToGoogleSheet(auth, vacancy, sheets, spreadsheetId, sheetName) {
  if (!vacancy.details.company_emails || vacancy.details.company_emails.length === 0) {
    console.log(`Vacancy ID ${vacancy._id} has no company emails. Skipping.`);
    return;
  }

  try {
    const firstEmptyRow = await getFirstEmptyRow(sheets, spreadsheetId, sheetName);
    const range = `${sheetName}!A${firstEmptyRow}`;

    const formattedDate = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm'); // Форматирование даты

    const values = [
      [
        vacancy._id || '',
        vacancy.details.searchRequest || '',
        vacancy.details.hh_vacancy_title || '',
        vacancy.details.hh_vacancy_salary || '',
        vacancy.details.hh_vacancy_currency || '',
        vacancy.details.hh_vacancy_experience || '',
        (vacancy.details.hh_vacancy_view_employment_mode || []).join(', '),
        cleanText(vacancy.details.hh_vacancy_description || ''),
        (vacancy.details.hh_vacancy_skills || []).join(', '),
        vacancy.details.hh_vacancy_company_name || '',
        vacancy.details.hh_vacancy_company_url || '',
        vacancy.details.hh_company_url || '',
        (vacancy.details.contactLinks || []).join(', '),
        (vacancy.details.company_emails || []).join(', '),
        formattedDate // Добавляем отформатированное поле createdAt
      ]
    ];

    const resource = { values };

    console.log('Appending data to Google Sheet with the following parameters:');
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log('Range:', range);
    // console.log('Resource:', JSON.stringify(resource, null, 2));

    if (!spreadsheetId || !range || !resource.values) {
      console.error('Missing required parameters: spreadsheetId, range, or resource values.');
      return;
    }

    try {
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource,
      });
      console.log(`${result.data.updates.updatedCells} cells appended.`);
    } catch (error) {
      console.error('Error appending data to Google Sheet:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  } catch (error) {
    console.error('Error fetching spreadsheet metadata or first empty row:', error);
  }
}

async function task_08_AddDatabaseToGoogleSheet() {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Clean';
    console.log('Authenticated successfully');

    // Извлечение всех записей из базы данных
    const vacancies = await Vacancy.find({});
    const batchSize = 10; // Количество записей в одной группе
    const delayMs = 1100; // Задержка в миллисекундах (1100ms чтобы гарантировать, что мы не превысим лимит 100 запросов за 100 секунд)

    for (let i = 0; i < vacancies.length; i += batchSize) {
      const batch = vacancies.slice(i, i + batchSize);
      for (const vacancy of batch) {
        vacancy.createdAt = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm'); // Форматирование даты
        await appendVacancyToGoogleSheet(auth, vacancy, sheets, spreadsheetId, sheetName);
        console.log(`Запись добавлена в Google Sheets: ${vacancy.details.vacancy_id}`);
        await delay(delayMs); // Задержка между запросами
      }
    }

  } catch (error) {
    console.log(`Ошибка при добавлении записей в Google Sheets: ${error.message}`);
  }
}

module.exports = task_08_AddDatabaseToGoogleSheet;
