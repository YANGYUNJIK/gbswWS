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

const mongoose = require("mongoose");

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "잘못된 ID 형식입니다" });
  }
  try {
    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
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

// ✅ 비밀번호 변경
router.patch("/change-password", async (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  console.log("🛠️ 비번 변경 요청:", req.body);

  try {
    const student = await Student.findOne({ $or: [{ id }, { name: id }] });

    if (!student) {
      return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
    }

    if (student.password !== currentPassword) {
      return res.status(400).json({ error: "현재 비밀번호가 일치하지 않습니다." });
    }

    student.password = newPassword;
    await student.save();

    res.json({ message: "비밀번호가 성공적으로 변경되었습니다." });
  } catch (err) {
    console.error("비밀번호 변경 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});


module.exports = router;
