import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StudentInfoProvider } from "../context/StudentInfoContext";

export default function Layout() {
  const router = useRouter();
  const [dDay, setDDay] = useState("");

  useEffect(() => {
    const targetDate = new Date("2025-09-19");
    const today = new Date();

    const timeDiff = targetDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    setDDay(`D-${dayDiff}`);
  }, []);

  return (
    <StudentInfoProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push("/main")}>
              <Text style={{ marginLeft: 16, fontSize: 16, color: "blue" }}>🏠 홈</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <Text style={{ fontSize: 16, color: "black" }}>{dDay}</Text>
            </View>
          ),
        }}
      />
    </StudentInfoProvider>
  );
}
