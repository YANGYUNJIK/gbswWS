const mongoose = require("mongoose");

const CheerSchema = new mongoose.Schema({
  message: { type: String, required: true },
  target: { type: String, enum: ["student", "teacher"], default: "student" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cheer", CheerSchema);
