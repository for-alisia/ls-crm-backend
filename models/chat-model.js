const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  text: { type: String, required: true },
  senderId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  recipientId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Chat', chatSchema);
