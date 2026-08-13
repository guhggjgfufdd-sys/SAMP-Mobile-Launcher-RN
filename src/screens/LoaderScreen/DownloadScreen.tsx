import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const { width } = Dimensions.get('window');

// إعدادات السيرفر والتطبيق
const SERVER_NAME = 'Las Venturas RP';
const PACKAGE_NAME = 'com.touch.mobile.dark';
const SERVERS_SCREEN = 'NodeScreen'; // شاشة السيرفرات (الشاشة الروسية)

// تحديد مسار التخزين المقترن بالنظام
const getTargetDirectory = () => {
  if (Platform.OS === 'android' && RNFS.ExternalDirectoryPath) {
    return RNFS.ExternalDirectoryPath;
  }
  return `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
};

const TARGET_PATH = getTargetDirectory();
const ZIP_FILE_PATH = `${TARGET_PATH}/gtasa_cache.zip`;
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export const DownloadScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('جاري تحضير اللعبة...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // متغيرات حماية لمنع التكرار والتحميل الوهمي
  const isProcessingRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);
  const downloadJobIdRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      initProcess();
    }, 400);

    return () => {
      clearTimeout(timer);
      if (downloadJobIdRef.current !== null) {
        RNFS.stopDownload(downloadJobIdRef.current);
      }
    };
  }, []);

  // طلب صلاحيات الذاكرة للأندرويد
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
        await PermissionsAndroid.requestMultiple(permissions);
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };

  // فحص وجود الكاش (في حال تم نقله يدويًا أو مثبت مسبقًا)
  const checkCacheExists = async (): Promise<boolean> => {
    try {
      const texdb = await RNFS.exists(`${TARGET_PATH}/texdb`);
      const samp = await RNFS.exists(`${TARGET_PATH}/samp`);
      const data = await RNFS.exists(`${TARGET_PATH}/data`);
      return (texdb && samp) || (texdb && data);
    } catch (e) {
      return false;
    }
  };

  // التوجيه المباشر لشاشة السيرفرات (NodeScreen)
  const navigateToServers = () => {
    try {
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: SERVERS_SCREEN }],
        });
      }
    } catch (err) {
      navigation.replace(SERVERS_SCREEN);
    }
  };

  // تهيئة عملية التنزيل/الفحص
  const initProcess = async () => {
    if (hasCompletedRef.current || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsError(false);
    setIsLoading(true);

    setStatusText('جاري التأكد من الصلاحيات...');
    await requestPermissions();

    setStatusText('جاري فحص ملفات اللعبة...');
    const installed = await checkCacheExists();

    // إذا وجد الكاش يدويًا أو مثبتاً
    if (installed) {
      hasCompletedRef.current = true;
      isProcessingRef.current = false;
      setStatusText('تم العثور على ملفات اللعبة!');
      setProgress(1);
      setIsLoading(false);

      setTimeout(() => {
        navigateToServers();
      }, 500);
      return;
    }

    // إذا لم توجد الملفات، ابدأ التنزيل الحقيقي
    await startRealDownload();
  };

  // عملية التنزيل الحقيقية والتثبيت
  const startRealDownload = async () => {
    try {
      setStatusText('جاري إنشاء مجلدات اللعبة...');
      const targetExists = await RNFS.exists(TARGET_PATH);
      if (!targetExists) {
        await RNFS.mkdir(TARGET_PATH).catch(() => {});
      }

      // تنظيف أي ملف مضغوط قديم تالف
      if (await RNFS.exists(ZIP_FILE_PATH)) {
        await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
      }

      setStatusText(`جاري الاتصال بسيرفر ${SERVER_NAME}...`);

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        connectionTimeout: 15000,
        readTimeout: 40000,
        background: true,
        discretionary: true,
        progressDivider: 1,
        // @ts-ignore - تتبع الروابط المعاد توجيهها من جيت هاب
        followRedirects: true,
        begin: (res) => {
          // حماية من التحميل الوهمي عند حدوث خطأ بالسيرفر
          if (res.statusCode !== 200 && res.statusCode !== 302) {
            throw new Error(`استجابة الخادم غير صالحة: ${res.statusCode}`);
          }
        },
        progress: (res) => {
          if (res.contentLength > 0) {
            let realProgress = res.bytesWritten / res.contentLength;
            // تخصيص 75% للتحميل و 25% لفك الضغط
            setProgress(realProgress * 0.75);
            setStatusText(`جاري تحميل الملفات (${Math.round(realProgress * 100)}%)`);
          }
        },
      });

      downloadJobIdRef.current = downloadTask.jobId;
      const downloadRes = await downloadTask.promise;

      // التأكد من نجاح التنزيل
      if (downloadRes.statusCode === 200 || downloadRes.statusCode === 302) {
        const fileStat = await RNFS.stat(ZIP_FILE_PATH);

        // حماية من التنزيل الوهمي: التأكد من أن حجم الملف أكبر من 10 ميجابايت على الأقل
        if (!fileStat || fileStat.size < 10 * 1024 * 1024) {
          throw new Error('الملف المحمل غير مكتمل أو فارغ');
        }

        setStatusText('جاري فك الضغط وتثبيت الملفات...');
        setProgress(0.85);

        // فك الضغط
        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        setProgress(0.95);
        setStatusText('جاري التنظيف وإعادة التهيئة...');

        // حذف الملف المضغوط بعد الانتهاء لتوفير المساحة
        if (await RNFS.exists(ZIP_FILE_PATH)) {
          await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
        }

        // إتمام العملية بنجاح
        setProgress(1);
        setStatusText('تم تثبيت اللعبة بنجاح!');
        hasCompletedRef.current = true;
        isProcessingRef.current = false;
        setIsLoading(false);

        setTimeout(() => {
          navigateToServers();
        }, 600);

      } else {
        throw new Error(`فشل التحميل من السيرفر (رمز: ${downloadRes.statusCode})`);
      }

    } catch (err: any) {
      console.error('Download Error:', err);
      isProcessingRef.current = false;
      setIsLoading(false);
      setIsError(true);
      setStatusText('حدث خطأ أثناء التثبيت');

      // تنظيف الملف التالف عند الفشل
      if (await RNFS.exists(ZIP_FILE_PATH)) {
        await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
      }

      Alert.alert(
        'خطأ في التحميل',
        'تعذر التنزيل التلقائي. تأكد من توفر المساحة والإنترنت، أو يمكنك نقل الملفات يدويًا.',
        [{ text: 'موافق' }]
      );
    }
  };

  // إعادة المحاولة عند حدوث خطأ
  const handleRetry = () => {
    isProcessingRef.current = false;
    hasCompletedRef.current = false;
    setProgress(0);
    initProcess();
  };

  return (
    <View style={styles.container}>
      {/* اسم السيرفر */}
      <Text style={styles.serverTitle}>{SERVER_NAME}</Text>
      <Text style={styles.subTitle}>SAMP Mobile Launcher</Text>

      {/* نص حالة التحميل */}
      <Text style={styles.status}>{statusText}</Text>

      {/* شريط التقدم */}
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {/* النسبة المئوية */}
      <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>

      {/* مؤشر الدوران */}
      {isLoading && progress < 1 && (
        <ActivityIndicator size="small" color="#FF9000" style={{ marginTop: 15 }} />
      )}

      {/* زر إعادة المحاولة */}
      {isError && (
        <TouchableOpacity style={styles.btnRetry} onPress={handleRetry}>
          <Text style={styles.btnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  serverTitle: {
    color: '#FF9000',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 35,
    marginTop: 5,
  },
  status: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  barContainer: {
    width: width * 0.85,
    height: 12,
    backgroundColor: '#222233',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333348',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF9000',
    borderRadius: 6,
  },
  percent: {
    color: '#FF9000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  btnRetry: {
    marginTop: 22,
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default DownloadScreen;
