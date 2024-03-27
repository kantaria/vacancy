const Vacancy = require('../models/vacancy');

async function removeVacancyDuplicates() {
    const vacancies = await Vacancy.find();
    const urlMap = new Map();
    let deletedUrls = [];
    let foundDuplicatesCount = 0; // Счётчик найденных дубликатов

    vacancies.forEach((vacancy) => {
        if (vacancy.details && vacancy.details.globalUrl) {
            const urlBasePart = vacancy.details.globalUrl.split('?')[0];
            if (urlMap.has(urlBasePart)) {
                urlMap.get(urlBasePart).push(vacancy);
            } else {
                urlMap.set(urlBasePart, [vacancy]);
            }
        }
    });

    for (const [_, duplicates] of urlMap) {
        if (duplicates.length > 1) {
            foundDuplicatesCount += duplicates.length; // Учитываем все дубликаты
            const duplicatesToDelete = duplicates.slice(1);
            for (const duplicate of duplicatesToDelete) {
                deletedUrls.push(duplicate.details.globalUrl);
                await Vacancy.findByIdAndDelete(duplicate._id);
            }
        }
    }

    console.log(`${deletedUrls.length} дубликатов вакансий успешно удалены из ${foundDuplicatesCount} найденных.`);
    return {
        foundDuplicates: foundDuplicatesCount, // Общее число найденных дубликатов
        deletedCount: deletedUrls.length, // Количество удалённых дубликатов
        deletedUrls: deletedUrls
    };
}

module.exports = { removeVacancyDuplicates };
