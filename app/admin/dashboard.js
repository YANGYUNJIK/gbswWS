import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform
} from "react-native";
import { useRouter } from "expo-router";

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

  const totalOrders = orders.length;
  const uniqueStudents = [...new Set(orders.map(o => o.studentName))].length;
  const popularMenus = orders.reduce((acc, curr) => {
    acc[curr.menu] = (acc[curr.menu] || 0) + curr.quantity;
    return acc;
  }, {});
  const sortedMenus = Object.entries(popularMenus)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const outOfStock = items.filter(i => !i.stock).length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 관리자 요약 대시보드</Text>

      <Text style={styles.stat}>총 신청 수: {totalOrders}</Text>
      <Text style={styles.stat}>총 학생 수: {uniqueStudents}</Text>
      <Text style={styles.stat}>품절 항목 수: {outOfStock}</Text>

      <Text style={[styles.stat, { marginTop: 15 }]}>🔥 인기 메뉴 Top 3:</Text>
      {sortedMenus.map(([name, count], i) => (
        <Text key={i} style={styles.stat}>
          {i + 1}. {name} ({count}회)
        </Text>
      ))}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  stat: { fontSize: 16, marginVertical: 3 },
  buttons: { marginTop: 30 },
  button: {
    backgroundColor: "#4CAF50", padding: 12, borderRadius: 8,
    marginBottom: 10, alignItems: "center"
  },
  buttonText: { color: "white", fontWeight: "bold" }
});
