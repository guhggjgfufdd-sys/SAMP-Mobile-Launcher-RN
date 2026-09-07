import React, { useEffect, useState } from 'react';
    import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
    import { useNavigation } from '@react-navigation/native';
    import { NativeStackNavigationProp } from '@react-navigation/native-stack';
    import RNFS from 'react-native-fs';
    import { useDispatch } from 'react-redux';
    import { setUsername } from '../store';
    import { RootStackParamList } from '../navigation/navigation-router';

    type ModeScreenNav = NativeStackNavigationProp<RootStackParamList, 'Mode'>;
    const TARGET_PATH = RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath;
    const READY_FLAG = `${TARGET_PATH}/.lv-cache-2.11.ready`;
    const ModeScreen = () => {
    const navigation = useNavigation<ModeScreenNav>();
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => { void checkCache(); }, []);
    const checkCache = async () => {
      const value = await RNFS.exists(READY_FLAG) || await RNFS.exists(`${TARGET_PATH}/texdb`);
      setReady(value);
    };
    const handleStart = async () => {
      const username = name.trim();
      if (!username) { Alert.alert('تنبيه', 'اكتب اسم اللاعب أولًا'); return; }
      if (!ready) { Alert.alert('الكاش غير مثبت', 'ثبت ملفات اللعبة أولًا ثم حاول الدخول.'); navigation.navigate('DownloadScreen'); return; }
      dispatch(setUsername(username));
      navigation.navigate('Game', { username });
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Las Venturas RP</Text>
        <Text style={styles.subtitle}>اكتب اسمك ثم ادخل إلى المدينة</Text>
        <TextInput style={styles.input} placeholder="اسم اللاعب" placeholderTextColor="#80909A" value={name} onChangeText={setName} autoCapitalize="none" />
        <Text style={styles.status}>{ready ? 'ملفات اللعبة جاهزة' : 'ملفات اللعبة غير مثبتة'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => void handleStart()}><Text style={styles.buttonText}>{ready ? 'دخول إلى السيرفر' : 'تثبيت ملفات اللعبة'}</Text></TouchableOpacity>
      </View>
    );
    };
    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#071018', justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 30, color: '#62d9f1', fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 15, color: '#9BAFB8', marginBottom: 30 },
    input: { width: '100%', height: 52, backgroundColor: '#13222D', borderRadius: 12, paddingHorizontal: 15, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2B4654', marginBottom: 16 },
    status: { color: '#9BAFB8', marginBottom: 18 },
    button: { width: '100%', height: 52, backgroundColor: '#62d9f1', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#071018', fontSize: 16, fontWeight: 'bold' },
    });
    export default ModeScreen;
    