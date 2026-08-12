import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB الحجم الفعلي المطلوب
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري فحص الملفات المحلية...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  const activeJobIdRef = useRef<number | null>(null);

  // 1. طلب صلاحيات الإشعارات لأجهزة أندرويد
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      } catch (e) {
        console.log('Notification permission error:', e);
      }
    }
  };

  // 2. فحص هل الملف موجود ومكتمل سابقاً بالذاكرة
  const verifyExistingFile = async (filePath: string): Promise<boolean> => {
    try {
      const fileExists = await RNFS.exists(filePath);
      if (fileExists) {
        const stat = await RNFS.stat(filePath);
        const actualSize = Number(stat.size);

        if (actualSize === TOTAL_FILE_BYTES) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التحقق: الملف مكتمل وجاهز! 🚀');
          setIsCompleted(true);
          return true; // مكتمل تماماً
        } else {
          // الملف غير مكتمل أو تالف -> نقتلع الملف الفاسد لتنظيف الذاكرة
          await RNFS.unlink(filePath);
        }
      }
    } catch (e) {
      console.log('Error verifying file:', e);
    }
    return false;
  };

  // 3. بدء التنزيل الفعلي والحقيقي
  const startDownloadDirectly = async () => {
    setErrorDetails('');
    setIsCompleted(false);
    setStatusText('جاري الاتصال بالسيرفر...');
    setCurrentBytes(0);

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      await requestNotificationPermission();

      // فحص أولي قبل التحميل
      const alreadyComplete = await verifyExistingFile(archivePath);
      if (alreadyComplete) return;

      try {
        await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      } catch (e) {}

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: archivePath,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
          'Accept': '*/*',
        },
        progressDivider: 0,
        progressInterval: 200,
        connectionTimeout: 60000,
        readTimeout: 60000,
        background: true, // للسماح بالعمل في الخلفية
        hasProgress: true,
        begin: (res) => {
          if (res.statusCode === 200 || res.statusCode === 302) {
            setStatusText('تم الاتصال! جاري تنزيل الملفات...');
          } else {
            setStatusText(`خطأ سيرفر: ${res.statusCode}`);
            setErrorDetails(`رمز الاستجابة: ${res.statusCode}`);
          }
        },
        progress: (res) => {
          const bytes = Number(res.bytesWritten);
          setCurrentBytes(bytes);
          setStatusText('جاري تحميل اللعبة...');
        },
      });

      activeJobIdRef.current = downloadTask.jobId;
      const result = await downloadTask.promise;

      if (result.statusCode === 200 || result.statusCode === 302) {
        // 🎯 فحص أمان حاسم: التأكد من مطابقة الحجم النهائي على الذاكرة
        const fileStat = await RNFS.stat(archivePath);
        const downloadedSizeBytes = Number(fileStat.size);

        if (downloadedSizeBytes === TOTAL_FILE_BYTES) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التحميل والتحقق من سلامة الملف بنجاح! 🚀');
          setIsCompleted(true);
        } else {
          // اكتشاف تحميل وهمي/ناقص
          await RNFS.unlink(archivePath);
          setStatusText('فشل التحقيق: الملف غير مكتمل!');
          setErrorDetails(`الحجم المحمل (${(downloadedSizeBytes / (1024 * 1024)).toFixed(2)} MB) لا يطابق الحجم المطلوب (${(TOTAL_FILE_BYTES / (1024 * 1024)).toFixed(2)} MB). تم حذف الملف غير المكتمل لسلامة التطبيق.`);
        }
      } else if (!errorDetails) {
        setErrorDetails(`فشل التحميل. رمز الاستجابة: ${result.statusCode}`);
      }
    } catch (err: any) {
      setStatusText('تعذر الاتصال بالسيرفر!');
      setErrorDetails(`تفاصيل الخطأ: ${err?.message || String(err)}`);
    }
  };

  useEffect(() => {
    startDownloadDirectly();
  }, []);

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
