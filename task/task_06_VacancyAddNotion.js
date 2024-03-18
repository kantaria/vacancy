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
        'Contracts': {
          multi_select: vacancy.details.hh_vacancy_view_accept_temporary.map(skill => ({ name: skill })),
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
        'Logo': {
          type: 'files',
          files: [
            {
              type: "external",
              name: "Logo",
              external: {
                url: vacancy.details.hh_vacancy_logo || 'https://fakeimg.pl/500x500?text=No+Logo',
              }
            }
          ]
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
          url: `https://hh.ru${vacancy.details.hh_vacancy_company_url}` || '',
        },
        'Address': {
          rich_text: [{
            text: {
              content: vacancy.details.hh_vacancy_address || ''
            }
          }],
        },
        'Web Site': {
          url: `https://${vacancy.details.hh_company_url}` || '',
        },
        'Field of activity': {
          multi_select: vacancy.details.hh_company_field_of_activity ? vacancy.details.hh_company_field_of_activity.map(activity => ({ name: activity })) : [],
        },
        'Presentation info': {
          rich_text: [{
            text: {
              content: ((vacancy.details.hh_company_description || '') // Замена null на пустую строку
                .replace(/<\/?[^>]+(>|$)/g, "") // Удаление HTML тегов
                .replace(/&nbsp;/g, " ") // Замена &nbsp; на пробелы
                .slice(0, 2000)) || '' // Обрезка до 2000 символов и обеспечение, что результат не null
            }
          }],
        },
        'Phone': {
          rich_text: [{
            text: {
              content: (vacancy.details.company_phones ? vacancy.details.company_phones.join(', ') : null)
            }
          }],
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