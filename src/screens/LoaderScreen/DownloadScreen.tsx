import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const { width } = Dimensions.get('window');

// ⚠️ اسم حزمة التطبيق ورابط التحميل
const PACKAGE_NAME = 'com.touch.mobile.dark';
const TARGET_PATH = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
const ZIP_FILE_PATH = `${TARGET_PATH}/2.11.gtasa.zip`;
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.6/2.11.gtasa.zip';

// اسم الشاشة القادمة بعد التنزيل
const NEXT_SCREEN_NAME = 'ModeScreen';

const DownloadScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('جاري بدء التطبيق...');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // تأخير بسيط لضمان رسم الواجهة أولاً على الهاتف قبل تنفيذ أي عمليات
    const timer = setTimeout(() => {
      initApp();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return (
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission Error:', err);
        return false;
      }
    }
    return true;
  };

  const checkCacheExists = async () => {
    try {
      const texdb = await RNFS.exists(`${TARGET_PATH}/texdb`);
      const samp = await RNFS.exists(`${TARGET_PATH}/SAMP`);
      const data = await RNFS.exists(`${TARGET_PATH}/data`);
      return texdb && samp && data;
    } catch (e) {
      console.log('Error checking cache:', e);
      return false;
    }
  };

  const initApp = async () => {
    setIsError(false);
    setIsLoading(true);

    setStatusText('جاري فحص صلاحيات الجهاز...');
    await requestStoragePermission();

    setStatusText('جاري التحقق من ملفات اللعبة...');
    const exists = await checkCacheExists();

    if (exists) {
      setStatusText('تم العثور على الملفات، جاري الدخول...');
      setProgress(1);
      setTimeout(() => {
        navigateToNextScreen();
      }, 500);
      return;
    }

    startDownload();
  };

  const navigateToNextScreen = () => {
    try {
      if (navigation && navigation.replace) {
        navigation.replace(NEXT_SCREEN_NAME);
      }
    } catch (err) {
      console.log('Navigation Error:', err);
    }
  };

  const startDownload = async () => {
    try {
      setStatusText('جاري تحضير المجلدات...');
      const dirExists = await RNFS.exists(TARGET_PATH);
      if (!dirExists) {
        await RNFS.mkdir(TARGET_PATH);
      }

      setStatusText('جاري تنزيل ملفات اللعبة...');

      const downloadRes = await RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        progress: (res) => {
          if (res.contentLength > 0) {
            let p = res.bytesWritten / res.contentLength;
            setProgress(p * 0.75);
          }
        },
        progressDivider: 1,
      }).promise;

      if (downloadRes.statusCode === 200) {
        setStatusText('جاري فك الضغط والتثبيت...');
        setProgress(0.85);

        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        if (await RNFS.exists(ZIP_FILE_PATH)) {
          await RNFS.unlink(ZIP_FILE_PATH);
        }

        setProgress(1);
        setStatusText('تم التثبيت بنجاح!');

        setTimeout(() => {
          navigateToNextScreen();
        }, 1000);
      } else {
        throw new Error('فشل التنزيل من السيرفر');
      }
    } catch (err) {
      console.error('Download error:', err);
      setIsLoading(false);
      setIsError(true);
      setStatusText('حدث خطأ أثناء التحميل أو فك الضغط');

      if (await RNFS.exists(ZIP_FILE_PATH)) {
        await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
      }

      Alert.alert('تنبيه', 'حدث خطأ أثناء التحميل، تأكد من توفر المساحة والإنترنت ثم أعد المحاولة.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>TOUCH MOBILE</Text>
      <Text style={styles.status}>{statusText}</Text>

      {/* شريط التقدم */}
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>

      {isLoading && progress < 1 && (
        <ActivityIndicator size="small" color="#FF9800" style={{ marginTop: 15 }} />
      )}

      {isError && (
        <TouchableOpacity style={styles.btnRetry} onPress={initApp}>
          <Text style={styles.btnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  status: {
    color: '#E0E0E0',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  barContainer: {
    width: width * 0.85,
    height: 12,
    backgroundColor: '#2A2A3D',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3F3F5A',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 6,
  },
  percent: {
    color: '#FF9800',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  btnRetry: {
    marginTop: 25,
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

// تصدير بالطريقتين لمنع أي مشكلة في استدعاء المكون
export { DownloadScreen };
export default DownloadScreen;
