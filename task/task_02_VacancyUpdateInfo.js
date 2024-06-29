const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const Vacancy = require('../models/vacancy');
const extractHighestSalary = require('../utils/extractHighestSalary');
const extractCurrencySymbol = require('../utils/extractCurrencySymbol');
const task_03_VacancyUpdateInfoCompanyDetails = require('./task_03_VacancyUpdateInfoCompanyDetails');
const { createMultiBar } = require('../config/progressBarConfig');
const uniqid = require('uniqid');
const fs = require('fs');
const path = require('path');  // Добавьте этот импорт

// Создаём инстанс MultiBar вне функции, чтобы его состояние было общим для всех вызовов функций
const multiBar = createMultiBar();
let globalBar; // Глобальный прогресс-бар, который будет отображать общий прогресс

const modelsPath = path.join(__dirname, '../models');
fs.readdir(modelsPath, (err, files) => {
  if (err) {
    console.error('Ошибка чтения каталога models:', err);
  } else {
    console.log('Содержимое каталога models:', files);
  }
});

async function fetchVacancyDetails(url, searchQuery) {
    // Передаем bar как аргумент функции для индивидуального отслеживания прогресса
    const bar = multiBar.create(1, 0, { name: url.slice(0, 50) + '...' });
    try {
        const { data } = await axios.get(url, { headers: getHeaders() });
        const $ = cheerio.load(data);
            // Создаем объект деталей вакансии...
            const details = {
                globalUrl: url,
                vacancy_id: uniqid.time(),
                searchRequest: searchQuery,
                hh_vacancy_title: $('h1[data-qa="vacancy-title"]').text() || null,
                hh_vacancy_salary: extractHighestSalary($('span[data-qa="vacancy-salary-compensation-type-net"]').text()),
                hh_vacancy_currency: extractCurrencySymbol($('span[data-qa="vacancy-salary-compensation-type-net"]').text()) || null,
                hh_vacancy_experience: $('[data-qa="vacancy-experience"]').text() || null,
                hh_vacancy_view_employment_mode: $('[data-qa="vacancy-view-employment-mode"]').text().split(',').map(text => text.trim()).filter(text => text.length > 0) || null,
                hh_vacancy_description: $('[data-qa="vacancy-description"]').text() || null,
                hh_vacancy_skills: $('[data-qa="bloko-tag bloko-tag_inline skills-element"]').map((i, el) => $(el).text()).get() || null,
                hh_vacancy_company_name: $('a[data-qa="vacancy-company-name"]').first().text() || null,
                hh_vacancy_company_url: "https://hh.ru"+$('a[data-qa="vacancy-company-name"]').attr('href') || null,
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
        // Проверяем, существует ли уже запись с таким URL в базе данных
        const existingVacancy = await Vacancy.findOne({ 'details.globalUrl': url });
        if (existingVacancy) {
            console.log("Запись уже ранее добавлена в базу данных: " + url);
            globalBar.increment(); // Обновляем глобальный прогресс-бар, чтобы отразить пропуск этой вакансии
            continue; // Пропускаем текущую итерацию цикла и переходим к следующему URL
        }

        // Если записи с таким URL нет, продолжаем обработку
        await fetchVacancyDetails(url, searchQuery);
        }
        console.log('All URLs processed.');
        return true;
    };

    module.exports = task_02_VacancyUpdateInfo;