const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const createHttpError = require('http-errors');

// Регистрация нового пользователя
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем, существует ли уже пользователь с такой почтой
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Email in use');
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового пользователя
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Ответ сервера
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: {
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Логин пользователя с созданием сессии
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Проверка пользователя
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw createHttpError(401, 'Invalid email or password');
    }

    // Генерация токенов
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Удаление предыдущей сессии и создание новой
    await Session.deleteOne({ userId: user._id });
    const session = await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Обновление сессии с использованием refresh-токена
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createHttpError(400, 'Refresh token is required');
    }

    // Поиск сессии по refresh-токену
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      throw createHttpError(401, 'Invalid refresh token');
    }

    // Проверка срока действия refresh-токена
    if (new Date() > session.refreshTokenValidUntil) {
      await Session.findByIdAndDelete(session._id); // Удаляем истекшую сессию
      throw createHttpError(401, 'Refresh token expired');
    }

    // Генерация новой пары токенов
    const newAccessToken = jwt.sign(
      { _id: session.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const newRefreshToken = jwt.sign(
      { _id: session.userId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    session.accessToken = newAccessToken;
    session.refreshToken = newRefreshToken;
    session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
    session.refreshTokenValidUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await session.save();

    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Логаут пользователя
const logout = async (req, res, next) => {
  try {
    // Извлекаем refreshToken из куки
    const refreshToken = req.cookies.refreshToken;

    // Проверяем наличие refreshToken
    if (!refreshToken) {
      return next(createError(400, 'Refresh token is required'));
    }

    // Удаляем сессию на основе refresh-токена
    const session = await Session.findOneAndDelete({ refreshToken });

    // Проверяем, была ли найдена и удалена сессия
    if (!session) {
      return next(createError(404, 'Session not found'));
    }

    // Очищаем куки сессии
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    // Отправляем успешный ответ
    res.status(204).send(); // Успешный логаут без тела ответа
  } catch (error) {
    next(error);
  }
};

// Отправка email для сброса пароля
const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Проверка наличия пользователя
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    // Создание JWT токена для сброса пароля
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    // Настройка Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Формирование и отправка письма
    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 200,
      message: 'Reset email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Сброс пароля
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Проверка токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Поиск пользователя
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    // Хэширование нового пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Удаление текущей сессии
    await Session.deleteOne({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      next(createHttpError(401, 'Token is expired or invalid.'));
    } else {
      next(error);
    }
  }
};

module.exports = { register, login, refresh, logout, sendResetEmail, resetPassword };
