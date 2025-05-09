import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { StudentInfoContext } from "../context/StudentInfoContext";
import { useRouter } from "expo-router";

export default function StudentMenu() {
  const { studentName, category } = useContext(StudentInfoContext);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{studentName}님, 어떤 항목을 신청하시겠어요?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/student/drink")}
      >
        <Text style={styles.buttonText}>🥤 음료 신청</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/student/snack")}
      >
        <Text style={styles.buttonText}>🍪 간식 신청</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push("/student/orders")}
      >
        <Text style={styles.buttonText}>📄 신청 내역 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  button: {
    backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, marginVertical: 10, width: "80%", alignItems: "center"
  },
  buttonSecondary: {
    backgroundColor: "#2196F3", padding: 15, borderRadius: 10, marginTop: 30, width: "80%", alignItems: "center"
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 }
});
