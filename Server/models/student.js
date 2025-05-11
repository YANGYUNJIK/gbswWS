const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  grade: Number,
  number: Number,
  category: String,
  password: String, // 초기값: 1234
});

module.exports = mongoose.model("Student", studentSchema);
