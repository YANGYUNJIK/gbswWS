const express = require("express");
const router = express.Router();
const Cheer = require("../models/Cheer");

// 오늘 메시지 가져오기 (대상 필터 가능)
router.get("/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filter = {
      createdAt: { $gte: start, $lte: end },
    };

    if (req.query.target === "student" || req.query.target === "teacher") {
      filter.target = req.query.target;
    }

    const messages = await Cheer.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// 메시지 등록
router.post("/", async (req, res) => {
  try {
    const { message, target } = req.body;

    if (!message || !["student", "teacher"].includes(target)) {
      return res.status(400).json({ error: "유효하지 않은 입력" });
    }

    const newCheer = new Cheer({ message, target });
    await newCheer.save();

    const io = req.app.get("io");
    if (io) io.emit("newCheer", newCheer);

    res.status(201).json(newCheer);
  } catch (err) {
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
