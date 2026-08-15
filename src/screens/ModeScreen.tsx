import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchModeSetting, fetchUserNameSetting } from '../thunks/settingsThunks';
import { setUserNameSetting } from '../actions/settingsActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Images from '../../assets/images';

type ScreenType = NativeStackScreenProps<any>;

export const ModeScreen = React.memo(({ navigation }: ScreenType) => {
  const dispatch = useAppDispatch();
  const [nickname, setNickname] = useState('');

  const onConnect = useCallback(async () => {
    if (!nickname.trim()) {
      Alert.alert('تنبيه', 'اكتب اسمك أولاً!');
      return;
    }

    // ✅ حفظ الاسم في AsyncStorage عشان يظهر في الإعدادات
    await AsyncStorage.setItem('@samp_nickname', nickname.trim());

    // حفظ الاسم في Redux
    dispatch(setUserNameSetting({ userName: nickname.trim() }));
    dispatch(fetchUserNameSetting(nickname.trim()));

    // تشغيل الخريطة العادية
    dispatch(fetchModeSetting(1));

    // ✅ الانتقال للعبة مباشرة
    navigation.replace('Initiation');
  }, [nickname, dispatch, navigation]);

  return (
    <View style={styles.container}>
      {/* الشعار */}
      <Image
        source={Images.logo}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* اسم السيرفر */}
      <Text style={styles.title}>Las Venturas RP</Text>
      <Text style={styles.subtitle}>SAMP Mobile</Text>

      {/* حقل الاسم */}
      <Text style={styles.label}>اسم اللاعب</Text>
      <TextInput
        style={styles.input}
        placeholder="مثال: Don_Corleone"
        placeholderTextColor="#666"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* زر حفظ + دخول */}
      <TouchableOpacity style={styles.connectBtn} onPress={onConnect}>
        <Text style={styles.connectText}>حفظ الاسم والدخول</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 40,
  },
  label: {
    color: '#fff',
    alignSelf: 'flex-end',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 30,
  },
  connectBtn: {
    backgroundColor: '#4A90D9',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  connectText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
