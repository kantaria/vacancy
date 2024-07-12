// utils/vacancyUpdateUtils.js
const mongoose = require('mongoose');
const Vacancy = require('../models/vacancy'); // Импортируйте модель Vacancy
const cliProgress = require('cli-progress');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB подключен...');
    } catch (err) {
        console.error('Ошибка подключения к MongoDB:', err.message);
        process.exit(1);
    }
}

async function updateVacanciesWithGlobalField(batchSize = 10) {
    await connectDB();

    try {
        const vacancies = await Vacancy.find({});
        const totalVacancies = vacancies.length;
        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progressBar.start(totalVacancies, 0);

        for (let i = 0; i < totalVacancies; i += batchSize) {
            const batch = vacancies.slice(i, i + batchSize);

            const promises = batch.map(async (vacancy) => {
                const { hh_vacancy_title, hh_vacancy_salary, hh_vacancy_experience, hh_vacancy_description, hh_vacancy_company_name } = vacancy.details;

                const hh_global = `
Вакансия: ${hh_vacancy_title || 'Не указано'}
Зарплата: ${hh_vacancy_salary || 'Не указано'}
Опыт: ${hh_vacancy_experience || 'Не указано'}
Описание: ${hh_vacancy_description || 'Не указано'}
Компания: ${hh_vacancy_company_name || 'Не указано'}
                `.trim();

                try {
                    const updateResult = await Vacancy.findOneAndUpdate(
                        { _id: vacancy._id },
                        { $set: { 'details.hh_global': hh_global } },
                        { new: true, upsert: true }
                    );

                    if (updateResult) {
                        console.log(`Запись с ID: ${vacancy._id} успешно обновлена.`);
                    } else {
                        console.log(`Запись с ID: ${vacancy._id} не была обновлена.`);
                    }
                } catch (updateError) {
                    console.error(`Ошибка обновления записи с ID: ${vacancy._id}:`, updateError.message);
                }
            });

            await Promise.all(promises);
            progressBar.update(i + batchSize > totalVacancies ? totalVacancies : i + batchSize);
        }

        progressBar.stop();
        console.log('Все вакансии обновлены с новым полем hh_global.');
    } catch (error) {
        console.error('Ошибка при обновлении вакансий:', error);
    } finally {
        mongoose.connection.close();
    }
}

module.exports = { updateVacanciesWithGlobalField };
