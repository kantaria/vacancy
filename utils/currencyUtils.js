const axios = require('axios');
const xml2js = require('xml2js');

const API_URL = 'https://www.cbr.ru/scripts/XML_daily.asp';
const currencySymbols = ['؋', '฿', '₿', '₵', '¢', '₡', 'C$', 'D', 'ден', 'дин', '.د.ج', 'BD', '.د.ع', '.د.أ', '.د.ك', '.د.ل', '.د.ت', '.د.م', 'DH', 'Db', '$', '₫', '֏', '€', 'فلس', 'ƒ', 'Ft', 'FBu', '₲', '₴', '₭', 'kr', '₾', 'Lek', 'L', 'lei', 'Le', 'лев', '₼', 'KM', 'MT', 'm', '₦', 'Nu', 'UM', 'T$', '₱', '£', 'P', 'Q', 'q', 'R', 'R$', '﷼', '៛', 'RM', '₽', '₹', '₪', '₸', '₮', '₩', '¥', 'zł'];

const getCurrencyRates = async () => {
  try {
    const response = await axios.get(API_URL);
    const data = await xml2js.parseStringPromise(response.data, { explicitArray: false });

    const currencies = data.ValCurs.Valute.reduce((acc, valute) => {
      switch (valute.CharCode) {
        case 'USD':
          acc['Американский доллар (USD)'] = parseFloat(valute.Value.replace(',', '.'));
          break;
        case 'EUR':
          acc['Евро (EUR)'] = parseFloat(valute.Value.replace(',', '.'));
          break;
      }
      return acc;
    }, {});

    return currencies;
  } catch (error) {
    console.error('Ошибка при получении курсов валют:', error.message);
    return null;
  }
};

const convertCurrencyToRUB = async (amount, currency) => {
  const rates = await getCurrencyRates();
  if (!rates) return null;

  const currencyMap = {
    '€': rates['Евро (EUR)'],
    '$': rates['Американский доллар (USD)']
  };

  return amount * (currencyMap[currency] || 1);
};

async function displayCurrencyRates() {
  const rates = await getCurrencyRates();
  if (rates) {
    const rateMessages = [];
    console.log('Курсы валют к рублю:');
    for (const [currency, rate] of Object.entries(rates)) {
      const message = `${currency}: ${rate}`;
      console.log(message);
      rateMessages.push(message);
    }
    return rateMessages;
  } else {
    console.log('Не удалось получить курсы валют.');
    return [];
  }
};

const convertSalaries = async () => {
  await connectDB();

  try {
    const vacancies = await Vacancy.find({
      $or: [
        { 'details.hh_vacancy_currency': '€' },
        { 'details.hh_vacancy_currency': '$' },
      ],
    });

    for (const vacancy of vacancies) {
      const { hh_vacancy_salary: salary, hh_vacancy_currency: currency } = vacancy.details;

      if (salary && currency) {
        const convertedSalary = await convertCurrencyToRUB(salary, currency);
        if (convertedSalary !== null) {
          vacancy.details.hh_vacancy_salary = convertedSalary;
          vacancy.details.hh_vacancy_currency = 'DONE';
          await vacancy.save();
          console.log(`Вакансия ${vacancy._id} обновлена: зарплата конвертирована в рубли.`);
        } else {
          console.log(`Не удалось конвертировать зарплату для вакансии ${vacancy._id}.`);
        }
      }
    }

    console.log('Все подходящие вакансии обновлены.');
  } catch (error) {
    console.error('Ошибка при обновлении вакансий:', error);
  } finally {
    mongoose.connection.close();
  }
};

const extractCurrencySymbol = (salaryText) => {
  for (const symbol of currencySymbols) {
    if (salaryText.includes(symbol)) {
      return symbol;
    }
  }
  return null;
};

const extractHighestSalary = (input) => {
  const matches = input.match(/\d[\d\s]*\d/g);
  if (!matches) {
    return null;
  }
  const numbers = matches.map(match => parseInt(match.replace(/\s/g, ''), 10));
  return numbers[numbers.length - 1];
};

module.exports = {
  getCurrencyRates,
  convertCurrencyToRUB,
  displayCurrencyRates,
  convertSalaries,
  extractCurrencySymbol,
  extractHighestSalary,
  currencySymbols
};
