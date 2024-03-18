const currencySymbols = require('./currencySymbols');

const extractCurrencySymbol = (salaryText) => {
  for (const symbol of currencySymbols) {
    if (salaryText.includes(symbol)) {
      return symbol;
    }
  }
  return null;
};

module.exports = extractCurrencySymbol;
