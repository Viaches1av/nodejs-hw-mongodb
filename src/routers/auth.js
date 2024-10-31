const express = require('express');
const validateBody = require('../middlewares/validateBody');
const authenticate = require('../middlewares/authenticate');
const {
  userSchema,
  loginSchema,
  refreshTokenSchema,
} = require('../schemas/userSchema');
const authController = require('../controllers/authController');

const router = express.Router();

// Регистрация
router.post('/register', validateBody(userSchema), authController.register);

// Логин
router.post('/login', validateBody(loginSchema), authController.login);

// Обновление сессии с использованием refresh токена
router.post('/refresh', authController.refresh);

// Выход из системы
router.post('/logout', authenticate, authController.logout);

module.exports = router;
