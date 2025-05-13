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
  View,
} from "react-native";
import { StudentInfoContext } from "../context/StudentInfoContext";

// ✅ 화면 너비 기준으로 아이템 크기 설정
const screenWidth = Dimensions.get("window").width;
const ITEM_WIDTH = screenWidth * 0.22;
const ITEM_SPACING = 12;
const SLIDER_WIDTH = ITEM_WIDTH * 3 + ITEM_SPACING * 2 + 97;

// ✅ 원본 데이터 (진짜 보여줄 4개)
const rawBannerData = [
  { image: require("../assets/test1.jpg"), route: "/student/drink", label: "🥤 음료 신청" },
  { image: require("../assets/test1.jpg"), route: "/student/snack", label: "🍪 간식 신청" },
  { image: require("../assets/test1.jpg"), route: "/student/orders", label: "📄 신청 내역" },
  { image: require("../assets/test1.jpg"), route: "/banner/4", label: "🛍️ 기타 기능 준비 중" },
];

// ✅ 무한 루프 구현을 위한 가짜 데이터 포함
const bannerData = [
  ...rawBannerData.slice(-2), // 마지막 2개 → 앞에 복제
  ...rawBannerData,           // 실제 데이터
  ...rawBannerData.slice(0, 2), // 처음 2개 → 뒤에 복제
];

export default function StudentMenu() {
  const router = useRouter();
  const { studentName } = useContext(StudentInfoContext);
  const flatListRef = useRef(null);

  // ✅ 무한 슬라이드 핵심: 실제 시작은 index 2 (원본의 첫 항목)
  const [currentIndex, setCurrentIndex] = useState(2);

  // ✅ 슬라이드 이동 함수
  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  // ✅ 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // ✅ 무한 루프처럼 보이게: 맨 끝에 도달하면 순간적으로 2번 인덱스로 점프
  const handleMomentumScrollEnd = () => {
    if (currentIndex === bannerData.length - 2) {
      flatListRef.current?.scrollToIndex({ index: 2, animated: false });
      setCurrentIndex(2);
    } else if (currentIndex === 1) {
      flatListRef.current?.scrollToIndex({ index: rawBannerData.length + 1, animated: false });
      setCurrentIndex(rawBannerData.length + 1);
    }
  };

  // ✅ 버튼 이전/다음
  const handlePrev = () => {
    if (currentIndex <= 1) {
      // 맨 앞에 도달했으면 맨 끝으로 순간 이동 (애니메이션 없이)
      flatListRef.current?.scrollToIndex({ index: rawBannerData.length + 1, animated: false });
      setCurrentIndex(rawBannerData.length + 1);
    } else {
      // 일반 이동
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex >= bannerData.length - 2) {
      flatListRef.current?.scrollToIndex({ index: 2, animated: false });
      setCurrentIndex(2);
    } else {
      scrollToIndex(currentIndex + 1);
    }
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
          initialScrollIndex={2} // ✅ 시작은 2번 (원본 첫 항목)
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH + ITEM_SPACING,
            offset: (ITEM_WIDTH + ITEM_SPACING) * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
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
      {/* ✅ 인디케이터: 실제 원본 데이터 기준 (0~3) */}
      <View style={styles.indicatorContainer}>
        {rawBannerData.map((_, i) => (
          <Pressable key={i} onPress={() => scrollToIndex(i + 2)}>
            <View style={[styles.dot, (currentIndex - 2 + rawBannerData.length) % rawBannerData.length === i && styles.activeDot]} />
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
    height: 140, // ✅ 세로 크기 증가
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
