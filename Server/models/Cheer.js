const mongoose = require("mongoose");

const cheerSchema = new mongoose.Schema({
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cheer", cheerSchema);
