require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

const databaseId = process.env.NOTION_DATABASE_ID_TESTING;

const findRecordByVacancyID = async (vacancyID) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'VacancyID',
        rich_text: {
          equals: vacancyID,
        },
      },
    });

    if (response.results.length > 0) {
      const record = response.results[0];
      const pageId = record.id;
      return pageId;
    } else {
      console.log(`No record found with VacancyID: ${vacancyID}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching record from Notion:', error.message);
    return null;
  }
};

const getPageContent = async (pageId) => {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId });
    return response.results;
  } catch (error) {
    console.error('Error fetching page content from Notion:', error.message);
    return [];
  }
};

const convertToHtml = (blocks) => {
  let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Page Content</title></head><body>';
  
  const getTextHtml = (richText) => {
    return richText.map(text => {
      let content = text.text.content;
      if (text.text.link) {
        content = `<a href="${text.text.link.url}">${content}</a>`;
      }
      if (text.annotations.bold) content = `<strong>${content}</strong>`;
      if (text.annotations.italic) content = `<em>${content}</em>`;
      if (text.annotations.underline) content = `<u>${content}</u>`;
      if (text.annotations.strikethrough) content = `<s>${content}</s>`;
      if (text.annotations.code) content = `<code>${content}</code>`;
      return content;
    }).join('');
  };

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading_1':
        html += `<h1>${getTextHtml(block.heading_1.rich_text)}</h1>`;
        break;
      case 'heading_2':
        html += `<h2>${getTextHtml(block.heading_2.rich_text)}</h2>`;
        break;
      case 'heading_3':
        html += `<h3>${getTextHtml(block.heading_3.rich_text)}</h3>`;
        break;
      case 'paragraph':
        html += `<p>${getTextHtml(block.paragraph.rich_text)}</p>`;
        break;
      case 'divider':
        html += '<hr />';
        break;
      case 'bulleted_list_item':
        html += `<ul><li>${getTextHtml(block.bulleted_list_item.rich_text)}</li></ul>`;
        break;
      case 'numbered_list_item':
        html += `<ol><li>${getTextHtml(block.numbered_list_item.rich_text)}</li></ol>`;
        break;
      // Добавьте другие типы блоков, если нужно
      default:
        console.log(`Unsupported block type: ${block.type}`);
    }
  });

  html += '</body></html>';
  return html;
};

const main = async () => {
  const vacancyID = '65fc6f6bd92a103caa567e86';
  const pageId = await findRecordByVacancyID(vacancyID);
  if (pageId) {
    const blocks = await getPageContent(pageId);
    const htmlContent = convertToHtml(blocks);
    console.log(htmlContent);
  }
};

main();
