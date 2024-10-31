const createError = require('http-errors');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    // Проверка наличия заголовка Authorization
    if (!authHeader) {
      return next(createError(401, 'Authorization header is missing'));
    }

    // Извлечение токена из заголовка Authorization
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return next(createError(401, 'Auth header should be of type Bearer'));
    }

    // Проверка существования сессии в базе данных
    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      return next(createError(401, 'Session not found'));
    }

    // Проверка срока действия токена доступа
    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);
    if (isAccessTokenExpired) {
      return next(createError(401, 'Access token expired'));
    }

    // Проверка, что пользователь существует
    const user = await User.findById(session.userId);
    if (!user) {
      return next(createError(401, 'User not found'));
    }

    req.user = user; // Добавление пользователя к запросу для дальнейшего использования
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
