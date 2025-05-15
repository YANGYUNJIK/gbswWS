import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { io } from "socket.io-client";

const screenWidth = Dimensions.get("window").width;

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const socket = io(SERVER_URL);

export default function CheerScrollList() {
  const [messages, setMessages] = useState([]);
  const lines = [0, 1, 2];

  const animValues = lines.map(() => useRef(new Animated.Value(screenWidth)).current);
  const textRefs = lines.map(() => useRef({ text: "", fontSize: 18, color: "#fff" }));

  const fetchCheer = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/cheer/today?target=student`);
      const data = await res.json();
      const fixed = { message: "🔥 오늘도 화이팅!" };
      const shuffled = [...data.map(d => d.message), fixed.message].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3); // 3~5개
      setMessages(selected);
    } catch (error) {
      console.error("응원 메시지 불러오기 실패", error);
    }
  };

  useEffect(() => {
    fetchCheer();
    socket.on("newCheer", fetchCheer);
    return () => socket.off("newCheer", fetchCheer);
  }, []);

  const getRandomBrightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 90%, 70%)`;
  };

  const startAnimation = (index) => {
    const message = messages[Math.floor(Math.random() * messages.length)] || "🔥 오늘도 화이팅!";
    const fontSize = Math.floor(Math.random() * 5) + 16;
    const color = getRandomBrightColor();

    textRefs[index].current = { text: message, fontSize, color };

    animValues[index].setValue(screenWidth);
    Animated.timing(animValues[index], {
      toValue: -screenWidth,
      duration: Math.floor(Math.random() * 6000) + 10000, // 10~16초
      useNativeDriver: true,
    }).start(() => startAnimation(index));
  };

  useEffect(() => {
    if (messages.length === 0) return;
    lines.forEach((i) => {
      setTimeout(() => startAnimation(i), i * 1000);
    });
  }, [messages]);

  return (
    <View style={styles.container}>
      {lines.map((i) => (
        <View key={i} style={styles.lineContainer}>
          <Animated.Text
            style={[
              styles.messageText,
              {
                transform: [{ translateX: animValues[i] }],
                fontSize: textRefs[i].current.fontSize,
                color: textRefs[i].current.color,
              },
            ]}
            numberOfLines={1}
          >
            {textRefs[i].current.text}
          </Animated.Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#333",
    marginTop: 0,
    marginBottom: 32,
  },
  lineContainer: {
    height: 26,
    overflow: "hidden",
    justifyContent: "center",
  },
  messageText: {
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
});
