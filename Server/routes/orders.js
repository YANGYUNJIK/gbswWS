const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.get("/", async (req, res) => {
  const { studentName } = req.query;
  const query = studentName ? { studentName } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
