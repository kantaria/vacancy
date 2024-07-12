const mongoose = require('mongoose');
const Vacancy = require('../models/vacancy'); // Импортируйте модель Vacancy
const connectDB = require('../config/mongoDB');

const countMatchingVacancies = async () => {
    try {
        const count = await Vacancy.countDocuments({
            // 'details.hh_vacancy_salary': { $gt: 100000 },
            // 'details.hh_vacancy_view_employment_mode': 'удаленная работа',
            // 'rating': { $exists: true },
            // 'rating': '00000'
        });
        console.log(`Количество подходящих записей: ${count}`);
    } catch (error) {
        console.error('Ошибка при подсчете записей:', error);
    }
};

const updateLimitRating = async () => {
    try {
        const result = await Vacancy.updateMany(
            { rating: 0 },
            { $set: { rating: '-1' } }
        );
        console.log(`Обновлено записей: ${result.nModified}`);
    } catch (error) {
        console.error('Ошибка при обновлении записей:', error);
    }
};

module.exports = {
    countMatchingVacancies,
    updateLimitRating
};