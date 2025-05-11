import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StudentInfoContext } from "../context/StudentInfoContext";

export default function StudentMenu() {
  const { studentName, category } = useContext(StudentInfoContext);
  const router = useRouter();

  useEffect(() => {
  console.log("✅ 현재 학생 이름:", studentName);
}, [studentName]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        먹은 만큼 밥값 해야제?
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#5DBB9D" }]}
        onPress={() => router.push("/student/drink")}
      >
        <Text style={styles.buttonText}>🥤 음료 신청</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#5DBB9D" }]}
        onPress={() => router.push("/student/snack")}
      >
        <Text style={styles.buttonText}>🍪 간식 신청</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#5DBB9D" }]}
        onPress={() => router.push("/student/orders")}
      >
        <Text style={styles.buttonText}>📄 신청 내역 보기</Text>
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
  header: {
    fontSize: 22, fontWeight: "bold", marginBottom: 40, textAlign: "center", color: "#333",
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
    color: "white", fontWeight: "bold", fontSize: 17,
  },
});
