// ✅ /app/admin/orders.js
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
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

  const getBadgeStyle = (status) => {
    switch (status) {
      case "accepted":
        return { backgroundColor: "#4CAF50" }; // 초록
      case "rejected":
        return { backgroundColor: "#F44336" }; // 빨강
      default:
        return { backgroundColor: "#9E9E9E" }; // 회색
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return { backgroundColor: "#5DBB9D" };
      case "rejected":
        return { backgroundColor: "#F44336" };
      default:
        return { backgroundColor: "#9E9E9E" };
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.infoSection}>
        <Text style={styles.name}>{item.menu}</Text>
        <Text style={styles.detail}>{item.studentName} / {item.userJob}</Text>
        <Text style={styles.detail}>{item.quantity}개 · {new Date(item.createdAt).toLocaleTimeString()}</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, getStatusColor(item.status)]}>
            {item.status === "accepted"
              ? "수락"
              : item.status === "rejected"
                ? "거절"
                : "대기"}
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#5DBB9D" }]}
              onPress={() => updateOrderStatus(item._id, "accepted")}
            >
              <Text style={styles.buttonText}>수락</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#F44336" }]}
              onPress={() => updateOrderStatus(item._id, "rejected")}
            >
              <Text style={styles.buttonText}>거절</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: "#f0f4f8",
    padding: 16,
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
  badgeWrapper: {
    marginTop: 6,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "flex-start",
    fontSize: 13,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  detail: {
    fontSize: 13,
    color: "#555",
  },
  statusRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

});
