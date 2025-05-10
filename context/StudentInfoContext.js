import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const StudentInfoContext = createContext();

export const StudentInfoProvider = ({ children }) => {
  const [studentName, setStudentName] = useState("");
  const [category, setCategory] = useState("");
  

  useEffect(() => {
    const loadData = async () => {
      const savedName = await AsyncStorage.getItem("studentName");
      const savedCategory = await AsyncStorage.getItem("category");
      if (savedName) setStudentName(savedName);
      if (savedCategory) setCategory(savedCategory);
    };
    loadData();
  }, []);

  const saveStudentInfo = async (name, cat) => {
    setStudentName(name);
    setCategory(cat);
    await AsyncStorage.setItem("studentName", name);
    await AsyncStorage.setItem("category", cat);
  };

  return (
    <StudentInfoContext.Provider value={{ studentName, category, saveStudentInfo }}>
      {children}
    </StudentInfoContext.Provider>
  );
};
