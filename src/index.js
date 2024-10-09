const { setupServer } = require('./server');
const { initMongoConnection } = require('./db/initMongoConnection');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initMongoConnection();

  const app = setupServer();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
