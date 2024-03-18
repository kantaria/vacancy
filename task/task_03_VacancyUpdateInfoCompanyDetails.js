require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');

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

async function task_03_VacancyUpdateInfoCompanyDetails(details) {
    let vacancyDetails = { details };

    try {
        const { data } = await axios.get(vacancyDetails.details.hh_vacancy_company_url, { headers: getHeaders() });
        const $ = cheerio.load(data);

        // Извлекаем информацию о компании и добавляем её непосредственно в объект details
        vacancyDetails.details.hh_company_url = $('[data-qa="sidebar-company-site"]').text().trim() || null;
        vacancyDetails.details.hh_company_field_of_activity = findCompanyFieldOfActivity($) || null;
        vacancyDetails.details.hh_company_description = $('[data-qa="company-description-text"]').html() || null;

        console.log(vacancyDetails)
        return vacancyDetails.details; // Возвращаем обновлённые детали вакансии
    } catch (error) {
        console.error(error);
        // В случае ошибки добавляем информацию об ошибке непосредственно в объект details
        vacancyDetails.details.error = {
            hh_company_url: null,
            hh_company_field_of_activity: null,
            hh_company_description: null,
        };
        return vacancyDetails.details;
    }
}

module.exports = task_03_VacancyUpdateInfoCompanyDetails;
