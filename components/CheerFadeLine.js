// ✅ CheerFadeLine.js (선생님용 전광판 - 상단 고정, 오늘도 화이팅 메시지 포함)
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

export default function CheerFadeLine() {
  const [messages, setMessages] = useState(["🔥 오늘도 화이팅!"]); // 기본 메시지 포함
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/cheer/today`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map(d => d.message));
        }
      } catch (err) {
        console.error("불러오기 실패", err);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, Math.floor(Math.random() * 3000) + 7000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.marqueeArea}>
        <Animated.Text style={[styles.fadeMessage, { opacity: fadeAnim }]}>🎉 🔥 {messages[currentIndex]}</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderColor: "#333",
    marginBottom: 100,
    marginTop: 0, // 상단에 바짝 붙이기
  },
  marqueeArea: {
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  fadeMessage: {
    fontSize: 16,
    color: "#00ffcc",
    fontWeight: "bold",
    textAlign: "center",
  },
});