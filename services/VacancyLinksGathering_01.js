const { task_01_VacancyLinksGathering } = require('../task/task_01_VacancyLinksGathering');

async function VacancyLinksGathering_01(searchQueries) {
  try {
    for (const searchQuery of searchQueries) {
      await task_01_VacancyLinksGathering(searchQuery);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = { VacancyLinksGathering_01 };