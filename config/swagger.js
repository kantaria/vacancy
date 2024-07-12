// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { version } = require('../package.json');

const port = process.env.PORT || 3002;
const ip = process.env.SERVER_IP;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version,
      description: 'API documentation for the project',
    },
    servers: [
      {
        url: `http://${ip}:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js', './config/swaggerComments.js'], // добавьте сюда новый файл с комментариями
};


const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
