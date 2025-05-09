import React, { useState, useContext } from "react";
import {
  View, Text, Button, Modal, TextInput, TouchableOpacity, StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { StudentInfoContext } from "../context/StudentInfoContext";

export default function MainScreen() {
  const router = useRouter();
  const { saveStudentInfo } = useContext(StudentInfoContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("게임개발");

  const handleSubmit = () => {
    if (!name.trim()) return alert("이름을 입력해주세요");
    saveStudentInfo(name.trim(), category);
    setModalVisible(false);
    router.push("/student");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Page</Text>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>학생 페이지</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/teacher")}>
        <Text style={styles.buttonText}>선생님 페이지</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalContent}>
            <Text>종목 선택:</Text>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="게임개발" value="게임개발" />
              <Picker.Item label="모바일앱개발" value="모바일앱개발" />
              <Picker.Item label="사이버보안" value="사이버보안" />
              <Picker.Item label="정보기술" value="정보기술" />
              <Picker.Item label="클라우드컴퓨팅" value="클라우드컴퓨팅" />
            </Picker>

            <Text>이름 입력:</Text>
            <TextInput
              style={styles.input}
              placeholder="홍길동"
              value={name}
              onChangeText={setName}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  button: {
    backgroundColor: "#4CAF50", padding: 15, borderRadius: 8, marginVertical: 10
  },
  buttonText: { color: "white", fontWeight: "bold" },
  modalWrap: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalContent: {
    backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%"
  },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 10, borderRadius: 5
  },
  modalButton: {
    backgroundColor: "#2196F3", padding: 10, marginTop: 10, borderRadius: 5, alignItems: "center"
  },
  modalButtonText: {
    color: "white", fontWeight: "bold"
  }
});
