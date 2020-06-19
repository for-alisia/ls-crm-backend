const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const HttpError = require("../utils/http-error");
const { ERR_DATA, DEFAULT_PERMISSIONS, IN_MS } = require("../config");
const User = require("../models/user-model");

// CREATION (return user object without authorization)
const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  // Return Error if inputs are not valid
  if (!errors.isEmpty()) {
    return next(new HttpError(ERR_DATA.invalid_inputs.message, ERR_DATA.invalid_inputs.status));
  }
  // Get inputs from request body
  const { username, surName = "", firstName = "", middleName = "", password } = req.body;

  // Check if user is already exists
  let existingUser;

  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }

  if (existingUser) {
    return next(new HttpError(ERR_DATA.user_exists.message, ERR_DATA.user_exists.message));
  }
  // Create new user object
  const createdUser = new User({
    username,
    firstName,
    surName,
    middleName,
    password,
    permission: DEFAULT_PERMISSIONS,
  });
  // Save new user in DB
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError(ERR_DATA.creation_failed.message, ERR_DATA.creation_failed.status));
  }

  res.send({ username, firstName, surName, middleName });
};

// LOGIN (return user obj with tokens)
const login = async (req, res, next) => {
  const { username, password } = req.body;
  let user, accessToken, refreshToken;
  // Validate user by username and password
  try {
    const validateUser = await User.findByCredentials(username, password);

    if (!validateUser.result) {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
    user = validateUser.user;
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }
  // Get tokens for this user
  try {
    accessToken = await user.generateAccessToken();
    refreshToken = await user.generateRefreshToken();
  } catch (err) {
    console.log(err);
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }

  res.send(user.generateResponseObj({ ...accessToken, ...refreshToken }));
};

// REFRESH TOKEN (return tokens)
const refreshToken = async (req, res, next) => {
  const token = req.headers.authorization;
  let tokens, decodedToken, user;

  if (!token) {
    return next(new HttpError(ERR_DATA.invalid_credentials.message, ERR_DATA.invalid_credentials.status));
  }
  // Decode provided token
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return next(new HttpError(ERR_DATA.invalid_credentials.message, ERR_DATA.invalid_credentials.status));
  }
  // Find user in DB via id and provided token
  try {
    user = await User.findOne({
      _id: decodedToken.id,
      "tokens.token": token,
    });
  } catch (err) {
    return next(new HttpError(ERR_DATA.invalid_credentials.message, ERR_DATA.invalid_credentials.status));
  }
  // Generate new access token
  try {
    tokens = await user.generateAccessToken();
  } catch (err) {
    return next(new HttpError(ERR_DATA.interval.message, ERR_DATA.interval.status));
  }

  res.send({
    ...tokens,
    refreshToken: token,
    refreshTokenExpiredAt: decodedToken.exp * IN_MS,
  });
};

exports.createUser = createUser;
exports.login = login;
exports.refreshToken = refreshToken;
