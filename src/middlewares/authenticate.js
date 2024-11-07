const createError = require('http-errors');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      return next(createError(401, 'Authorization header is missing'));
    }

    const [bearer, token] = authHeader.split(' ');
    console.log('Token:', token);

    if (bearer !== 'Bearer' || !token) {
      return next(createError(401, 'Auth header should be of type Bearer'));
    }

    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      return next(createError(401, 'Session not found'));
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);
    if (isAccessTokenExpired) {
      return next(createError(401, 'Access token expired'));
    }
    const user = await User.findById(session.userId);
    if (!user) {
      return next(createError(401, 'User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
