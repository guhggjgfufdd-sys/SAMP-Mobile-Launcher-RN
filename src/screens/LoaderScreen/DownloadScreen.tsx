import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions, 
  PermissionsAndroid, 
  Platform 
} from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const { width } = Dimensions.get('window');

// الإعدادات
const SERVER_NAME = 'Las Venturas RP';
const PACKAGE_NAME = 'com.touch.mobile.dark';
const SERVERS_SCREEN = 'Main'; // الاسم الصحيح للشاشة من الروتر لديك

// المسار الافتراضي للملفات
const getTargetDirectory = () => {
  return Platform.OS === 'android' && RNFS.ExternalDirectoryPath 
    ? RNFS.ExternalDirectoryPath 
    : `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
};

const TARGET_PATH = getTargetDirectory();
const ZIP_FILE_PATH = `${TARGET_PATH}/gtasa_cache.zip`;
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('جاري التهيئة...');
  const [mbText, setMbText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // لمنع تكرار تشغيل دالة initApp عند التحديث
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      initApp();
    }
  }, []);

  // دالة البدء: تطلب الصلاحيات أولاً ثم تقرر المسار
  const initApp = async () => {
    setIsLoading(true);
    setStatusText('يرجى منح صلاحيات التخزين...');

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== 'granted') {
        setStatusText('تم رفض الصلاحيات، يرجى إعادة المحاولة.');
        setIsError(true);
        setIsLoading(false);
        return;
      }
    }

    // بعد الموافقة، نفحص الملفات
    setStatusText('جاري فحص ملفات اللعبة...');
    const hasFiles = await checkCacheExists();
    
    if (hasFiles) {
      setStatusText('الملفات جاهزة، جاري الدخول...');
      setTimeout(navigateToServers, 800);
    } else {
      startDownload();
    }
  };

  const checkCacheExists = async () => {
    try {
      // نتحقق من وجود المجلدات الأساسية
      const texdbExists = await RNFS.exists(`${TARGET_PATH}/texdb`);
      return texdbExists;
    } catch (e) { return false; }
  };

  const navigateToServers = () => {
    navigation.reset({ index: 0, routes: [{ name: SERVERS_SCREEN }] });
  };

  const startDownload = async () => {
    setIsError(false);
    setIsLoading(true);
    setStatusText('جاري بدء التحميل...');

    try {
      // 1. تنظيف أي مخلفات قديمة
      if (await RNFS.exists(ZIP_FILE_PATH)) await RNFS.unlink(ZIP_FILE_PATH);
      if (!(await RNFS.exists(TARGET_PATH))) await RNFS.mkdir(TARGET_PATH);

      // 2. التحميل
      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        connectionTimeout: 20000,
        readTimeout: 40000,
        progress: (res) => {
          const p = res.bytesWritten / res.contentLength;
          setProgress(p * 0.7); // 70% للتحميل
          setMbText(`${(res.bytesWritten / 1024 / 1024).toFixed(1)} MB / ${(res.contentLength / 1024 / 1024).toFixed(1)} MB`);
        },
      });

      const res = await downloadTask.promise;

      if (res.statusCode === 200) {
        // 3. فك الضغط التلقائي
        setStatusText('جاري فك الضغط...');
        setProgress(0.85);
        
        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        // 4. حذف ملف الـ Zip لتوفير المساحة
        await RNFS.unlink(ZIP_FILE_PATH);
        
        setStatusText('اكتمل التثبيت بنجاح!');
        setProgress(1);
        setTimeout(navigateToServers, 1000);
      } else {
        throw new Error('فشل الخادم');
      }
    } catch (err) {
      setIsError(true);
      setStatusText('حدث خطأ أثناء التحميل. تأكد من الإنترنت.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.serverTitle}>{SERVER_NAME}</Text>
      <Text style={styles.status}>{statusText}</Text>
      
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      
      <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      {mbText !== '' && <Text style={styles.mbText}>{mbText}</Text>}

      {isError && (
        <TouchableOpacity style={styles.btnRetry} onPress={initApp}>
          <Text style={styles.btnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', justifyContent: 'center', alignItems: 'center', padding: 20 },
  serverTitle: { color: '#FF9000', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  status: { color: '#DDD', marginBottom: 10, textAlign: 'center' },
  barContainer: { width: '90%', height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#FF9000' },
  percent: { color: '#FF9000', marginTop: 10, fontWeight: 'bold' },
  mbText: { color: '#888', fontSize: 12 },
  btnRetry: { marginTop: 20, backgroundColor: '#E53935', padding: 15, borderRadius: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

export default DownloadScreen;
