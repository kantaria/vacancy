const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/mongoDB');
const scrapingRoutes = require('./routes/scrapingRoutes');
const os = require('os');
const { swaggerUi, specs } = require('./config/swagger');
const handleError = require('./utils/errorHandler');
const log = require('./utils/logger');

// Создаем экземпляр приложения Express
const app = express();
connectDB();

// Подключаем middleware для обработки JSON и urlencoded данных
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/', scrapingRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to our API!');
});

function getServerIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'IP not found';
}

// Запускаем сервер
const port = process.env.PORT;
app.listen(port, () => {
  const ip = process.env.SERVER_IP;
  log(`Server is running on http://${ip}:${port}`);
  log(`Api documentation http://${ip}:${port}/api-docs/`);
});

app.use((err, req, res, next) => {
  handleError(err, res);
});
