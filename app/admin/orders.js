// ✅ /app/admin/orders.js
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SERVER_URL = "https://gbswws.onrender.com";

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("주문 불러오기 실패", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    if (!id) {
      console.error("❌ 주문 ID 없음", id);
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      console.log("✅ 상태 업데이트 완료", result);
      fetchOrders(); // 상태 업데이트 후 새로고침
    } catch (error) {
      console.error("상태 업데이트 실패", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>직종: {item.userJob}</Text>
      <Text style={styles.text}>이름: {item.studentName}</Text>
      <Text style={styles.text}>메뉴: {item.menu}</Text>
      <Text style={styles.text}>개수: {item.quantity}</Text>
      <Text style={styles.text}>신청시간: {new Date(item.createdAt).toLocaleString()}</Text>
      <Text style={styles.text}>상태: {item.status}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => updateOrderStatus(item._id, "accepted")}
        >
          <Text style={styles.buttonText}>수락</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => updateOrderStatus(item._id, "rejected")}
        >
          <Text style={styles.buttonText}>거절</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 4,
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
