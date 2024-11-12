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
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(pino);

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.use('/api-docs', swaggerDocs());

  console.log('Маршрут /api-docs подключен');

  const PORT = process.env.PORT || 3000; // Используем переменную окружения PORT
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  return app;
}

module.exports = { setupServer };
