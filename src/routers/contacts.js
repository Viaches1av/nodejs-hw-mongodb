const express = require('express');
const fs = require('fs');
const contactsController = require('../controllers/contacts');
const validateBody = require('../middlewares/validateBody');
const isValidId = require('../middlewares/isValidId');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/multer');
const saveFileToCloudinary = require('../utils/saveFileToCloudinary');
const router = express.Router();
const {
  contactPostSchema,
  contactPatchSchema,
} = require('../schemas/contactSchema');

router.use(authenticate);

router.get('/', contactsController.getAllContacts);
router.get('/:contactId', isValidId, contactsController.getContactById);

router.post(
  '/',
  authenticate,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new Error('Файл не был передан в запросе');
      }

      const filePath = req.file.path;
      console.log('Файл загружен во временную папку:', filePath);

      const photoUrl = await saveFileToCloudinary(req.file);
      req.fileUrl = photoUrl;
      next();
    } catch (error) {
      console.error('Ошибка при загрузке на Cloudinary:', error.message);
      next(error);
    }
  },
  contactsController.createContact
);

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
