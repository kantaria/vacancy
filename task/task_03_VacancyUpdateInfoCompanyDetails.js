require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const { createSingleBar } = require('../config/progressBarConfig');
const task_04_VacancyCollectLinks = require('./task_04_VacancyCollectLinks');
// const task_06_VacancyAddNotion = require('./task_06_VacancyAddNotion'); // Закомментировано
const task_07_VacancyAddGoogleSheet = require('./task_07_VacancyAddGoogleSheet');
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

        progressBar.update(100); // Завершаем прогресс после обработки данных
        progressBar.stop(); // Останавливаем прогресс-бар

        if (vacancyDetails.details.hh_company_url) {
            await task_04_VacancyCollectLinks(vacancyDetails);
        } else {
            try {
                const vacancyData = vacancyDetails; // Получаем данные вакансии из тела запроса
                vacancyData.details.hh_company_url = 'null'; 
                vacancyData.details.contactLinks = null; 
                vacancyData.details.company_emails = [];
                const vacancySave = new Vacancy(vacancyData); // Создаем новый экземпляр модели Vacancy с полученными данными
                await vacancySave.save(); // Сохраняем вакансию в базу данных
                // await task_06_VacancyAddNotion(vacancyDetails); // Закомментировано
                await task_07_VacancyAddGoogleSheet(vacancyDetails); // Добавляем вакансию в Google Sheets
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
        };

        return vacancyDetails.details;
    }
}

module.exports = task_03_VacancyUpdateInfoCompanyDetails;
