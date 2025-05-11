// ✅ _layout.js (학생 + 선생님 종 실시간 반영 완전 적용 - 안정화)
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext, StudentInfoProvider } from "../context/StudentInfoContext";

const SERVER_URL = Platform.OS === "web"
  ? "http://localhost:3000"       // 로컬 개발 중이라면 이거!
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

  useEffect(() => {
    const targetDate = new Date("2025-09-19");
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDDayText(`📅 2025 전국기능경기대회 D-${dayDiff}`);
  }, []);

  useEffect(() => {
    const path = router.pathname || segments.join("/") || "";
    const admin = path.includes("admin");
    const teacher = path.includes("teacher");
    const student = path.includes("student");

    setIsTeacher(admin || teacher);
    setIsStudent(student);

    // ✅ 선생님: 최초 대기 주문 수 가져오기
    if (admin || teacher) {
      fetch(`${SERVER_URL}/orders`)
        .then((res) => res.json())
        .then((data) => {
          const pending = data.filter((o) => o.status === "pending");
          setPendingCount(pending.length);
        });
    }

    // ✅ 소켓 이벤트 등록
    socket.on("newOrder", () => {
      setPendingCount((prev) => prev + 1);
    });

    socket.on("orderUpdated", (order) => {
      if ((admin || teacher) && order.status !== "pending") {
        setPendingCount((prev) => Math.max(prev - 1, 0));
      }
      if (student && studentName && order.studentName === studentName) {
        console.log("🔔 학생 알림 발생!");
        setStudentAlert(true);
      }
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
    };
  }, []);

  const handleAlert = () => {
    if (isTeacher) {
      Alert.alert("🔔 알림", pendingCount > 0 ? `${pendingCount}개의 신청이 처리 대기 중입니다.` : "새로운 신청이 없습니다.");
    } else if (isStudent) {
      Alert.alert("📢 알림", "신청하신 항목이 처리되었습니다.");
      setStudentAlert(false);
    }
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
                  <View style={[styles.badge, { minWidth: 10, paddingHorizontal: 0 }]} />
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
