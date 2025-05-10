// ✅ /app/student/orders.js
import { useContext, useEffect, useState } from "react";
import {
  FlatList, Image, StyleSheet, Text, View
} from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL = "https://gbswws.onrender.com";
const socket = io(SERVER_URL);

export default function StudentOrdersScreen() {
  const { studentName, category } = useContext(StudentInfoContext);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    if (!studentName || !category) return;

    try {
      const res = await fetch(`${SERVER_URL}/orders`);
      const data = await res.json();
      const filtered = data.filter(
        order => order.studentName === studentName && order.userJob === category
      );
      setOrders(filtered);
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
      if (
        updatedOrder.studentName === studentName &&
        updatedOrder.userJob === category
      ) {
        alert(`📢 '${updatedOrder.menu}' 신청이 '${translateStatus(updatedOrder.status)}' 처리되었습니다.`);
        fetchOrders();
      }
    });

    return () => {
      socket.off("orderUpdated");
    };
  }, [studentName, category]);

  const translateStatus = (status) => {
    switch (status) {
      case "accepted": return "수락됨";
      case "rejected": return "거절됨";
      default: return "대기중";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "green";
      case "rejected": return "red";
      default: return "gray";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/60" }}
          style={styles.image}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.menu}>{item.menu}</Text>
          <Text style={styles.detail}>수량: {item.quantity}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>상태: {translateStatus(item.status)}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    alignSelf: "center",
    width: "60%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  menu: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
});
