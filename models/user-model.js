const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 4 },
  firstName: { type: String },
  surName: { type: String },
  middleName: { type: String },
  avatar: { type: String },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
