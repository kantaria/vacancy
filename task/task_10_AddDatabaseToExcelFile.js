const Vacancy = require('../models/vacancy');
const cleanText = require('../utils/cleanText');
const handleError = require('../utils/errorHandler');
const log = require('../utils/logger');
const moment = require('moment');
const ExcelJS = require('exceljs');

async function task_10_AddDatabaseToExcelFile() {
  try {
    const vacancies = await Vacancy.find({});
    const totalVacancies = vacancies.length;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vacancies');

    worksheet.columns = [
      { header: 'Vacancy Title', key: 'title' },
      { header: 'Search Request', key: 'searchRequest' },
      { header: 'Salary', key: 'salary' },
      { header: 'Experience', key: 'experience' },
      { header: 'Employment Mode', key: 'employmentMode' },
      { header: 'Description', key: 'description' },
      { header: 'Skills', key: 'skills' },
      { header: 'Company Name', key: 'companyName' },
      { header: 'Company URL', key: 'companyURL' },
      { header: 'Website', key: 'companyURL2' },
      { header: 'Company Emails', key: 'companyEmails' },
      { header: 'Global Field', key: 'globalField' },
      { header: 'Rating', key: 'rating' },
      { header: 'Vacancy ID', key: 'vacancyID' },
      { header: 'Created At', key: 'createdAt' }
    ];

    vacancies.forEach((vacancy) => {
      const formattedDate = moment(vacancy.createdAt).format('DD MMMM YYYY, HH:mm');
      worksheet.addRow({
        title: vacancy.details.hh_vacancy_title || '',
        searchRequest: vacancy.details.searchRequest || '',
        salary: vacancy.details.hh_vacancy_salary || '',
        experience: vacancy.details.hh_vacancy_experience || '',
        employmentMode: (vacancy.details.hh_vacancy_view_employment_mode || []).join(', '),
        description: cleanText(vacancy.details.hh_vacancy_description || ''),
        skills: (vacancy.details.hh_vacancy_skills || []).join(', '),
        companyName: vacancy.details.hh_vacancy_company_name || '',
        companyURL: vacancy.details.hh_vacancy_company_url || '',
        companyURL2: vacancy.details.hh_company_url || '',
        companyEmails: (vacancy.details.company_emails || []).join(', '),
        globalField: vacancy.details.hh_global || '',
        rating: vacancy.rating || '',
        vacancyID: vacancy._id || '',
        createdAt: formattedDate
      });
      log(`Запись добавлена в Excel: ${vacancy._id}`);
    });

    const filePath = 'vacancies.xlsx';
    log(`Writing file to: ${filePath}`);
    await workbook.xlsx.writeFile(filePath);
    log(`Файл успешно создан: ${filePath}`);
  } catch (error) {
    handleError(error, 'Ошибка при добавлении записей в Excel');
  }
}

module.exports = task_10_AddDatabaseToExcelFile;
