const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newsSchema = new Schema({
  created_at: { type: Date, required: true },
  text: { type: String, required: true, minlength: 30 },
  title: { type: String, required: true, minlength: 4 },
  user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('News', newsSchema);
