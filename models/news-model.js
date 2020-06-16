const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsSchema = new Schema({
  text: { type: String, required: true, minlength: 4 },
  title: { type: String, required: true, minlength: 4 },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

newsSchema.virtual("created").get(function () {
  if (this["_created"]) return this["_created"];
  return (this["_created"] = this._id.getTimestamp());
});

module.exports = mongoose.model("News", newsSchema);
