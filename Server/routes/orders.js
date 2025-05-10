// ✅ Server/routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// 주문 생성
// ✅ Server/routes/orders.js
router.post("/", async (req, res) => {
  console.log("📥 주문 요청:", req.body); // ✅ 요청 로그 찍기

  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    console.log("✅ 저장 성공:", savedOrder); // ✅ 저장 로그
    res.json(savedOrder);
  } catch (error) {
    console.error("❌ 주문 저장 실패:", error); // ✅ 실패 로그
    res.status(500).json({ error: "주문 저장 실패", detail: error.message });
  }
});

//

// 주문 목록 가져오기
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ 주문 조회 실패:", error);
    res.status(500).json({ error: "주문 조회 실패" });
  }
});

// 주문 상태 변경
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("❌ 주문 상태 변경 실패:", error);
    res.status(500).json({ error: "주문 상태 변경 실패" });
  }
});

router.get("/popular", async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$menu",
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ]);

    res.json(orders);
  } catch (error) {
    console.error("❌ 인기 메뉴 집계 실패:", error);
    res.status(500).json({ error: "인기 메뉴 집계 실패" });
  }
});

module.exports = router;
