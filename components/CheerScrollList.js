import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const screenWidth = Dimensions.get("window").width;

export default function CheerScrollList() {
  const [cheerMessages, setCheerMessages] = useState([]);
  const animRefs = [useRef(new Animated.Value(screenWidth)).current, useRef(new Animated.Value(screenWidth)).current, useRef(new Animated.Value(screenWidth)).current];
  const [currentMessages, setCurrentMessages] = useState(["", "", ""]);

  const getRandomMessages = (messages) => {
    const shuffled = [...messages].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1 % shuffled.length], shuffled[2 % shuffled.length]];
  };

  const startAnimation = (lineIndex) => {
    animRefs[lineIndex].setValue(screenWidth);
    Animated.timing(animRefs[lineIndex], {
      toValue: -screenWidth,
      duration: Math.floor(Math.random() * 8000) + 12000,
      useNativeDriver: true,
    }).start(() => {
      if (cheerMessages.length > 0) {
        const nextMessages = getRandomMessages(cheerMessages);
        setCurrentMessages(nextMessages);
        startAnimation(lineIndex); // 재귀
      }
    });
  };

  useEffect(() => {
    const fetchCheer = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/cheer/today`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCheerMessages(data.map(d => d.message));
          const initial = getRandomMessages(data.map(d => d.message));
          setCurrentMessages(initial);
        }
      } catch (error) {
        console.error("응원 메시지 불러오기 실패", error);
      }
    };
    fetchCheer();
  }, []);

  useEffect(() => {
    animRefs.forEach((_, i) => startAnimation(i));
  }, [cheerMessages]);

  return (
    <View style={styles.container}>
      {currentMessages.map((msg, i) => (
        <Animated.Text
          key={i}
          style={[styles.text, { transform: [{ translateX: animRefs[i] }] }]}
        >
          🎉 {msg}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#333",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#00ffcc",
    fontWeight: "bold",
    marginVertical: 3,
  },
});
