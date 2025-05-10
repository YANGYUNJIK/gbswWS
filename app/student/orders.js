// ✅ /app/student/orders.js
import { useContext, useEffect, useState } from "react";
import {
  FlatList, StyleSheet, Text, View
} from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";
const socket = io(SERVER_URL);

export default function StudentOrdersScreen() {
  const { studentName } = useContext(StudentInfoContext);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    if (!studentName) return;

    try {
      const res = await fetch(`${SERVER_URL}/orders?studentName=${studentName}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("❌ 주문 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchOrders();

    socket.on("connect", () => {
      console.log("🟢 소켓 연결됨:", socket.id);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.studentName === studentName) {
        alert(`📢 '${updatedOrder.menu}' 신청이 '${updatedOrder.status}' 처리되었습니다.`);
        fetchOrders();
      }
    });

    return () => {
      socket.off("orderUpdated");
    };
  }, [studentName]);

  const getStatusColor = (status) => {
    switch (status) {
      case "수락됨": return "green";
      case "거부됨": return "red";
      default: return "gray";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.menu}>{item.menu}</Text>
      <Text>수량: {item.quantity}</Text>
      <Text style={{ fontWeight: "bold", color: getStatusColor(item.status) }}>
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
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  menu: { fontSize: 18, fontWeight: "bold" },
  time: { fontSize: 12, color: "#888", marginTop: 5 }
});