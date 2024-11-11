const swaggerUI = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const createHttpError = require('http-errors');

const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');

const swaggerDocs = () => {
  try {
    if (!fs.existsSync(SWAGGER_PATH)) {
      throw new Error("swagger.json file doesn't exist");
    }

    const swaggerDocument = JSON.parse(fs.readFileSync(SWAGGER_PATH, 'utf8'));

    return [swaggerUI.serve, swaggerUI.setup(swaggerDocument)];
  } catch (err) {
    return (req, res, next) => {
      next(createHttpError(500, "Can't load swagger documentation"));
    };
  }
};

module.exports = { swaggerDocs };
