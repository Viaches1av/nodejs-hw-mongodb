const BadRequest = require('http-errors');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(BadRequest(error.details.map(err => err.message).join(', ')));
    }
    next();
  };
};

module.exports = validateBody;
