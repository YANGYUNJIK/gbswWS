// ✅ RamenScreen.js - 주말에만 신청 가능, 필터 기능 포함

import { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const screenWidth = Dimensions.get("window").width;
const CARD_GAP = 60;
const CARD_WIDTH = (screenWidth - CARD_GAP * 5) / 4;

export default function RamenScreen() {
  const { studentName, category } = useContext(StudentInfoContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  const today = new Date().getDay();
  const isWeekend = today === 0 || today === 6 || today === 5;

  const fetchItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/items`);
      if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);
      const data = await res.json();
      const ramens = data.filter((item) => item.type === "ramen"); // 오타 수정: ranems -> ramens
      setItems(ramens);
    } catch (err) {
      console.error("❌ 라면 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelect = (item) => {
    if (!isWeekend) {
      alert("라면은 주말에만 신청 가능합니다!");
      return;
    }
    setSelectedItem(item);
    setQuantity(1);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!studentName || !category) {
      alert("학생 이름 또는 카테고리가 설정되지 않았습니다.");
      return;
    }

    const payload = {
      studentName,
      userJob: category,
      menu: selectedItem.name,
      quantity,
      image: selectedItem.image,
    };

    try {
      const res = await fetch(`${SERVER_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "신청 실패");

      alert("✅ 신청 완료!");
      setModalVisible(false);
    } catch (err) {
      console.error("❌ 신청 실패:", err);
      alert("신청 중 오류가 발생했습니다.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "inStock") return item.stock !== false;
    if (filter === "soldOut") return item.stock === false;
    return true;
  });

  const filledItems = [...filteredItems];
  const remainder = filteredItems.length % 4;
  if (remainder !== 0) {
    const emptySlots = 4 - remainder;
    for (let i = 0; i < emptySlots; i++) filledItems.push(null);
  }

  const renderItem = ({ item, index }) => {
    if (!item) return <View style={styles.cardPlaceholder} />;

    const isSoldOut = item.stock === false;
    const isHovered = hoveredIndex === index;

    return (
      <Pressable
        onPress={() => !isSoldOut && handleSelect(item)}
        onHoverIn={() => setHoveredIndex(index)}
        onHoverOut={() => setHoveredIndex(null)}
        style={[styles.card, isSoldOut && { opacity: 0.4 }]}
        disabled={isSoldOut}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: item.image }}
            style={[styles.image, isHovered && styles.imageHovered]}
          />
          {isSoldOut && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>품절</Text>
            </View>
          )}
          {!isWeekend && (
            <View style={styles.weekendBadge}>
              <Text style={styles.weekendText}>주말 신청 가능</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>• 라면 코너</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter("all")} style={[styles.filterButton, filter === "all" && styles.activeFilter]}>
          <Text style={styles.filterText}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("inStock")} style={[styles.filterButton, filter === "inStock" && styles.activeFilter]}>
          <Text style={styles.filterText}>재고 있음</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("soldOut")} style={[styles.filterButton, filter === "soldOut" && styles.activeFilter]}>
          <Text style={styles.filterText}>품절</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filledItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        numColumns={4}
        columnWrapperStyle={{ paddingHorizontal: CARD_GAP, justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                <Text style={styles.arrow}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}개</Text>
              <TouchableOpacity onPress={() => setQuantity((prev) => Math.min(10, prev + 1))}>
                <Text style={styles.arrow}>{">"}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>신청하기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: "gray" }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8", padding: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  filterContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#ccc", marginHorizontal: 4 },
  activeFilter: { backgroundColor: "#5DBB9D" },
  filterText: { color: "#fff", fontWeight: "bold" },
  card: { width: CARD_WIDTH, marginBottom: 35, borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, alignItems: "center", backgroundColor: "#fff", elevation: 2, minHeight: 150, justifyContent: "center" },
  cardPlaceholder: { width: CARD_WIDTH, marginBottom: 20 },
  image: { width: 100, height: 100, marginBottom: 8 },
  imageHovered: { transform: [{ scale: 1.1 }] },
  name: { textAlign: "center" },
  soldOutBadge: { position: "absolute", top: 4, left: 4, backgroundColor: "red", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  soldOutText: { color: "white", fontSize: 10, fontWeight: "bold" },
  weekendBadge: { position: "absolute", bottom: 4, right: 4, backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, zIndex: 1 },
  weekendText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: 300, backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  quantityControl: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  arrow: { fontSize: 28, paddingHorizontal: 20, color: "#4A90E2" },
  quantityText: { fontSize: 18, fontWeight: "bold", minWidth: 60, textAlign: "center" },
  button: { backgroundColor: "#5DBB9D", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", minWidth: 100, marginVertical: 6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
});