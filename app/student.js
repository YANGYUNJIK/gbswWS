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

// 📐 기본 설정
const screenWidth = Dimensions.get("window").width;
const ITEM_WIDTH = screenWidth * 0.22;
const ITEM_SPACING = 12;
const SLIDER_WIDTH = ITEM_WIDTH * 3 + ITEM_SPACING * 2 + 85;
const LOOP_SIZE = 1000;
const CENTER_INDEX = Math.floor(LOOP_SIZE / 2);

// 📦 원본 데이터
const rawBannerData = [
  { image: require("../assets/drink.png"), route: "/student/drink", label: "🥤 음료 신청" },
  { image: require("../assets/snack.png"), route: "/student/snack", label: "🍪 간식 신청" },
  { image: require("../assets/report.png"), route: "/student/orders", label: "📄 신청 내역" },
  { image: require("../assets/test1.jpg"), route: "/banner/4", label: "🛍️ 기타 기능 준비 중" },
];

// 🔁 1000개 복제
const bannerData = Array(LOOP_SIZE)
  .fill(null)
  .map((_, i) => rawBannerData[i % rawBannerData.length]);

export default function StudentMenu() {
  const router = useRouter();
  const { studentName } = useContext(StudentInfoContext);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(CENTER_INDEX);

  // ✅ 이동 함수
  const scrollToIndex = (index, animated = true) => {
    flatListRef.current?.scrollToIndex({ index, animated });
    setCurrentIndex(index);
  };

  // ✅ 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      scrollToIndex(nextIndex, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // ✅ 끝에 도달하면 중앙으로 jump
  const handleMomentumScrollEnd = () => {
    if (currentIndex <= 100 || currentIndex >= LOOP_SIZE - 100) {
      scrollToIndex(CENTER_INDEX, false);
    }
  };

  // ◀
  const handlePrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  // ▶
  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  return (
    <View style={styles.container}>
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

      {/* ⭕ 인디케이터 */}
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
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
    height: 300,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 16,
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
});
