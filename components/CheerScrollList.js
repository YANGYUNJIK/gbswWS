// ✅ CheerScrollList.jsx (학생용 전광판: 3~5개 메시지 랜덤, 3줄에 랜덤 색상 + 폰트 크기 적용)
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const screenWidth = Dimensions.get("window").width;
const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

export default function CheerScrollList() {
  const [messages, setMessages] = useState([]); // 전체 메시지 풀
  const animValues = [
    useRef(new Animated.Value(screenWidth)).current,
    useRef(new Animated.Value(screenWidth)).current,
    useRef(new Animated.Value(screenWidth)).current,
  ];

  const [messageLines, setMessageLines] = useState([
    { text: "", fontSize: 16, color: "#fff" },
    { text: "", fontSize: 16, color: "#fff" },
    { text: "", fontSize: 16, color: "#fff" },
  ]);

  useEffect(() => {
    const fetchCheer = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/cheer/today`);
        const data = await res.json();

        const fixed = { message: "🔥 오늘도 화이팅!" };

        if (Array.isArray(data)) {
          const count = Math.floor(Math.random() * 3) + 3; // 3~5개
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, count - 1);
          setMessages([fixed, ...selected]);
        }
      } catch (error) {
        console.error("응원 메시지 불러오기 실패", error);
      }
    };

    fetchCheer();
  }, []);

  const getRandomBrightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 90%, 70%)`; // 밝은 계열 색상
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const startAnimation = (index) => {
      const message = messages[Math.floor(Math.random() * messages.length)]?.message || "";
      const fontSize = Math.floor(Math.random() * 5) + 16; // 16~20
      const color = getRandomBrightColor();

      setMessageLines((prev) => {
        const updated = [...prev];
        updated[index] = { text: message, fontSize, color };
        return updated;
      });

      animValues[index].setValue(screenWidth);
      Animated.timing(animValues[index], {
        toValue: -screenWidth,
        duration: Math.floor(Math.random() * 6000) + 12000,
        useNativeDriver: true,
      }).start(() => startAnimation(index));
    };

    [0, 1, 2].forEach((i) => {
      setTimeout(() => startAnimation(i), i * 1000);
    });
  }, [messages]);

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.lineContainer}>
          <Animated.Text
            style={[
              styles.messageText,
              {
                transform: [{ translateX: animValues[i] }],
                fontSize: messageLines[i].fontSize,
                color: messageLines[i].color,
              },
            ]}
            numberOfLines={1}
          >
            {messageLines[i].text || "오늘도 화이팅!"}
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
