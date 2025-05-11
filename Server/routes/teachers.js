const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");

// 전체 선생님 목록
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ id: 1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "선생님 조회 실패" });
  }
});

// 선생님 등록
router.post("/", async (req, res) => {
  try {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.status(201).json({ message: "선생님 등록 완료", teacher: newTeacher });
  } catch (err) {
    res.status(500).json({ message: "선생님 등록 실패", detail: err.message });
  }
});

// 선생님 삭제
router.delete("/:id", async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "선생님 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "선생님 삭제 실패" });
  }
});

// 선생님 정보 수정 (이름, department, category 등)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "선생님 정보 수정 완료", teacher: updated });
  } catch (err) {
    res.status(500).json({ message: "선생님 정보 수정 실패" });
  }
});

// 비밀번호 초기화
router.patch("/:id/reset-password", async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      { password: "1234" },
      { new: true }
    );
    res.json({ message: "비밀번호 초기화 완료", teacher: updated });
  } catch (err) {
    res.status(500).json({ message: "비밀번호 초기화 실패" });
  }
});

module.exports = router;
