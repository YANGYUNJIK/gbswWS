// ✅ _layout.js (학생 + 선생님 종 실시간 반영 완성본)
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext, StudentInfoProvider } from "../context/StudentInfoContext";

const SERVER_URL = Platform.OS === "web"
  ? "http://localhost:3000"
  : "https://gbswws.onrender.com";

const socket = io(SERVER_URL);

function LayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { studentName } = useContext(StudentInfoContext);
  const [dDayText, setDDayText] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [studentAlert, setStudentAlert] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  // ✅ D-Day 설정
  useEffect(() => {
    const targetDate = new Date("2025-09-19");
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDDayText(`📅 2025 전국기능경기대회 D-${dayDiff}`);
  }, []);

  // ✅ 페이지 경로에 따라 선생님/학생 분기
  useEffect(() => {
    const path = router.pathname || segments.join("/") || "";
    const admin = path.includes("admin");
    const teacher = path.includes("teacher");
    const student = path.includes("student");

    setIsTeacher(admin || teacher);
    setIsStudent(student);
  }, [router.pathname, segments]);

  // ✅ 선생님 종 실시간 반영
  useEffect(() => {
    if (!isTeacher) return;

    const fetchPending = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/orders`);
        const data = await res.json();
        const pending = data.filter((o) => o.status === "pending");
        setPendingCount(pending.length);
      } catch (err) {
        console.error("❌ 처리 대기 주문 불러오기 실패", err);
      }
    };

    fetchPending();

    const handleNewOrder = () => setPendingCount((prev) => prev + 1);
    const handleOrderUpdated = (order) => {
      if (order.status !== "pending") {
        setPendingCount((prev) => Math.max(prev - 1, 0));
      }
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [isTeacher]);

  // ✅ 학생 종 실시간 반영
  useEffect(() => {
    if (!isStudent || !studentName) return;

    const handleOrderUpdated = (order) => {
      if (order.studentName === studentName) {
        console.log("🔔 학생 알림 발생!", order.studentName);
        setStudentAlert(true);
      }
    };

    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [isStudent, studentName]);

  // ✅ 종 눌렀을 때
  const handleAlert = () => {
    if (isTeacher) {
      Alert.alert("🔔 알림", pendingCount > 0 ? `${pendingCount}개의 신청이 처리 대기 중입니다.` : "새로운 신청이 없습니다.");
    } else if (isStudent) {
      Alert.alert("📢 알림", "신청하신 항목이 처리되었습니다.");
      setStudentAlert(false);
    }
  };

  // ✅ 계정 처리
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
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerTitle: () => (
          <TouchableOpacity
            onPress={() => router.replace("/main")}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
              {dDayText}
            </Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            {(isTeacher || isStudent) && (
              <TouchableOpacity onPress={handleAlert} style={{ position: "relative" }}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
                {isTeacher && pendingCount > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{pendingCount}</Text></View>
                )}
                {isStudent && studentAlert && (
                  <View style={[styles.badge, { minWidth: 10, height: 10, borderRadius: 5, paddingHorizontal: 0 }]} />
                )}
              </TouchableOpacity>
            )}
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
  );
}

export default function Layout() {
  return (
    <StudentInfoProvider>
      <LayoutContent />
    </StudentInfoProvider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
    alignItems: "center",
    gap: 10,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
});
