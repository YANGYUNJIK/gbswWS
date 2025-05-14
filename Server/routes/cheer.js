const express = require("express");
const router = express.Router();
const Cheer = require("../models/Cheer");

router.get("/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const messages = await Cheer.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("오늘 메시지 조회 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "메시지가 비어 있음" });

    const newCheer = new Cheer({ message });
    await newCheer.save();
    res.status(201).json(newCheer);
  } catch (err) {
    console.error("응원 등록 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
