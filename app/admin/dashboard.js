import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SERVER_URL = "https://gbswws.onrender.com";

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ordersRes, itemsRes] = await Promise.all([
      fetch(`${SERVER_URL}/orders`),
      fetch(`${SERVER_URL}/items`)
    ]);
    const ordersData = await ordersRes.json();
    const itemsData = await itemsRes.json();
    setOrders(ordersData);
    setItems(itemsData);
  };

  const getTodayOrders = () => {
    const today = new Date();
    return orders.filter((order) => {
      const created = new Date(order.createdAt);
      return (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate()
      );
    });
  };

  const todayOrders = getTodayOrders();

  const totalOrders = orders.length;
  const uniqueStudents = [...new Set(orders.map(o => o.studentName))].length;
  const outOfStock = items.filter(i => !i.stock).length;

  const popularMenus = orders.reduce((acc, curr) => {
    acc[curr.menu] = (acc[curr.menu] || 0) + curr.quantity;
    return acc;
  }, {});
  const sortedMenus = Object.entries(popularMenus)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📋 관리자 요약 대시보드</Text>

      <Text style={styles.stat}>총 신청 수: {totalOrders}</Text>
      <Text style={styles.stat}>총 학생 수: {uniqueStudents}</Text>
      <Text style={styles.stat}>품절 항목 수: {outOfStock}</Text>

      <Text style={[styles.stat, { marginTop: 15 }]}>🔥 인기 메뉴 Top 3:</Text>
      <View style={styles.popularRow}>
        {sortedMenus.map(([name, count], i) => {
          const item = items.find((i) => i.name === name);
          return (
            <View key={i} style={styles.popularCard}>
              {item?.image ? (
                <Image source={{ uri: item.image }} style={styles.popularImage} />
              ) : (
                <View style={[styles.popularImage, { backgroundColor: "#ddd" }]} />
              )}
              <Text style={styles.popularText}>{name}</Text>
              <Text style={styles.popularSub}>{count}회</Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.stat, { marginTop: 20 }]}>🗓️ 오늘 신청 내역 ({new Date().toLocaleDateString()})</Text>
      {todayOrders.length === 0 ? (
        <Text style={{ color: "gray" }}>오늘 신청된 항목이 없습니다.</Text>
      ) : (
        todayOrders.map((order, i) => (
          <Text key={i} style={styles.stat}>
            {order.studentName} - {order.menu} ({order.quantity}개)
          </Text>
        ))
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/admin/manage")}>
          <Text style={styles.buttonText}>📦 항목 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/admin/orders")}>
          <Text style={styles.buttonText}>📋 신청 관리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/admin/stats")}>
          <Text style={styles.buttonText}>📊 전체 차트</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  stat: { fontSize: 16, marginVertical: 3 },
  buttons: { marginTop: 30 },
  button: {
    backgroundColor: "#5DBB9D",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center"
  },
  buttonText: { color: "white", fontWeight: "bold" },
  popularRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  popularCard: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  popularImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  popularText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  popularSub: {
    fontSize: 12,
    color: "#555",
  },
});
