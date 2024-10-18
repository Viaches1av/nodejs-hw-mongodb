const { isValidObjectId } = require('mongoose');
const { BadRequest } = require('http-errors');

const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    return next(BadRequest(`Invalid contact ID: ${contactId}`));
  }
  next();
};

module.exports = isValidId;
