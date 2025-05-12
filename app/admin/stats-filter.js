import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";


export default function StatsFilterScreen() {
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState("게임개발");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`${SERVER_URL}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  const filteredOrders = orders.filter((o) => o.category === category);

  const countByMenu = () => {
    const result = {};
    filteredOrders.forEach((order) => {
      result[order.menu] = (result[order.menu] || 0) + order.quantity;
    });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
  };

  if (Platform.OS !== "web") {
    return <Text style={{ padding: 20 }}>⚠️ 이 차트는 웹에서만 볼 수 있습니다.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 종목별 신청 차트</Text>

      <Picker
        selectedValue={category}
        style={styles.picker}
        onValueChange={setCategory}
      >
        <Picker.Item label="게임개발" value="게임개발" />
        <Picker.Item label="모바일앱개발" value="모바일앱개발" />
        <Picker.Item label="사이버보안" value="사이버보안" />
        <Picker.Item label="정보기술" value="정보기술" />
        <Picker.Item label="클라우드컴퓨팅" value="클라우드컴퓨팅" />
      </Picker>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={countByMenu()}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  picker: { backgroundColor: "#eee", marginBottom: 10 },
});
