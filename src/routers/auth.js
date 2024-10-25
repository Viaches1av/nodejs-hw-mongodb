const express = require('express');
const validateBody = require('../middlewares/validateBody');
const { userSchema, loginSchema, refreshTokenSchema }= require('../schemas/userSchema');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateBody(userSchema), authController.register);

router.post('/login', validateBody(loginSchema), authController.login);

router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);


module.exports = router;
