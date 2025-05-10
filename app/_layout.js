import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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

  return (
    <StudentInfoProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: () => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                {dDayText}
              </Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push("/main")}>
              <Text style={{ marginLeft: 16, fontSize: 16, color: "#4A90E2" }}>🏠</Text>
            </TouchableOpacity>
          ),
          headerRight: () => <View style={{ marginRight: 16 }} />, // 오른쪽 비워두기
        }}
      />
    </StudentInfoProvider>
  );
}
