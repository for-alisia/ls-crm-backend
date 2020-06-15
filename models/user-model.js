const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randToken = require("rand-token");

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
      expireAt: {
        type: Number,
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
    console.log("User not exists");
    throw new Error("Invalid");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.log("Password invalid");
    throw new Error("Invalid");
  }

  return user;
};

// userSchema.methods.generateAuthToken = async function () {
//   const user = this;
//   const accessTokenExpiredAt = Math.float(new Date()) + 60 * 1000;
//   const refreshTokenExpiredAt = Math.float(new Date()) + 60 * 60 * 1000;
//   console.log(accessTokenExpiredAt, refreshTokenExpiredAt);
//   const accessToken = jwt.sign({ id: user._id.toString() }, process.env.SECRET);

//   const refreshToken = randToken.uid(256);

//   user.tokens = user.tokens.concat({
//     token: accessToken,
//     expireAt: refreshTokenExpiredAt,
//   });
//   await user.save();

//   return {
//     accessToken,
//     refreshToken,
//     accessTokenExpiredAt,
//     refreshTokenExpiredAt,
//   };
// };

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const accessTokenExpiredAt = Math.floor(Date.now()) + 60 * 1000;
  const refreshTokenExpiredAt = Math.floor(Date.now()) + 60 * 60 * 1000;
  const accessToken = jwt.sign(
    { id: user._id.toString(), exp: accessTokenExpiredAt / 1000 },
    process.env.SECRET
  );
  const refreshToken = randToken.uid(256);

  user.tokens = user.tokens.concat({
    token: refreshToken,
    expireAt: refreshTokenExpiredAt,
  });

  await user.save();

  return {
    accessToken,
    refreshToken,
    accessTokenExpiredAt,
    refreshTokenExpiredAt,
  };
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
