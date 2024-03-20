const Vacancy = require('../models/Vacancy');

async function removeVacancyDuplicates() {
  const vacancies = await Vacancy.find();
  const urlMap = new Map();
  let deletedUrls = [];

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
          const duplicatesToDelete = duplicates.slice(1);
          for (const duplicate of duplicatesToDelete) {
              deletedUrls.push(duplicate.details.globalUrl);
              await Vacancy.findByIdAndDelete(duplicate._id);
          }
      }
  }

  console.log(`${deletedUrls.length} дубликатов вакансий успешно удалены.`);
  return {
      deletedCount: deletedUrls.length,
      deletedUrls: deletedUrls
  };
}

module.exports = { removeVacancyDuplicates };