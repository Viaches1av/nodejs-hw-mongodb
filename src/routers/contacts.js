const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');
const ctrlWrapper = require('../utils/ctrlWrapper');

router.get('/', ctrlWrapper(contactsController.getAllContacts));

router.get('/:contactId', ctrlWrapper(contactsController.getContactById));

router.post('/', ctrlWrapper(contactsController.createContact));

router.patch('/:contactId', ctrlWrapper(contactsController.updateContact));

router.delete('/:contactId', ctrlWrapper(contactsController.deleteContact));

module.exports = router;
