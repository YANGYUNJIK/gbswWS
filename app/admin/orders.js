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
  const [filter, setFilter] = useState("전체");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("❌ 주문 불러오기 실패", error);
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
      await res.json();
      fetchOrders();
    } catch (error) {
      console.error("❌ 상태 업데이트 실패", error);
    }
  };

  const filteredOrders =
    filter === "전체"
      ? orders
      : orders.filter((order) => order.status === filter);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row" }}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
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
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>주문 관리</Text>

      <View style={styles.filterContainer}>
        {["전체", "pending", "accepted", "rejected"].map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilter(status)}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
          >
            <Text style={styles.filterText}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: "#ccc",
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    color: "white",
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "white",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: "cover",
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
