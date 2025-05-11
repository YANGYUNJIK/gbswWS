const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  password: String,
  name: String,
  category: String,
  grade: String,
  number: String,
});

module.exports = mongoose.model("Student", studentSchema);
