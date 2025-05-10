import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const SERVER_URL = "https://gbswws.onrender.com";

export default function AdminDashboard() {
  const [popularItems, setPopularItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    fetchPopular();
    fetchItems();
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders/popular`);
      const data = await res.json(); // [{ _id: "콜라", totalQuantity: 12 }, ...]
      setPopularItems(data);
    } catch (err) {
      console.error("❌ 인기 메뉴 불러오기 실패", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/items`);
      const data = await res.json();
      setAllItems(data);
    } catch (err) {
      console.error("❌ 전체 항목 불러오기 실패", err);
    }
  };

  const findItemDetails = (menuName) =>
    allItems.find((item) => item.name === menuName);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🏆 인기 메뉴 Top 3</Text>

      {popularItems.map((entry, index) => {
        const item = findItemDetails(entry._id);
        return (
          <View key={index} style={styles.card}>
            {item?.image && (
              <Image source={{ uri: item.image }} style={styles.image} />
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{entry._id}</Text>
              <Text style={styles.sub}>
                신청 수: {entry.totalQuantity} / 종류: {item?.type || "알 수 없음"}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sub: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});
