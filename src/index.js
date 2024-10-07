const { setupServer } = require('./server');
const { initMongoConnection } = require('./db/initMongoConnection');

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Подключаемся к MongoDB
  await initMongoConnection();

  // Запускаем сервер
  const app = setupServer();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
