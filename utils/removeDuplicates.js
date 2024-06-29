const mongoose = require('mongoose');
const Vacancy = require('../models/vacancy');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB подключен...');
  } catch (err) {
    console.error('Ошибка подключения к MongoDB:', err.message);
    process.exit(1);
  }
};

const removeDuplicates = async () => {
  await connectDB();

  try {
    const vacancies = await Vacancy.find({});
    const uniqueVacancies = new Map();

    for (const vacancy of vacancies) {
      const key = `${vacancy.details.hh_vacancy_company_name}-${vacancy.details.hh_vacancy_description}`;
      if (!uniqueVacancies.has(key)) {
        uniqueVacancies.set(key, vacancy._id);
      } else {
        await Vacancy.findByIdAndDelete(vacancy._id);
        console.log(`Дубликат удален: ${vacancy._id}`);
      }
    }

    console.log('Проверка и удаление дубликатов завершены.');
  } catch (error) {
    console.error('Ошибка при удалении дубликатов:', error);
  } finally {
    mongoose.connection.close();
  }
};

removeDuplicates();