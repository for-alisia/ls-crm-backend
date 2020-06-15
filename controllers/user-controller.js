const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const HttpError = require("../utils/http-error");
const User = require("../models/user-model");

// CREATION
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
    const createRefresh = true;
    const tokens = await createdUser.generateAuthToken(createRefresh);

    res.send(generateResponseUser(createdUser, tokens));
  } catch (err) {
    return next(new HttpError("Creating user failed, please try again", 500));
  }
};

const getUser = async (req, res, next) => {
  res.send("User object");
};

const updateUser = async (req, res, next) => {
  res.send("User updated");
};

const deleteUser = async (req, res, next) => {
  res.send("User deleted");
};

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Fetching users failed", 500));
  }

  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const updatePermission = async (req, res, next) => {
  res.send("Permissions updated");
};

// LOGIN
const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const createRefresh = true;
    const user = await User.findByCredentials(username, password);
    const tokens = await user.generateAuthToken(createRefresh);

    res.send(generateResponseUser(user, tokens));
  } catch (err) {
    return next(new HttpError("Invalid credentials provided", 403));
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new Error();
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({
      _id: decodedToken.id,
      "tokens.token": token,
    });
    const createRefresh = false;
    const tokens = await user.generateAuthToken(createRefresh);

    res.send({
      ...tokens,
      refreshToken: token,
      refreshTokenExpiredAt: decodedToken.exp * 1000,
    });
  } catch (err) {
    return next(new HttpError("Authentication failed", 403));
  }
};

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
