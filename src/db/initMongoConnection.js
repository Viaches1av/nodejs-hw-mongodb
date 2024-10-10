const mongoose = require('mongoose');
require('dotenv').config();

async function initMongoConnection() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL, {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      dbName: process.env.MONGODB_DB,
    });
    console.log('Mongo connection successfully established!');
    return connection;
  } catch (error) {
    console.error('Mongo connection error:', error);
    process.exit(1);
  }
}

module.exports = initMongoConnection;
