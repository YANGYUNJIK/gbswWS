// ✅ /app/admin/orders.js (중앙 정렬 개선)
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";


export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [filterValue, setFilterValue] = useState("");

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
    if (!id) return;
    try {
      const res = await fetch(`${SERVER_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await res.json();
      fetchOrders();
    } catch (error) {
      console.error("상태 업데이트 실패", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return { backgroundColor: "#5DBB9D" };
      case "rejected": return { backgroundColor: "#F44336" };
      default: return { backgroundColor: "#9E9E9E" };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "전체") return true;
    const field = selectedFilter === "직종" ? "userJob" : "studentName";
    return order[field]?.toLowerCase().includes(filterValue.toLowerCase());
  });

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.infoSection}>
          <Text style={styles.name}>{item.menu}</Text>
          <Text style={styles.detail}>{item.studentName} / {item.userJob}</Text>
          <Text style={styles.detail}>{item.quantity}개 · {new Date(item.createdAt).toLocaleTimeString()}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusBadge, getStatusColor(item.status)]}>
              {item.status === "accepted" ? "수락" : item.status === "rejected" ? "거절" : "대기"}
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonFilterContainer}>
        {['전체', '직종', '이름'].map((label) => (
          <TouchableOpacity
            key={label}
            style={[styles.filterButton, selectedFilter === label && styles.filterButtonActive]}
            onPress={() => {
              setSelectedFilter(label);
              setFilterValue("");
            }}
          >
            <Text style={selectedFilter === label ? styles.filterTextActive : styles.filterText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedFilter !== "전체" && (
        <View style={styles.centeredRow}>
          <TextInput
            style={styles.filterInput}
            placeholder="이름 입력"
            value={filterValue}
            onChangeText={setFilterValue}
          />
        </View>
      )}
      <FlatList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.centeredList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f4f8",
    flex: 1,
    padding: 16,
  },
  centeredRow: {
    alignItems: "center",
  },
  centeredList: {
    alignItems: "center",
    paddingBottom: 60,
  },
  cardWrapper: {
    width: "100%",
    alignItems: "center",
  },
  buttonFilterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#5DBB9D",
  },
  filterText: {
    color: "#333",
    fontWeight: "bold",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "50%",
    height: 40,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginBottom: 12,
  },
  
  card: {
    width: 742,
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
