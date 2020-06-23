const fs = require('fs');

const winston = require('winston');
require('winston-mongodb');

const { ERR_DATA, MONGO_URL } = require('../config');

const logger = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.MongoDB({ db: MONGO_URL }),
  ],
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/exception.log' })],
});

process.on('unhandledRejection', (ex) => {
  throw ex;
});

module.exports = (error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  logger.error(error.message, error);
  res.status(error.code || ERR_DATA.unknown.status).json({
    message: error.message || ERR_DATA.unknown.message,
  });
};
