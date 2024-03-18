require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');

// Modify the function to accept $ as a parameter
function findCompanyFieldOfActivity($) {
    let result = null;
    const sidebarHeaderColorElements = $('[data-qa="sidebar-header-color"]');
    sidebarHeaderColorElements.each(function () {
        if ($(this).text().trim() === "Сферы деятельности") {
            result = $(this).next().text().trim().split(',').map(item => item.trim());
            return false; // Break the loop
        }
    });
    return result;
}

async function task_03_VacancyUpdateInfoCompanyDetails(details) {
    let vacancyDetails = { details };

    try {
        const { data } = await axios.get(vacancyDetails.details.hh_vacancy_company_url, { headers: getHeaders() });
        const $ = cheerio.load(data);

        const companyDetails = {
            hh_company_url: $('[data-qa="sidebar-company-site"]').text().trim() || null,
            // Pass $ to findCompanyFieldOfActivity
            hh_company_field_of_activity: findCompanyFieldOfActivity($) || null,
            hh_company_description: $('[data-qa="company-description-text"]').html() || null,
        };

        vacancyDetails.companyDetails = companyDetails; // Добавляем companyDetails как подобъект vacancyDetails

        console.log(vacancyDetails);
        return companyDetails;
    } catch (error) {
        console.error(error);
        // В случае ошибки можно также добавить структуру ошибки
        vacancyDetails.error = {
            hh_company_url: null,
            hh_company_field_of_activity: null,
            hh_company_description: null,
        };
        return vacancyDetails;
    }
}

module.exports = task_03_VacancyUpdateInfoCompanyDetails;
