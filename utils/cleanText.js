const sanitizeHtml = require('sanitize-html');

function cleanText(html) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  }).replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = cleanText;
