require('dotenv').config();

const getHeaders = () => ({
  'User-Agent': process.env.USER_AGENT,
  'Accept': process.env.ACCEPT,
  'Accept-Language': process.env.ACCEPT_LANGUAGE,
  'Referer': process.env.REFERER,
  'Connection': process.env.CONNECTION,
  'Accept-Encoding': process.env.ACCEPT_ENCODING,
  'DNT': process.env.DNT,
  'Upgrade-Insecure-Requests': process.env.UPGRADE_INSECURE_REQUESTS,
  'Sec-Fetch-Site': process.env.SEC_FETCH_SITE,
  'Sec-Fetch-Mode': process.env.SEC_FETCH_MODE,
  'Sec-Fetch-User': process.env.SEC_FETCH_USER,
  'Sec-Fetch-Dest': process.env.SEC_FETCH_DEST,
});

module.exports = getHeaders;