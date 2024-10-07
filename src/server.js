const express = require('express');
const cors = require('cors');
const pino = require('pino-http')();

function setupServer() {
  const app = express();

  // Использование CORS и логгера
  app.use(cors());
  app.use(pino);

  // Обработка несуществующих маршрутов
  app.use((req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  return app;
}

module.exports = { setupServer };
