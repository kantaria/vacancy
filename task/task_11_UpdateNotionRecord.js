require('dotenv').config();
const { findRecordById, updateRecord } = require('../utils/notionUtils');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');

const updateNotionRecord = async (vacancy) => {
  try {
    const recordId = vacancy.details.vacancy_id;
    const databaseId = process.env.NOTION_DATABASE_ID_TESTING;

    const record = await findRecordById(databaseId, recordId);

    if (record) {
      const pageId = record.id;
      const updateFields = {
        Rating: {
          number: 100,
        },
      };
      await updateRecord(pageId, updateFields);
      log(`Запись с ID ${recordId} обновлена: рейтинг установлен на 100.`);
    } else {
      log(`Запись с ID ${recordId} не найдена.`);
    }
  } catch (error) {
    handleError(error, `Ошибка при обновлении записи в Notion: ${error.message}. Полная ошибка: ${JSON.stringify(error)}`);
  }
};

module.exports = updateNotionRecord;
