// ✅ Server/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    studentName: String,
    userJob: String,
    menu: String,
    quantity: Number,
    image: String, // ✅ 이미지 URL 저장용 필드 추가
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
