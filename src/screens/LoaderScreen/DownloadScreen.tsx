import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Dimensions, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const { width } = Dimensions.get('window');

// الإعدادات
const SERVER_NAME = 'Las Venturas RP';
const PACKAGE_NAME = 'com.touch.mobile.dark'; // تأكد أنه يطابق ما في ملف AndroidManifest
const SERVERS_SCREEN = 'Main'; 

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
  const [statusText, setStatusText] = useState('جاري فحص الملفات...');
  const [mbText, setMbText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    startProcess();
  }, []);

  const startProcess = async () => {
    setIsError(false);
    
    // 1. طلب الصلاحيات
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
    }

    // 2. فحص هل الملفات موجودة مسبقاً؟
    const hasFiles = await checkCacheExists();
    if (hasFiles) {
      setStatusText('الملفات موجودة، جاري التوجيه...');
      setTimeout(navigateToServers, 500);
      return;
    }

    // 3. إذا لم توجد، ابدأ التحميل
    downloadFiles();
  };

  const checkCacheExists = async () => {
    try {
      const exists = await RNFS.exists(`${TARGET_PATH}/texdb`);
      return exists;
    } catch (e) { return false; }
  };

  const navigateToServers = () => {
    navigation.reset({ index: 0, routes: [{ name: SERVERS_SCREEN }] });
  };

  const downloadFiles = async () => {
    setIsLoading(true);
    setStatusText('جاري التحميل...');

    try {
      // تنظيف المكان
      if (await RNFS.exists(ZIP_FILE_PATH)) await RNFS.unlink(ZIP_FILE_PATH);
      if (!(await RNFS.exists(TARGET_PATH))) await RNFS.mkdir(TARGET_PATH);

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        connectionTimeout: 15000, // زيادة الوقت لمنع التوقف
        readTimeout: 30000,
        begin: (res) => { if (res.statusCode !== 200) throw new Error(); },
        progress: (res) => {
          const p = res.bytesWritten / res.contentLength;
          setProgress(p * 0.7); // التحميل يمثل 70% من العملية
          setMbText(`${(res.bytesWritten / 1024 / 1024).toFixed(1)} MB / ${(res.contentLength / 1024 / 1024).toFixed(1)} MB`);
        },
      });

      const res = await downloadTask.promise;

      if (res.statusCode === 200) {
        // فك الضغط
        setStatusText('جاري فك الضغط (لا تغلق التطبيق)...');
        setProgress(0.85);
        
        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        // حذف الملف المضغوط بعد الفك لتوفير المساحة
        await RNFS.unlink(ZIP_FILE_PATH);
        
        setStatusText('اكتمل التثبيت!');
        setProgress(1);
        setTimeout(navigateToServers, 1000);
      } else {
        throw new Error();
      }
    } catch (err) {
      setIsError(true);
      setStatusText('حدث خطأ في التحميل. تأكد من اتصال الإنترنت.');
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
      <Text style={styles.mbText}>{mbText}</Text>

      {isError && (
        <TouchableOpacity style={styles.btnRetry} onPress={startProcess}>
          <Text style={styles.btnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', justifyContent: 'center', alignItems: 'center', padding: 20 },
  serverTitle: { color: '#FF9000', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  status: { color: '#DDD', marginBottom: 10 },
  barContainer: { width: '90%', height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#FF9000' },
  percent: { color: '#FF9000', marginTop: 10, fontWeight: 'bold' },
  mbText: { color: '#888', fontSize: 12 },
  btnRetry: { marginTop: 20, backgroundColor: '#E53935', padding: 15, borderRadius: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

export default DownloadScreen;
