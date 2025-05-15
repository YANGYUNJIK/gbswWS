// ✅ /app/student/change-password.js
import { useContext, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";

export default function ChangePasswordScreen() {
  const { studentName } = useContext(StudentInfoContext);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      Alert.alert("❗ 현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/students/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName,
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("❌ 변경 실패", data.message || "비밀번호 변경에 실패했습니다.");
        return;
      }

      Alert.alert("✅ 비밀번호가 성공적으로 변경되었습니다.");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      Alert.alert("❌ 오류", "서버와 통신에 실패했습니다.");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 비밀번호 변경</Text>
      <Text style={styles.label}>현재 비밀번호</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={currentPw}
        onChangeText={setCurrentPw}
        placeholder="현재 비밀번호"
      />
      <Text style={styles.label}>새 비밀번호</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={newPw}
        onChangeText={setNewPw}
        placeholder="새 비밀번호"
      />
      <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
        <Text style={styles.buttonText}>변경하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { marginTop: 10, marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 10, marginBottom: 10,
  },
  button: {
    marginTop: 20, backgroundColor: "#5DBB9D", padding: 14, borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
