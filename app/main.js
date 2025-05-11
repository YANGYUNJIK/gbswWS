import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { StudentInfoContext } from "../context/StudentInfoContext";

const SERVER_URL = Platform.OS === "web"
  ? "http://localhost:3000"
  : "https://gbswws.onrender.com";

export default function MainScreen() {
  const router = useRouter();
  const { saveStudentInfo } = useContext(StudentInfoContext);

  const [role, setRole] = useState("student"); // "student" or "teacher"
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) {
      Alert.alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("❌ 로그인 실패", data.message || "아이디 또는 비밀번호가 틀렸습니다.");
        return;
      }

      Alert.alert("✅ 로그인 성공");

      // ✅ Context에 저장
      if (role === "student") {
        saveStudentInfo(data.user.name, data.user.category); // 핵심 수정
        router.push("/student");
      } else {
        router.push("/teacher");
      }

    } catch (err) {
      console.error("❌ 로그인 오류", err);
      Alert.alert("서버 연결 실패");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 간편 로그인</Text>

      <View style={styles.selector}>
        <TouchableOpacity
          style={[styles.roleBtn, role === "student" && styles.activeBtn]}
          onPress={() => setRole("student")}
        >
          <Text style={styles.roleText}>학생</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === "teacher" && styles.activeBtn]}
          onPress={() => setRole("teacher")}
        >
          <Text style={styles.roleText}>선생님</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={id}
        onChangeText={setId}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f2f4f8" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  selector: { flexDirection: "row", justifyContent: "center", marginBottom: 20, gap: 10 },
  roleBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center"
  },
  activeBtn: {
    backgroundColor: "#5DBB9D",
    borderColor: "#5DBB9D"
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold"
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  loginBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center"
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
});
