import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  NavigationContainer,
  ParamListBase,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

type Group = {
  id: string;
  label: string;
  color: string;
  icon: string;
};

type Message = { sender: string; text: string };

const INITIAL_GROUPS: Group[] = [
  { id: 'you',    label: 'You',    color: '#ff5a26', icon: 'person' },
  { id: 'home',   label: 'Home',   color: '#00a9f7', icon: 'home'   },
  { id: 'love',   label: 'Love',   color: '#304ffe', icon: 'heart'  },
  { id: 'family', label: 'Family', color: '#6a1b9a', icon: 'people' },
  { id: 'friends',label: 'Friends',color:'#ff2d70', icon: 'chatbubbles' },
  { id: 'school', label: 'School', color: '#00c4c4', icon: 'school' },
];

const PRESET_MSGS: Record<string, Message[]> = {
  you: [
    { sender: 'Me', text: 'Dinner is ready at 7.PM' },
  ],
  home: [
    { sender: 'Dad', text: 'Water the plants, please.' },
    { sender: 'Me',  text: 'Done 👍' },
  ],
  love: [
    { sender: 'Me',  text: 'Miss you ❤️' },
    { sender: 'Lisa',text: 'Miss you too!' },
  ],
  family: [
    { sender: 'Sis', text: 'Call Mom and Dad.' },
    { sender: 'Me',  text: 'Will do tonight.' },
  ],
  friends: [
    { sender: 'Alex', text: 'Movie Friday?' },
    { sender: 'Me',   text: 'Absolutely!' },
  ],
  school: [
    { sender: 'Prof', text: 'Project due next week.' },
    { sender: 'Me',   text: 'Got it. Thanks.' },
  ],
};

const Stack = createNativeStackNavigator();

type DirNav = NativeStackNavigationProp<ParamListBase, 'Directory'>;

const DirectoryScreen = ({ navigation }: { navigation: DirNav }) => {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const initialIds = INITIAL_GROUPS.map(g => g.id);

  const addGroup = () => {
    const label = newLabel.trim();
    if (!label) {
      Alert.alert('Please provide a name');
      return;
    }
    const id = label.toLowerCase().replace(/\s+/g, '-');
    if (groups.some(g => g.id === id)) {
      Alert.alert('Name exists', 'Please choose another name.');
      return;
    }
    const colorPool = ['#ff5a26','#00a9f7','#304ffe','#6a1b9a','#ff2d70','#00c4c4'];
    const newGroup: Group = {
      id,
      label,
      color: colorPool[Math.floor(Math.random()*colorPool.length)],
      icon: 'albums',
    };
    setGroups(prev => [...prev, newGroup]);
    setNewLabel('');
    setDialogVisible(false);
  };

  const tryDeleteGroup = (group: Group) => {
    if (initialIds.includes(group.id)) {
      Alert.alert("Can't delete", "Default groups cannot be deleted.");
      return;
    }
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setGroups(prev => prev.filter(g => g.id !== group.id));
        }},
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Messages Directory',
      headerRight: () => (
        <Pressable onPress={() => setDialogVisible(true)} style={{ marginRight:12 }}>
          <Ionicons name="add-circle-outline" size={28} color="#007aff" />
        </Pressable>
      ),
    });
  }, [navigation]);

  const renderItem = ({ item }: { item: Group }) => (
    <View style={styles.cell}>
      <Pressable
        style={[styles.circle, { backgroundColor: item.color }]}
        onPress={() => navigation.navigate('Messages', { group: item })}
        onLongPress={() => tryDeleteGroup(item)}
        android_ripple={{ color: "#ddd", borderless: false }}
      >
        <Ionicons name={item.icon} size={32} color="#fff" />
      </Pressable>
      <Text style={styles.circleLabel}>{item.label}</Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
      />

      {}
      <Modal transparent visible={dialogVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Group</Text>
            <TextInput
              placeholder="Group name"
              style={styles.input}
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <Button title="Cancel" onPress={()=>setDialogVisible(false)} />
              <View style={{ width:12 }} />
              <Button title="Add" onPress={addGroup} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const MessagesScreen = ({ route }: any) => {
  const { group } = route.params as { group: Group };
  const [messages,setMessages] = useState<Message[]>(PRESET_MSGS[group.id] ?? []);
  const [content,setContent]   = useState('');

  const send = () => {
    const txt = content.trim();
    if (!txt) return;
    setMessages(prev => [...prev, { sender:'Me', text:txt }]);
    setContent('');
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <FlatList
        data={messages}
        keyExtractor={(_,i)=>i.toString()}
        renderItem={({ item }) => (
          <View style={styles.msgBubble}>
            <Text><Text style={{fontWeight:'bold'}}>{item.sender}: </Text>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{color:'#999'}}>No messages yet.</Text>}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.msgInput}
          placeholder="Type a message"
          value={content}
          onChangeText={setContent}
        />
        <Pressable style={styles.sendBtn} onPress={send}>
          <Ionicons name="send" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Directory" component={DirectoryScreen} />
        <Stack.Screen
          name="Messages"
          component={MessagesScreen}
          options={({ route }: any)=>({ title: route.params.group.label })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  list:{ padding:24 },
  cell:{
    width:'50%',
    alignItems:'center',
    marginBottom:24,
  },
  circle:{
    width:110,
    height:110,
    borderRadius:55,
    justifyContent:'center',
    alignItems:'center',
  },
  circleLabel:{ marginTop:6,fontWeight:'600' },
  msgBubble:{
    backgroundColor:'#f0f0f0',
    borderRadius:6,
    padding:12,
    marginBottom:8,
  },
  inputRow:{ flexDirection:'row',alignItems:'center',marginTop:8 },
  msgInput:{
    flex:1,
    height:44,
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:6,
    paddingHorizontal:12,
  },
  sendBtn:{
    padding:10,
    marginLeft:8,
    backgroundColor:'#007aff',
    borderRadius:50,
  },
  modalOverlay:{
    flex:1,
    backgroundColor:'rgba(0,0,0,.25)',
    justifyContent:'center',
    alignItems:'center',
  },
  modalBox:{
    width:'80%',
    backgroundColor:'#fff',
    padding:20,
    borderRadius:8,
    elevation:4,
  },
  modalTitle:{ fontSize:18,fontWeight:'600',marginBottom:12 },
  input:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:6,
    height:40,
    paddingHorizontal:10,
    marginBottom:16,
  },
});
