import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gbswws.onrender.com";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfwaukxfs/upload";
const UPLOAD_PRESET = "unsigned";
const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dfwaukxfs/image/upload/v1746598811/artxp8kgy5zhdmgfospd.webp";

const socket = io(SERVER_URL);

const isWeekend = () => {
  const today = new Date().getDay(); // 0: 일요일, 6: 토요일
  return today === 0 || today === 6;
};

export default function ManageItemsScreen() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("drink");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [stock, setStock] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [filterTypeValue, setFilterTypeValue] = useState("drink");
  const [filterStockValue, setFilterStockValue] = useState(true);
  const [filterName, setFilterName] = useState("");

  const fetchItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("❌ 항목 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      alert(message);
    }
  };

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
    if (!imageUrl) imageUrl = DEFAULT_IMAGE_URL;

    const payload = {
      name,
      type,
      image: imageUrl,
      stock: stock,
    };

    const method = editId ? "PUT" : "POST";
    const endpoint = editId
      ? `${SERVER_URL}/items/${editId}`
      : `${SERVER_URL}/items`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("요청 실패");

      showToast(editId ? "✅ 수정 완료" : "✅ 등록 완료");
      resetForm();
      fetchItems();
    } catch (err) {
      console.error("❌ 등록/수정 실패", err);
      showToast("❌ 등록 또는 수정 실패");
    }
  };

  const handleDelete = async (id) => {
    const confirm = Platform.OS === "web"
      ? window.confirm("정말 삭제하시겠습니까?")
      : await new Promise((resolve) => {
        Alert.alert("삭제 확인", "정말 삭제하시겠습니까?", [
          { text: "취소", onPress: () => resolve(false) },
          { text: "삭제", onPress: () => resolve(true) },
        ]);
      });

    if (!confirm) return;

    try {
      await fetch(`${SERVER_URL}/items/${id}`, { method: "DELETE" });
      showToast("🗑️ 삭제 완료");
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

  const filteredItems = items.filter((item) => {
    if (selectedFilter === "전체") return true;
    if (selectedFilter === "종류") return item.type === filterTypeValue;
    if (selectedFilter === "재고") return item.stock === filterStockValue;
    if (selectedFilter === "이름") return item.name.includes(filterName);
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: item.image || DEFAULT_IMAGE_URL }}
            style={styles.cardImage}
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {item.name} (
            {item.type === "drink"
              ? "음료"
              : item.type === "snack"
                ? "간식"
                : "라면"}
            )
          </Text>
          <Text
            style={[
              styles.cardStock,
              { color: item.stock ? "green" : "red" },
            ]}
          >
            재고: {item.stock ? "있음" : "품절"}
          </Text>
        </View>
        <View style={styles.cardButtons}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.editBtn}
          >
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={styles.deleteBtn}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterGroup}>
          {["전체", "종류", "재고", "이름", "추가"].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.filterButton,
                selectedFilter === label && styles.filterButtonActive,
                label === "추가" && styles.addFilterButton,
              ]}
              onPress={() => {
                if (label === "추가") {
                  setModalVisible(true);
                } else {
                  setSelectedFilter(label);
                }
              }}
            >
              <Text
                style={[
                  selectedFilter === label
                    ? styles.filterTextActive
                    : styles.filterText,
                  label === "추가" && styles.addFilterText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedFilter === "종류" && (
        <View style={styles.selectorRow}>
          {["drink", "snack", "ramen"].map((val) => (
            <TouchableOpacity
              key={val}
              onPress={() => setFilterTypeValue(val)}
              style={[
                styles.selectorBtn,
                filterTypeValue === val && styles.selectorBtnActive,
              ]}
            >
              <Text style={{ color: filterTypeValue === val ? "white" : "#333" }}>
                {val === "drink"
                  ? "음료"
                  : val === "snack"
                    ? "간식"
                    : "라면"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedFilter === "재고" && (
        <View style={styles.selectorRow}>
          {[true, false].map((val) => (
            <TouchableOpacity
              key={val.toString()}
              onPress={() => setFilterStockValue(val)}
              style={[
                styles.selectorBtn,
                filterStockValue === val && styles.selectorBtnActive,
              ]}
            >
              <Text style={{ color: filterStockValue === val ? "white" : "#333" }}>
                {val ? "재고 있음" : "품절"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedFilter === "이름" && (
        <View style={styles.selectorRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="이름 검색"
            value={filterName}
            onChangeText={setFilterName}
          />
        </View>
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TextInput
              placeholder="이름"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <View style={styles.selectorRow}>
              {["drink", "snack", "ramen"].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setType(val)}
                  style={[
                    styles.selectorBtn,
                    type === val && styles.selectorBtnActive,
                  ]}
                >
                  <Text style={{ color: type === val ? "white" : "#333" }}>
                    {val === "drink"
                      ? "음료"
                      : val === "snack"
                        ? "간식"
                        : "라면"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.imagePick}>
              <Text>📷 이미지 선택</Text>
            </TouchableOpacity>

            {image && (
              <View style={{ alignItems: "center", marginTop: 5, marginBottom: 5 }}>
                <Image source={{ uri: image }} style={styles.previewImage} />
              </View>
            )}

            {/* ✅ 재고 텍스트 정확히 가운데 정렬 */}
            <TouchableOpacity
              onPress={() => setStock(!stock)}
              style={styles.stockButton}
            >
              <Text style={styles.stockText}>
                재고: {stock ? "있음" : "품절"} (터치 변경)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={{ color: "white", fontSize: 16 }}>
                {editId ? "수정하기" : "등록하기"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetForm}
              style={{ marginTop: 15, alignItems: "center" }}
            >
              <Text style={{ color: "gray" }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8", padding: 10 },
  filterContainer: { justifyContent: "center", alignItems: "center", marginBottom: 12 },
  filterGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  filterTextActive: { color: "white", fontWeight: "bold", fontSize: 13 },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  selectorBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  selectorBtnActive: { backgroundColor: "#5DBB9D" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "50%",
    height: 40,
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  toggle: { marginVertical: 8, fontSize: 16, color: "#555", textAlign: "center" },
  imagePick: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    marginTop: 10,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  button: {
    width: "100%",
    backgroundColor: "#5DBB9D",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardWrapper: { width: "100%", alignItems: "center" },
  card: {
    width: 742,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageWrapper: { justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: "#eee" },
  cardContent: { flex: 1, justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  cardStock: { fontSize: 14 },
  cardButtons: { flexDirection: "row", gap: 8 },
  editBtn: { padding: 6, backgroundColor: "#e3f2fd", borderRadius: 6 },
  deleteBtn: { padding: 6, backgroundColor: "#ffebee", borderRadius: 6 },
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
  filterButtonActive: { backgroundColor: "#5DBB9D" },
  addFilterButton: {
    backgroundColor: "#ffa94d",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addFilterText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  }, stockButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 10,
  },
  stockText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },

});
