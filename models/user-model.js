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
  const user = await this.findOne({ username });

  if (!user) {
    throw new Error("Invalid");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid");
  }

  return user;
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

  user.tokens = user.tokens.filter((token) => {
    return jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return false;
      }
      return true;
    });
  });

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
