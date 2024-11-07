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
  authenticate,
  upload.single('photo'),
  (req, res, next) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    next();
  },
  (req, res, next) => {
    req.body = {
      ...req.body,
      isFavourite: req.body.isFavourite === 'true',
    };
    ю;
    const { error } = contactPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
        data: null,
      });
    }

    next();
  },
  contactsController.createContact
);

router.patch(
  '/:contactId',
  authenticate,
  isValidId,
  upload.single('photo'),
  (req, res, next) => {
    req.body = {
      ...req.body,
      isFavourite: req.body.isFavourite === 'true',
    };
    next();
  },
  validateBody(contactPatchSchema),
  contactsController.updateContact
);

module.exports = router;
