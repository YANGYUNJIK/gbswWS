import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CheerScrollList from "../components/CheerScrollList"; // 경로는 프로젝트에 맞게 조정
import { StudentInfoContext } from "../context/StudentInfoContext";


const screenWidth = Dimensions.get("window").width;
const ITEM_WIDTH = screenWidth * 0.22;
const ITEM_SPACING = 12;
const SLIDER_WIDTH = ITEM_WIDTH * 3 + ITEM_SPACING * 2 + 85;
const LOOP_SIZE = 1000;
const CENTER_INDEX = Math.floor(LOOP_SIZE / 2);

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const rawBannerData = [
  { image: require("../assets/drink.png"), route: "/student/drink", label: "🥤 음료 신청" },
  { image: require("../assets/snack.png"), route: "/student/snack", label: "🍪 간식 신청" },
  { image: require("../assets/report.png"), route: "/student/orders", label: "📄 신청 내역" },
  { image: require("../assets/test1.jpg"), route: "/student/ramen", label: "🛍️🍜 라면 신청 (임시)" },
];
const categoryItems = [
  { label: "게임개발", image: require("../assets/gameG.png"), route: "/category/game" },
  { label: "모바일앱개발", image: require("../assets/mobileG.png"), route: "/category/mobile" },
  { label: "사이버보안", image: require("../assets/secureG.png"), route: "/category/security" },
  { label: "정보기술", image: require("../assets/codeG.png"), route: "/category/it" },
  { label: "클라우드", image: require("../assets/cloudG.png"), route: "/category/cloud" },
];

const bannerData = Array(LOOP_SIZE)
  .fill(null)
  .map((_, i) => rawBannerData[i % rawBannerData.length]);

export default function StudentMenu() {
  const router = useRouter();
  const { studentName } = useContext(StudentInfoContext);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(CENTER_INDEX);

  const [cheerMessages, setCheerMessages] = useState([]);
  const scrollAnim = useRef(new Animated.Value(screenWidth)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const fetchCheer = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/cheer/today`);
        const data = await res.json();
        if (Array.isArray(data)) {
        const fixedMessage = { message: "🎉 오늘도 화이팅!" }; // 고정 메시지
        const shuffled = data.sort(() => 0.5 - Math.random());
        setCheerMessages([fixedMessage, ...shuffled]);
      }
      } catch (error) {
        console.error("응원 메시지 불러오기 실패", error);
      }
    };
    fetchCheer();
  }, []);

  useEffect(() => {
    if (!cheerMessages.length || !textWidth) return;
    scrollAnim.setValue(screenWidth);
    const animateMessage = () => {
      Animated.timing(scrollAnim, {
        toValue: -textWidth,
        duration: Math.floor(Math.random() * 8000) + 15000,
        useNativeDriver: true,
      }).start(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % cheerMessages.length);
      });
    };
    animateMessage();
    const interval = setInterval(animateMessage, 11000);
    return () => clearInterval(interval);
  }, [cheerMessages, textWidth]);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollToIndex(currentIndex + 1, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const scrollToIndex = (index, animated = true) => {
    flatListRef.current?.scrollToIndex({ index, animated });
    setCurrentIndex(index);
  };

  const handleMomentumScrollEnd = () => {
    if (currentIndex <= 100 || currentIndex >= LOOP_SIZE - 100) {
      scrollToIndex(CENTER_INDEX, false);
    }
  };

  const handlePrev = () => scrollToIndex(currentIndex - 1);
  const handleNext = () => scrollToIndex(currentIndex + 1);

  return (
    <View style={styles.container}>

      <CheerScrollList cheerMessages={cheerMessages} />

      {/* 기존 배너와 카테고리 UI */}
      <View style={[styles.sliderRow, { width: SLIDER_WIDTH + ITEM_SPACING * 2 }]}>
        <TouchableOpacity onPress={handlePrev} style={styles.arrow}>
          <Image source={require("../assets/arrow-left.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={bannerData}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          initialScrollIndex={CENTER_INDEX}
          keyExtractor={(_, index) => index.toString()}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH + ITEM_SPACING,
            offset: (ITEM_WIDTH + ITEM_SPACING) * index,
            index,
          })}
          contentContainerStyle={{ gap: ITEM_SPACING }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(item.route)}>
              <ImageBackground
                source={item.image}
                style={styles.banner}
                imageStyle={{ borderRadius: 16 }}
              >
                <Text style={styles.label}>{item.label}</Text>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity onPress={handleNext} style={styles.arrow}>
          <Image
            source={require("../assets/arrow-left.png")}
            style={[styles.arrowIcon, { transform: [{ rotate: "180deg" }] }]}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.indicatorContainer, { width: SLIDER_WIDTH }]}>
        {rawBannerData.map((_, i) => (
          <Pressable key={i} onPress={() => scrollToIndex(CENTER_INDEX + i)}>
            <View
              style={[
                styles.dot,
                currentIndex % rawBannerData.length === i && styles.activeDot,
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* ✅ 카테고리 */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categoryItems}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(item.route)} style={styles.categoryItem}>
              <Image source={item.image} style={styles.categoryImage} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
  },
  // cheerBannerContainer: {
  //   width: "100%",
  //   height: 32,
  //   overflow: "hidden",
  //   backgroundColor: "#fff4d6",
  //   justifyContent: "center",
  //   paddingHorizontal: 10,
  //   borderBottomWidth: 1,
  //   borderColor: "#ffe0a3",
  // },
  // cheerBannerText: {
  //   fontSize: 14,
  //   fontWeight: "bold",
  //   color: "#cc8400",
  //   whiteSpace: "nowrap",
  // },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    paddingHorizontal: 10,
    zIndex: 10,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: "#555",
  },
  banner: {
    width: ITEM_WIDTH,
    height: 165,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 8,
    paddingRight: 8,
  },
  label: {
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
    marginLeft: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#5DBB9D",
  },
  categoryContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 25,
  },
  categoryImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  cheerBannerContainer: {
    width: "100%",
    height: 36,
    overflow: "hidden",
    backgroundColor: "#000", // 검은 배경
    justifyContent: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#333",
    marginBottom: 16, // 배너와 간격
  },
  cheerBannerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00ffcc", // 밝은 민트 글씨
  },
});
