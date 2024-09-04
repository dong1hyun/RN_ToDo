import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from "react"
import { theme } from "./color"
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from '@expo/vector-icons/Fontisto';

const TODO_STORAGE_KEY = '@toDos';
const CUR_SECTION_KEY = '@section';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [toDoLoading, setToDoLoading] = useState(false);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onCahngeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(toSave));
  }
  const saveSection = async (isWorking) => {
    await AsyncStorage.setItem(CUR_SECTION_KEY, isWorking ? "work" : "travel");
  }
  const loadSection = async () => {
    const section = await AsyncStorage.getItem(CUR_SECTION_KEY);
    setWorking(section === 'work' ? true : false);
  }
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(TODO_STORAGE_KEY);
    setToDos(JSON.parse(s));
  }
  useEffect(() => {
    const isWorking = loadSection();
    setWorking(isWorking);
    loadToDos();
  }, []);
  useEffect(() => {
    saveSection(working);
  }, [working]);
  const addToDo = async () => {
    if (text === "") return;
    const newToDos = { ...toDos, [Date.now()]: { text, working, isComplete: false } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }
  const completeToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key]['isComplete'] = !newToDos[key]['isComplete'];
    saveToDos(newToDos);
    loadToDos();
  }
  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do", "Are you sure?",
      [
        { text: "Cancel" },
        {
          text: "I'm Sure", onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          }
        }
      ]
    );
    return;
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Pressable onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? 'white' : 'gray' }}>Work</Text>
        </Pressable>
        <Pressable onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? 'white' : 'gray' }}>Travel</Text>
        </Pressable>
      </View>
      <View>
        <TextInput
          value={text}
          onSubmitEditing={addToDo}
          onChangeText={onCahngeText}
          returnKeyType='done'
          style={styles.input}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map(key => working === toDos[key].working ? (
          <View style={{ ...styles.toDo, opacity: toDos[key].isComplete ? 0.5 : 1 }} key={key}>
            <Text style={styles.toDoText}>{toDos[key].text}</Text>
            <View style={styles.toDoBtns}>
              <TouchableOpacity onPress={() => completeToDo(key)}><Text>완료</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { }}><Text>수정</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(key)}><Text style={styles.deleteBtn}><Fontisto name="trash" size={18} color="black" /></Text></TouchableOpacity>
            </View>
          </View>
        ) : null)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: 600,
    color: 'white'
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  toDoBtns: {
    flexDirection: 'row',
    gap: 20
  }
});