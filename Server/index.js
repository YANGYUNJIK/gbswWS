// ✅ /Server/index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] },
});

const Order = require("./models/Order");
const Item = require("./models/Item");
const itemsRoutes = require("./routes/items");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const teacherRoutes = require("./routes/teachers");

app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/auth", authRoutes);
app.use(cors());
app.use(express.json());
app.use("/items", itemsRoutes);
app.use("/orders", ordersRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch((err) => console.log("❌ MongoDB 연결 실패", err));

io.on("connection", (socket) => {
  //console.log("🟢 클라이언트 접속됨:", socket.id);

  socket.on("disconnect", () => {
  //  console.log("🔴 클라이언트 연결 해제:", socket.id);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중 (포트 ${PORT})`);
});
