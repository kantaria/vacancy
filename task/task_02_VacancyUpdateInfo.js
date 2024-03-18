const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const extractHighestSalary = require('../utils/extractHighestSalary');
const extractCurrencySymbol = require('../utils/extractCurrencySymbol');
const task_03_VacancyUpdateInfoCompanyDetails = require('./task_03_VacancyUpdateInfoCompanyDetails');
const { createMultiBar } = require('../config/progressBarConfig');
const uniqid = require('uniqid');

// Создаём инстанс MultiBar вне функции, чтобы его состояние было общим для всех вызовов функций
const multiBar = createMultiBar();
let globalBar; // Глобальный прогресс-бар, который будет отображать общий прогресс

async function fetchVacancyDetails(url, searchQuery) {
    // Передаем bar как аргумент функции для индивидуального отслеживания прогресса
    const bar = multiBar.create(1, 0, { name: url.slice(0, 50) + '...' });
    try {
        const { data } = await axios.get(url, { headers: getHeaders() });
        const $ = cheerio.load(data);
            // Создаем объект деталей вакансии...
            const details = {
                vacancy_id: uniqid.time(),
                searchRequest: searchQuery,
                hh_vacancy_title: $('h1[data-qa="vacancy-title"]').text() || null,
                hh_vacancy_salary: extractHighestSalary($('span[data-qa="vacancy-salary-compensation-type-net"]').text()),
                hh_vacancy_currency: extractCurrencySymbol($('span[data-qa="vacancy-salary-compensation-type-net"]').text()) || null,
                hh_vacancy_experience: $('[data-qa="vacancy-experience"]').text() || null,
                hh_vacancy_view_employment_mode: $('[data-qa="vacancy-view-employment-mode"]').text().split(',').map(text => text.trim()).filter(text => text.length > 0) || null,
                hh_vacancy_view_accept_temporary: $('[data-qa="vacancy-view-accept-temporary"]').text().replace('Возможно временное оформление:', '').trim().split(',').map(text => text.trim()).filter(text => text.length > 0) || null,
                hh_vacancy_description: $('[data-qa="vacancy-description"]').text() || null,
                hh_vacancy_skills: $('[data-qa="bloko-tag bloko-tag_inline skills-element"]').map((i, el) => $(el).text()).get() || null,
                hh_vacancy_logo: $('img.vacancy-company-logo-image-redesigned').attr('src') || null,
                hh_vacancy_company_name: $('a[data-qa="vacancy-company-name"]').first().text() || null,
                hh_vacancy_company_url: "https://hh.ru"+$('a[data-qa="vacancy-company-name"]').attr('href') || null,
                hh_vacancy_address: $('[data-qa="vacancy-view-raw-address"]').first().text() || null,
            };
            bar.increment(); // Обновляем индивидуальный прогресс-бар
            globalBar.increment(); // Важно! Обновляем глобальный прогресс-бар
            await task_03_VacancyUpdateInfoCompanyDetails(details);
            return details;
        } catch (error) {
            console.error(`Failed for URL ${url}: ${error}`);
            bar.stop(); // Останавливаем индивидуальный прогресс-бар в случае ошибки
            return null;
        }
    }
    
    const task_02_VacancyUpdateInfo = async (urls, searchQuery) => {
        // Инициализируем глобальный прогресс-бар с общим количеством вакансий
        globalBar = multiBar.create(urls.length, 0, { name: 'Total Progress' });
    
        for (const url of urls) {
            await fetchVacancyDetails(url, searchQuery);
        }
        // multiBar.stop() уже вызовется автоматически при завершении всех баров, так что явно вызывать его здесь не нужно
        console.log('All URLs processed.');
        return true;
    };
    
    module.exports = task_02_VacancyUpdateInfo;