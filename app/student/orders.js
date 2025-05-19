import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";
import { StudentInfoContext } from "../../context/StudentInfoContext";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

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
        (order) =>
          order.studentName === studentName && order.userJob === category
      );
      setOrders(filtered);
    } catch (err) {
      console.error("❌ 주문 불러오기 실패:", err);
    }
  };

  const handleCancel = async (orderId) => {
    const confirm = window.confirm("정말 이 신청을 취소하시겠습니까?");
    if (!confirm) return;

    try {
      const res = await fetch(`${SERVER_URL}/orders/${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ 신청이 취소되었습니다.");
        fetchOrders();
      } else {
        alert("❌ 취소에 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 주문 취소 실패:", err);
      alert("서버 오류로 인해 신청을 취소할 수 없습니다.");
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
        // alert(
        //   `📢 '${updatedOrder.menu}' 신청이 '${translateStatus(
        //     updatedOrder.status
        //   )}' 처리되었습니다.`
        // );
        fetchOrders();
      }
    });

    return () => {
      socket.off("orderUpdated");
    };
  }, [studentName, category]);

  const translateStatus = (status) => {
    switch (status) {
      case "accepted":
        return "수락됨";
      case "rejected":
        return "거절됨";
      case "cancelled":
        return "취소됨"; // ✅ 추가
      default:
        return "대기중";
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "green";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* ✅ 오른쪽 상단에 취소 버튼 배치 */}
      {item.status === "pending" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item._id)}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      )}

      <View style={styles.cardRow}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/60" }}
          style={styles.image}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.menu}>{item.menu}</Text>
          <Text style={styles.detail}>수량: {item.quantity}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              상태: {translateStatus(item.status)}
            </Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
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
  cancelButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ff5c5c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
});
