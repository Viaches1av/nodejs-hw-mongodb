const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');
const validateBody = require('../middlewares/validateBody');
const isValidId = require('../middlewares/isValidId');
const {
  contactPostSchema,
  contactPatchSchema,
} = require('../schemas/contactSchema');

router.get('/', contactsController.getAllContacts);
router.get('/:contactId', isValidId, contactsController.getContactById);

router.post(
  '/',
  validateBody(contactPostSchema),
  contactsController.createContact
);

router.patch(
  '/:contactId',
  isValidId,
  validateBody(contactPatchSchema),
  contactsController.updateContact
);

router.delete('/:contactId', isValidId, contactsController.deleteContact);

module.exports = router;
