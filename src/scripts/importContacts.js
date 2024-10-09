const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Contact = require('../models/contactModel');
const { initMongoConnection } = require('../db/initMongoConnection');

async function importContacts() {
  try {
    await initMongoConnection();

    const contactsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../contacts.json'))
    );

    await Contact.insertMany(contactsData);
    console.log('Contacts imported successfully!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error importing contacts:', error);
    process.exit(1);
  }
}

importContacts();
