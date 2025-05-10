import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

const categories = ["게임개발", "사이버보안", "모바일앱개발", "정보기술", "클라우드컴퓨팅"];

export default function MainScreen() {
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  const handleStudentConfirm = () => {
    if (!studentName.trim()) return Alert.alert("이름을 입력하세요");
    setStudentModalVisible(false);
    setTimeout(() => {
      router.push({ pathname: "/student", params: { name: studentName, category } });
    }, 100);
  };

  const handleTeacherConfirm = () => {
    if (teacherPassword === "1234") {
      setTeacherModalVisible(false);
      setTimeout(() => {
        router.push("/teacher");
      }, 100);
    } else {
      Alert.alert("비밀번호가 올바르지 않습니다");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={category ? require("../assets/world2.png") : require("../assets/world1.png")}
        style={styles.image}
      />

      <View style={styles.dropdownWrapper}>
        <RNPickerSelect
          onValueChange={(value) => setCategory(value)}
          value={category}
          placeholder={{ label: "카테고리 선택", value: null }}
          useNativeAndroidPickerStyle={false}
          items={categories.map((cat) => ({ label: cat, value: cat }))}
          style={pickerSelectStyles}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#5DBB9D" }]}
          onPress={() => {
            if (!category) {
              Alert.alert("직종을 먼저 선택해주세요");
              return;
            }
            setStudentModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>학생</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4a90e2" }]}
          onPress={() => {
            if (!category) {
              Alert.alert("직종을 먼저 선택해주세요");
              return;
            }
            setTeacherModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>선생님</Text>
        </TouchableOpacity>
      </View>

      {/* 학생 모달 */}
      <Modal visible={studentModalVisible} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text>이름을 입력하세요:</Text>
            <TextInput
              style={styles.input}
              value={studentName}
              onChangeText={setStudentName}
              placeholder="예: 홍길동"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleStudentConfirm}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStudentModalVisible(false)}>
              <Text style={{ color: "gray", marginTop: 10 }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 선생님 모달 */}
      <Modal visible={teacherModalVisible} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text>비밀번호를 입력하세요:</Text>
            <TextInput
              style={styles.input}
              value={teacherPassword}
              onChangeText={setTeacherPassword}
              secureTextEntry
              placeholder="1234"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleTeacherConfirm}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTeacherModalVisible(false)}>
              <Text style={{ color: "gray", marginTop: 10 }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  image: { width: 220, height: 180, resizeMode: "contain", marginBottom: 30 },
  label: { fontSize: 16, marginBottom: 8 },
  dropdownWrapper: { marginBottom: 30 },
  buttonRow: { flexDirection: "row", marginTop: 20, gap: 20 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  modalWrapper: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)"
  },
  modalBox: {
    width: 300, backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center"
  },
  input: {
    borderWidth: 1, borderColor: "#ccc", width: "100%", marginTop: 10, padding: 10, borderRadius: 6
  },
  modalButton: {
    backgroundColor: "#5DBB9D",
    marginTop: 15,
    padding: 10,
    borderRadius: 6,
    width: "100%",
    alignItems: "center"
  },
  modalButtonText: { color: "white", fontWeight: "bold" },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    width: 250,
    textAlign: 'center',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    width: 250,
    textAlign: 'center',
  },
};
