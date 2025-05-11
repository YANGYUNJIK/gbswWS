const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// 전체 학생 목록
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ id: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "학생 조회 실패" });
  }
});

// 학생 등록
router.post("/", async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "학생 등록 완료", student: newStudent });
  } catch (err) {
    res.status(500).json({ message: "학생 등록 실패", detail: err.message });
  }
});

// 학생 삭제
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "학생 삭제 완료" });
  } catch (err) {
    res.status(500).json({ message: "학생 삭제 실패" });
  }
});

// 학생 수정 (이름, category, grade, number 등)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "학생 정보 수정 완료", student: updated });
  } catch (err) {
    res.status(500).json({ message: "학생 정보 수정 실패" });
  }
});

// 비밀번호 초기화
router.patch("/:id/reset-password", async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { password: "1234" },
      { new: true }
    );
    res.json({ message: "비밀번호 초기화 완료", student: updated });
  } catch (err) {
    res.status(500).json({ message: "비밀번호 초기화 실패" });
  }
});

module.exports = router;
