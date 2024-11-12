require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const pino = require('pino-http')();
const contactsRouter = require('./routers/contacts');
const authRouter = require('./routers/auth');
const { swaggerDocs } = require('./middlewares/swaggerDocs.js');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

function setupServer() {
  console.log('Запуск setupServer'); 
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(pino);

  // Подключаем Swagger UI до всех других обработчиков
  app.use('/api-docs', swaggerDocs());
  console.log('Маршрут /api-docs подключен');

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  // Обработчики ошибок после всех маршрутов
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });


  return app;
}

module.exports = { setupServer };
