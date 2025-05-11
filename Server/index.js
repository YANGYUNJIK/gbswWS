// ✅ /Server/index.js (라우터 내에서도 socket.emit 사용 가능하도록 io 공유)
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ CORS 설정
app.use(cors({
  origin: [
    "https://gbswws.netlify.app",
    "http://localhost:8081",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ 소켓 서버 생성
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// ✅ io를 app에 저장하여 라우터에서도 접근 가능하게 설정
app.set("io", io);

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
  console.log("🟢 소켓 연결됨:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 소켓 연결 해제:", socket.id);
  });
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
