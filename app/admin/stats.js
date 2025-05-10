import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const SERVER_URL = "https://gbswws.onrender.com";
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a2d2ff", "#ffafcc"];

export default function StatsScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${SERVER_URL}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  const countByCategory = () => {
    const result = {};
    orders.forEach((order) => {
      result[order.category] = (result[order.category] || 0) + order.quantity;
    });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
  };

  const countByMenu = () => {
    const result = {};
    orders.forEach((order) => {
      result[order.menu] = (result[order.menu] || 0) + order.quantity;
    });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
  };

  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text>⚠️ 이 페이지는 웹에서만 지원됩니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 신청 현황 차트</Text>

      <Text style={styles.chartTitle}>1. 종목별 신청 수</Text>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={countByCategory()}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <Text style={styles.chartTitle}>2. 항목별 신청 수</Text>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={countByMenu()}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {countByMenu().map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
});
