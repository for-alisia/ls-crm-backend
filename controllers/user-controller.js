const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HttpError = require('../utils/http-error');
const User = require('../models/user-model');

const createUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, check your data', 422));
  }

  const {
    username,
    surName = '',
    firstName = '',
    middleName = '',
    password,
  } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    return next(new HttpError("Couldn't create a user, try again", 500));
  }

  if (existingUser) {
    return next(
      new HttpError('User is already exists, please change username', 422)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Couldn't create a user, please try again", 500));
  }

  const createdUser = new User({
    username,
    firstName,
    surName,
    middleName,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Creating user failed, please try again', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, username: createdUser.username },
      process.env.SECRET,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('Signing up failed, please try again', 500));
  }

  res.status(201).json({
    userId: createdUser.id,
    token,
    firstName: createdUser.firstName,
    surName: createdUser.surName,
    middleName: createdUser.middleName,
  });
};

const getUser = async (req, res, next) => {
  res.send('User object');
};
const updateUser = async (req, res, next) => {
  res.send('User updated');
};
const deleteUser = async (req, res, next) => {
  res.send('User deleted');
};
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(new HttpError('Fetching users failed', 500));
  }

  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};
const updatePermission = async (req, res, next) => {
  res.send('Permissions updated');
};

exports.createUser = createUser;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
exports.updatePermission = updatePermission;
