import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TeacherScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👩‍🏫 선생님 메뉴</Text>

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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 20,
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
