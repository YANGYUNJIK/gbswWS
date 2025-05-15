import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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

  const [cheerModalVisible, setCheerModalVisible] = useState(false);
  const [cheerText, setCheerText] = useState("");
  const [cheerTarget, setCheerTarget] = useState("student");

  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.13)).current;

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

  const handleCheerSubmit = async () => {
    if (!cheerText.trim()) {
      Alert.alert("⚠️ 메시지를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/cheer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cheerText, target: cheerTarget }),
      });

      if (!res.ok) throw new Error("등록 실패");

      socket.emit("newCheer");
      Alert.alert("✅ 등록 완료", "응원 메시지가 등록되었습니다.");
      setCheerModalVisible(false);
      setCheerText("");
    } catch (err) {
      Alert.alert("❌ 오류", "메시지 등록에 실패했습니다.");
    }
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

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackVisible: false,
          headerTitle: () => (
            <TouchableOpacity onPress={() => router.replace("/main")}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>{dDayText}</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => { setChatVisible(true); setHasNewChat(false); }} style={{ position: "relative" }}>
                <Text style={{ fontSize: 20 }}>💬</Text>
                {hasNewChat && <View style={styles.redDot} />}
              </TouchableOpacity>
              {isTeacher && (
                <TouchableOpacity onPress={() => setCheerModalVisible(true)} style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 20 }}>📣</Text>
                </TouchableOpacity>
              )}
              {(isTeacher || isStudent) && (
                <TouchableOpacity onPress={() => {
                  if (isTeacher) {
                    pendingCount > 0 ? router.push("/admin/orders") : Alert.alert("🔔 알림", "새로운 신청이 없습니다.");
                  } else {
                    Alert.alert("📢 알림", "신청하신 항목이 처리되었습니다.");
                    setStudentAlert(false);
                  }
                }} style={{ marginLeft: 10, position: "relative" }}>
                  <Text style={{ fontSize: 20 }}>🔔</Text>
                  {isTeacher && pendingCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{pendingCount}</Text>
                    </View>
                  )}
                  {isStudent && studentAlert && <View style={styles.redDot} />}
                </TouchableOpacity>
              )}
            </View>
          ),
          headerStyle: { backgroundColor: "#f5f9ff", borderBottomWidth: 1, borderBottomColor: "#ddd" },
        }}
      />

      {/* 응원 메시지 작성 모달 */}
      {cheerModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={styles.modalTitle}>📣 응원 메시지 작성</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {["student", "teacher"].map((tgt) => (
                  <TouchableOpacity key={tgt} onPress={() => setCheerTarget(tgt)}>
                    <Text style={{
                      fontWeight: cheerTarget === tgt ? "bold" : "normal",
                      color: cheerTarget === tgt ? "#4A90E2" : "#666"
                    }}>
                      {tgt === "student" ? "학생" : "교사"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              value={cheerText}
              onChangeText={setCheerText}
              placeholder="예: 모두 파이팅하세요!"
              style={styles.input}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                handleCheerSubmit();
              }}
              blurOnSubmit={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setCheerModalVisible(false)}>
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCheerSubmit}>
                <Text style={{ color: "blue" }}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 채팅 모달 */}
      {chatVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "60%" }]}>
            <Text style={styles.modalTitle}>💬 실시간 채팅</Text>
            <FlatList
              data={chatMessages}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <Text style={{ marginVertical: 2 }}>
                  <Text style={{ fontWeight: "bold" }}>{item.sender}</Text>: {item.text}
                </Text>
              )}
              style={{ flex: 1, marginVertical: 10 }}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="메시지 입력..."
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>전송</Text>
              </TouchableOpacity>
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
    alignItems: "center",
    gap: 10,
    marginRight: 16,
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
  redDot: {
    position: "absolute",
    top: -5,
    right: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
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
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
