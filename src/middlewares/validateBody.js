const { BadRequest } = require('http-errors');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(BadRequest(error.message));
    }
    next();
  };
};

module.exports = validateBody;
