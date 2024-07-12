const { task_01_VacancyLinksGathering } = require('../task/task_01_VacancyLinksGathering');
const handleError = require('../utils/errorHandler'); // Исправленный импорт
const log = require('../utils/logger');

async function VacancyLinksGathering_01(searchQueries) {
  try {
    for (const searchQuery of searchQueries) {
      await task_01_VacancyLinksGathering(searchQuery);
    }
  } catch (error) {
    handleError(error, 'Error in VacancyLinksGathering_01');
  }
}

module.exports = { VacancyLinksGathering_01 };
