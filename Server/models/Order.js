const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  userJob: { type: String }, // 선택사항
  menu: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: "대기중" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
