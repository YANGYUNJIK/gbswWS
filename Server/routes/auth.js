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
      if (!student) {
        return res.status(404).json({ message: "존재하지 않는 학생 아이디입니다." });
      }
      if (student.password !== password) {
        return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
      }
      return res.json({ role: "student", user: student });
    }

    if (role === "teacher") {
      const teacher = await Teacher.findOne({ id });
      if (!teacher) {
        return res.status(404).json({ message: "존재하지 않는 선생님 아이디입니다." });
      }
      if (teacher.password !== password) {
        return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
      }
      return res.json({ role: "teacher", user: teacher });
    }

    return res.status(400).json({ message: "잘못된 역할입니다." });

  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
