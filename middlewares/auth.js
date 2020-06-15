const jwt = require("jsonwebtoken");

const HttpError = require("../utils/http-error");
const User = require("../models/user-model");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new Error();
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    req.userData = { id: decodedToken.id };
    next();
  } catch (err) {
    return next(new HttpError("Authentication failed", 403));
  }
};

module.exports = auth;
