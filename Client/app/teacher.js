import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function TeacherScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👩‍🏫 선생님 페이지</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/admin/manage")}
      >
        <Text style={styles.buttonText}>📦 항목 등록 / 수정 / 삭제</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/admin/orders")}
      >
        <Text style={styles.buttonText}>📋 신청 목록 관리</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/admin/dashboard")}
      >
        <Text style={styles.buttonText}>📈 요약 대시보드</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20
  },
  title: {
    fontSize: 22, fontWeight: "bold", marginBottom: 30
  },
  button: {
    backgroundColor: "#4CAF50", padding: 15, borderRadius: 10,
    marginVertical: 10, width: "80%", alignItems: "center"
  },
  buttonText: {
    color: "white", fontSize: 16, fontWeight: "bold"
  }
});
