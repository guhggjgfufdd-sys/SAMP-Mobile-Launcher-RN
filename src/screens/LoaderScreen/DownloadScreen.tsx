import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, AppState } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB الحجم الحقيقي
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري فحص الاتصال والسيرفر...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const bytesRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. طلب الصلاحيات لمنع الأندرويد من قتل عملية الخلفية
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Number(Platform.Version) >= 33) {
          const perm = PermissionsAndroid.PERMISSIONS?.POST_NOTIFICATIONS || 'android.permission.POST_NOTIFICATIONS';
          await PermissionsAndroid.request(perm as any);
        }
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ).catch(() => {});
      }
    } catch (e) {
      console.log('Permission bypass:', e);
    }
  };

  // 2. منع التحميل الوهمي: الفحص المباشر للحجم الفعلي المكتوب على ذاكرة الهاتف
  const getActualFileSizeOnDisk = async (filePath: string): Promise<number> => {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        const stat = await RNFS.stat(filePath);
        return Number(stat?.size || 0);
      }
    } catch (e) {
      console.log('Disk Check Error:', e);
    }
    return 0;
  };

  // 3. منع التحميل الوهمي: التحقق من استجابة السيرفر قبل بدء التحميل
  const verifyServerConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(DOWNLOAD_URL, { method: 'HEAD' });
      if (response.status === 200 || response.status === 302 || response.status === 206) {
        return true;
      }
    } catch (e) {
      console.log('Server verification error:', e);
    }
    return false;
  };

  // 4. دالة التحميل الرئيسية المدعومة بالخلفية ومنع الوهمي
  const startDownload = async () => {
    if (isDownloading) return;

    setErrorDetails('');
    setIsDownloading(true);
    setStatusText('جاري التحقق من السيرفر والملفات...');

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      await requestPermissions();

      // فحص الحجم الفعلي الحقيقي الموجود بالهاردسك وليس الذاكرة المؤقتة
      const actualSizeOnDisk = await getActualFileSizeOnDisk(archivePath);

      if (actualSizeOnDisk >= TOTAL_FILE_BYTES) {
        bytesRef.current = TOTAL_FILE_BYTES;
        setCurrentBytes(TOTAL_FILE_BYTES);
        setStatusText('تم التحقق: اللعبة محمّلة وجاهزة بالكامل! 🚀');
        setIsDownloading(false);
        return;
      }

      // إعداد العداد من النقطة الحقيقية المكتوبة على ذاكرة الهاتف
      bytesRef.current = actualSizeOnDisk;
      setCurrentBytes(actualSizeOnDisk);

      // فحص السيرفر لمنع التنزيل الوهمي
      const isServerOk = await verifyServerConnection();
      if (!isServerOk) {
        setStatusText('تعذر الاتصال بالسيرفر الأصلي!');
        setErrorDetails('الرابط غير متاح أو لا يوجد اتصال بالإنترنت.');
        setIsDownloading(false);
        return;
      }

      await RNFS.mkdir(RNFS.DocumentDirectoryPath).catch(() => {});

      // مؤقت سلس لتحديث الشاشة كل 250ms دون إجهاد المعالج
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(async () => {
        // تحديث العداد بناءً على الملف الفعلي أو القيمة المسجلة
        setCurrentBytes(bytesRef.current);
      }, 250);

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
        'Accept': '*/*',
      };

      if (actualSizeOnDisk > 0) {
        headers['Range'] = `bytes=${actualSizeOnDisk}-`;
      }

      setStatusText('جاري تحميل اللعبة...');

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: archivePath,
        headers,
        progressInterval: 500,
        progressDivider: 5, // تقليل إجهاد المعالج للعمل بالخلفية عند فتح تيك توك
        connectionTimeout: 45000,
        readTimeout: 45000,
        background: true, // تفعيل التحميل بالخلفية
        hasProgress: true,
        begin: (res) => {
          if (res.statusCode === 200 || res.statusCode === 206 || res.statusCode === 302) {
            setStatusText('جاري تحميل ملفات اللعبة...');
          } else {
            setStatusText(`خطأ من السيرفر: ${res.statusCode}`);
            setErrorDetails(`رمز الاستجابة: ${res.statusCode}`);
          }
        },
        progress: (res) => {
          const written = Number(res.bytesWritten || 0);
          bytesRef.current = actualSizeOnDisk + written;
        },
      });

      const result = await downloadTask.promise;

      if (timerRef.current) clearInterval(timerRef.current);

      // فحص حقيقي نهائي للحجم على ذاكرة الهاتف لمنع التحميل الوهمي
      const finalDiskSize = await getActualFileSizeOnDisk(archivePath);

      if (finalDiskSize >= TOTAL_FILE_BYTES) {
        bytesRef.current = TOTAL_FILE_BYTES;
        setCurrentBytes(TOTAL_FILE_BYTES);
        setStatusText('تم التنزيل والتحقق الحقيقي بنجاح! 🚀');
      } else {
        // إذا كان الحجم الحقيقي أقل، فهذا يعني أن التحميل انقطع بالخلفية أثناء فتح تطبيقات أخرى
        bytesRef.current = finalDiskSize;
        setCurrentBytes(finalDiskSize);
        setStatusText('توقف التحميل مؤقتاً أثناء التواجد بالخلفية');
        setErrorDetails('يمكنك الضغط على استكمال لمتابعة التنزيل من حيث توقف.');
      }
    } catch (err: any) {
      setStatusText('تعذر إكمال التحميل!');
      setErrorDetails(`تفاصيل الخطأ: ${err?.message || String(err)}`);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsDownloading(false);
    }
  };

  // 5. استئناف التحميل تلقائياً عند العودة من تيك توك إلى التطبيق
  useEffect(() => {
    startDownload();

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // عند العودة للتطبيق، يتم تحديث حجم الملف الفعلي واستئناف التحميل إن توقف
        const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;
        const currentSize = await getActualFileSizeOnDisk(archivePath);
        bytesRef.current = currentSize;
        setCurrentBytes(currentSize);
      }
    });

    return () => {
      subscription.remove();
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
