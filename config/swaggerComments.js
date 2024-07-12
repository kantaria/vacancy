/**
 * @swagger
 * /api/vacancies:
 *   post:
 *     summary: Добавить вакансию
 *     description: Добавляет новую вакансию в базу данных
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               details:
 *                 type: object
 *                 description: Данные вакансии
 *     responses:
 *       201:
 *         description: Вакансия успешно добавлена
 *       400:
 *         description: Поле company_emails пустое или вакансия уже существует
 *       500:
 *         description: Ошибка при добавлении вакансии
 */


/**
 * @swagger
 * /api/add-database-to-google-sheets:
 *   get:
 *     summary: Добавить записи в Google Sheets
 *     description: Добавляет все записи из базы данных в Google Sheets
 *     responses:
 *       200:
 *         description: Все записи добавлены в Google Sheets
 *       500:
 *         description: Ошибка при добавлении записей в Google Sheets
 */


/**
 * @swagger
 * /api/add-database-to-excel:
 *   get:
 *     summary: Добавить записи в Excel
 *     description: Добавляет все записи из базы данных в Excel файл
 *     responses:
 *       200:
 *         description: Все записи добавлены в Excel файл
 *       500:
 *         description: Ошибка при добавлении записей в Excel
 */


/**
 * @swagger
 * /api/count-vacancies:
 *   post:
 *     summary: Подсчет подходящих вакансий
 *     description: Подсчитывает количество вакансий, соответствующих заданным критериям
 *     responses:
 *       200:
 *         description: Количество подходящих записей
 *       500:
 *         description: Ошибка при подсчете записей
 */


/**
 * @swagger
 * /api/update-vacancies-with-global-field:
 *   post:
 *     summary: Обновить вакансии с глобальным полем
 *     description: Обновляет все вакансии, добавляя глобальное поле
 *     responses:
 *       200:
 *         description: Все вакансии обновлены с новым полем hh_global
 *       500:
 *         description: Ошибка при обновлении вакансий
 */


/**
 * @swagger
 * /api/currency-rates:
 *   get:
 *     summary: Получить курсы валют
 *     description: Возвращает текущие курсы валют к рублю
 *     responses:
 *       200:
 *         description: Успешно получены курсы валют
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Не удалось получить курсы валют
 */


/**
 * @swagger
 * /api/update-notion-record:
 *   post:
 *     summary: Обновить запись в Notion
 *     description: Обновляет запись в Notion по заданному ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vacancy:
 *                 type: object
 *                 description: Данные вакансии
 *     responses:
 *       200:
 *         description: Запись обновлена
 *       400:
 *         description: Неверный запрос
 *       500:
 *         description: Внутренняя ошибка сервера
 */


/**
 * @swagger
 * /api/vacancies/details:
 *   post:
 *     summary: Получить информацию о вакансии по ID
 *     description: Возвращает информацию о вакансии по заданному ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID вакансии
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Информация о вакансии
 *       404:
 *         description: Вакансия не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 */

/**
 * @swagger
 * /api/evaluate-vacancies:
 *   post:
 *     summary: Оценить вакансии
 *     description: Оценивает вакансии с использованием ChatGPT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 description: Количество вакансий для оценки
 *     responses:
 *       200:
 *         description: Результаты оценки вакансий
 *       400:
 *         description: Неверный запрос
 *       500:
 *         description: Внутренняя ошибка сервера
 */


/**
 * @swagger
 * /api/start-scraping:
 *   get:
 *     summary: Запустить процесс сбора данных
 *     description: Запускает процесс сбора данных по переданным запросам
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchQueries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив поисковых запросов
 *     responses:
 *       200:
 *         description: Процесс запущен
 *       400:
 *         description: Неверный формат данных
 *       500:
 *         description: Ошибка сервера
 */


/**
 * @swagger
 * /api/chatgpt:
 *   post:
 *     summary: Получить ответ от ChatGPT
 *     description: Возвращает ответ от ChatGPT на переданный запрос
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Вопрос для ChatGPT
 *     responses:
 *       200:
 *         description: Ответ от ChatGPT
 *       400:
 *         description: Неверный запрос
 *       500:
 *         description: Внутренняя ошибка сервера
 */