require('dotenv').config();
const { Client } = require('@notionhq/client');
const sleep = require('util').promisify(setTimeout);

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const databaseId = process.env.NOTION_DATABASE_ID_TESTING;
const delayMs = 200; // Задержка между запросами в миллисекундах

const getAllRecords = async (databaseId) => {
  let records = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    console.log('Fetching records from Notion...');
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
    });

    records = records.concat(response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;

    console.log(`Fetched ${response.results.length} records, total: ${records.length}`);
  }

  return records;
};

const updateRecord = async (pageId, updateFields) => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await notion.pages.update({
        page_id: pageId,
        properties: updateFields,
      });
      return response;
    } catch (error) {
      if ((error.code === 'notionhq_client_request_timeout' || error.code === 'notionhq_client_response_error') && attempt < 5) {
        console.warn(`Attempt ${attempt} failed with error: ${error.message}. Retrying...`);
        await sleep(delayMs * attempt); // Увеличиваем задержку с каждой попыткой
      } else {
        throw error;
      }
    }
  }
};

const removeQuotesFromVacancyID = async () => {
  const prettyMs = (await import('pretty-ms')).default;

  try {
    console.log('Fetching all records...');
    const records = await getAllRecords(databaseId);
    const totalRecords = records.length;
    let processedRecords = 0;

    console.log(`Total records to process: ${totalRecords}`);

    const startTime = Date.now();

    for (const record of records) {
      const vacancyIDProperty = record.properties.VacancyID;
      if (vacancyIDProperty && vacancyIDProperty.rich_text && vacancyIDProperty.rich_text.length > 0) {
        const vacancyID = vacancyIDProperty.rich_text[0].text.content;

        if (vacancyID.includes('"')) {
          const newVacancyID = vacancyID.replace(/"/g, '');
          const updateFields = {
            'VacancyID': {
              rich_text: [
                {
                  text: {
                    content: newVacancyID,
                  },
                },
              ],
            },
          };
          await updateRecord(record.id, updateFields);
          console.log(`Updated record ID: ${record.id}, new VacancyID: ${newVacancyID}`);
        }
      }

      processedRecords++;

      const elapsedTime = Date.now() - startTime;
      const estimatedTotalTime = (elapsedTime / processedRecords) * totalRecords;
      const eta = estimatedTotalTime - elapsedTime;

      console.log(`Processed records: ${processedRecords}/${totalRecords}, ETA: ${prettyMs(eta)}`);

      await sleep(delayMs); // Добавляем задержку между запросами
    }

    console.log(`Process completed: processed ${processedRecords} records.`);
  } catch (error) {
    console.error(`Error updating records in Notion: ${error.message}`);
  }
};

removeQuotesFromVacancyID();