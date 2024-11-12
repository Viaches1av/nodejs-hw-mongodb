const { setupServer } = require('./server');
console.log(`Запускаем сервер на порту: ${process.env.PORT || 3000}`);

const initMongoConnection = require('./db/initMongoConnection');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initMongoConnection();
    const app = setupServer();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
})();
