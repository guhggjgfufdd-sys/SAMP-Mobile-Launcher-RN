import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB (الحجم الحقيقي المطلوب للملف)
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = ({ navigation }: any) => {
  const [currentBytes, setCurrentBytes] = useState(0);
  const [statusText, setStatusText] = useState('جاري الفحص واستئناف التحميل...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const jobIdRef = useRef<number | null>(null);
  const isDownloadingRef = useRef<boolean>(false);

  // 1️⃣ منع التحميل الوهمي: قراءة الحجم الحقيقي المكتوب فعلياً على ذاكرة الهاتف
  const getDiskFileSize = async (filePath: string): Promise<number> => {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        const stat = await RNFS.stat(filePath);
        return Number(stat?.size || 0);
      }
    } catch (err) {
      console.log('خطأ في قراءة الذاكرة:', err);
    }
    return 0;
  };

  // 2️⃣ دالة فك الضغط والحفظ والتوجيه إلى قائمة Main
  const extractAndNavigate = async (zipPath: string) => {
    try {
      setIsExtracting(true);
      setStatusText('جاري فك الضغط ونقل الملفات لأماكنها... 📦');

      const targetPath = RNFS.DocumentDirectoryPath;

      // فك ضغط ملف اللعبة
      await unzip(zipPath, targetPath);

      setStatusText('تم فك الضغط وتنظيم الملفات بنجاح! 🚀');

      // حذف ملف الـ ZIP لتوفير مساحة الجهاز
      await RNFS.unlink(zipPath).catch(() => {});

      // حفظ حالة التثبيت كـ "مكتمل" حتى لا تظهر شاشة التحميل مرة أخرى عند فتح اللعبة
      await AsyncStorage.setItem('IS_GAME_INSTALLED', 'true');

      // 🔄 التوجيه المباشر إلى القائمة الرئيسية (Main)
      setTimeout(() => {
        if (navigation) {
          navigation.replace('Main');
        }
      }, 1000);

    } catch (err: any) {
      setIsExtracting(false);
      setStatusText('حدث خطأ أثناء فك الضغط!');
      setErrorDetails(`تفاصيل الخطأ: ${err?.message || String(err)}`);
    }
  };

  // 3️⃣ دالة التحميل الرئيسية
  const startDownload = async () => {
    if (isDownloadingRef.current || isExtracting) return;

    // التأكد أولاً هل اللعبة مثبتة سابقاً للذهاب مباشرة إلى Main
    const isInstalled = await AsyncStorage.getItem('IS_GAME_INSTALLED');
    if (isInstalled === 'true') {
      if (navigation) navigation.replace('Main');
      return;
    }

    setErrorDetails('');
    isDownloadingRef.current = true;
    setIsDownloading(true);
    setStatusText('جاري فحص حالة الملف والاتصال...');

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    try {
      await RNFS.mkdir(RNFS.DocumentDirectoryPath).catch(() => {});

      const existingDiskBytes = await getDiskFileSize(archivePath);

      // 🛡️ إذا كان الملف محمّلاً بالكامل سابقاً بالذاكرة، انتقل مباشرة لفك الضغط ثم Main
      if (existingDiskBytes >= TOTAL_FILE_BYTES) {
        setCurrentBytes(TOTAL_FILE_BYTES);
        isDownloadingRef.current = false;
        setIsDownloading(false);
        await extractAndNavigate(archivePath);
        return;
      }

      setCurrentBytes(existingDiskBytes);

      // 🔄 إرسال Range Header لتكملة التحميل من الميجابايت الأخيرة وتجنب البدء من 0
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

          // 🛡️ منع التحميل الوهمي: إلغاء العملية فوراً إذا كان الرابط معطلاً أو أرجع كود غير صالحة
          if (res.statusCode !== 200 && res.statusCode !== 206 && res.statusCode !== 302) {
            isResponseValid = false;
            setStatusText(`خطأ سيرفر: ${res.statusCode}`);
            setErrorDetails('السيرفر أرجع استجابة غير صالحة. تم إيقاف التحميل لمنع التنزيل الوهمي.');
            if (jobIdRef.current) {
              RNFS.stopDownload(jobIdRef.current);
            }
          } else {
            setStatusText('جاري تحميل ملفات اللعبة...');
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

      // 🛡️ فحص الحجم الفعلي النهائى المكتوب بالهاردسك
      const finalDiskSize = await getDiskFileSize(archivePath);

      if (result.statusCode === 200 || result.statusCode === 206) {
        if (finalDiskSize >= TOTAL_FILE_BYTES) {
          setCurrentBytes(TOTAL_FILE_BYTES);
          // 📦 الانتهاء الحقيقي -> التوجه الفوري لفك الضغط والدخول إلى Main
          await extractAndNavigate(archivePath);
        } else {
          setCurrentBytes(finalDiskSize);
          setStatusText('توقف التحميل مؤقتاً عند الخروج');
          setErrorDetails('اضغط استكمال لمتابعة التنزيل من حيث توقف.');
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

  // 🔄 استئناف التحميل تلقائياً فور العودة إلى التطبيق
  useEffect(() => {
    startDownload();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isDownloadingRef.current && !isExtracting) {
        startDownload();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
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

      {!isExtracting ? (
        <>
          <Text style={styles.fileDetails}>
            {FILE_NAME} - {currentMB} MB / {totalMB} MB
          </Text>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text style={styles.percentText}>{progressPercent}%</Text>
        </>
      ) : (
        <Text style={styles.extractingText}>يرجى الانتظار، يتم تنظيم الملفات للتشغيل...</Text>
      )}

      {(errorDetails || !isDownloading) && !isExtracting ? (
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
  extractingText: {
    color: '#ffb74d',
    fontSize: 15,
    marginTop: 15,
    textAlign: 'center',
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
