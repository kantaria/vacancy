const axios = require('axios');
const cheerio = require('cheerio');
const getHeaders = require('../config/headers');
const isValidLink = require('../utils/isValidLink');

const fetchContactLinks = async (companyURL, domain, linksVisited = new Set(), links = [companyURL]) => {
  console.log("start Fetching Contact Links");
  if (linksVisited.has(companyURL) || links.length >= 50) {
    return links;
  }

  try {
    if (!isValidLink(companyURL)) {
      return links;
    }

    const data = await axios(companyURL, { headers: getHeaders() });
    linksVisited.add(companyURL);

    const $ = cheerio.load(data.data);
    $('a[href^="/"], a[href^="http"]').each((i, el) => {
      if (links.length >= 50) {
        return false;
      }

      const link = $(el).attr('href');
      const fullLink = new URL(link, companyURL).href;
      
      if (isValidLink(fullLink) && new URL(fullLink).hostname.includes(domain) && !linksVisited.has(fullLink) && !links.includes(fullLink)) {
        links.push(fullLink);
      }
    });
    return links;
  } catch (error) {
    console.error("An error occurred: ", error.message);
    return links;
  }
};

module.exports = fetchContactLinks;