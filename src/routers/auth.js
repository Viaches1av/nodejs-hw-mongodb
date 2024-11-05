const express = require('express');
const validateBody = require('../middlewares/validateBody');
const {
  userSchema,
  loginSchema,
  resetEmailSchema,
  resetPasswordSchema,
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
router.post('/logout', authController.logout);

// Отправка email для сброса пароля
router.post('/send-reset-email', validateBody(resetEmailSchema), authController.sendResetEmail);

// Сброс пароля
router.post('/reset-pwd', validateBody(resetPasswordSchema), authController.resetPassword);

module.exports = router;
