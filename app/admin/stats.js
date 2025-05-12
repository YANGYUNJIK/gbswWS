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

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";


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

  const chartBlock = (title, data, type = "bar") => (
    <View style={styles.chartBlock}>
      <Text style={styles.chartTitle}>{title}</Text>
      <ResponsiveContainer width="100%" height={300}>
        {type === "bar" ? (
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

  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text>⚠️ 이 페이지는 웹에서만 지원됩니다.</Text>
      </View>
    );
  }

  const dataByCategory = countByField("userJob");       // 종목별
  const dataByStudent = countByField("studentName");     // 학생 이름별
  const dataByMenu = countByField("menu");               // 항목별

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 신청 현황 차트</Text>

      {chartBlock("1. 종목별 신청 수", dataByCategory)}
      {chartBlock("2. 학생 이름별 신청 수", dataByStudent)}
      {chartBlock("3. 항목별 신청 수", dataByMenu, "pie")}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  chartBlock: {
    width: "100%",
    maxWidth: 800,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#444",
  },
});
