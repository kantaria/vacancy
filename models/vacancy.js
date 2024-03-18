// models/vacancy.js
const mongoose = require('mongoose');

const VacancySchema = new mongoose.Schema({
  url: String,
  vacancy_id: String,
  searchRequest: String,
  notionStatus: { type: Boolean, default: false },
  details: {
    hh_vacancy_title: String,
    hh_vacancy_salary: String,
    hh_vacancy_currency: String,
    hh_vacancy_experience: String,
    hh_vacancy_view_employment_mode: [String],
    hh_vacancy_view_accept_temporary: [String],
    hh_vacancy_description: { type: String },
    hh_vacancy_skills: [String],
    hh_vacancy_logo: String,
    hh_vacancy_company_name: String,
    hh_vacancy_company_url: String,
    hh_vacancy_address: String,
    hh_company_url: String,
    hh_company_field_of_activity: [String],
    hh_company_description: String,
    contactLinks: [String],
    company_phones: [String],
    company_emails: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('vacancy', VacancySchema);
