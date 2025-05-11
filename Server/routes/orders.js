// ✅ Server/routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// ✅ 주문 생성
router.post("/", async (req, res) => {
  console.log("📥 주문 요청:", req.body);

  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    console.log("✅ 저장 성공:", savedOrder);

    // ✅ 소켓 emit
    const io = req.app.get("io");
    if (io) {
      io.emit("newOrder", savedOrder); // 모든 연결된 클라이언트에 전송
    }

    res.json(savedOrder);
  } catch (error) {
    console.error("❌ 주문 저장 실패:", error);
    res.status(500).json({ error: "주문 저장 실패", detail: error.message });
  }
});


// ✅ 주문 목록
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ 주문 조회 실패:", error);
    res.status(500).json({ error: "주문 조회 실패" });
  }
});

// ✅ 주문 상태 변경
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("❌ 상태 변경 실패:", error);
    res.status(500).json({ error: "주문 상태 변경 실패" });
  }
});

// ✅ 인기 메뉴 Top 3
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
