import React, { useContext, useEffect, useState } from "react";
import {
  FlatList, StyleSheet,
  Text,
  View
} from "react-native";
import { io } from "socket.io-client"; // ✅ socket.io 클라이언트 임포트
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";
const socket = io(SERVER_URL); // ✅ 서버와 실시간 연결

export default function StudentOrdersScreen() {
  const { studentName } = useContext(StudentInfoContext);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders?studentName=${studentName}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("주문 목록 가져오기 실패", err);
    }
  };

  useEffect(() => {
    if (!studentName) return;

    fetchOrders(); // 최초 데이터 불러오기

    // ✅ 소켓 연결 이벤트
    socket.on("connect", () => {
      console.log("🟢 소켓 연결됨:", socket.id);
    });

    // ✅ 실시간 상태 업데이트 받기
    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.studentName === studentName) {
        alert(`📢 ${updatedOrder.menu} 신청이 ${updatedOrder.status} 처리되었습니다`);
        fetchOrders(); // 새로고침
      }
    });

    // ✅ 컴포넌트 언마운트 시 소켓 이벤트 정리
    return () => {
      socket.off("orderUpdated");
    };
  }, [studentName]);

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
