// ✅ /app/main.js (ImageBackground로 leftPane 투명 배경 적용)
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { StudentInfoContext } from "../context/StudentInfoContext";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";


export default function MainScreen() {
  const router = useRouter();
  const { saveStudentInfo } = useContext(StudentInfoContext);

  const [role, setRole] = useState("student");
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

      if (role === "student") {
        saveStudentInfo(data.user.name, data.user.category);
        router.push("/student");
      } else {
        router.push("/teacher");
      }

    } catch (err) {
      console.error("❌ 로그인 오류", err);
      Alert.alert("서버 연결 실패");
    }
  };

  const imageSource = id && password
    ? require("../assets/world2.png")
    : require("../assets/world1.png");

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <ImageBackground
          source={require("../assets/test1.jpg")}
          style={styles.fullImage}
          imageStyle={{ opacity: 0.6 }}
        />
      </View>

      <View style={styles.rightPane}>
        <Image source={imageSource} style={styles.inlineImage} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f2f4f8",
  },
  leftPane: {
    width: "50%", // ← 절반으로 고정
    height: "100%",
  },
  fullImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  rightPane: {
    width: "50%", // ← 절반으로 고정
    height: "100%",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
  },
  inlineImage: {
    width: 180,
    height: 180,
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  roleBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  activeBtn: {
    backgroundColor: "#5DBB9D",
    borderColor: "#5DBB9D",
  },
  roleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  loginBtn: {
    backgroundColor: "#5DBB9D",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
