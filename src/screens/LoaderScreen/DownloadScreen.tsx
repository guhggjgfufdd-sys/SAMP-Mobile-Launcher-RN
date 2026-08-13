import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Dimensions, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const { width } = Dimensions.get('window');

const SERVER_NAME = 'Las Venturas RP';
const PACKAGE_NAME = 'com.touch.mobile.dark';
const SERVERS_SCREEN = 'Main'; // تم اعتماد الاسم الصحيح الذي وجدناه في الروتر

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
  const [statusText, setStatusText] = useState('جاري التحقق من ملفات اللعبة...');
  const [mbText, setMbText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const isProcessingRef = useRef(false);

  useEffect(() => {
    initApp();
  }, []);

  // بدء العمليات فوراً بدون انتظار
  const initApp = async () => {
    isProcessingRef.current = true;
    
    // 1. طلب الصلاحيات
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
    }

    // 2. فحص وجود الكاش
    const hasFiles = await checkCacheExists();
    if (hasFiles) {
      setStatusText('تم العثور على الملفات، جاري الدخول...');
      navigateToServers();
    } else {
      // 3. إذا لم يوجد كاش، ابدأ التحميل فوراً
      startDownload();
    }
  };

  const checkCacheExists = async () => {
    try {
      return (await RNFS.exists(`${TARGET_PATH}/texdb`)) && (await RNFS.exists(`${TARGET_PATH}/samp`));
    } catch (e) { return false; }
  };

  const navigateToServers = () => {
    navigation.reset({ index: 0, routes: [{ name: SERVERS_SCREEN }] });
  };

  const startDownload = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // تنظيف أي ملفات سابقة
      if (await RNFS.exists(ZIP_FILE_PATH)) await RNFS.unlink(ZIP_FILE_PATH);
      if (!(await RNFS.exists(TARGET_PATH))) await RNFS.mkdir(TARGET_PATH);

      setStatusText('جاري تحميل ملفات اللعبة...');

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        begin: (res) => { if (res.statusCode !== 200 && res.statusCode !== 302) throw new Error(); },
        progress: (res) => {
          const p = res.bytesWritten / res.contentLength;
          setProgress(p * 0.7); // 70% للتحميل
          setMbText(`${(res.bytesWritten / 1024 / 1024).toFixed(1)} MB / ${(res.contentLength / 1024 / 1024).toFixed(1)} MB`);
        },
        followRedirects: true,
      });

      const res = await downloadTask.promise;

      if (res.statusCode === 200 || res.statusCode === 302) {
        // التحقق من الحجم قبل فك الضغط
        const stats = await RNFS.stat(ZIP_FILE_PATH);
        if (stats.size < 5 * 1024 * 1024) throw new Error('الملف تالف');

        // فك الضغط تلقائياً
        setStatusText('جاري فك الضغط...');
        setProgress(0.85);
        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        // تنظيف
        await RNFS.unlink(ZIP_FILE_PATH);
        
        setStatusText('تم التثبيت بنجاح!');
        setProgress(1);
        navigateToServers();
      } else {
        throw new Error('فشل الاتصال');
      }
    } catch (err) {
      setIsError(true);
      setStatusText('خطأ في التحميل');
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
        <TouchableOpacity style={styles.btnRetry} onPress={startDownload}>
          <Text style={styles.btnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', justifyContent: 'center', alignItems: 'center', padding: 20 },
  serverTitle: { color: '#FF9000', fontSize: 28, fontWeight: 'bold' },
  status: { color: '#FFF', marginVertical: 10 },
  barContainer: { width: '85%', height: 12, backgroundColor: '#222', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#FF9000' },
  percent: { color: '#FF9000', marginTop: 10, fontWeight: 'bold' },
  mbText: { color: '#AAA', fontSize: 12 },
  btnRetry: { marginTop: 20, backgroundColor: '#E53935', padding: 15, borderRadius: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

export default DownloadScreen;
