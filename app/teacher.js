import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CheerFadeLine from "../components/CheerFadeLine"; // 경로는 프로젝트에 맞게 조정
export default function TeacherScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CheerFadeLine />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#5DBB9D" }]}
        onPress={() => router.push("/admin/manage")}
      >
        <Text style={styles.buttonText}>📦 항목 등록 / 수정 / 삭제</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#5DBB9D" }]}
        onPress={() => router.push("/admin/orders")}
      >
        <Text style={styles.buttonText}>📋 신청 목록 관리</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#5DBB9D" }]}
        onPress={() => router.push("/admin/dashboard")}
      >
        <Text style={styles.buttonText}>📈 요약 대시보드</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4A90E2" }]}
        onPress={() => router.push("/admin/users")}
      >
        <Text style={styles.buttonText}>👥 사용자 관리</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 0,
    paddingTop: 0,           // ✅ 추가: 상단 간격 제거
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 10,
    width: "25%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
});
