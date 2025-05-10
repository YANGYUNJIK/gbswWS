import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { StudentInfoProvider } from "../context/StudentInfoContext";

export default function Layout() {
  const router = useRouter();
  const [dDayText, setDDayText] = useState("");

  useEffect(() => {
    const targetDate = new Date("2025-09-19");
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDDayText(`📅 2025 전국기능경기대회 D-${dayDiff}`);
  }, []);

  const handleAlert = () => {
    Alert.alert("🔔 알림", "새로운 알림이 없습니다.");
  };

  const handleAccount = () => {
    Alert.alert("👤 계정", "로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <StudentInfoProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackVisible: false, // ✅ 모든 화면에서 뒤로가기 제거
          headerTitle: () => (
            <TouchableOpacity
              onPress={() => router.replace("/main")}
              style={{ alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                {dDayText}
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                marginRight: 16,
                alignItems: "center",
                gap: 10,
              }}
            >
              <TouchableOpacity onPress={handleAlert}>
                <Text style={{ fontSize: 18 }}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAccount}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: "#f5f9ff",
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
          },
        }}
      />
    </StudentInfoProvider>
  );
}
