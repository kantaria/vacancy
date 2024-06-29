const { google } = require('googleapis');
const cleanText = require('./cleanText');
const moment = require('moment'); // Для форматирования даты

async function getFirstEmptyRow(sheets, spreadsheetId, sheetName) {
  const range = `${sheetName}!A:A`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;
  return rows ? rows.length + 1 : 1;
}

async function checkIfDuplicate(sheets, spreadsheetId, sheetName, vacancyId) {
  const range = `${sheetName}!A:A`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;
  if (rows) {
    return rows.some(row => row[0] === vacancyId);
  }
  return false;
}

async function appendToGoogleSheet(auth, vacancy) {
  if (!vacancy.details.company_emails || vacancy.details.company_emails.length === 0) {
    console.log(`Vacancy ID ${vacancy.details.vacancy_id} has no company emails. Skipping.`);
    return;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = 'Clean';

  try {
    const sheetsMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = sheetsMeta.data.sheets.some(sheet => sheet.properties.title === sheetName);
    if (!sheetExists) {
      throw new Error(`Sheet with name "${sheetName}" does not exist.`);
    }
  } catch (error) {
    console.error('Error fetching spreadsheet metadata:', error);
    return;
  }

  const isDuplicate = await checkIfDuplicate(sheets, spreadsheetId, sheetName, vacancy.details.vacancy_id);
  if (isDuplicate) {
    console.log(`Duplicate found for vacancy ID: ${vacancy.details.vacancy_id}. Skipping.`);
    return;
  }

  const firstEmptyRow = await getFirstEmptyRow(sheets, spreadsheetId, sheetName);
  const range = `${sheetName}!A${firstEmptyRow}`;

  const formattedDate = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm'); // Форматирование даты

  const values = [
    [
      vacancy.details.vacancy_id || '',
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
  console.log('Resource:', JSON.stringify(resource, null, 2));

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
    // Call the Apps Script to create dropdowns
  } catch (error) {
    console.error('Error appending data to Google Sheet:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

module.exports = {
  appendToGoogleSheet,
  checkIfDuplicate,
  getFirstEmptyRow
};
