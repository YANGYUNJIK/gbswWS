const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "아이템 불러오기 실패" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, type, image, stock } = req.body;
    const newItem = new Item({ name, type, image, stock });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "아이템 등록 실패" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, image, stock } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, type, image, stock },
      { new: true } // 업데이트된 결과 반환
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "아이템을 찾을 수 없음" });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "아이템 수정 실패" });
  }
});

// Server/routes/items.js
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "삭제 완료" });
  } catch (err) {
    console.error("❌ 삭제 실패", err);
    res.status(500).json({ error: "삭제 실패" });
  }
});



module.exports = router;
