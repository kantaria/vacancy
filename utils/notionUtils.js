require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const findRecordById = async (databaseId, recordId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'VacancyID',
      rich_text: {
        equals: `"${recordId}"`, // добавляем кавычки вокруг ID
      },
    },
  });

  return response.results[0];
};

const updateRecord = async (pageId, updateFields) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties: updateFields,
  });

  return response;
};

module.exports = {
  findRecordById,
  updateRecord,
};
