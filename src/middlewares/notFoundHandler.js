const createError = require('http-errors');

const notFoundHandler = (req, res, next) => {
  next(createError(404, 'Route not found'));
};

module.exports = notFoundHandler;
