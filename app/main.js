import { useRouter } from "expo-router";
import { useContext, useState } from "react";
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
import { StudentInfoContext } from "../context/StudentInfoContext";

const categories = ["게임개발", "사이버보안", "모바일앱개발", "정보기술", "클라우드컴퓨팅"];

export default function MainScreen() {
  const router = useRouter();
  const [localName, setLocalName] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [category, setCategory] = useState("");
  const { saveStudentInfo } = useContext(StudentInfoContext);

  const handleStudentConfirm = () => {
    if (!localName.trim()) return Alert.alert("이름을 입력하세요");
    if (!category) return Alert.alert("직종을 먼저 선택해주세요");
    saveStudentInfo(localName, category);
    setStudentModalVisible(false);
    setTimeout(() => {
      router.push("/student");
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
          placeholder={{ label: "직종을 선택하세요", value: "" }}
          useNativeAndroidPickerStyle={false}
          items={categories.map((cat) => ({ label: cat, value: cat }))}
          style={pickerSelectStyles}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#5DBB9D" }]}
          onPress={() => {
            if (!category) return Alert.alert("직종을 먼저 선택해주세요");
            setStudentModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>👩‍🎓 학생</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4a90e2" }]}
          onPress={() => {
            if (!category) return Alert.alert("직종을 먼저 선택해주세요");
            setTeacherModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>👨‍🏫 선생님</Text>
        </TouchableOpacity>
      </View>

      {/* 학생 모달 */}
      <Modal visible={studentModalVisible} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text>이름을 입력하세요:</Text>
            <TextInput
              style={styles.input}
              value={localName}
              onChangeText={setLocalName}
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
              // secureTextEntry
              // placeholder="1234"
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f5f9",
  },
  image: {
    width: 220,
    height: 180,
    resizeMode: "contain",
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  dropdownWrapper: {
    marginBottom: 10,
    width: "20%",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
  },
  modalButton: {
    backgroundColor: "#5DBB9D",
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    color: 'black',
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    color: 'black',
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
  },
  inputWeb: {
    fontSize: 18,
    height: 35,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#fff',
    color: 'black',
    width: '100%',
    textAlign: 'center',
    appearance: 'none', // ✅ 선택값 가려지는 문제 해결
    MozAppearance: 'none', // Firefox용
    WebkitAppearance: 'none', // Safari/Chrome용
  },
};
