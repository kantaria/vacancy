// Подключаем необходимые модули
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/mongoDB');
const scrapingRoutes = require('./routes/scrapingRoutes');
const os = require('os');

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

app.use('/', scrapingRoutes); // использование нового маршрута

// Пример маршрута
app.get('/', (req, res) => {
  res.send('Welcome to our API!');
});

// Функция для получения IP-адреса
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
const port = process.env.PORT || 3002;
app.listen(port, () => {
  const ip = process.env.SERVER_IP;
  console.log(`Server is running on http://${ip}:${port}`);
});
