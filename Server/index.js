// ✅ /Server/index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ CORS 설정 (Netlify & 로컬 웹 허용)
app.use(cors({
  origin: [
    "https://gbswws.netlify.app",  // ✅ Netlify (운영용)
    "http://localhost:8081",       // ✅ 로컬 개발용 웹
    "http://localhost:3000",       // ✅ 로컬 서버 (예방 차원)
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));


app.use(express.json());

// ✅ 소켓 연결 (모든 출처 허용)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// ✅ MongoDB 모델 불러오기
const Order = require("./models/Order");
const Item = require("./models/Item");

// ✅ 라우터 불러오기
const itemsRoutes = require("./routes/items");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const teacherRoutes = require("./routes/teachers");

// ✅ 라우터 등록
app.use("/items", itemsRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);

// ✅ 소켓 연결 감지
io.on("connection", (socket) => {
  // console.log("🟢 소켓 연결됨:", socket.id);
  socket.on("disconnect", () => {
    // console.log("🔴 소켓 연결 해제:", socket.id);
  });
});

// ✅ 주문 저장 + 소켓 알림
app.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    io.emit("newOrder", newOrder);
    res.status(201).json({ message: "신청 완료", order: newOrder });
  } catch (err) {
    console.error("❌ 주문 저장 실패", err);
    res.status(500).json({ message: "주문 저장 실패" });
  }
});

// ✅ 상태 변경 + 소켓 알림
app.patch("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "주문 없음" });
    io.emit("orderUpdated", order);
    res.json(order);
  } catch (err) {
    console.error("❌ 상태 변경 실패", err);
    res.status(500).json({ message: "상태 변경 실패" });
  }
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB 연결됨");
    server.listen(PORT, () => {
      console.log(`🚀 서버 실행 중 (포트 ${PORT})`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 실패", err);
  });
