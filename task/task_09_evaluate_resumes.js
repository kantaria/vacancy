const mongoose = require('mongoose');
const Vacancy = require('../models/vacancy');
const { getChatGPTResponse } = require('./task_09_ai');
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

const resume = `
МИХАИЛ КАНТАРИА
+37498128030 ⋄ +84369772490 ⋄ ДаНанг, Вьетнам kantariamo@gmail.com ⋄ linkedin.com/in/kantariamo ⋄ t.me/kantariamo

КРАТКОЕ ОПИСАНИЕ
Опытный проектный менеджер с более чем 5-летним опытом управления проектами и более чем 7-летним опытом разработки Front End. Обладаю глубокими знаниями в области Front End разработки, что позволяет эффективно сотрудничать с техническими командами и обеспечивать высокое качество продукта.

ОПЫТ РАБОТЫ
1. Lucky Team (09/2018 - 11/2023)
   Должность: Руководитель отдела разработки
   Обязанности:
   • Формирование новых команд
   • Управление проектами по разработке программного обеспечения, координация команд численностью более 60 человек
   • Внедрение методологий Agile, сокращение сроков реализации проектов на 15%
   • Контроль проектных планов и бюджетов
   • Регулярные встречи с заинтересованными сторонами для отслеживания прогресса и решения проблем
   • Обеспечение качества продукта через код-ревью и тестирование

2. Code Time (02/2015 – 08/2018)
   Должность: Технический директор (CTO)
   Обязанности:
   • Завершено более 10 крупных проектов, увеличение клиентской базы на 25%
   • Координация межфункциональных команд
   • Разработка и поддержка проектной документации
   • Управление рисками и изменениями, сокращение неудач на 20%
   • Наставничество и поддержка команды разработчиков

НАВЫКИ
Технические Навыки:
• Управление проектами: Agile, Scrum, Waterfall
• Инструменты: JIRA, Trello, Asana
• Front End разработка: HTML, CSS, JavaScript, Vue.js
• Анализ данных: Excel, Google Analytics

Управленческие Навыки:
• Планирование и координация, управление рисками
• Контроль качества, наставничество
• Управление конфликтами, принятие решений
• Разработка стратегий, управление изменениями

Социальные Навыки:
• Лидерство, коммуникация, решение проблем, управление временем

СЕРТИФИКАТЫ И КУРСЫ
• Google Project Management
• Google: Foundations of Project Management
• Google: Project Initiation: Starting a Successful Project
• Google: Project Planning: Putting It All Together
• Google: Project Execution: Running the Project
• Google: Agile Project Management
• Google: Applying Project Management In The Real World

ПРОЕКТЫ
1. Конструктор веб-сайтов
   • Управление командой из 25 специалистов, включая разработчиков, дизайнеров, тестировщиков и аналитиков
   • Ускорение доставки задач на сервисную платформу на 75%
   • Снижение ежемесячных расходов компании более чем на 7 500 000 рублей
   • Использование технологий Node.js и Vue.js для разработки масштабируемого и быстрого приложения

2. Создание школы программирования с нуля
   • Координация межфункциональной команды из 28 человек
   • Руководство разработкой закрытого портала для обучения студентов
   • Привлечение 12 новых преподавателей и расширение направлений обучения в школе

ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
• Английский - B1
• Русский - свободно
• Армянский - свободно
`;

async function evaluateVacancies(limit) {
    await connectDB();

    try {
        const vacancies = await Vacancy.find({
            'details.hh_vacancy_salary': { $gt: 100000 },
            'details.hh_vacancy_view_employment_mode': 'удаленная работа',
            $or: [
                { 'rating': { $exists: false } },
                { 'rating': { $ne: -1 } }
            ]
        }).limit(limit);

        const results = [];

        for (const vacancy of vacancies) {
            const { _id, hh_vacancy_title, hh_vacancy_salary, hh_vacancy_experience, hh_vacancy_description, hh_vacancy_company_name } = vacancy.details;

            const prompt = `
Вакансия:
Название: ${hh_vacancy_title}
Зарплата: ${hh_vacancy_salary}
Опыт: ${hh_vacancy_experience}
Описание: ${hh_vacancy_description}
Компания: ${hh_vacancy_company_name}

Резюме:
${resume}

Оцените соответствие резюме этой вакансии по шкале от 0 до 10. Просто верните число.
            `;

            try {
                const response = await getChatGPTResponse(prompt);
                if (response) {
                    const rating = parseInt(response.match(/\d+/)[0]); // Извлекаем число из ответа
                    await Vacancy.updateOne({ _id: vacancy._id }, { $set: { rating } });
                    results.push({ id: vacancy._id, оценка: rating });
                } else {
                    console.log(`No valid response for vacancy ID: ${vacancy._id}`);
                    await Vacancy.updateOne({ _id: vacancy._id }, { $set: { rating: -2 } });
                }
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.log(`Rate limit exceeded for vacancy ID: ${vacancy._id}. Skipping this vacancy.`);
                    await Vacancy.updateOne({ _id: vacancy._id }, { $set: { rating: -2 } });
                } else {
                    console.error('Ошибка при обращении к ChatGPT API:', error);
                    await Vacancy.updateOne({ _id: vacancy._id }, { $set: { rating: -2 } });
                }
            }
        }

        return results;
    } catch (error) {
        console.error('Ошибка при оценке вакансий:', error);
        throw error;
    } finally {
        mongoose.connection.close();
    }
}

module.exports = { evaluateVacancies };