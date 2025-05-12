// ✅ UserManagementScreen with Modal-style UI
import { useEffect, useState } from "react";
import {
  Alert, FlatList, Modal,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from "react-native";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";


export default function UserManagementScreen() {
  const [role, setRole] = useState("student");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: "", name: "", category: "", grade: "", number: "", department: "",
  });
  const [editId, setEditId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch(`${SERVER_URL}/${role}s`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
    setForm({ id: "", name: "", category: "", grade: "", number: "", department: "" });
    setEditId(null);
  }, [role]);

  const handleInput = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.category) {
      return Alert.alert("⚠️ 필수 항목을 입력하세요.");
    }

    const payload = role === "student"
      ? {
          ...form,
          grade: Number(form.grade),
          number: Number(form.number),
          password: "1234",
        }
      : {
          id: form.id,
          name: form.name,
          category: form.category,
          department: form.department,
          password: "1234",
        };

    const method = editId ? "PUT" : "POST";
    const endpoint = editId
      ? `${SERVER_URL}/${role}s/${editId}`
      : `${SERVER_URL}/${role}s`;

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      Alert.alert(editId ? "✅ 수정 완료" : "✅ 등록 완료");
      fetchUsers();
      setForm({ id: "", name: "", category: "", grade: "", number: "", department: "" });
      setEditId(null);
      setModalVisible(false);
    } else {
      Alert.alert("❌ 요청 실패");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("정말 삭제할까요?");
    if (!confirm) return;

    await fetch(`${SERVER_URL}/${role}s/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setForm({
      id: user.id || "",
      name: user.name || "",
      category: user.category || "",
      grade: user.grade?.toString() || "",
      number: user.number?.toString() || "",
      department: user.department || "",
    });
    setModalVisible(true);
  };

  const resetPassword = async (id) => {
    const res = await fetch(`${SERVER_URL}/${role}s/${id}/reset-password`, {
      method: "PATCH",
    });

    if (res.ok) {
      Alert.alert("🔄 비밀번호 초기화 완료 (1234)");
    } else {
      Alert.alert("❌ 비밀번호 초기화 실패");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👩‍🏫 사용자 관리</Text>

      <View style={styles.roleToggle}>
        <TouchableOpacity
          style={[styles.roleBtn, role === "student" && styles.active]}
          onPress={() => setRole("student")}
        >
          <Text>학생</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === "teacher" && styles.active]}
          onPress={() => setRole("teacher")}
        >
          <Text>선생님</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
        <Text style={styles.addText}>{editId ? "수정하기" : "+ 사용자 추가"}</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View>
              <Text>{item.name} ({item.id})</Text>
              <Text style={{ fontSize: 12, color: "#888" }}>{item.category}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => resetPassword(item._id)}>
                <Text>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Text style={{ color: "red" }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TextInput placeholder="ID" value={form.id} onChangeText={(t) => handleInput("id", t)} style={styles.input} />
            <TextInput placeholder="이름" value={form.name} onChangeText={(t) => handleInput("name", t)} style={styles.input} />
            <TextInput placeholder="직종" value={form.category} onChangeText={(t) => handleInput("category", t)} style={styles.input} />

            {role === "student" ? (
              <>
                <TextInput placeholder="학년" value={form.grade} onChangeText={(t) => handleInput("grade", t)} style={styles.input} />
                <TextInput placeholder="번호" value={form.number} onChangeText={(t) => handleInput("number", t)} style={styles.input} />
              </>
            ) : (
              <TextInput placeholder="부서" value={form.department} onChangeText={(t) => handleInput("department", t)} style={styles.input} />
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.addBtn}>
              <Text style={styles.addText}>{editId ? "수정하기" : "등록하기"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              setForm({ id: "", name: "", category: "", grade: "", number: "", department: "" });
              setEditId(null);
            }} style={{ marginTop: 12, alignItems: "center" }}>
              <Text style={{ color: "gray" }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f8" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 5, borderRadius: 6, backgroundColor: "#fff",
  },
  roleToggle: { flexDirection: "row", gap: 10, marginBottom: 10 },
  roleBtn: {
    padding: 10, borderWidth: 1, borderColor: "#aaa", borderRadius: 6
  },
  active: { backgroundColor: "#def", borderColor: "#339" },
  addBtn: {
    backgroundColor: "#5DBB9D", padding: 12, alignItems: "center", borderRadius: 8, marginTop: 10
  },
  addText: { color: "white", fontWeight: "bold" },
  userCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 6, marginVertical: 5, backgroundColor: "#fff"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
});
