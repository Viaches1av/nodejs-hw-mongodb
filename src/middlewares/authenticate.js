const createError = require('http-errors');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');

const authenticate = async (req, res, next) => {
  try {
    console.log('Starting authenticate middleware');

    const authHeader = req.get('Authorization');
    if (!authHeader) {
      console.log('No Authorization header found');
      return next(createError(401, 'Authorization header is missing'));
    }

    const [bearer, token] = authHeader.split(' ');
    console.log('Token extracted:', token);

    if (bearer !== 'Bearer' || !token) {
      console.log('Invalid Authorization header format');
      return next(createError(401, 'Auth header should be of type Bearer'));
    }

    console.log('Searching for session with token:', token);
    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      console.log('No session found for provided token');
      return next(createError(401, 'Session not found'));
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);
    if (isAccessTokenExpired) {
      console.log('Access token has expired');
      return next(createError(401, 'Access token expired'));
    }

    console.log('Finding user with ID:', session.userId);
    const user = await User.findById(session.userId);
    if (!user) {
      console.log('User not found for session');
      return next(createError(401, 'User not found'));
    }

    console.log('Authenticated User:', user);
    req.user = user;
    next();
  } catch (error) {
    console.log('Error in authenticate middleware:', error);
    next(error);
  }
};

module.exports = authenticate;
