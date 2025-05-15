import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View
} from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext, StudentInfoProvider } from "../context/StudentInfoContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SERVER_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://gbswws.onrender.com";
const socket = io(SERVER_URL);
const TODAY_KEY = `chatMessages-${new Date().toISOString().split("T")[0]}`; // 📅 오늘 기준

function LayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { studentName, teacherName } = useContext(StudentInfoContext);

  const nickname = teacherName ? "선생님" : studentName || "익명";
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef(null);

  const [chatVisible, setChatVisible] = useState(false);
  const [hasNewChat, setHasNewChat] = useState(false);

  const [cheerModalVisible, setCheerModalVisible] = useState(false);
  const [cheerText, setCheerText] = useState("");
  const [cheerTarget, setCheerTarget] = useState("student");

  const [dDayText, setDDayText] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [studentAlert, setStudentAlert] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [ready, setReady] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.15)).current;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🧠 저장 & 불러오기
  const loadChat = async () => {
    const saved = await AsyncStorage.getItem(TODAY_KEY);
    if (saved) setChatMessages(JSON.parse(saved));
  };
  const saveChat = async (messages) => {
    await AsyncStorage.setItem(TODAY_KEY, JSON.stringify(messages));
  };

  useEffect(() => {
    loadChat();
    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => {
        const updated = [...prev, msg];
        saveChat(updated);
        return updated;
      });
      if (!chatVisible) setHasNewChat(true);
    });
    return () => socket.off("chatMessage");
  }, [chatVisible]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      sender: nickname,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("chatMessage", msg);
    setNewMessage("");
    inputRef.current?.focus(); // ✅ 커서 복귀
  };

  const deleteMessage = async (index) => {
    const updated = chatMessages.filter((_, i) => i !== index);
    setChatMessages(updated);
    await saveChat(updated);
  };

  const resetMessages = async () => {
    setChatMessages([]);
    await AsyncStorage.removeItem(TODAY_KEY);
  };

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

    socket.on("newOrder", () => setPendingCount((prev) => prev + 1));
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

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => {
              Animated.timing(drawerAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
              }).start();
              setDrawerOpen(true);
            }}>
              <Text style={{ fontSize: 30, marginLeft: 10 }}> ☰ </Text>
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <TouchableOpacity onPress={() => router.replace("/main")}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>{dDayText}</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => {
                setChatVisible(true);
                setHasNewChat(false);
              }} style={{ position: "relative" }}>
                <Text style={{ fontSize: 20 }}>💬</Text>
                {hasNewChat && <View style={styles.dot} />}
              </TouchableOpacity>
              {isTeacher && (
                <TouchableOpacity onPress={() => setCheerModalVisible(true)}>
                  <Text style={{ fontSize: 20 }}>📣</Text>
                </TouchableOpacity>
              )}
              {(isTeacher || isStudent) && (
                <TouchableOpacity onPress={() => {
                  isTeacher
                    ? pendingCount > 0
                      ? router.push("/admin/orders")
                      : Alert.alert("🔔 알림", "새로운 신청이 없습니다.")
                    : Alert.alert("📢 알림", "신청하신 항목이 처리되었습니다.");
                  setStudentAlert(false);
                }}>
                  <Text style={{ fontSize: 20 }}>🔔</Text>
                  {isTeacher && pendingCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{pendingCount}</Text></View>}
                  {isStudent && studentAlert && <View style={styles.dot} />}
                </TouchableOpacity>
              )}
            </View>
          ),
          headerStyle: { backgroundColor: "#f5f9ff", borderBottomWidth: 1, borderBottomColor: "#ddd" },
        }}
      />

      {drawerOpen && (
        <Pressable onPress={() => {
          Animated.timing(drawerAnim, {
            toValue: -SCREEN_WIDTH * 0.15,
            duration: 200,
            useNativeDriver: false,
          }).start(() => setDrawerOpen(false));
        }} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)" }} />
      )}

      <Animated.View style={{
        position: "absolute",
        top: 0, bottom: 0, left: 0,
        width: SCREEN_WIDTH * 0.15,
        backgroundColor: "#fff",
        paddingTop: 60,
        paddingHorizontal: 16,
        zIndex: 999,
        transform: [{ translateX: drawerAnim }],
      }}>
        {[
          ...(isTeacher ? [
            { label: "🏠 메인", route: "/teacher" },
            { label: "📦 간식 관리", route: "/admin/manage" },
            { label: "📋 신청 관리", route: "/admin/orders" },
            { label: "📊 대시보드", route: "/admin/dashboard" },
            { label: "👥 사용자 관리", route: "/admin/users" },
          ] : isStudent ? [
            { label: "🏠 메인", route: "/student" },
            { label: "🥤 음료 신청", route: "/student/drink" },
            { label: "🍪 간식 신청", route: "/student/snack" },
            { label: "🍜 라면 신청", route: "/student/ramen" },
            { label: "📄 신청 내역", route: "/student/orders" },
          ] : []),
          { label: "🚪 로그아웃", route: "/main" },
        ].map(({ label, route }) => (
          <TouchableOpacity key={label} onPress={() => {
            router.push(route);
            Animated.timing(drawerAnim, {
              toValue: -SCREEN_WIDTH * 0.15,
              duration: 200,
              useNativeDriver: false,
            }).start(() => setDrawerOpen(false));
          }} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {chatVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "65%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.modalTitle}>💬 실시간 채팅</Text>
              {isTeacher && (
                <TouchableOpacity onPress={resetMessages}>
                  <Text style={{ color: "red", fontSize: 12 }}>초기화</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={chatMessages}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item, index }) => (
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <Text>
                    <Text style={{ fontWeight: "bold" }}>{item.sender}</Text>: {item.text}
                  </Text>
                  {isTeacher && (
                    <TouchableOpacity onPress={() => deleteMessage(index)}>
                      <Text style={{ color: "red", marginLeft: 10 }}>❌</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <TextInput
                ref={inputRef}
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={sendMessage}
                placeholder="메시지 입력..."
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>전송</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={{ marginTop: 12 }}>
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
    gap: 14,
    marginRight: 16,
  },
  dot: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: "red",
    width: 10,
    height: 10,
    borderRadius: 5,
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
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
});
