const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');
const validateBody = require('../middlewares/validateBody');
const isValidId = require('../middlewares/isValidId');
const contactSchema = require('../schemas/contactSchema');

router.get('/', contactsController.getAllContacts);
router.get('/:contactId', isValidId, contactsController.getContactById);

router.post('/', validateBody(contactSchema), contactsController.createContact);
router.patch('/:contactId', isValidId, validateBody(contactSchema), contactsController.updateContact);

router.delete('/:contactId', isValidId, contactsController.deleteContact);

module.exports = router;
