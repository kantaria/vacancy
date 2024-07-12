require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const task_04_VacancyCollectLinks = require('./task_04_VacancyCollectLinks');
const Vacancy = require('../models/vacancy');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');

const initialStatus = {
  Preparation: true,
  ReadyToApply: false,
  Applied: false,
  TestTask: false,
  Interview: false,
  AwaitingResponse: false,
  Offered: false,
  Signed: false,
  Trash: false,
  Rejected: false,
};

async function task_03_VacancyUpdateInfoCompanyDetails(details) {
  let vacancyDetails = { details };

  try {
    const { data } = await axios.get(vacancyDetails.details.hh_vacancy_company_url, { headers: getHeaders() });
    const $ = cheerio.load(data);

    vacancyDetails.details.hh_company_url = $('[data-qa="sidebar-company-site"]').text().trim() || null;

    if (vacancyDetails.details.hh_company_url) {
      await task_04_VacancyCollectLinks(vacancyDetails);
    } else {
      log(`Вакансия без деталей о компании, пропускаем: ${vacancyDetails.details.hh_vacancy_company_name}`);
    }

    // Добавление статуса при обновлении информации о компании
    const vacancy = await Vacancy.findOne({ 'details.globalUrl': vacancyDetails.details.globalUrl });
    if (vacancy) {
      vacancy.details = vacancyDetails.details;
      vacancy.status = initialStatus;
      await vacancy.save();
    } else {
      const newVacancy = new Vacancy({
        details: vacancyDetails.details,
        status: initialStatus,
      });
      await newVacancy.save();
    }

    return vacancyDetails.details;
  } catch (error) {
    handleError(error, 'Error in task_03_VacancyUpdateInfoCompanyDetails');
    return vacancyDetails.details;
  }
}

module.exports = task_03_VacancyUpdateInfoCompanyDetails;
