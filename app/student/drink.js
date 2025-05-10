import { useContext, useEffect, useState } from "react";
import {
  FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";

export default function DrinkScreen() {
  const { studentName, category } = useContext(StudentInfoContext); // ✅ category 불러오기
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/items`);
      const data = await res.json();
      const drinks = data.filter((item) => item.type === "drink" && item.stock);
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
    // ✅ 서버에서 자동으로 처리하는 createdAt, status는 보내지 않아도 됨
    image: selectedItem.image, // ✅ 반드시 포함되어야 함
  };

  //console.log("✅ 선택된 이미지:", selectedItem.image);

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


  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleSelect(item)} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>음료 신청</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={4}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              {selectedItem?.name} 신청
            </Text>

            <Text>개수 선택:</Text>
            <View style={styles.dropdown}>
              {[...Array(10)].map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setQuantity(i + 1)}>
                  <Text style={quantity === i + 1 ? styles.selected : null}>
                    {i + 1}개
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={{ color: "white" }}>신청하기</Text>
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
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    width: "23%", margin: "1%",
    borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, alignItems: "center"
  },
  image: { width: 60, height: 60, marginBottom: 5 },
  name: { textAlign: "center" },
  modalBackground: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalBox: {
    width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10
  },
  dropdown: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 10
  },
  selected: { fontWeight: "bold", color: "blue" },
  button: {
    backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, alignItems: "center"
  }
});
