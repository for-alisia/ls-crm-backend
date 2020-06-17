const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const HttpError = require("../utils/http-error");
const User = require("../models/user-model");

// CREATION (return user object without authorization)
const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  // Return Error if inputs are not valid
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check your data", 422));
  }
  // Get inputs from request body
  const {
    username,
    surName = "",
    firstName = "",
    middleName = "",
    password,
  } = req.body;

  // Check if user is already exists
  let existingUser;

  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    return next(new HttpError("Couldn't create a user, try again", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User is already exists, please change username", 422)
    );
  }
  // Create new user object
  const createdUser = new User({
    username,
    firstName,
    surName,
    middleName,
    password,
    permission: {
      chat: { C: true, R: true, U: true, D: true },
      news: { C: true, R: true, U: true, D: true },
      settings: { C: true, R: true, U: true, D: true },
    },
  });

  try {
    await createdUser.save();

    res.send({ username, firstName, surName, middleName });
  } catch (err) {
    return next(new HttpError("Creating user failed, please try again", 500));
  }
};

// GET PROFILE (return user's obj without password and tokens)
const getUser = async (req, res, next) => {
  const { id } = res.locals.userData;
  try {
    const user = await User.findOne({ _id: id }, "-tokens -password");
    res.send(user);
  } catch (err) {
    return next(new HttpError("Couldn't find user with provided ID", 403));
  }
};
// TODO update profile
// UPDATE PROFILE INFO (return updated user's profile)
const updateUser = async (req, res, next) => {
  res.send("User updated");
};
// TODO delete user
// DELETE USER (return ?)
const deleteUser = async (req, res, next) => {
  res.send("User deleted");
};

// GET LIST OF ALL USERS (return user's list for authenticated users)
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password -tokens");
  } catch (err) {
    return next(new HttpError("Fetching users failed", 500));
  }
  //res.send(users.map((u) => u.toObject({ getters: true })));
  res.send(users);
};
// TODO update permission
// UPDATE PERMISSION (return ?)
const updatePermission = async (req, res, next) => {
  res.send("Permissions updated");
};

// LOGIN (return user obj with tokens)
const login = async (req, res, next) => {
  const { username, password } = req.body;
  let user, accessToken, refreshToken;
  try {
    const validateUser = await User.findByCredentials(username, password);

    if (validateUser.result === "Error") {
      return next(new HttpError(validateUser.msg, validateUser.status));
    }
    user = validateUser.user;
  } catch (err) {
    console.log(err);
    return next(new HttpError("Interval error (check user credentials)", 500));
  }

  try {
    accessToken = await user.generateAccessToken();
    refreshToken = await user.generateRefreshToken();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Interval error (get tokens)", 500));
  }

  res.send(generateResponseUser(user, { ...accessToken, ...refreshToken }));
};

// REFRESH TOKEN (return tokens)
const refreshToken = async (req, res, next) => {
  const token = req.headers.authorization;
  let tokens, decodedToken, user;

  if (!token) {
    return next(new HttpError("Can't get access to refresh token", 500));
  }

  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return next(new HttpError("Invalid refresh token", 500));
  }

  try {
    user = await User.findOne({
      _id: decodedToken.id,
      "tokens.token": token,
    });
  } catch (err) {
    return next(new HttpError("Couldn't find a user", 403));
  }

  try {
    tokens = await user.generateAccessToken();
  } catch (err) {
    return next(new HttpError("Couldn't generate token", 403));
  }

  res.send({
    ...tokens,
    refreshToken: token,
    refreshTokenExpiredAt: decodedToken.exp * 1000,
  });
};

// Configure response object
const generateResponseUser = (user, tokens) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    middleName: user.middleName,
    surName: user.surName,
    permission: user.permission,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiredAt: tokens.accessTokenExpiredAt,
    refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
  };
};

exports.login = login;
exports.refreshToken = refreshToken;
exports.createUser = createUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
exports.updatePermission = updatePermission;
