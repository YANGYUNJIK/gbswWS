const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  department: String,
  category: String,
  password: String, // 초기값: 1234
});

module.exports = mongoose.model("Teacher", teacherSchema);
