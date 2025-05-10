import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
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

  const countByField = (field) => {
    const result = {};
    orders.forEach((order) => {
      if (order[field]) {
        result[order[field]] = (result[order[field]] || 0) + order.quantity;
      }
    });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
  };

  const chartBlock = (title, data, chartType = "bar") => {
    return (
      <View style={{ marginBottom: 40 }}>
        <Text style={styles.chartTitle}>{title}</Text>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "bar" ? (
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </View>
    );
  };

  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text>⚠️ 이 페이지는 웹에서만 지원됩니다.</Text>
      </View>
    );
  }

  const dataByJob = countByField("userJob");
  const dataByMenu = countByField("menu");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 신청 현황 차트</Text>

      {chartBlock("1. 직종별 신청 수", dataByJob)}
      {chartBlock("2. 항목별 신청 수", dataByMenu, "pie")}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});
