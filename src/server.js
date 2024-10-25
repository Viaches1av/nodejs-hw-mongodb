const express = require('express');
const cors = require('cors');
const pino = require('pino-http')();
const contactsRouter = require('./routers/contacts');
const authRouter = require('./routers/auth');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

function setupServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pino);

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { setupServer };
