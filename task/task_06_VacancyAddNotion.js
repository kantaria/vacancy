require('dotenv').config();
const { Client } = require('@notionhq/client');

// Инициализация клиента Notion
const notion = new Client({
  auth: process.env.NOTION_SECRET
});

const databaseId = process.env.NOTION_DATABASE_ID_TESTING;


async function task_06_VacancyAddNotion(vacancy) {
  try {
    await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        'Uniqid': {
          rich_text: [{
            text: {
              content: vacancy.details.vacancy_id
            }
          }],
        },
        'Search Request': {
          select: {
            name: vacancy.details.searchRequest || null
          }
        },
        'Vacancy Title': {
          title: [{
            text: {
              content: vacancy.details.hh_vacancy_title || ''
            }
          }],
        },
        'Salary': {
          number: vacancy.details.hh_vacancy_salary ? parseInt(vacancy.details.hh_vacancy_salary, 10) : null
        },
        'Currency': {
          rich_text: [{
            text: {
              content: vacancy.details.hh_vacancy_currency || ""
            }
          }],
        },
        'Experience': {
          rich_text: [{
            text: {
              content: vacancy.details.hh_vacancy_experience || ''
            }
          }],
        },
        'Employment type': {
          multi_select: vacancy.details.hh_vacancy_view_employment_mode.map(type => ({ name: type })),
        },
        'Description': {
          rich_text: [{
            text: {
              content: (vacancy.details.hh_vacancy_description || '').slice(0, 2000)
            }
          }],
        },
        'Skills': {
          multi_select: vacancy.details.hh_vacancy_skills.map(skill => ({
            name: skill.replace(/,/g, ' ')
          })),
        },
        'Company': {
          rich_text: [{
            text: {
              content: vacancy.details.hh_vacancy_company_name || ''
            }
          }],
        },
        'Announcement': {
          url: vacancy.url || null,
        },
        'Presentation': {
          url: `${vacancy.details.hh_vacancy_company_url}` || '',
        },
        'Web Site': {
          url: `https://${vacancy.details.hh_company_url}` || '',
        },
        'Emails': {
          rich_text: [{
            text: {
              content: (vacancy.details.company_emails ? vacancy.details.company_emails.join(', ') : null)
            }
          }],
        }
      }
    });
    console.log(`Запись добавлена в Notion: ${vacancy.details.vacancy_id}`);
  } catch (error) {
    console.log(`Ошибка при добавлении записи в Notion: ${error.message}. Полная ошибка: ${JSON.stringify(error)}`);
  }
}

module.exports = task_06_VacancyAddNotion;