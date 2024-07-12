require('dotenv').config();
const { Client } = require('@notionhq/client');
const mongoose = require('mongoose');
const Vacancy = require('../models/vacancy'); // Убедитесь, что путь правильный

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const databaseId = process.env.NOTION_DATABASE_ID_TESTING;
const pageSize = 100; // Количество записей за один запрос

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

const fetchVacancyIDsAndStatuses = async (startCursor = undefined) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: pageSize, // Количество записей за один запрос
    });

    const records = response.results;

    const vacancyData = records.map(record => {
      const vacancyIDProperty = record.properties.VacancyID;
      const statusProperty = record.properties.Status;

      const vacancyID = vacancyIDProperty && vacancyIDProperty.rich_text && vacancyIDProperty.rich_text.length > 0
        ? vacancyIDProperty.rich_text[0].text.content
        : 'VacancyID not found';

      const status = statusProperty && statusProperty.status && statusProperty.status.name
        ? statusProperty.status.name
        : 'Status not found';

      return { vacancyID, status };
    });

    const hasMore = response.has_more;
    const nextCursor = response.next_cursor;

    return { vacancyData, hasMore, nextCursor };

  } catch (error) {
    console.error('Error fetching records from Notion:', error.message);
    return { vacancyData: [], hasMore: false, nextCursor: null };
  }
};

const updateVacancyStatusInDB = async (vacancyID, notionStatus) => {
  try {
    const statusUpdate = {
      Preparation: false,
      ReadyToApply: false,
      Applied: false,
      TestTask: false,
      Interview: false,
      AwaitingResponse: false,
      Offered: false,
      Signed: false,
      Trash: false,
      Rejected: false
    };

    if (statusUpdate.hasOwnProperty(notionStatus)) {
      statusUpdate[notionStatus] = true;
    }

    await Vacancy.updateOne({ _id: vacancyID }, { status: statusUpdate });
    return statusUpdate;
  } catch (error) {
    console.error(`Error updating status for VacancyID ${vacancyID} in DB:`, error.message);
    return null;
  }
};

const findAndUpdateVacanciesInDB = async (vacancyData) => {
  try {
    const vacancyIDs = vacancyData.map(data => data.vacancyID);
    const vacancies = await Vacancy.find({ _id: { $in: vacancyIDs } }, 'status'); // Запрашиваем только поле status
    for (const vacancy of vacancies) {
      const matchingVacancy = vacancyData.find(data => data.vacancyID === vacancy._id.toString());
      if (matchingVacancy) {
        const updatedStatus = await updateVacancyStatusInDB(vacancy._id, matchingVacancy.status);
        console.log(`VacancyID: ${vacancy._id}`);
        console.log(`Updated Status in MongoDB: ${JSON.stringify(updatedStatus, null, 2)}`);
        console.log(`Status in Notion: ${matchingVacancy.status}`);
      } else {
        console.log(`VacancyID: ${vacancy._id}`);
        console.log(`Status in MongoDB: ${JSON.stringify(vacancy.status, null, 2)}`);
        console.log('Matching vacancy not found in Notion data');
      }
    }
  } catch (error) {
    console.error('Error finding vacancies in DB:', error.message);
  }
};

const processVacancies = async () => {
  let startCursor = undefined;
  let hasMore = true;
  let totalRecords = 0;
  let processedRecords = 0;
  const startTime = Date.now();

  // Предварительно получаем общее количество записей
  try {
    const countResponse = await notion.databases.query({
      database_id: databaseId,
      page_size: 1,
    });
    totalRecords = countResponse.total;
  } catch (error) {
    console.error('Error fetching total record count from Notion:', error.message);
    return;
  }

  while (hasMore) {
    const { vacancyData, hasMore: more, nextCursor } = await fetchVacancyIDsAndStatuses(startCursor);
    if (vacancyData.length > 0) {
      await findAndUpdateVacanciesInDB(vacancyData);
      processedRecords += vacancyData.length;
      const elapsedTime = (Date.now() - startTime) / 1000; // Время, прошедшее с начала процесса в секундах
      const averageTimePerRecord = elapsedTime / processedRecords; // Среднее время на запись
      const remainingRecords = totalRecords - processedRecords;
      const estimatedRemainingTime = remainingRecords * averageTimePerRecord; // Оценочное оставшееся время в секундах

      console.log(`Progress: ${processedRecords} / ${totalRecords}`);
      console.log(`Estimated remaining time: ${Math.round(estimatedRemainingTime)} seconds`);
      console.log(`Elapsed time: ${Math.round(elapsedTime)} seconds`);
    }
    startCursor = nextCursor;
    hasMore = more;
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`Total processing time: ${Math.round(totalTime)} seconds`);
};

const main = async () => {
  await connectDB();
  await processVacancies();
  mongoose.connection.close();
};

main();
