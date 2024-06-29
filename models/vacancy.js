// models/vacancy.js
const mongoose = require('mongoose');

const VacancySchema = new mongoose.Schema({
  vacancy_id: String,
  details: {
    searchRequest: String,
    globalUrl: String,
    hh_vacancy_title: String,
    hh_vacancy_salary: String,
    hh_vacancy_currency: String,
    hh_vacancy_experience: String,
    hh_vacancy_view_employment_mode: [String],
    hh_vacancy_description: { type: String },
    hh_vacancy_skills: [String],
    hh_vacancy_company_name: String,
    hh_vacancy_company_url: String,
    hh_company_url: String,
    contactLinks: [String],
    company_emails: [String]
  }
}, { timestamps: true });

module.exports = mongoose.models.Vacancy || mongoose.model('Vacancy', VacancySchema);

