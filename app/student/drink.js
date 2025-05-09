import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, Image, TextInput, TouchableOpacity, Modal, StyleSheet
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export default function DrinkScreen() {
  const { studentName, category } = useContext(StudentInfoContext);
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    fetch(`${SERVER_URL}/items`)
      .then((res) => res.json())
      .then((data) => setItems(data.filter(item => item.type === "drink")));
  }, []);

  const handleOrder = async () => {
    if (!selectedItem || !quantity) return;

    await fetch(`${SERVER_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName,
        category,
        menu: selectedItem.name,
        quantity: parseInt(quantity),
      }),
    });

    setModalVisible(false);
    setQuantity("1");
    alert("신청 완료!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🥤 음료 신청</Text>
      {chunkArray(items, 4).map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              style={styles.card}
              disabled={!item.stock}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.bottom}>
                <Text style={{ color: item.stock ? "green" : "red" }}>
                  {item.stock ? "재고 있음" : "품절"}
                </Text>
                <Text>❤️</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* 신청 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text>{selectedItem?.name} 신청하기</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity style={styles.button} onPress={handleOrder}>
              <Text style={{ color: "white" }}>신청</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10, color: "gray" }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    row: {
      flexDirection: "row",
      justifyContent: "flex-start",
      flexWrap: "nowrap",
      marginBottom: 15,
    },
    card: {
      width: "23%", // 4개 정렬 기준 여유 있게
      marginRight: "2%",
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
      elevation: 3,
    },
    image: { width: 60, height: 60, borderRadius: 5 },
    name: { marginTop: 5, fontWeight: "bold" },
    bottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 5,
    },
    modalWrap: {
      flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)"
    },
    modal: {
      backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%"
    },
    input: {
      borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 10, borderRadius: 5
    },
    button: {
      backgroundColor: "#4CAF50", padding: 10, borderRadius: 5, alignItems: "center"
    }
  });
  