import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري الاتصال بالسيرفر...');

  useEffect(() => {
    let activeJobId: number | null = null;

    const startDownloadDirectly = async () => {
      try {
        // تنبيه فوري لتأكيد بدء الكود
        Alert.alert('فحص التشغيل', 'بدأت عملية التنزيل المباشرة!');

        const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

        // إنشاء المجلد إذا لم يكن موجوداً
        try {
          await RNFS.mkdir(RNFS.DocumentDirectoryPath);
        } catch (e) {}

        // إطلاق التنزيل المباشر بدون وسطاء
        const downloadTask = RNFS.downloadFile({
          fromUrl: DOWNLOAD_URL,
          toFile: archivePath,
          progressDivider: 1,
          background: false,
          connectionTimeout: 30000,
          readTimeout: 30000,
          begin: (res) => {
            setStatusText(`تم الاتصال! كود الاستجابة: ${res.statusCode}`);
          },
          progress: (res) => {
            const bytes = Number(res.bytesWritten);
            setCurrentBytes(bytes);
            setStatusText('جاري تحميل ملفات اللعبة...');
          },
        });

        activeJobId = downloadTask.jobId;
        const result = await downloadTask.promise;

        if (result.statusCode === 200 || result.statusCode === 302) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التحميل بنجاح! 🚀');
          Alert.alert('نجاح', 'تم اكتمال تنزيل الملفات بنجاح!');
        } else {
          Alert.alert('خطأ سيرفر', `أرجع السيرفر كود: ${result.statusCode}`);
        }
      } catch (err: any) {
        Alert.alert('خطأ في التنزيل', err?.message || String(err));
      }
    };

    startDownloadDirectly();

    return () => {
      if (activeJobId !== null) {
        try {
          RNFS.stopDownload(activeJobId);
        } catch (e) {}
      }
    };
  }, []);

  // حساب النسبة المئوية
  const progressPercent = TOTAL_FILE_BYTES > 0 
    ? Math.min(100, Math.floor((currentBytes / TOTAL_FILE_BYTES) * 100)) 
    : 0;

  const currentMB = (currentBytes / (1024 * 1024)).toFixed(2);
  const totalMB = (TOTAL_FILE_BYTES / (1024 * 1024)).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{statusText}</Text>

      <Text style={styles.fileDetails}>
        {FILE_NAME} - {currentMB} MB / {totalMB} MB
      </Text>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <Text style={styles.percentText}>{progressPercent}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  fileDetails: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '80%',
    height: 12,
    backgroundColor: '#333333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  percentText: {
    color: '#2196F3',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
});

export default DownloadScreen;
