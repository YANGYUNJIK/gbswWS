import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const SERVER_URL = "https://gbswws.onrender.com";

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, categoryFilter, nameFilter]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("신청 목록 가져오기 실패:", err);
    }
  };

  const applyFilters = () => {
    let result = orders;

    if (categoryFilter !== "전체") {
      result = result.filter((o) => o.category === categoryFilter);
    }

    if (nameFilter.trim()) {
      result = result.filter((o) =>
        o.studentName.toLowerCase().includes(nameFilter.trim().toLowerCase())
      );
    }

    setFilteredOrders(result);
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch(`${SERVER_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (err) {
      console.error("상태 변경 실패:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "수락됨": return "green";
      case "거부됨": return "red";
      default: return "gray";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>
        <Text style={styles.bold}>{item.category}</Text> - {item.studentName}
      </Text>
      <Text>{item.menu} × {item.quantity}</Text>
      <Text style={{ color: getStatusColor(item.status), fontWeight: "bold" }}>
        상태: {item.status || "대기중"}
      </Text>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>

      {!item.status && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.accept}
            onPress={() => updateOrderStatus(item._id, "수락됨")}
          >
            <Text style={styles.actionText}>✅ 수락</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reject}
            onPress={() => updateOrderStatus(item._id, "거부됨")}
          >
            <Text style={styles.actionText}>❌ 거절</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>학생 신청 목록</Text>

      {/* 필터 영역 */}
      <View style={styles.filterWrap}>
        <Picker
          selectedValue={categoryFilter}
          style={styles.picker}
          onValueChange={(value) => setCategoryFilter(value)}
        >
          <Picker.Item label="전체" value="전체" />
          <Picker.Item label="게임개발" value="게임개발" />
          <Picker.Item label="모바일앱개발" value="모바일앱개발" />
          <Picker.Item label="사이버보안" value="사이버보안" />
          <Picker.Item label="정보기술" value="정보기술" />
          <Picker.Item label="클라우드컴퓨팅" value="클라우드컴퓨팅" />
        </Picker>

        <TextInput
          style={styles.nameInput}
          placeholder="이름 검색"
          value={nameFilter}
          onChangeText={setNameFilter}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  filterWrap: { marginBottom: 10 },
  picker: {
    backgroundColor: "#eee", marginBottom: 8
  },
  nameInput: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 5,
    padding: 10, marginBottom: 8
  },
  card: {
    backgroundColor: "#fff", padding: 15, borderRadius: 10,
    marginBottom: 12, elevation: 2
  },
  text: { fontSize: 16 },
  bold: { fontWeight: "bold" },
  time: { fontSize: 12, color: "#888", marginTop: 4 },
  actions: {
    flexDirection: "row", justifyContent: "space-around", marginTop: 10
  },
  accept: { backgroundColor: "green", padding: 8, borderRadius: 5 },
  reject: { backgroundColor: "red", padding: 8, borderRadius: 5 },
  actionText: { color: "white", fontWeight: "bold" },
});
