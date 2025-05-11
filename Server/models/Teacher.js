const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  password: String,
  name: String,
  category: String,
  department: String,
});

module.exports = mongoose.model("Teacher", teacherSchema);
