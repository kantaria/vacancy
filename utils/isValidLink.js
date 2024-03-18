const isValidLink = (url) => {
  const excludedExtensions = /\.(jpg|jpeg|png|gif|svg|pdf|docx|xlsx|pptx|zip|rar|tar|gz)$/i;
  return !excludedExtensions.test(url);
};

module.exports = isValidLink;