const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// 로그인 요청
router.post("/", async (req, res) => {
  const { id, password, role } = req.body;

  try {
    if (role === "student") {
      const student = await Student.findOne({ id });
      if (!student || student.password !== password) {
        return res.status(401).json({ message: "학생 로그인 실패" });
      }
      return res.json({ role: "student", user: student });
    } else if (role === "teacher") {
      const teacher = await Teacher.findOne({ id });
      if (!teacher || teacher.password !== password) {
        return res.status(401).json({ message: "선생님 로그인 실패" });
      }
      return res.json({ role: "teacher", user: teacher });
    } else {
      return res.status(400).json({ message: "잘못된 역할" });
    }
  } catch (err) {
    console.error("❌ 로그인 오류", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
