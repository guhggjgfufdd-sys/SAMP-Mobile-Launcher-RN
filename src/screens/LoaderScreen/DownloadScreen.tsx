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

// ⚠️ اسم سيرفركم المخصص وحزمة التطبيق
const SERVER_NAME = 'Las Venturas RP';
const PACKAGE_NAME = 'com.touch.mobile.dark';

// المسارات الخاصة باللعبة
const TARGET_PATH = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
const ZIP_FILE_PATH = `${TARGET_PATH}/2.11.gtasa.zip`;
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.6/2.11.gtasa.zip';

// 🚀 الشاشة القادمة (شاشة السيرفرات)
const SERVERS_SCREEN = 'ModeScreen'; 

export const DownloadScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('جاري بدء التطبيق...');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      initProcess();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 1️⃣ طلب صلاحيات الذاكرة والتخزين
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
        const granted = await PermissionsAndroid.requestMultiple(permissions);
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

  // 2️⃣ فحص وجود الملفات لتجنب إعادة التحميل
  const checkCacheExists = async () => {
    try {
      const texdb = await RNFS.exists(`${TARGET_PATH}/texdb`);
      const samp = await RNFS.exists(`${TARGET_PATH}/SAMP`);
      const data = await RNFS.exists(`${TARGET_PATH}/data`);
      return texdb && samp && data;
    } catch (e) {
      return false;
    }
  };

  const initProcess = async () => {
    setIsError(false);
    setIsLoading(true);

    setStatusText('جاري فحص الصلاحيات...');
    await requestPermissions();

    setStatusText('جاري التحقق من وجود الكاش...');
    const installed = await checkCacheExists();

    if (installed) {
      setStatusText('تم العثور على ملفات اللعبة!');
      setProgress(1);
      
      // ✅ الانتقال المباشر لشاشة السيرفرات بكسر الحلقة التكرارية
      setTimeout(() => {
        goToServersScreen();
      }, 600);
      return;
    }

    startDownload();
  };

  // 3️⃣ دالة الانتقال المباشر لشاشة السيرفرات
  const goToServersScreen = () => {
    try {
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: SERVERS_SCREEN }],
        });
      }
    } catch (err) {
      console.log('Navigation Reset Error:', err);
      navigation.replace(SERVERS_SCREEN);
    }
  };

  // 4️⃣ التنزيل وفك الضغط
  const startDownload = async () => {
    try {
      setStatusText('تحضير مجلدات اللعبة...');
      const exists = await RNFS.exists(TARGET_PATH);
      if (!exists) {
        await RNFS.mkdir(TARGET_PATH);
      }

      setStatusText(`جاري تنزيل ملفات سيرفر ${SERVER_NAME}...`);

      const downloadRes = await RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        progress: (res) => {
          if (res.contentLength > 0) {
            let p = res.bytesWritten / res.contentLength;
            setProgress(p * 0.75); // 75% تنزيل
          }
        },
        progressDivider: 1,
      }).promise;

      if (downloadRes.statusCode === 200) {
        setStatusText('جاري فك الضغط والتثبيت على الهاتف...');
        setProgress(0.85);

        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        // تنظيف الملف المضغوط لمنع تعليق 99%
        if (await RNFS.exists(ZIP_FILE_PATH)) {
          await RNFS.unlink(ZIP_FILE_PATH);
        }

        setProgress(1);
        setStatusText('تم تثبيت اللعبة بنجاح!');

        // ✅ التوجيه المباشر لشاشة السيرفرات
        setTimeout(() => {
          goToServersScreen();
        }, 1000);
      } else {
        throw new Error('فشل التنزيل من الخادم');
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setIsError(true);
      setStatusText('حدث خطأ أثناء التثبيت');

      if (await RNFS.exists(ZIP_FILE_PATH)) {
        await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
      }

      Alert.alert('تنبيه', 'حدث خطأ أثناء تنزيل الملفات، تأكد من وجود مساحة كافية.');
    }
  };

  return (
    <View style={styles.container}>
      {/* اسم سيرفركم الظاهر بالواجهة */}
      <Text style={styles.serverTitle}>{SERVER_NAME}</Text>
      <Text style={styles.subTitle}>SAMP Mobile Launcher</Text>

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
        <TouchableOpacity style={styles.btnRetry} onPress={initProcess}>
          <Text style={styles.btnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101018',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  serverTitle: {
    color: '#FF9800',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    color: '#8888AA',
    fontSize: 14,
    marginBottom: 35,
    marginTop: 5,
  },
  status: {
    color: '#E0E0E0',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  barContainer: {
    width: width * 0.85,
    height: 12,
    backgroundColor: '#222233',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333348',
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
    marginTop: 10,
  },
  btnRetry: {
    marginTop: 20,
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export { DownloadScreen };
export default DownloadScreen;
