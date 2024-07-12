// utils/apiUtils.js

const axios = require('axios');
const handleError = require('./errorHandler');
const log = require('./logger');

async function fetchWithRetry(url, attempts = 3, headers = {}) {
  try {
    const response = await axios.get(url, { headers });
    log(`Successful request to URL: ${url}`);
    return response;
  } catch (error) {
    if (attempts <= 1) {
      handleError(error, 'Max retry attempts reached');
      return null;
    }
    log(`Request failed. Remaining attempts: ${attempts - 1}. Retrying...`);
    return await fetchWithRetry(url, attempts - 1, headers);
  }
}

module.exports = {
  fetchWithRetry,
};
