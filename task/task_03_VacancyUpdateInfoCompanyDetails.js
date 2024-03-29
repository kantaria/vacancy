require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const { createSingleBar } = require('../config/progressBarConfig');
const task_04_VacancyCollectLinks = require('./task_04_VacancyCollectLinks');
const task_06_VacancyAddNotion = require('./task_06_VacancyAddNotion');
const Vacancy = require('../models/vacancy');


function findCompanyFieldOfActivity($) {
    let result = null;
    const sidebarHeaderColorElements = $('[data-qa="sidebar-header-color"]');
    sidebarHeaderColorElements.each(function () {
        if ($(this).text().trim() === "Сферы деятельности") {
            result = $(this).next().text().trim().split(',').map(item => item.trim());
            return false;
        }
    });
    return result;
}

async function task_03_VacancyUpdateInfoCompanyDetails(details, showProgressBar = true) {
    let vacancyDetails = { details };
    const progressBar = createSingleBar(showProgressBar);
    progressBar.start(100, 0); // Начальное значение прогресса

    try {
        const { data } = await axios.get(vacancyDetails.details.hh_vacancy_company_url, { headers: getHeaders() });
        progressBar.update(50); // Обновляем прогресс после успешного запроса
        const $ = cheerio.load(data);

        // Извлекаем информацию о компании и добавляем её непосредственно в объект details
        vacancyDetails.details.hh_company_url = $('[data-qa="sidebar-company-site"]').text().trim() || null;
        vacancyDetails.details.hh_company_field_of_activity = findCompanyFieldOfActivity($) || null;
        vacancyDetails.details.hh_company_description = $('[data-qa="company-description-text"]').html() || null;

        progressBar.update(100); // Завершаем прогресс после обработки данных
        progressBar.stop(); // Останавливаем прогресс-бар

        if (vacancyDetails.details.hh_company_url) {
            await task_04_VacancyCollectLinks(vacancyDetails);
        } else {
            try {
                const vacancyData = vacancyDetails; // Получаем данные вакансии из тела запроса
                vacancyData.notionStatus = true;
                vacancyData.details.hh_company_url = 'null'; // Add notionStatus property
                vacancyData.details.hh_company_field_of_activity = null;
                vacancyData.details.hh_company_description = null;
                vacancyData.details.contactLinks = null; // Add notionStatus property
                vacancyData.details.company_phones = []; // Add notionStatus property
                vacancyData.details.company_emails = []; // Add notionStatus property
                const vacancySave = new Vacancy(vacancyData); // Создаем новый экземпляр модели Vacancy с полученными данными
                await vacancySave.save(); // Сохраняем вакансию в базу данных
                await task_06_VacancyAddNotion(vacancyDetails); // Добавляем вакансию в Notion
                console.log('Вакансия сохранена в базу данных БЕЗ деталей о компании');
            } catch (error) {
                console.error('Ошибка при добавлении вакансии:', error);
            }
        }
        return vacancyDetails.details; // Возвращаем обновлённые детали вакансии
    } catch (error) {
        console.error(error);
        progressBar.stop();
        vacancyDetails.details.error = {
            hh_company_url: null,
            hh_company_field_of_activity: null,
            hh_company_description: null,
        };

        return vacancyDetails.details;
    }
}

module.exports = task_03_VacancyUpdateInfoCompanyDetails;
