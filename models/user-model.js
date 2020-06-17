const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
});

userSchema.plugin(uniqueValidator);

// Check the credentials
userSchema.statics.findByCredentials = async function (username, password) {
  let user, isMatch;

  try {
    user = await this.findOne({ username });
  } catch (err) {
    console.log(err);
    return { result: "Error", msg: "Interval error (username)", status: 500 };
  }

  if (!user) {
    return {
      result: "Error",
      msg: "Invalid credentials (username)",
      status: 403,
    };
  }

  try {
    isMatch = await bcrypt.compare(password, user.password);
  } catch (err) {
    console.log(err);
    return {
      result: "Error",
      msg: "Interval error (password)",
      status: 500,
    };
  }

  if (!isMatch) {
    return {
      result: "Error",
      msg: "Invalid credentials (password)",
      status: 403,
    };
  }

  return { result: "Success", user };
};

// Check user's permissions
userSchema.statics.checkProvidedUser = async function (userId, permissionType) {
  let user;
  try {
    user = await this.findById(userId);
  } catch (err) {
    console.log(err);
    return {
      result: "Error",
      msg: "Can't retrieve a user from database",
      status: 500,
    };
  }

  if (!user) {
    return {
      result: "Error",
      msg: "Can't find a user with provided id",
      status: 404,
    };
  }

  if (!user.permission.news[permissionType]) {
    return {
      result: "Error",
      msg: "You are not allowed to do this",
      status: 403,
    };
  }

  return { result: "Success", user };
};

// Generate Access Token
userSchema.methods.generateAccessToken = async function () {
  const user = this;
  const tokens = {};

  tokens.accessTokenExpiredAt = Math.floor(Date.now()) + 60 * 60 * 1000;

  tokens.accessToken = jwt.sign(
    { id: user._id.toString(), exp: tokens.accessTokenExpiredAt / 1000 },
    process.env.SECRET
  );

  return tokens;
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = async function () {
  const user = this;
  const tokens = {};

  tokens.refreshTokenExpiredAt = Math.floor(Date.now()) + 60 * 60 * 24 * 1000;
  tokens.refreshToken = jwt.sign(
    { id: user._id.toString(), exp: tokens.refreshTokenExpiredAt / 1000 },
    process.env.SECRET
  );

  // user.tokens = user.tokens.filter((token) => {
  //   return jwt.verify(token, process.env.SECRET, (err, decoded) => {
  //     if (err) {
  //       return false;
  //     }
  //     return true;
  //   });
  // });

  user.tokens = user.tokens.concat({
    token: tokens.refreshToken,
  });

  await user.save();

  return tokens;
};

// Hashed password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
