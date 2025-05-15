const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  type: String, // "drink" 또는 "snack" 또는 "ramen"
  image: String,
  stock: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
