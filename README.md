# Проект: Система Сбора и Обработки Вакансий

## Оглавление

1. [Описание проекта](#описание-проекта)
2. [Установка и настройка](#установка-и-настройка)
3. [Структура проекта](#структура-проекта)
4. [Описание файлов и директорий](#описание-файлов-и-директорий)
5. [API Документация](#api-документация)
6. [Задачи и Скрипты](#задачи-и-скрипты)
7. [Утилиты](#утилиты)
8. [Конфигурационные файлы](#конфигурационные-файлы)

## Описание проекта

Этот проект представляет собой систему для сбора, обработки и хранения информации о вакансиях. В проекте используются различные технологии и библиотеки, такие как Node.js, Express, Mongoose, axios, cheerio и др.

## Установка и настройка

1. Склонируйте репозиторий:
    ```sh
    git clone <repository_url>
    ```

2. Установите зависимости:
    ```sh
    cd <project_directory>
    yarn install
    ```

3. Создайте файл `.env` на основе предоставленного примера и заполните необходимые переменные окружения:
    ```sh
    cp .env.example .env
    ```

4. Запустите сервер:
    ```sh
    yarn start
    ```

## Структура проекта

```plaintext
.
├── app.js
├── asset-manifest.json
├── config
│   ├── headers.js
│   ├── mongoDB.js
│   ├── progressBarConfig.js
│   └── swagger.js
├── credentials.json
├── favicon.ico
├── index.html
├── logo192.png
├── logo512.png
├── models
│   └── vacancy.js
├── refresh_token.txt
├── robots.txt
├── routes
│   └── scrapingRoutes.js
├── services
│   └── VacancyLinksGathering_01.js
├── task
│   ├── task_01_VacancyLinksGathering.js
│   ├── task_02_VacancyUpdateInfo.js
│   ├── task_03_VacancyUpdateInfoCompanyDetails.js
│   ├── task_04_VacancyCollectLinks.js
│   ├── task_05_VacancyScrapeCompanyContacts.js
│   ├── task_06_VacancyAddNotion.js
│   ├── task_07_VacancyAddGoogleSheet.js
│   ├── task_08_AddDatabaseToGoogleSheet.js
│   ├── task_09_ai.js
│   ├── task_09_evaluate_resumes.js
│   └── task_10_AddDatabaseToExcelFile.js
├── utils
│   ├── asyncLimiter.js
│   ├── cleanText.js
│   ├── convertCurrency.js
│   ├── convertSalaries.js
│   ├── currencyRates.js
│   ├── currencySymbols.js
│   ├── currencyUtils.js
│   ├── extractCurrencySymbol.js
│   ├── extractHighestSalary.js
│   ├── fetchContactLinks.js
│   ├── googleAuth.js
│   ├── googleSheets.js
│   ├── isValidLink.js
│   ├── removeDuplicates.js
│   ├── vacancyUpdateUtils.js
│   └── vacancyUtils.js
└── yarn.lock
```

## Описание файлов и директорий

### Основные файлы

- `app.js`: Основной файл приложения, где настраивается и запускается сервер.
- `index.html`: Главная HTML страница для фронтенда.
- `favicon.ico`: Иконка сайта.
- `asset-manifest.json`: Манифест ассетов.

### Конфигурационные файлы (`config`)

- `headers.js`: Функция для получения заголовков HTTP-запросов.
- `mongoDB.js`: Настройка подключения к MongoDB.
- `progressBarConfig.js`: Конфигурация прогресс-бара.
- `swagger.js`: Настройка Swagger для API-документации.

### Модели (`models`)

- `vacancy.js`: Mongoose модель для вакансий.

### Маршруты (`routes`)

- `scrapingRoutes.js`: Маршруты для работы с API.

### Сервисы (`services`)

- `VacancyLinksGathering_01.js`: Сервис для сбора ссылок на вакансии.

### Задачи (`task`)

- `task_01_VacancyLinksGathering.js`: Сбор ссылок на вакансии.
- `task_02_VacancyUpdateInfo.js`: Обновление информации о вакансиях.
- `task_03_VacancyUpdateInfoCompanyDetails.js`: Обновление информации о компании вакансии.
- `task_04_VacancyCollectLinks.js`: Сбор контактных ссылок компании.
- `task_05_VacancyScrapeCompanyContacts.js`: Парсинг контактной информации компании.
- `task_06_VacancyAddNotion.js`: Добавление вакансии в Notion.
- `task_07_VacancyAddGoogleSheet.js`: Добавление вакансии в Google Sheets.
- `task_08_AddDatabaseToGoogleSheet.js`: Добавление всей базы данных в Google Sheets.
- `task_09_ai.js`: Взаимодействие с API ChatGPT.
- `task_09_evaluate_resumes.js`: Оценка резюме с помощью ChatGPT.
- `task_10_AddDatabaseToExcelFile.js`: Добавление всей базы данных в Excel файл.

### Утилиты (`utils`)

- `asyncLimiter.js`: Лимитер для асинхронных задач.
- `cleanText.js`: Очистка текста от HTML-тегов.
- `convertCurrency.js`: Конвертация валют.
- `convertSalaries.js`: Конвертация зарплат.
- `currencyRates.js`: Получение курсов валют.
- `currencySymbols.js`: Массив символов валют.
- `currencyUtils.js`: Утилиты для работы с валютами.
- `extractCurrencySymbol.js`: Извлечение символа валюты из строки.
- `extractHighestSalary.js`: Извлечение максимальной зарплаты из строки.
- `fetchContactLinks.js`: Получение контактных ссылок компании.
- `googleAuth.js`: Авторизация в Google API.
- `googleSheets.js`: Работа с Google Sheets.
- `isValidLink.js`: Проверка валидности ссылки.
- `removeDuplicates.js`: Удаление дубликатов вакансий.
- `vacancyUpdateUtils.js`: Утилиты для обновления вакансий.
- `vacancyUtils.js`: Различные утилиты для работы с вакансиями.

### Конфигурационные файлы

- `.env`: Переменные окружения для настройки приложения.
- `credentials.json`: Файл с учетными данными для Google API.

## API Документация

### Общие маршруты

- `GET /`: Главная страница API.
- `GET /api-docs`: Swagger документация API.

### Маршруты для работы с вакансиями

- `POST /api/vacancies`: Добавление новой вакансии.
- `GET /api/add-database-to-google-sheets`: Добавление всех записей из базы данных в Google Sheets.
- `GET /api/add-database-to-excel`: Добавление всех записей из базы данных в Excel файл.
- `POST /api/count-vacancies`: Подсчет подходящих вакансий.
- `POST /api/update-vacancies-with-global-field`: Обновление вакансий с глобальным полем.

### Маршруты для взаимодействия с ChatGPT

- `POST /api/chatgpt`: Получение ответа от ChatGPT на переданный запрос.
- `POST /api/evaluate-vacancies`: Оценка вакансий с использованием ChatGPT.

### Маршруты для сбора данных

- `GET /api/start-scraping`: Запуск процесса сбора данных по переданным запросам.

### Маршруты для работы с валютами

- `GET /api/currency-rates`: Получение текущих курсов валют.

## Задачи и Скрипты

### Сбор ссылок на вакансии

`task_01_VacancyLinksGathering.js` - Сбор ссылок на вакансии на основе поискового запроса.

### Обновление информации о вакансиях

`task_02_VacancyUpdateInfo.js` - Обновление информации о вакансиях, включая детали компании и контактные ссылки.

### Обновление информации о компании вакансии

`task_03_VacancyUpdateInfoCompanyDetails.js` - Обновление информации о компании вакансии, включая парсинг контактных данных.

### Сбор контактных ссылок компании

`task_04_VacancyCollectLinks.js` - Сбор контактных ссылок компании для указанной вакансии.

### Парсинг контактной информации компании

`task_05_VacancyScrapeCompanyContacts.js` - Парсинг контактной информации компании из собранных ссылок.

### Добавление вакансии в Notion

`task_06_VacancyAddNotion.js` - Добавление вакансии в базу

 данных Notion.

### Добавление вакансии в Google Sheets

`task_07_VacancyAddGoogleSheet.js` - Добавление вакансии в Google Sheets.

### Добавление всей базы данных в Google Sheets

`task_08_AddDatabaseToGoogleSheet.js` - Добавление всех записей из базы данных в Google Sheets.

### Взаимодействие с API ChatGPT

`task_09_ai.js` - Функции для взаимодействия с API ChatGPT.

### Оценка резюме с помощью ChatGPT

`task_09_evaluate_resumes.js` - Оценка резюме с помощью ChatGPT.

### Добавление всей базы данных в Excel файл

`task_10_AddDatabaseToExcelFile.js` - Добавление всех записей из базы данных в Excel файл.

## Утилиты

### Лимитер для асинхронных задач

`asyncLimiter.js` - Лимитер для асинхронных задач с ограничением количества одновременных запросов.

### Очистка текста от HTML-тегов

`cleanText.js` - Очистка текста от HTML-тегов и пробелов.

### Конвертация валют

`convertCurrency.js` - Конвертация валют на основе текущих курсов.

### Конвертация зарплат

`convertSalaries.js` - Конвертация зарплат в рубли.

### Получение курсов валют

`currencyRates.js` - Получение текущих курсов валют с сайта Центрального банка.

### Массив символов валют

`currencySymbols.js` - Массив символов валют для парсинга зарплат.

### Утилиты для работы с валютами

`currencyUtils.js` - Утилиты для работы с валютами, включая отображение текущих курсов.

### Извлечение символа валюты из строки

`extractCurrencySymbol.js` - Извлечение символа валюты из строки.

### Извлечение максимальной зарплаты из строки

`extractHighestSalary.js` - Извлечение максимальной зарплаты из строки.

### Получение контактных ссылок компании

`fetchContactLinks.js` - Получение контактных ссылок компании с сайта компании.

### Авторизация в Google API

`googleAuth.js` - Авторизация в Google API и получение токенов доступа.

### Работа с Google Sheets

`googleSheets.js` - Утилиты для работы с Google Sheets.

### Проверка валидности ссылки

`isValidLink.js` - Проверка валидности ссылки на основе расширения файла.

### Удаление дубликатов вакансий

`removeDuplicates.js` - Удаление дубликатов вакансий из базы данных.

### Утилиты для обновления вакансий

`vacancyUpdateUtils.js` - Утилиты для обновления информации о вакансиях.

### Различные утилиты для работы с вакансиями

`vacancyUtils.js` - Различные утилиты для работы с вакансиями, включая подсчет и обновление записей.

### Запросы к БД:
```json
curl -X POST http://192.168.1.93:3000/api/vacancies/details -H "Content-Type: application/json" -d '{"id": "60d0fe4f5311236168a109ca"}' | jq
```