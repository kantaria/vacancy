const mongoose = require('mongoose');

const VacancySchema = new mongoose.Schema({
  vacancy_id: String,
  details: {
    searchRequest: String,
    globalUrl: String,
    hh_vacancy_title: String,
    hh_vacancy_salary: String,
    hh_vacancy_experience: String,
    hh_vacancy_view_employment_mode: [String],
    hh_vacancy_description: { type: String },
    hh_vacancy_skills: [String],
    hh_vacancy_company_name: String,
    hh_vacancy_company_url: String,
    hh_company_url: String,
    hh_global: String,
    contactLinks: [String],
    company_emails: [String]
  },
  rating: Number,
  status: {
    type: Map,
    of: Boolean,
    default: {
      'Preparation': true,
      'ReadyToApply': false,
      'Applied': false,
      'TestTask': false,
      'Interview': false,
      'AwaitingResponse': false,
      'Offered': false,
      'Signed': false,
      'Trash': false,
      'Rejected': false
    }
  }
}, { timestamps: true });

module.exports = mongoose.models.Vacancy || mongoose.model('Vacancy', VacancySchema);
