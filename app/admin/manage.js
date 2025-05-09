import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from "react-native";

const SERVER_URL = Platform.OS === "web"
  ? "http://localhost:3000"
  : "https://gbswws.onrender.com";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfwaukxfs/upload";
const UPLOAD_PRESET = "unsigned";

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
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/100?text=No+Image" }}
        style={styles.image}
      />
      <View style={{ flex: 1 }}>
        <Text>{item.name} ({item.type === "drink" ? "음료" : "간식"})</Text>
        <Text style={{ color: item.stock ? "green" : "red" }}>
          {item.stock ? "재고 있음" : "품절"}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
        <Text>✏️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
        <Text>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.header}>항목 등록 / 수정</Text>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
        <Text style={{ color: "white" }}>+ 항목 추가</Text>
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
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
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
            <Image source={{ uri: image }} style={{ width: 100, height: 100, marginTop: 10 }} />
          )}

          <TouchableOpacity onPress={() => setStock(!stock)} style={styles.toggle}>
            <Text>재고: {stock ? "있음" : "품절"} (터치 변경)</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={{ color: "white" }}>{editId ? "수정하기" : "등록하기"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resetForm} style={{ marginTop: 20 }}>
            <Text style={{ color: "gray" }}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginVertical: 10
  },
  toggle: { marginVertical: 10 },
  imagePick: {
    borderWidth: 1, borderColor: "#aaa", padding: 10, borderRadius: 5, alignItems: "center"
  },
  button: {
    backgroundColor: "#4CAF50", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10
  },
  card: {
    flexDirection: "row", alignItems: "center", padding: 10, borderWidth: 1,
    borderColor: "#ccc", borderRadius: 8, marginVertical: 5
  },
  image: { width: 50, height: 50, marginRight: 10, borderRadius: 5 },
  editBtn: { marginLeft: 10 },
  deleteBtn: { marginLeft: 10 }
});
