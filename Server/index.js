require("dotenv").config(); // 반드시 index.js 맨 위에 있어야 함

const express = require("express");
const http = require("http"); // ← socket.io와 함께 필요
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app); // ← app을 http 서버로 감싸기
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch((err) => console.log("❌ MongoDB 연결 실패", err));

// 클라이언트 연결 확인
io.on("connection", (socket) => {
  console.log("🟢 클라이언트 접속됨:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 클라이언트 연결 해제:", socket.id);
  });
});

// POST /orders (신청할 때 알림 보내기)
app.post("/orders", async (req, res) => {
  const orderData = req.body;

  // 여기서 DB에 저장 (예: new Order(orderData).save() 생략 가능)
  // 저장된 데이터 대신 요청 본문 사용
  io.emit("newOrder", orderData); // 💡 실시간 전송
  res.status(201).json({ message: "신청 완료", order: orderData });
});

server.listen(3000, () => {
  console.log("🚀 서버 실행 중 (포트 3000)");
});

// POST /orders (신청할 때 알림 보내기)
app.patch("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) return res.status(404).json({ message: "주문 없음" });

    // 🔔 실시간으로 해당 주문이 변경되었음을 알림
    io.emit("orderUpdated", order); // 모든 연결된 클라이언트에게 전송

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "수정 실패" });
  }
});
