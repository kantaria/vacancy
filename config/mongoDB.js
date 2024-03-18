const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB подключен...');
    } catch (err) {
        console.error('Ошибка подключения к MongoDB:', err.message);
        // Завершаем процесс с ошибкой для предотвращения запуска приложения без базы данных
        process.exit(1);
    }
};

module.exports = connectDB;