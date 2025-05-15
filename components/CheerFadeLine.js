import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { io } from "socket.io-client";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = 100;

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const socket = io(SERVER_URL);

export default function CheerFadeLine() {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/cheer/today?target=teacher`);
      const data = await res.json();
      const fixed = { message: "🔥 오늘도 화이팅!" };
      const count = Math.floor(Math.random() * 3) + 3; // 3~5개
      const selected = [...data.map(d => d.message), fixed.message]
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
      setMessages(selected);
    } catch (err) {
      console.error("불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    socket.on("newCheer", fetchMessages);
    return () => socket.off("newCheer", fetchMessages);
  }, []);

  return (
    <View style={styles.container}>
      {messages.map((msg, i) => (
        <FloatingMessage key={`${msg}-${i}`} message={msg} />
      ))}
    </View>
  );
}

function getRandomBrightColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 70%)`;
}

function FloatingMessage({ message }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [position, setPosition] = useState({
    top: Math.random() * (SCREEN_HEIGHT - 30),
    left: Math.random() * (SCREEN_WIDTH - 160),
    fontSize: Math.floor(Math.random() * 6) + 16,
    color: getRandomBrightColor(),
  });

  useEffect(() => {
    const loop = () => {
      setPosition({
        top: Math.random() * (SCREEN_HEIGHT - 30),
        left: Math.random() * (SCREEN_WIDTH - 160),
        fontSize: Math.floor(Math.random() * 6) + 16,
        color: getRandomBrightColor(),
      });

      opacity.setValue(0);
      scale.setValue(0.8);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(2500),
          Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.delay(2500),
          Animated.timing(scale, { toValue: 0.8, duration: 500, useNativeDriver: true }),
        ]),
      ]).start(() => loop());
    };

    loop();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingText,
        {
          top: position.top,
          left: position.left,
          opacity,
          fontSize: position.fontSize,
          color: position.color,
          transform: [{ scale }],
          backgroundColor: "transparent", // 깜빡임 방지
        },
      ]}
    >
      🎉 {message}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
    marginBottom: 30,
  },
  floatingText: {
    position: "absolute",
    fontWeight: "bold",
  },
});
