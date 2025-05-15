import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const StudentInfoContext = createContext();

export const StudentInfoProvider = ({ children }) => {
  const [studentName, setStudentName] = useState("");
  const [category, setCategory] = useState("");
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedName = await AsyncStorage.getItem("studentName");
      const savedCategory = await AsyncStorage.getItem("category");
      const savedTeacher = await AsyncStorage.getItem("teacherName");

      if (savedName) setStudentName(savedName);
      if (savedCategory) setCategory(savedCategory);
      if (savedTeacher) setTeacherName(savedTeacher);
    };
    loadData();
  }, []);

  const saveStudentInfo = async (name, cat) => {
    setStudentName(name);
    setCategory(cat);
    setTeacherName(""); // ✅ 선생님 닉네임 제거
    await AsyncStorage.setItem("studentName", name);
    await AsyncStorage.setItem("category", cat);
    await AsyncStorage.removeItem("teacherName");
  };

  const saveTeacherInfo = async (name) => {
    setTeacherName(name);
    setStudentName(""); // ✅ 학생 이름 제거
    setCategory("");
    await AsyncStorage.setItem("teacherName", name);
    await AsyncStorage.removeItem("studentName");
    await AsyncStorage.removeItem("category");
  };

  const clearInfo = async () => {
    setStudentName("");
    setCategory("");
    setTeacherName("");
    await AsyncStorage.removeItem("studentName");
    await AsyncStorage.removeItem("category");
    await AsyncStorage.removeItem("teacherName");
  };


  return (
    <StudentInfoContext.Provider
      value={{
        studentName,
        category,
        teacherName,
        saveStudentInfo,
        saveTeacherInfo,
        clearInfo, // ⬅️ 추가
      }}
    >
      {children}
    </StudentInfoContext.Provider>
  );

};
