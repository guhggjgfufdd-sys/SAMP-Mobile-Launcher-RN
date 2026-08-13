import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import RNFS from 'react-native-fs';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB (الحجم الحقيقي المطلوب للملف)
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = () => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري الفحص واستئناف التحميل...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const jobIdRef = useRef<number | null>(null);
  const isDownloadingRef = useRef<boolean>(false);

  // 1️⃣ منع التحميل الوهمي: قراءة الحجم الحقيقي المكتوب فعلياً في ذاكرة الهاتف
  const getDiskFileSize = async (filePath: string): Promise<number> => {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        const stat = await RNFS.stat(filePath);
        return Number(stat?.size || 0);
      }
    } catch (err) {
      console.log('خطأ في قراءة ملف الهاردسك:', err);
    }
    return 0;
  };

  // 2️⃣ دالة التحميل الرئيسية واستكمال التقدم
  const startDownload = async () => {
    if (isDownloadingRef.current) return;

    setErrorDetails('');
    isDownloadingRef.current = true;
    setIsDownloading(true);
    setStatusText('جاري التحقق من الملف المتروك بالسعة...');

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      await RNFS.mkdir(RNFS.DocumentDirectoryPath).catch(() => {});

      // فحص كم ميجابايت تم تنزيلها سابقاً على ذاكرة الجهاز
      const existingDiskBytes = await getDiskFileSize(archivePath);

      // 🛡️ منع التحميل الوهمي: إذا الملف مكتمل بالكامل على الهاتف لا داعي للتحميل
      if (existingDiskBytes >= TOTAL_FILE_BYTES) {
        setCurrentBytes(TOTAL_FILE_BYTES);
        setStatusText('تم التحقق: اللعبة محمّلة وجاهزة بالكامل! 🚀');
        isDownloadingRef.current = false;
        setIsDownloading(false);
        return;
      }

      // تحديث العداد بالحجم الموجود بالهاردسك
      setCurrentBytes(existingDiskBytes);

      // 🔄 استكمال التحميل: إرسال هيدر Range لجلب المتبقي فقط دون البدء من 0
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile)',
        'Accept': '*/*',
      };

      if (existingDiskBytes > 0) {
        headers['Range'] = `bytes=${existingDiskBytes}-`;
      }

      let isResponseValid = true;

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: archivePath,
        headers,
        background: true,
        progressInterval: 400,
        connectionTimeout: 45000,
        readTimeout: 45000,
        begin: (res) => {
          jobIdRef.current = res.jobId;

          // 🛡️ منع التحميل الوهمي: إلغاء التحميل فوراً إذا أرجعت الصفحة كود خطأ (مثل 404)
          if (res.statusCode !== 200 && res.statusCode !== 206 && res.statusCode !== 302) {
            isResponseValid = false;
            setStatusText(`خطأ من السيرفر: ${res.statusCode}`);
            setErrorDetails('السيرفر أرجع استجابة غير صالحة. تم إيقاف التحميل لمنع التنزيل الوهمي.');
            if (jobIdRef.current) {
              RNFS.stopDownload(jobIdRef.current);
            }
          } else {
            setStatusText('جاري تحميل اللعبة...');
          }
        },
        progress: (res) => {
          if (!isResponseValid) return;
          const written = Number(res.bytesWritten || 0);
          const totalProgress = existingDiskBytes + written;

          if (totalProgress <= TOTAL_FILE_BYTES) {
            setCurrentBytes(totalProgress);
          }
        },
      });

      const result = await downloadTask.promise;

      // 🛡️ منع التحميل الوهمي: الفحص الميداني الحقيقي للهاردسك عند انتهاء العملية
      const finalDiskSize = await getDiskFileSize(archivePath);

      if (result.statusCode === 200 || result.statusCode === 206) {
        if (finalDiskSize >= TOTAL_FILE_BYTES) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          setStatusText('تم التنزيل والتحقق النهائي بنجاح! 🚀');
        } else {
          // إذا كان أندرويد أوقف التحميل عند الخروج للتطبيقات الأخرى
          setCurrentBytes(finalDiskSize);
          setStatusText('توقف التحميل مؤقتاً عند الخروج');
          setErrorDetails('اضغط على استكمال لمتابعة التنزيل من حيث توقف.');
        }
      }
    } catch (err: any) {
      const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;
      const savedBytes = await getDiskFileSize(archivePath);
      setCurrentBytes(savedBytes);
      setStatusText('توقف الاتصال');
      setErrorDetails(`يمكنك الاستكمال من النقطة الحالية (${(savedBytes / (1024 * 1024)).toFixed(2)} MB).`);
    } finally {
      isDownloadingRef.current = false;
      setIsDownloading(false);
    }
  };

  // 🔄 الاستئناف التلقائي المباشر فور العودة إلى التطبيق
  useEffect(() => {
    startDownload();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isDownloadingRef.current) {
        startDownload();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
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

      {errorDetails || !isDownloading ? (
        <TouchableOpacity style={styles.retryBtn} onPress={startDownload}>
          <Text style={styles.retryBtnText}>استكمال التنزيل 🔄</Text>
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
