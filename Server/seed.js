// ✅ Server/seed.js
const mongoose = require("mongoose");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");

// ⚠️ 여기에 본인의 MongoDB 연결 URI를 입력하세요
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin1234@cluster0.v5opc9e.mongodb.net/snackApp?retryWrites=true&w=majority";

const runSeed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB 연결됨");

    // 기존 데이터 삭제
    await Student.deleteMany({});
    await Teacher.deleteMany({});

    // 학생 초기 데이터
    await Student.insertMany([
      {
        id: "s1002",
        name: "홍길동",
        category: "게임개발",
        grade: 2,
        number: 7,
        password: "1234",
      },
      {
        id: "s2001",
        name: "이몽룡",
        category: "정보기술",
        grade: 1,
        number: 3,
        password: "1234",
      },
    ]);

    // 선생님 초기 데이터
    await Teacher.insertMany([
      {
        id: "t1001",
        name: "김선생",
        category: "정보기술",
        department: "3반",
        password: "1234",
      },
    ]);

    console.log("🎉 초기 데이터 삽입 완료!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ 데이터 삽입 오류:", err.message);
    process.exit(1);
  }
};

runSeed();
