import { useContext, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";
const screenWidth = Dimensions.get("window").width;
const CARD_GAP = 60;
const CARD_WIDTH = (screenWidth - CARD_GAP * 5) / 4;

export default function DrinkScreen() {
  const { studentName, category } = useContext(StudentInfoContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/items`);
      const data = await res.json();
      const drinks = data.filter((item) => item.type === "drink");
      setItems(drinks);
    } catch (err) {
      console.error("❌ 음료 목록 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelect = (item) => {
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
      console.log("✅ 신청 저장 결과:", data);

      alert("✅ 신청 완료!");
      setModalVisible(false);
    } catch (err) {
      console.error("❌ 신청 실패", err);
    }
  };

  const filledItems = [...items];
  const remainder = items.length % 4;
  if (remainder !== 0) {
    const emptySlots = 4 - remainder;
    for (let i = 0; i < emptySlots; i++) {
      filledItems.push(null);
    }
  }

  const renderItem = ({ item }) => {
    if (!item) return <View style={styles.cardPlaceholder} />;

    const isSoldOut = item.stock === false;

    return (
      <TouchableOpacity
        onPress={() => !isSoldOut && handleSelect(item)}
        style={[styles.card, isSoldOut && { opacity: 0.4 }]}
        disabled={isSoldOut}
      >
        <View style={{ position: "relative" }}>
          <Image source={{ uri: item.image }} style={styles.image} />

          {isSoldOut && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>품절</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>• 음료 신청</Text>
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
            <Text style={styles.modalTitle}>
              {selectedItem?.name}
            </Text>

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
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, marginTop: 10 },
  card: {
    width: CARD_WIDTH,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 2,
    minHeight: 150,
    justifyContent: "center"
  },
  cardPlaceholder: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  image: { width: 100, height: 100, marginBottom: 8 },
  name: { textAlign: "center" },
  soldOutBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  soldOutText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  arrow: {
    fontSize: 28,
    paddingHorizontal: 20,
    color: "#4A90E2",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 60,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#5DBB9D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    marginVertical: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
