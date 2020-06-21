const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { ERR_DATA, ACCESS_TOKEN_DUR, REFRESH_TOKEN_DUR, IN_MS } = require('../config');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 4 },
  firstName: { type: String },
  surName: { type: String },
  middleName: { type: String },
  image: { type: String },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  permission: {
    chat: {
      C: { type: Boolean },
      R: { type: Boolean },
      U: { type: Boolean },
      D: { type: Boolean },
    },
    news: {
      C: { type: Boolean },
      R: { type: Boolean },
      U: { type: Boolean },
      D: { type: Boolean },
    },
    settings: {
      C: { type: Boolean },
      R: { type: Boolean },
      U: { type: Boolean },
      D: { type: Boolean },
    },
  },
  deleted: { type: Boolean },
});

userSchema.plugin(uniqueValidator);

// Find user by username and password
userSchema.statics.findByCredentials = async function (username, password) {
  let user, isMatch;

  try {
    user = await this.findOne({ username, deleted: false });
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }

  if (!user) {
    return {
      result: false,
      msg: ERR_DATA.invalid_credentials.message,
      status: ERR_DATA.invalid_credentials.status,
    };
  }

  try {
    isMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }

  if (!isMatch) {
    return {
      result: false,
      msg: ERR_DATA.invalid_credentials.message,
      status: ERR_DATA.invalid_credentials.status,
    };
  }

  return { result: true, user };
};

// Check user's permissions
userSchema.statics.checkProvidedUser = async function (userId, permissionType) {
  const { type, operation } = permissionType;
  let user;
  try {
    user = await this.findOne({ _id: userId, deleted: false });
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }

  if (!user) {
    return { result: false, msg: ERR_DATA.no_user.message, status: ERR_DATA.no_user.status };
  }

  if (!user.permission[type][operation]) {
    return { result: false, msg: ERR_DATA.no_permission.message, status: ERR_DATA.no_permission.status };
  }

  return { result: true, user };
};

// Generate Access Token
userSchema.methods.generateAccessToken = async function () {
  const user = this;
  const tokens = {};

  tokens.accessTokenExpiredAt = Math.floor(Date.now()) + ACCESS_TOKEN_DUR;
  try {
    tokens.accessToken = jwt.sign(
      { id: user._id.toString(), exp: tokens.accessTokenExpiredAt / IN_MS },
      process.env.SECRET
    );
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }

  return tokens;
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = async function () {
  const user = this;
  const tokens = {};

  tokens.refreshTokenExpiredAt = Math.floor(Date.now()) + REFRESH_TOKEN_DUR;
  try {
    tokens.refreshToken = jwt.sign(
      { id: user._id.toString(), exp: tokens.refreshTokenExpiredAt / IN_MS },
      process.env.SECRET
    );
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }
  // Delete all expired tokens from DB
  user.tokens = user.tokens.filter((token) => {
    const decodedToken = jwt.decode(token.token, { complete: true });
    if (decodedToken.payload.exp * IN_MS > Date.now()) {
      return true;
    }
    return false;
  });

  user.tokens = user.tokens.concat({
    token: tokens.refreshToken,
  });
  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }

  return tokens;
};

// Generate response object
userSchema.methods.generateResponseObj = function (tokens) {
  const user = this;
  return {
    _id: user.id,
    username: user.username,
    firstName: user.firstName,
    middleName: user.middleName,
    surName: user.surName,
    image: user.image,
    permission: user.permission,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiredAt: tokens.accessTokenExpiredAt,
    refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
  };
};

// Check if password is valid
userSchema.methods.checkPassword = async function (password) {
  const user = this;
  let isMatch;

  try {
    isMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.log(err);
    return { result: false, msg: ERR_DATA.interval.message, status: ERR_DATA.interval.status };
  }

  return isMatch;
};

// Hashed password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
