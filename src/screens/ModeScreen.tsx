import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unzip } from 'react-native-zip-archive';

// ====== إعدادات الكاش ======
const CACHE_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';
const CACHE_DIR = RNFS.ExternalDirectoryPath + '/SAMP';
const CACHE_ZIP = RNFS.CachesDirectoryPath + '/cache.zip';
const USERNAME_KEY = '@samp_username';
const CACHE_READY_KEY = '@samp_cache_ready';

const ModeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // التحقق من وجود الكاش لما تفتح الشاشة
  useEffect(() => {
    checkExistingCache();
  }, []);

  const checkExistingCache = async () => {
    try {
      const flagExists = await RNFS.exists(CACHE_DIR + '/.extracted');
      if (flagExists) {
        setStatusText('الكاش موجود ✅ اضغط دخول');
      }
    } catch (e) {}
  };

  const handleEnter = async () => {
    if (!username.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم المستخدم');
      return;
    }

    // حفظ الاسم
    await AsyncStorage.setItem(USERNAME_KEY, username.trim());

    // تحقق إذا الكاش موجود مسبقاً
    const cacheExists = await RNFS.exists(CACHE_DIR + '/.extracted');
    if (cacheExists) {
      goToGameScreen();
      return;
    }

    // ابدأ التحميل
    startDownload();
  };

  const startDownload = async () => {
    setLoading(true);
    setProgress(0);
    setStatusText('جاري التحضير...');

    try {
      // 1) أنشئ مجلد SAMP
      const cacheDirExists = await RNFS.exists(CACHE_DIR);
      if (!cacheDirExists) {
        await RNFS.mkdir(CACHE_DIR);
      }

      // احذف الملف القديل إذا موجود
      const zipExists = await RNFS.exists(CACHE_ZIP);
      if (zipExists) {
        await RNFS.unlink(CACHE_ZIP);
      }

      setStatusText('جاري تحميل الكاش...');

      // 2) التحميل الحقيقي بـ Progress
      const download = RNFS.downloadFile({
        fromUrl: CACHE_URL,
        toFile: CACHE_ZIP,
        begin: (res) => {
          console.log('حجم الملف:', res.contentLength);
        },
        progress: (res) => {
          const percent = res.bytesWritten / res.contentLength;
          setProgress(percent);
          setStatusText(`جاري التحميل... ${Math.round(percent * 100)}%`);
        },
      });

      const result = await download.promise;

      if (result.statusCode !== 200) {
        throw new Error(`خطأ في السيرفر: ${result.statusCode}`);
      }

      // 3) فك الضغط (Unzip) — يشتغل بعد ما يكمل التحميل
      setStatusText('جاري استخراج الملفات...');
      await unzip(CACHE_ZIP, CACHE_DIR);

      // علّم إن الاستخراج تم
      await RNFS.writeFile(CACHE_DIR + '/.extracted', 'done');
      await AsyncStorage.setItem(CACHE_READY_KEY, 'true');

      // احذف ملف ZIP المؤقت
      await RNFS.unlink(CACHE_ZIP);

      setStatusText('تم التحميل والاستخراج ✅');

      // 4) الانتقال لشاشة السيرفرات بعد 0.8 ثانية
      setTimeout(() => goToGameScreen(), 800);

    } catch (error: any) {
      console.error(error);
      Alert.alert('خطأ', error.message || 'فشل تحميل الكاش');
      setStatusText('فشل التحميل ❌');
    } finally {
      setLoading(false);
    }
  };

  const goToGameScreen = () => {
    navigation.replace('Game', { username: username.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>★</Text>
      <Text style={styles.brand}>TOUCH MOBILE</Text>

      <Text style={styles.label}>اسم المستخدم</Text>
      <TextInput
        style={styles.input}
        placeholder="أدخل اسمك"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        textAlign="right"
        editable={!loading}
      />

      {/* شريط التقدم الحقيقي */}
      {loading && (
        <View style={styles.progressBox}>
          <ActivityIndicator size="large" color="#5b8def" />
          <Text style={styles.statusText}>{statusText}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
        </View>
      )}

      {!loading && statusText !== '' && (
        <Text style={styles.statusText}>{statusText}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleEnter}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? 'جاري التحميل...' : 'الدخول'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0c10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: { fontSize: 80, color: '#ff6b8a', fontWeight: 'bold' },
  brand: { fontSize: 18, color: '#fff', letterSpacing: 4, marginBottom: 40 },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'right',
    width: '100%',
    maxWidth: 320,
  },
  input: {
    backgroundColor: '#1a1c23',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2d35',
    marginBottom: 20,
    width: '100%',
    maxWidth: 320,
  },
  progressBox: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: { color: '#9ca3af', marginBottom: 10, fontSize: 14 },
  barBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#2a2d35',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#5b8def',
  },
  percentText: { color: '#5b8def', marginTop: 6, fontSize: 12 },
  button: {
    backgroundColor: '#5b8def',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ModeScreen;
