// ✅ 전체 수정된 _layout.js (실시간 채팅 포함)
import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext, StudentInfoProvider } from "../context/StudentInfoContext";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const socket = io(SERVER_URL);
const SCREEN_WIDTH = Dimensions.get("window").width;

function LayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { studentName } = useContext(StudentInfoContext);

  const [dDayText, setDDayText] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [studentAlert, setStudentAlert] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [ready, setReady] = useState(false);

  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [hasNewChat, setHasNewChat] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.13)).current;

  const [cheerModalVisible, setCheerModalVisible] = useState(false);
  const [cheerText, setCheerText] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      sender: studentName || "익명",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("chatMessage", msg);
    setNewMessage("");
  };

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (!chatVisible) setHasNewChat(true);
    });
    return () => socket.off("chatMessage");
  }, [chatVisible]);

  useEffect(() => {
    const targetDate = new Date("2025-09-19");
    const today = new Date();
    const dayDiff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    setDDayText(`2025 전국기능경기대회 D-${dayDiff}`);
  }, []);

  useEffect(() => {
    const path = router.pathname || segments.join("/") || "";
    const admin = path.includes("admin");
    const teacher = path.includes("teacher");
    const student = path.includes("student");

    setIsTeacher(admin || teacher);
    setIsStudent(student);

    if (admin || teacher) {
      fetch(`${SERVER_URL}/orders`)
        .then((res) => res.json())
        .then((data) => {
          const pending = data.filter((o) => o.status === "pending");
          setPendingCount(pending.length);
        });
    }

    socket.on("newOrder", () => {
      setPendingCount((prev) => prev + 1);
    });
    socket.on("orderUpdated", (order) => {
      if ((admin || teacher) && order.status !== "pending") {
        setPendingCount((prev) => Math.max(prev - 1, 0));
      }
      if (student && studentName && order.studentName === studentName) {
        setStudentAlert(true);
      }
    });

    setReady(true);
    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
    };
  }, [segments]);

  if (!ready) return null;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -SCREEN_WIDTH * 0.4,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  const handleAlert = () => {
    if (isTeacher) {
      pendingCount > 0 ? router.push("/admin/orders") : Alert.alert("🔔 알림", "새로운 신청이 없습니다.");
    } else if (isStudent) {
      Alert.alert("📢 알림", "신청하신 항목이 처리되었습니다.");
      setStudentAlert(false);
    }
  };

  const menuItems = (isTeacher ? [
    { label: "🏠 메인", route: "/teacher" },
    { label: "📦 간식 관리", route: "/admin/manage" },
    { label: "📋 신청 관리", route: "/admin/orders" },
    { label: "📊 대시보드", route: "/admin/dashboard" },
    { label: "👥 사용자 관리", route: "/admin/users" },
    { label: "📣 응원 작성", route: "cheer" },
    { label: "🚪 로그아웃", route: "/main" },
  ] : isStudent ? [
    { label: "🏠 메인", route: "/student" },
    { label: "🥤 음료 신청", route: "/student/drink" },
    { label: "🍪 간식 신청", route: "/student/snack" },
    { label: "🍜 라면 신청", route: "/student/ramen" },
    { label: "📄 신청 내역", route: "/student/orders" },
    { label: "🚪 로그아웃", route: "/main" },
  ] : []);

  return (
    <>
      <Stack screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerLeft: () => (isTeacher || isStudent) && (
          <TouchableOpacity onPress={openDrawer}><Text style={{ fontSize: 30, marginLeft: 10 }}> ☰ </Text></TouchableOpacity>
        ),
        headerTitle: () => (
          <TouchableOpacity onPress={() => router.replace("/main")}><Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>{dDayText}</Text></TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => { setChatVisible(true); setHasNewChat(false); }} style={{ marginLeft: 10, position: "relative" }}>
              <Text style={{ fontSize: 20 }}>💬</Text>
              {hasNewChat && <View style={{ position: "absolute", top: -5, right: -6, backgroundColor: "red", width: 10, height: 10, borderRadius: 5 }} />}
            </TouchableOpacity>
            {(isTeacher || isStudent) && (
              <TouchableOpacity onPress={handleAlert} style={{ position: "relative" }}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
                {isTeacher && pendingCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{pendingCount}</Text></View>}
                {isStudent && studentAlert && <View style={[styles.badge, { minWidth: 10, paddingHorizontal: 0 }]} />}
              </TouchableOpacity>
            )}
          </View>
        ),
        headerStyle: { backgroundColor: "#f5f9ff", borderBottomWidth: 1, borderBottomColor: "#ddd" },
      }} />

      {drawerOpen && <Pressable onPress={closeDrawer} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)" }} />}

      <Animated.View style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: SCREEN_WIDTH * 0.13, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 16, zIndex: 999, transform: [{ translateX: drawerAnim }] }}>
        {menuItems.map(({ label, route }) => (
          <TouchableOpacity key={label} onPress={() => { closeDrawer(); label === "📣 응원 작성" ? setCheerModalVisible(true) : router.push(route); }} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {cheerModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📣 응원 메시지 작성</Text>
            <TextInput value={cheerText} onChangeText={setCheerText} placeholder="예: 모두 파이팅하세요!" style={styles.input} />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setCheerModalVisible(false)}><Text>취소</Text></TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                await fetch(`${SERVER_URL}/cheer`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ message: cheerText }),
                });
                setCheerModalVisible(false);
                setCheerText("");
              }}><Text style={{ color: "blue" }}>등록</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {chatVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "60%" }]}>  
            <Text style={styles.modalTitle}>💬 실시간 채팅</Text>
            <View style={{ flex: 1, marginVertical: 10 }}>
              <FlatList data={chatMessages} keyExtractor={(_, i) => i.toString()} renderItem={({ item }) => (
                <Text style={{ marginVertical: 2 }}><Text style={{ fontWeight: "bold" }}>{item.sender}</Text>: {item.text}</Text>
              )} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput style={[styles.input, { flex: 1 }]} value={newMessage} onChangeText={setNewMessage} placeholder="메시지 입력..." />
              <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}><Text style={{ color: "#4A90E2", fontWeight: "bold" }}>전송</Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: "gray", textAlign: "right" }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
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
  modalOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});