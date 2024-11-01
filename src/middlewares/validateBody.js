const createHttpError = require('http-errors');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(createHttpError(400, error.details[0].message));
    }
    next();
  };
};

module.exports = validateBody;
