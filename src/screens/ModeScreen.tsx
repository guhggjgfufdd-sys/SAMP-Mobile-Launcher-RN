import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { useDispatch } from 'react-redux';
import { setUsername } from '../store';
import { RootStackParamList } from '../navigation/navigation-router';

type ModeScreenNav = NativeStackNavigationProp<RootStackParamList, 'Mode'>;

const CACHE_URL = 'https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v2.11/gtasa.zip';
const SAMP_DIR = `${RNFS.ExternalDirectoryPath}/SAMP`;
const EXTRACTED_FLAG = `${SAMP_DIR}/.extracted`;
const ZIP_PATH = `${RNFS.ExternalDirectoryPath}/gtasa.zip`;

const ModeScreen = () => {
  const navigation = useNavigation<ModeScreenNav>();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    checkCache();
  }, []);

  const checkCache = async () => {
    const exists = await RNFS.exists(EXTRACTED_FLAG);
    if (exists) {
      setStatus('الكاش جاهز ✅');
    }
  };

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'اكتب اسمك أولاً');
      return;
    }

    dispatch(setUsername(name.trim()));

    const isCached = await RNFS.exists(EXTRACTED_FLAG);
    if (isCached) {
      navigation.navigate('Game', { username: name.trim() });
      return;
    }

    await downloadAndExtract();
  };

  const downloadAndExtract = async () => {
    try {
      setLoading(true);
      setStatus('جاري التحميل...');
      setProgress(0);

      await RNFS.mkdir(SAMP_DIR);

      if (await RNFS.exists(ZIP_PATH)) {
        await RNFS.unlink(ZIP_PATH);
      }

      const download = RNFS.downloadFile({
        fromUrl: CACHE_URL,
        toFile: ZIP_PATH,
        begin: (res) => {
          console.log('Started:', res.contentLength);
        },
        progress: (res) => {
          const percentage = (res.bytesWritten / res.contentLength) * 100;
          setProgress(Math.round(percentage));
        },
      });

      await download.promise;

      setStatus('جاري فك الضغط...');
      setProgress(100);

      await unzip(ZIP_PATH, SAMP_DIR);
      await RNFS.writeFile(EXTRACTED_FLAG, 'extracted', 'utf8');
      await RNFS.unlink(ZIP_PATH);

      setStatus('تم ✅');
      setLoading(false);

      navigation.navigate('Game', { username: name.trim() });
    } catch (error: any) {
      setLoading(false);
      Alert.alert('خطأ', `فشل التحميل: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SAMP Mobile</Text>
      <Text style={styles.subtitle}>شاشة البداية</Text>

      <TextInput
        style={styles.input}
        placeholder="اكتب اسمك هنا..."
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
      />

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.statusText}>{status}</Text>
          {progress > 0 && progress < 100 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          )}
          <Text style={styles.percentText}>{progress}%</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>
            {status.includes('جاهز') ? 'دخول للسيرفرات' : 'تحميل الكاش والدخول'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00ff88',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderBox: {
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 14,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  percentText: {
    color: '#00ff88',
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ModeScreen;
