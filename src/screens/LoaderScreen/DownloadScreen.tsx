import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';

// 🎯 الرابط المباشر للتحميل من GitHub
const DOWNLOAD_URL = 'https://github.com/guhggjgfuf/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري بدء الاتصال...');
  const [errorDetails, setErrorDetails] = useState('');

  const startDownloadDirectly = async () => {
    setErrorDetails('');
    setStatusText('جاري طلب الملف من السيرفر...');
    setCurrentBytes(0);

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      // إنشاء المجلد بأمان
      try {
        await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      } catch (e) {}

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: archivePath,
        progressDivider: 1,
        connectionTimeout: 15000,
        readTimeout: 15000,
        begin: (res) => {
          if (res.statusCode === 200 || res.statusCode === 302) {
            setStatusText('تم الاتصال! جاري تحميل ملفات اللعبة...');
          } else {
            setStatusText(`خطأ من السيرفر! الكود: ${res.statusCode}`);
            setErrorDetails(`الرابط أرجع رمز: ${res.statusCode} (تأكد من وجود الملف في Releases)`);
          }
        },
        progress: (res) => {
          const bytes = Number(res.bytesWritten);
          setCurrentBytes(bytes);
          setStatusText('جاري تحميل اللعبة...');
        },
      });

      const result = await downloadTask.promise;

      if (result.statusCode === 200 || result.statusCode === 302) {
        setCurrentBytes(TOTAL_FILE_BYTES);
        setStatusText('تم التحميل بنجاح! 🚀');
      } else if (!errorDetails) {
        setErrorDetails(`فشل التحميل. كود الاستجابة: ${result.statusCode}`);
      }
    } catch (err: any) {
      setStatusText('تعذر الاتصال بالسيرفر!');
      setErrorDetails(`تفاصيل الخطأ: ${err?.message || String(err)}`);
    }
  };

  useEffect(() => {
    startDownloadDirectly();
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

      {errorDetails ? (
        <Text style={styles.errorText}>{errorDetails}</Text>
      ) : null}

      <Text style={styles.fileDetails}>
        {FILE_NAME} - {currentMB} MB / {totalMB} MB
      </Text>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <Text style={styles.percentText}>{progressPercent}%</Text>

      {errorDetails ? (
        <TouchableOpacity style={styles.retryBtn} onPress={startDownloadDirectly}>
          <Text style={styles.retryBtnText}>إعادة المحاولة 🔄</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 13,
    marginBottom: 15,
    textAlign: 'center',
  },
  fileDetails: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '90%',
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
  retryBtn: {
    marginTop: 25,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default DownloadScreen;
