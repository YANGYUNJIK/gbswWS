// Server/models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  type: String,         // 'drink' or 'snack'
  image: String,        // Cloudinary 이미지 URL
  stock: { type: Boolean, default: true },
});

module.exports = mongoose.model('Item', ItemSchema);
