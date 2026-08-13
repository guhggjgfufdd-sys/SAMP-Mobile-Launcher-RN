import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, InteractionManager } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري تجهيز الاتصال...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // ذاكرة سريعة لمنع اختناق واجهة React
  const bytesRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. طلب الصلاحية بمرونة
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

  // 2. فحص الذاكرة المحلية
  const checkExistingFile = async (filePath: string) => {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        const stat = await RNFS.stat(filePath);
        const size = Number(stat?.size || 0);

        if (size === TOTAL_FILE_BYTES) {
          bytesRef.current = TOTAL_FILE_BYTES;
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التحقق: اللعبة محمّلة وجاهزة! 🚀');
          return true;
        } else if (size > 0) {
          bytesRef.current = size;
          setCurrentBytes(size);
          setStatusText(`استكمال التحميل من (${(size / (1024 * 1024)).toFixed(1)} MB)...`);
        }
      }
    } catch (e) {
      console.log('Check error:', e);
    }
    return false;
  };

  // 3. بدء عملية التنزيل المباشرة
  const startDownload = async () => {
    if (isDownloading) return;

    setErrorDetails('');
    setIsDownloading(true);
    setStatusText('جاري الاتصال بالسيرفر...');

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      await requestPermissions();

      const isComplete = await checkExistingFile(archivePath);
      if (isComplete) {
        setIsDownloading(false);
        return;
      }

      await RNFS.mkdir(RNFS.DocumentDirectoryPath).catch(() => {});

      // تشغيل المؤقت المستقل للواجهة (تحديث سلس كل 200ms)
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentBytes(bytesRef.current);
      }, 200);

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: archivePath,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
          'Accept': '*/*',
        },
        progressInterval: 500,
        connectionTimeout: 60000,
        readTimeout: 60000,
        background: true,
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
          // حفظ القيمة بدون تحديث الشاشة لتجنب التجميد
          bytesRef.current = Number(res.bytesWritten || 0);
        },
      });

      const result = await downloadTask.promise;

      // إيقاف مؤقت التحديث عند الانتهاء
      if (timerRef.current) clearInterval(timerRef.current);

      if (result.statusCode === 200 || result.statusCode === 302) {
        const stat = await RNFS.stat(archivePath).catch(() => null);
        const finalSize = Number(stat?.size || 0);

        if (finalSize === TOTAL_FILE_BYTES) {
          bytesRef.current = TOTAL_FILE_BYTES;
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التنزيل والتحقق بنجاح! 🚀');
        } else {
          setStatusText('توقف التحميل قبل الاكتمال');
          setErrorDetails('يمكنك الضغط على استكمال لمتابعة التنزيل.');
        }
      } else if (!errorDetails) {
        setErrorDetails(`فشل التحميل. رمز الاستجابة: ${result.statusCode}`);
      }
    } catch (err: any) {
      setStatusText('تعذر الاتصال بالسيرفر!');
      setErrorDetails(`تفاصيل الخطأ: ${err?.message || String(err)}`);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    // الانتظار حتى استقرار انتقال الشاشات لضمان عدم تجمد الأقسام
    const task = InteractionManager.runAfterInteractions(() => {
      startDownload();
    });

    return () => {
      task.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
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
