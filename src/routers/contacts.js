const express = require('express');
const contactsController = require('../controllers/contacts');
const validateBody = require('../middlewares/validateBody');
const isValidId = require('../middlewares/isValidId');
const contactSchema = require('../schemas/contactSchema');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/multer');
const router = express.Router();
const {
  contactPostSchema,
  contactPatchSchema,
} = require('../schemas/contactSchema');

// Применяем authenticate для всех маршрутов
router.use(authenticate);

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

router.post(
  '/',
  upload.single('photo'),
  validateBody(contactSchema),
  contactsController.createContact
);

router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  validateBody(contactSchema),
  contactsController.updateContact
);

module.exports = router;
