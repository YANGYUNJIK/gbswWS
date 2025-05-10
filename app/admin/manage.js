import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";

const SERVER_URL = Platform.OS === "web"
  ? "http://localhost:3000"
  : "https://gbswws.onrender.com";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfwaukxfs/upload";
const UPLOAD_PRESET = "unsigned";

const socket = io(SERVER_URL);

export default function ManageItemsScreen() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("drink");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [stock, setStock] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("❌ 항목 불러오기 실패", err);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: Platform.OS === "web",
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (Platform.OS === "web") {
        setImage(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        alert("❗ 모바일 환경에서 base64 이미지 추출이 필요합니다.");
      }
    }
  };

  const uploadToCloudinary = async (base64) => {
    const formData = new FormData();
    formData.append("file", base64);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.secure_url) {
      alert("❌ 이미지 업로드 실패");
      return null;
    }
    return data.secure_url;
  };

  const handleSubmit = async () => {
    let imageUrl = image;

    if (image && image.startsWith("data:")) {
      imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) return;
    }

    const payload = { name, type, image: imageUrl || "", stock };

    const method = editId ? "PUT" : "POST";
    const endpoint = editId ? `${SERVER_URL}/items/${editId}` : `${SERVER_URL}/items`;

    try {
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      resetForm();
      fetchItems();
    } catch (err) {
      console.error("❌ 등록/수정 실패", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${SERVER_URL}/items/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (err) {
      console.error("❌ 삭제 실패", err);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setName(item.name);
    setType(item.type);
    setImage(item.image);
    setStock(item.stock);
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setType("drink");
    setImage(null);
    setStock(true);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardImageWrapper}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/100?text=No+Image" }}
          style={styles.cardImage}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {item.name} ({item.type === "drink" ? "음료" : "간식"})
        </Text>
        <Text style={[styles.cardStock, { color: item.stock ? "green" : "red" }]}>
          재고: {item.stock ? "있음" : "품절"}
        </Text>
      </View>
      <View style={styles.cardButtons}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
          <Text>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={styles.header}>📦 항목 등록 / 수정</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
          <Text style={{ color: "white", fontSize: 16 }}>+ 항목 추가</Text>
        </TouchableOpacity>

        {items.length === 0 ? (
          <Text style={{ marginTop: 20, textAlign: "center", color: "gray" }}>
            등록된 항목이 없습니다.
          </Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
        )}

        {/* 등록/수정 모달 */}
        <Modal visible={modalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TextInput
                placeholder="이름"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <TouchableOpacity onPress={() => setType(type === "drink" ? "snack" : "drink")}>
                <Text style={styles.toggle}>종류: {type === "drink" ? "음료" : "간식"} (터치 변경)</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={pickImage} style={styles.imagePick}>
                <Text>📷 이미지 선택</Text>
              </TouchableOpacity>

              {image && (
                <View style={{ alignItems: "center", marginTop: 10 }}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                </View>
              )}

              <TouchableOpacity onPress={() => setStock(!stock)} style={styles.toggle}>
                <Text>재고: {stock ? "있음" : "품절"} (터치 변경)</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <Text style={{ color: "white", fontSize: 16 }}>
                  {editId ? "수정하기" : "등록하기"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetForm} style={{ marginTop: 15, alignItems: "center" }}>
                <Text style={{ color: "gray" }}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f4f8",
    padding: 10,
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#333", textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#bbb", borderRadius: 10, padding: 12,
    marginVertical: 10, fontSize: 16, backgroundColor: "#fff",
  },
  toggle: { marginVertical: 12, fontSize: 16, color: "#555" },
  imagePick: {
    borderWidth: 1, borderColor: "#aaa", padding: 12,
    borderRadius: 8, alignItems: "center", backgroundColor: "#f7f7f7",
  },
  previewImage: {
    width: 120, height: 120, borderRadius: 10, resizeMode: "cover",
  },
  button: {
    backgroundColor: "#5DBB9D", paddingVertical: 14, borderRadius: 10,
    alignItems: "center", marginTop: 10, shadowColor: "#000",
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  card: {
    flexDirection: "row", alignItems: "center", padding: 12,
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    marginVertical: 6, backgroundColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardImageWrapper: {
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardImage: {
    width: 70, height: 70, borderRadius: 8, backgroundColor: "#eee",
  },
  cardContent: { flex: 1, justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  cardStock: { fontSize: 14 },
  cardButtons: { flexDirection: "row", gap: 8 },
  editBtn: { padding: 6, backgroundColor: "#e3f2fd", borderRadius: 6 },
  deleteBtn: { padding: 6, backgroundColor: "#ffebee", borderRadius: 6 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
  },
  modalCard: {
    width: 320, backgroundColor: "#fff", borderRadius: 12, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
});
