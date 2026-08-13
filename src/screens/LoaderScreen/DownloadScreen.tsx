import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري بدء الاتصال...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadJobId = useRef<number | null>(null);

  // 1. طلب الصلاحية
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        const perm = PermissionsAndroid.PERMISSIONS?.POST_NOTIFICATIONS || 'android.permission.POST_NOTIFICATIONS';
        await PermissionsAndroid.request(perm as any);
      }
    } catch (e) {
      console.log('Permission bypass:', e);
    }
  };

  // 2. بدء التحميل المباشر والحي
  const startDownload = async () => {
    if (isDownloading) return;

    setErrorDetails('');
    setIsDownloading(true);
    setStatusText('جاري الاتصال بالسيرفر...');

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      await requestPermissions();

      // فحص إذا كان الملف موجود ومكتمل أو تحسب الجزء المحمّل
      const exists = await RNFS.exists(archivePath);
      let existingSize = 0;
      if (exists) {
        const stat = await RNFS.stat(archivePath);
        existingSize = Number(stat?.size || 0);

        if (existingSize === TOTAL_FILE_BYTES) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('الملف مكتمل وجاهز بالكامل! 🚀');
          setIsDownloading(false);
          return;
        }
      }

      await RNFS.mkdir(RNFS.DocumentDirectoryPath).catch(() => {});

      // إلغاء background: true حتى لا يتجمد التحميل في أندرويد
      const task = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: archivePath,
        headers: existingSize > 0 ? {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
          'Accept': '*/*',
          'Range': `bytes=${existingSize}-` // استكمال التحميل من النقطة الحالية
        } : {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
          'Accept': '*/*',
        },
        progressInterval: 200,
        progressDivider: 1,
        connectionTimeout: 30000,
        readTimeout: 30000,
        background: false, // ⚠️ إيقاف خيار الخلفية المسبب لتجميد الواجهة
        hasProgress: true,
        begin: (res) => {
          if (res.statusCode === 200 || res.statusCode === 206 || res.statusCode === 302) {
            setStatusText('تم الاتصال! جاري تنزيل الملفات...');
          } else {
            setStatusText(`خطأ سيرفر: ${res.statusCode}`);
            setErrorDetails(`رمز الاستجابة: ${res.statusCode}`);
          }
        },
        progress: (res) => {
          const written = Number(res.bytesWritten || 0);
          const totalDownloaded = existingSize + written;
          setCurrentBytes(totalDownloaded);
          setStatusText('جاري تحميل اللعبة...');
        },
      });

      downloadJobId.current = task.jobId;
      const result = await task.promise;

      if (result.statusCode === 200 || result.statusCode === 206 || result.statusCode === 302) {
        const stat = await RNFS.stat(archivePath).catch(() => null);
        const finalSize = Number(stat?.size || 0);

        if (finalSize >= TOTAL_FILE_BYTES) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التنزيل والتحقق بنجاح! 🚀');
        } else {
          setStatusText('توقف التحميل قبل الاكتمال');
          setErrorDetails('التحميل غير مكتمل، اضغط إعادة المحاولة للاستكمال.');
        }
      } else if (!errorDetails) {
        setErrorDetails(`فشل التحميل. رمز الاستجابة: ${result.statusCode}`);
      }
    } catch (err: any) {
      setStatusText('تعذر الاتصال بالسيرفر!');
      setErrorDetails(`تفاصيل الخطأ: ${err?.message || String(err)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    // مهلة زمنية بسيطة لضمان استقرار الشاشة قبل الاتصال
    const timer = setTimeout(() => {
      startDownload();
    }, 300);

    return () => clearTimeout(timer);
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
        <TouchableOpacity style={styles.retryBtn} onPress={startDownload}>
          <Text style={styles.retryBtnText}>إعادة المحاولة / استكمال 🔄</Text>
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
