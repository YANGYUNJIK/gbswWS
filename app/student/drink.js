import React, { useContext, useEffect, useState } from "react";
import {
  FlatList, Image, StyleSheet,
  Text,
  View
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";

export default function DrinkScreen() {
  const { studentName } = useContext(StudentInfoContext);
  const [items, setItems] = useState([]);

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
    </View>
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
  name: { textAlign: "center" }
});
