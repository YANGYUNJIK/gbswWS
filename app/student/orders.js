import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, FlatList, StyleSheet
} from "react-native";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";

export default function StudentOrdersScreen() {
  const { studentName } = useContext(StudentInfoContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (studentName) fetchOrders();
  }, [studentName]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders?studentName=${studentName}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("주문 목록 가져오기 실패", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "수락됨":
        return "green";
      case "거부됨":
        return "red";
      default:
        return "gray";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.menu}>{item.menu}</Text>
      <Text>수량: {item.quantity}</Text>
      <Text style={{ color: getStatusColor(item.status), fontWeight: "bold" }}>
        상태: {item.status || "대기중"}
      </Text>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{studentName}님의 신청 내역</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff", padding: 15, borderRadius: 10,
    marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  menu: { fontSize: 18, fontWeight: "bold" },
  time: { fontSize: 12, color: "#888", marginTop: 5 }
});
