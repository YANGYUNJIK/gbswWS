import { Stack, useRouter, useSegments } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Platform,
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

    const [cheerTarget, setCheerTarget] = useState("student");
    const [cheerModalVisible, setCheerModalVisible] = useState(false);
    const [cheerText, setCheerText] = useState("");

    const [chatVisible, setChatVisible] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [hasNewChat, setHasNewChat] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.4)).current;

    const todayDate = new Date().toISOString().split("T")[0];

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const nickname = isTeacher ? "선생님" : (studentName || "익명");

        const msg = {
            sender: nickname,
            text: newMessage.trim(),
            time: new Date().toLocaleTimeString(),
            date: todayDate,
        };
        socket.emit("chatMessage", msg);
        setNewMessage("");
    };

    const saveMessagesToStorage = async (messages) => {
        try {
            const key = `chat-${todayDate}`;
            const json = JSON.stringify(messages);
            if (Platform.OS === "web") {
                localStorage.setItem(key, json);
            } else {
                const AsyncStorage = await import("@react-native-async-storage/async-storage");
                await AsyncStorage.default.setItem(key, json);
            }
        } catch (err) {
            console.error("메시지 저장 실패:", err);
        }
    };

    const loadMessages = async () => {
        try {
            const key = `chat-${todayDate}`;
            let stored;
            if (Platform.OS === "web") {
                stored = localStorage.getItem(key);
            } else {
                const AsyncStorage = await import("@react-native-async-storage/async-storage");
                stored = await AsyncStorage.default.getItem(key);
            }
            if (stored) {
                setChatMessages(JSON.parse(stored));
            }
        } catch (err) {
            console.error("메시지 불러오기 실패:", err);
        }
    };

    const clearChatMessages = () => {
        Alert.alert("⚠️ 확인", "모든 채팅을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                style: "destructive",
                onPress: async () => {
                    setChatMessages([]);
                    const key = `chat-${todayDate}`;
                    if (Platform.OS === "web") {
                        localStorage.removeItem(key);
                    } else {
                        const AsyncStorage = await import("@react-native-async-storage/async-storage");
                        await AsyncStorage.default.removeItem(key);
                    }
                },
            },
        ]);
    };

    const deleteSingleMessage = (indexToDelete) => {
        const updated = chatMessages.filter((_, i) => i !== indexToDelete);
        setChatMessages(updated);
        saveMessagesToStorage(updated);
    };

    useEffect(() => {
        saveMessagesToStorage(chatMessages);
    }, [chatMessages]);

    useEffect(() => {
        socket.on("chatMessage", (msg) => {
            if (msg.date === todayDate) {
                setChatMessages((prev) => [...prev, msg]);
                if (!chatVisible) setHasNewChat(true);
            }
        });
        return () => socket.off("chatMessage");
    }, [chatVisible]);

    useEffect(() => {
        if (chatVisible) {
            loadMessages();
        }
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
                    headerLeft: () =>
                        (isTeacher || isStudent) && (
                            <TouchableOpacity onPress={openDrawer}>
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
                            <TouchableOpacity onPress={() => { setChatVisible(true); setHasNewChat(false); }} style={{ position: "relative" }}>
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
                                    if (isTeacher) {
                                        pendingCount > 0
                                            ? router.push("/admin/orders")
                                            : Alert.alert("🔔 알림", "새로운 신청이 없습니다.");
                                    } else {
                                        Alert.alert("📢 알림", "신청하신 항목이 처리되었습니다.");
                                        setStudentAlert(false);
                                    }
                                }} style={{ position: "relative" }}>
                                    <Text style={{ fontSize: 20 }}>🔔</Text>
                                    {isTeacher && pendingCount > 0 && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{pendingCount}</Text>
                                        </View>
                                    )}
                                    {isStudent && studentAlert && <View style={[styles.badge, { minWidth: 10 }]} />}
                                </TouchableOpacity>
                            )}
                        </View>
                    ),
                    headerStyle: {
                        backgroundColor: "#f5f9ff",
                        borderBottomWidth: 1,
                        borderBottomColor: "#ddd",
                    },
                }}
            />

            {drawerOpen && (
                <Pressable
                    onPress={closeDrawer}
                    style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "100%", height: "100%",
                        backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                />
            )}

            <Animated.View
                style={{
                    position: "absolute", top: 0, bottom: 0, left: 0,
                    width: SCREEN_WIDTH * 0.15,
                    backgroundColor: "#fff",
                    paddingTop: 60,
                    paddingHorizontal: 16,
                    zIndex: 999,
                    transform: [{ translateX: drawerAnim }],
                }}
            >
                {(isTeacher || isStudent) && (
                    (isTeacher
                        ? [
                            { label: "🏠 메인", route: "/teacher" },
                            { label: "📦 간식 관리", route: "/admin/manage" },
                            { label: "📋 신청 관리", route: "/admin/orders" },
                            { label: "📊 대시보드", route: "/admin/dashboard" },
                            { label: "👥 사용자 관리", route: "/admin/users" },
                        ]
                        : [
                            { label: "🏠 메인", route: "/student" },
                            { label: "🥤 음료 신청", route: "/student/drink" },
                            { label: "🍪 간식 신청", route: "/student/snack" },
                            { label: "🍜 라면 신청", route: "/student/ramen" },
                            { label: "📄 신청 내역", route: "/student/orders" },
                        ]
                    ).concat({ label: "🚪 로그아웃", route: "/main" }).map(({ label, route }) => (
                        <TouchableOpacity
                            key={label}
                            onPress={() => {
                                closeDrawer();
                                router.push(route);
                            }}
                            style={{ marginBottom: 20 }}
                        >
                            <Text style={{ fontSize: 16 }}>{label}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </Animated.View>

            {cheerModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            <Text style={styles.modalTitle}>📣 응원 메시지 작성</Text>
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <TouchableOpacity onPress={() => setCheerTarget("student")}>
                                    <Text style={{ fontWeight: cheerTarget === "student" ? "bold" : "normal", color: cheerTarget === "student" ? "#4A90E2" : "#666" }}>
                                        학생
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setCheerTarget("teacher")}>
                                    <Text style={{ fontWeight: cheerTarget === "teacher" ? "bold" : "normal", color: cheerTarget === "teacher" ? "#4A90E2" : "#666" }}>
                                        교사
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TextInput
                            value={cheerText}
                            onChangeText={setCheerText}
                            placeholder="예: 모두 파이팅하세요!"
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                                handleCheerSubmit();
                            }}
                            style={styles.input}
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

            {chatVisible && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: "60%" }]}>
                        <Text style={styles.modalTitle}>💬 실시간 채팅</Text>
                        <View style={{ flex: 1, marginVertical: 10 }}>
                            <FlatList
                                data={chatMessages}
                                keyExtractor={(_, i) => i.toString()}
                                renderItem={({ item, index }) => (
                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}>
                                        <Text style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: "bold" }}>{item.sender}</Text>: {item.text}
                                        </Text>
                                        {isTeacher && (
                                            <TouchableOpacity onPress={() => deleteSingleMessage(index)}>
                                                <Text style={{ color: "red", marginLeft: 8 }}>❌</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            />

                        </View>
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
