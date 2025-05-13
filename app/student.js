// StudentMenu.js
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { StudentInfoContext } from "../context/StudentInfoContext";

const screenWidth = Dimensions.get("window").width;
const ITEM_WIDTH = screenWidth * 0.22;
const ITEM_SPACING = 12;
const SLIDER_WIDTH = ITEM_WIDTH * 3 + ITEM_SPACING * 2 + 100;

const bannerData = [
  { image: require("../assets/test1.jpg"), route: "/student/drink", label: "🥤 음료 신청" },
  { image: require("../assets/test1.jpg"), route: "/student/snack", label: "🍪 간식 신청" },
  { image: require("../assets/test1.jpg"), route: "/student/orders", label: "📄 신청 내역" },
  { image: require("../assets/test1.jpg"), route: "/banner/4", label: "🛍️ 기타 기능 준비 중" },
];

export default function StudentMenu() {
  const router = useRouter();
  const { studentName } = useContext(StudentInfoContext);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerData.length;
      scrollToIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const prevIndex = currentIndex === 0 ? bannerData.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % bannerData.length;
    scrollToIndex(nextIndex);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.sliderContainer, { width: SLIDER_WIDTH }]}>
        <TouchableOpacity onPress={handlePrev} style={styles.arrow}>
          <Image source={require("../assets/arrow-left.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <FlatList
          data={bannerData}
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          keyExtractor={(_, index) => index.toString()}
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
      <View style={styles.indicatorContainer}>
        {bannerData.map((_, i) => (
          <Pressable key={i} onPress={() => scrollToIndex(i)}>
            <View style={[styles.dot, i === currentIndex && styles.activeDot]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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
    marginTop: 6,
    marginLeft: 8,
    position: "absolute",
    bottom: -20,
    left: 0,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  banner: {
    width: ITEM_WIDTH,
    height: 100,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 8,
    paddingRight: 8,
  },
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    left: 20,
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

});
