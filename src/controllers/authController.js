const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const createError = require('http-errors');

// Регистрация нового пользователя
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем, существует ли уже пользователь с такой почтой
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(409, 'Email in use');
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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь с такой почтой
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    // Проверяем пароль
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw createError(401, 'Invalid email or password');
    }

    // Генерация токенов
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Создание сессии
    await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Ответ сервера
    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError(400, 'Refresh token is required');
    }

    // Поиск сессии по refresh-токену
    const session = await Session.findOne({ refreshToken });

    if (!session) {
      throw createError(401, 'Invalid refresh token');
    }

    // Проверка срока действия refresh-токена
    if (new Date() > session.refreshTokenValidUntil) {
      await Session.findByIdAndDelete(session._id); // Удаляем истекшую сессию
      throw createError(401, 'Refresh token expired');
    }

    // Генерация нового access-токена
    const newAccessToken = jwt.sign({ _id: session.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Генерация нового refresh-токена
    const newRefreshToken = jwt.sign({ _id: session.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Обновляем access-токен и refresh-токен в базе данных
    session.accessToken = newAccessToken;
    session.refreshToken = newRefreshToken;
    session.accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
    session.refreshTokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await session.save();

    // Ответ сервера
    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken, // Возвращаем новый refreshToken
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh };
