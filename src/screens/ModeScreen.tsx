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
import * as Images from './../assets/images';

type ScreenType = NativeStackScreenProps<any>;

export const ModeScreen = React.memo(({ navigation }: ScreenType) => {
  const dispatch = useAppDispatch();
  const [nickname, setNickname] = useState('');

  const onConnect = useCallback(() => {
    if (!nickname.trim()) {
      Alert.alert('تنبيه', 'اكتب اسمك أولاً!');
      return;
    }
    
    // حفظ الاسم
    dispatch(setUserNameSetting({ userName: nickname }));
    dispatch(fetchUserNameSetting(nickname));
    
    // تشغيل الخريطة العادية (غيّر لـ 2 إذا تبي ثلجية)
    dispatch(fetchModeSetting(1));
    
    // الانتقال للعبة
    navigation.replace('Initiation');
  }, [nickname, dispatch, navigation]);

  const onSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

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
      <View style={styles.inputBox}>
        <Text style={styles.label}>👤 اسم اللاعب</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: Ahmed_Rp"
          placeholderTextColor="#555"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* زر الدخول */}
      <TouchableOpacity style={styles.playBtn} onPress={onConnect}>
        <Text style={styles.playText}>🎮  دخول السيرفر</Text>
      </TouchableOpacity>

      {/* زر الإعدادات */}
      <TouchableOpacity style={styles.settingsBtn} onPress={onSettings}>
        <Text style={styles.settingsText}>⚙️  الإعدادات</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 35,
  },
  inputBox: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#16162a',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  playBtn: {
    width: '100%',
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  playText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsBtn: {
    width: '100%',
    backgroundColor: '#0f3460',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
