const jwt = require('jsonwebtoken');

const HttpError = require('../utils/http-error');
const { ERR_DATA } = require('../config');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new Error();
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    res.locals.userData = { id: decodedToken.id };
    next();
  } catch (err) {
    return next(new HttpError(ERR_DATA.no_auth.message, ERR_DATA.no_auth.status));
  }
};

module.exports = auth;
