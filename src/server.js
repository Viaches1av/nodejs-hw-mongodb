const express = require('express');
const cors = require('cors');
const pino = require('pino-http')();
const Contact = require('./models/contactModel');

function setupServer() {
  const app = express();

  app.use(cors());
  app.use(pino);

  app.get('/contacts', async (req, res) => {
    try {
      const contacts = await Contact.find();
      res.status(200).json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error retrieving contacts',
        error: error.message,
      });
    }
  });

  app.get('/contacts/:contactId', async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.contactId);

      if (!contact) {
        return res.status(404).json({
          status: 404,
          message: `Contact with id ${req.params.contactId} not found`,
        });
      }

      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${req.params.contactId}`,
        data: contact,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error retrieving contact',
        error: error.message,
      });
    }
  });

  app.use((req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  return app;
}

module.exports = { setupServer };
