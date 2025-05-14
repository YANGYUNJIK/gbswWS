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

// 📐 화면 너비 기준 설정
const screenWidth = Dimensions.get("window").width;
const ITEM_WIDTH = screenWidth * 0.22;
const ITEM_SPACING = 12;
const SLIDER_WIDTH = ITEM_WIDTH * 3 + ITEM_SPACING * 2 + 65;

// 📦 원본 데이터
const rawBannerData = [
  { image: require("../assets/test1.jpg"), route: "/student/drink", label: "🥤 음료 신청" },
  { image: require("../assets/test1.jpg"), route: "/student/snack", label: "🍪 간식 신청" },
  { image: require("../assets/test1.jpg"), route: "/student/orders", label: "📄 신청 내역" },
  { image: require("../assets/test1.jpg"), route: "/banner/4", label: "🛍️ 기타 기능 준비 중" },
];

// 🔁 무한 슬라이드를 위한 데이터 확장
const bannerData = [
  ...rawBannerData.slice(-2),
  ...rawBannerData,
  ...rawBannerData.slice(0, 2),
];

export default function StudentMenu() {
  const router = useRouter();
  const { studentName } = useContext(StudentInfoContext);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(2); // 진짜 시작 인덱스

  // 📦 공통 슬라이드 이동 함수
  const scrollToIndex = (index, animated = true) => {
    flatListRef.current?.scrollToIndex({ index, animated });
    setCurrentIndex(index);
  };

  // ⏱ 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= bannerData.length - 2) {
        scrollToIndex(nextIndex, true);
        setTimeout(() => {
          scrollToIndex(2, false); // 진짜 처음으로 점프
        }, 350);
      } else {
        scrollToIndex(nextIndex, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // ◀ 버튼
  const handlePrev = () => {
    const prevIndex = currentIndex - 1;

    if (prevIndex <= 1) {
      scrollToIndex(prevIndex, true);
      setTimeout(() => {
        scrollToIndex(rawBannerData.length + 1, false);
      }, 350);
    } else {
      scrollToIndex(prevIndex, true);
    }
  };

  // ▶ 버튼
  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= bannerData.length - 2) {
      scrollToIndex(nextIndex, true);
      setTimeout(() => {
        scrollToIndex(2, false);
      }, 350);
    } else {
      scrollToIndex(nextIndex, true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.sliderRow, { width: SLIDER_WIDTH + ITEM_SPACING * 2 }]}>
        <TouchableOpacity onPress={handlePrev} style={styles.arrow}>
          <Image source={require("../assets/arrow-left.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <FlatList
          data={bannerData}
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          initialScrollIndex={2}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(data, index) => ({
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
          <Pressable key={i} onPress={() => scrollToIndex(i + 2)}>
            <View
              style={[
                styles.dot,
                (currentIndex - 2 + rawBannerData.length) % rawBannerData.length === i &&
                  styles.activeDot,
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
  banner: {
    width: ITEM_WIDTH,
    height: 140,
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
    marginTop: 8,
    marginLeft: 65,
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
