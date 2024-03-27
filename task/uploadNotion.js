require('dotenv').config();
const { Client } = require('@notionhq/client');
const connectDB = require('../config/mongoDB');
const Vacancy = require('../models/vacancy');
const uniqid = require('uniqid');

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const databaseId = process.env.NOTION_DATABASE_ID_TESTING;

async function uploadNotion() {
  await connectDB();

  const totalRecords = await Vacancy.countDocuments();
  let addedRecords = 0;
  const batchSize = 100;
  let hasMore = true;
  let skip = 0;
  const startTime = Date.now();

  console.log(`Всего записей для добавления: ${totalRecords}`);

  while (hasMore) {
    const dataBatch = await Vacancy.find().skip(skip).limit(batchSize);
    if (dataBatch.length === 0) {
      hasMore = false;
      console.log('Загрузка данных завершена.');
      break;
    }

    for (const data of dataBatch) {
      try {
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: {
            'Uniqid': {
              rich_text: [{
                text: {
                  content: uniqid.time()
                }
              }],
            },
            'Search Request': {
              select: {
                name: data.details.searchRequest || null
              }
            },
            'Vacancy Title': {
              title: [{
                text: {
                  content: data.details.hh_vacancy_title || ''
                }
              }],
            },
            'Salary': {
              number: data.details.hh_vacancy_salary ? parseInt(data.details.hh_vacancy_salary, 10) : null
            },
            'Currency': {
              rich_text: [{
                text: {
                  content: data.details.hh_vacancy_currency || ""
                }
              }],
            },
            'Experience': {
              rich_text: [{
                text: {
                  content: data.details.hh_vacancy_experience || ''
                }
              }],
            },
            'Employment type': {
              multi_select: data.details.hh_vacancy_view_employment_mode.map(type => ({ name: type })),
            },
            'Contracts': {
              multi_select: data.details.hh_vacancy_view_accept_temporary.map(skill => ({ name: skill })),
            },
            'Description': {
              rich_text: [{
                text: {
                  content: (data.details.hh_vacancy_description || '').slice(0, 2000)
                }
              }],
            },
            'Skills': {
              multi_select: data.details.hh_vacancy_skills.map(skill => ({
                name: skill.replace(/,/g, ' ')
              })),
            },
            'Logo': {
              files: [{
                type: "external",
                name: "Logo",
                external: {
                  url: data.details.hh_vacancy_logo || 'https://fakeimg.pl/500x500?text=No+Logo',
                }
              }]
            },
            'Company': {
              rich_text: [{
                text: {
                  content: data.details.hh_vacancy_company_name || ''
                }
              }],
            },
            'Announcement': {
              url: data.details.globalUrl || null,
            },
            'Presentation': {
              url: data.details.hh_vacancy_company_url || '',
            },
            'Address': {
              rich_text: [{
                text: {
                  content: data.details.hh_vacancy_address || ''
                }
              }],
            },
            'Web Site': {
              url: `https://${data.details.hh_company_url}` || '',
            },
            'Field of activity': {
              multi_select: data.details.hh_company_field_of_activity ? data.details.hh_company_field_of_activity.map(activity => ({ name: activity })) : [],
            },
            'Presentation info': {
              rich_text: [{
                text: {
                  content: ((data.details.hh_company_description || '') // Замена null на пустую строку
                    .replace(/<\/?[^>]+(>|$)/g, "") // Удаление HTML тегов
                    .replace(/&nbsp;/g, " ") // Замена &nbsp; на пробелы
                    .slice(0, 2000)) || '' // Обрезка до 2000 символов и обеспечение, что результат не null
                }
              }],
            },
            'Phone': {
              rich_text: [{
                text: {
                  content: (data.details.company_phones ? data.details.company_phones.join(', ') : null)
                }
              }],
            },
            'Emails': {
              rich_text: [{
                text: {
                  content: (data.details.company_emails ? data.details.company_emails.join(', ') : null)
                }
              }],
            }
          }
        });

        addedRecords++;
        console.log(`Добавлено записей: ${addedRecords}/${totalRecords}. Осталось добавить: ${totalRecords - addedRecords}`);

        await delay(10);

      } catch (error) {
        console.error(`Ошибка загрузки в Notion: ${error.message}`);
      }
    }

    const elapsedTime = (Date.now() - startTime) / 1000;
    const estimatedTotalTime = (elapsedTime / addedRecords) * totalRecords;
    const estimatedRemainingTime = estimatedTotalTime - elapsedTime;

    console.log(`Примерное оставшееся время: ${(estimatedRemainingTime / 60).toFixed(2)} минут`);

    skip += batchSize;
  }

  console.log('Процесс загрузки данных в Notion полностью завершён.');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

uploadNotion().then(() => console.log('Завершение.'));
