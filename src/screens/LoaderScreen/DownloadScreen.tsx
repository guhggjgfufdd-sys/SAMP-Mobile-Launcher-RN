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

// 👑 اسم السيرفر الخاص بكم
const SERVER_NAME = 'Las Venturas RP';
const PACKAGE_NAME = 'com.touch.mobile.dark';

// 📱 اسم شاشة السيرفرات التالية المباشرة
const SERVERS_SCREEN = 'ModeScreen';

// 📂 تحديد مسار التخزين المتوافق مع Android 11+ لتفادي حظر النظام وخطأ 0%
const getTargetDirectory = () => {
  if (Platform.OS === 'android' && RNFS.ExternalDirectoryPath) {
    return RNFS.ExternalDirectoryPath;
  }
  return `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
};

const TARGET_PATH = getTargetDirectory();
const ZIP_FILE_PATH = `${TARGET_PATH}/gtasa_cache.zip`;
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.6/2.11.gtasa.zip';

export const DownloadScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('جاري تحضير اللعبة...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // 🛡️ متغيرات حماية لمنع التكرار والتأكد من عدم إعادة التحميل بعد الانتهاء
  const isProcessingRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);
  const downloadJobIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 🖤 تأخير بسيط (400ms) لمنع ظهور الشاشة السوداء عند فتح الواجهة
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

  // 1️⃣ طلب صلاحيات الذاكرة للأندرويد
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

  // 2️⃣ فحص الكاش الذكي (تجاوز التنزيل إذا كانت الملفات موجودة مسبقاً)
  const checkCacheExists = async (): Promise<boolean> => {
    try {
      const texdb = await RNFS.exists(`${TARGET_PATH}/texdb`);
      const samp = await RNFS.exists(`${TARGET_PATH}/SAMP`);
      const data = await RNFS.exists(`${TARGET_PATH}/data`);
      return texdb && samp && data;
    } catch (e) {
      return false;
    }
  };

  // 3️⃣ التهيئة وتحديد حالة الملفات
  const initProcess = async () => {
    // إيقاف العملية فوراً إذا كان التحميل مكتمل أو جاري التنفيذ لمنع التكرار
    if (hasCompletedRef.current || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsError(false);
    setIsLoading(true);

    setStatusText('جاري التأكد من الصلاحيات...');
    await requestPermissions();

    setStatusText('جاري فحص ملفات اللعبة...');
    const installed = await checkCacheExists();

    // إذا وُجد الكاش (منقول يدوياً أو محمل سابقاً)
    if (installed) {
      hasCompletedRef.current = true;
      setStatusText('تم العثور على ملفات اللعبة!');
      setProgress(1); // 100%
      setIsLoading(false);
      
      // التوجيه المباشر لشاشة السيرفرات
      setTimeout(() => {
        navigateToServers();
      }, 500);
      return;
    }

    // إذا لم تكن الملفات موجودة، نبدأ التحميل الحقيقي
    await startRealDownload();
  };

  // 4️⃣ الانتقال النهائي لشاشة السيرفرات بكسر جميع السجلات
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

  // 5️⃣ التحميل الحقيقي وتثبيت الكاش
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

      setStatusText(`جاري الاتصال بسيرفر تحميل ${SERVER_NAME}...`);

      const downloadTask = RNFS.downloadFile({
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        begin: (res) => {
          // منع التحميل الوهمي بالتأكد من استجابة السيرفر
          if (res.statusCode !== 200 && res.statusCode !== 302) {
            throw new Error(`استجابة الخادم غير صحيحة: ${res.statusCode}`);
          }
        },
        progress: (res) => {
          // حساب نسبة التحميل الحقيقية بالبايت
          if (res.contentLength > 0) {
            let realProgress = res.bytesWritten / res.contentLength;
            // التنزيل يأخذ أول 75% من الشريط
            setProgress(realProgress * 0.75);
            setStatusText(`جاري تحميل الملفات: ${Math.round(realProgress * 100)}%`);
          }
        },
        progressDivider: 1,
      });

      downloadJobIdRef.current = downloadTask.jobId;
      const downloadRes = await downloadTask.promise;

      // التأكد من استلام الملف كاملاً وغير فارغ
      if (downloadRes.statusCode === 200 || downloadRes.statusCode === 302) {
        const fileStat = await RNFS.stat(ZIP_FILE_PATH);
        if (!fileStat || fileStat.size === 0) {
          throw new Error('الملف المحمل تالف أو فارغ!');
        }

        setStatusText('جاري فك الضغط وتثبيت الملفات...');
        setProgress(0.85);

        // عملية فك الضغط الحقيقية
        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        setProgress(0.95);
        setStatusText('جاري التنظيف وإنهاء التثبيت...');

        // 🗑️ تنظيف الملف المضغوط فوراً لتفريغ الذاكرة ومنع التكرار أو التعليق عند 99%
        if (await RNFS.exists(ZIP_FILE_PATH)) {
          await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
        }

        // 🎉 الاكتشمال المباشر 100%
        setProgress(1);
        setStatusText('تم تثبيت اللعبة بنجاح!');
        hasCompletedRef.current = true;
        isProcessingRef.current = false;
        setIsLoading(false);

        // 🚀 التوجيه المباشر والنهائي لشاشة السيرفرات
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

      if (await RNFS.exists(ZIP_FILE_PATH)) {
        await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
      }

      Alert.alert(
        'خطأ في التحميل',
        'تعذر التنزيل التلقائي. تأكد من توفر المساحة والإنترنت، أو يمكنك نقل الملفات يدوياً.',
        [{ text: 'موافق' }]
      );
    }
  };

  // دالة زر إعادة المحاولة
  const handleRetry = () => {
    isProcessingRef.current = false;
    hasCompletedRef.current = false;
    setProgress(0);
    initProcess();
  };

  return (
    <View style={styles.container}>
      {/* اسم سيرفركم */}
      <Text style={styles.serverTitle}>{SERVER_NAME}</Text>
      <Text style={styles.subTitle}>SAMP Mobile Launcher</Text>

      {/* نص حالة التحميل */}
      <Text style={styles.status}>{statusText}</Text>

      {/* شريط التقدم الحقيقي */}
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {/* النسبة المئوية */}
      <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>

      {/* مؤشر الدوران أثناء التحميل */}
      {isLoading && progress < 1 && (
        <ActivityIndicator size="small" color="#FF9800" style={{ marginTop: 15 }} />
      )}

      {/* زر إعادة المحاولة عند حدوث خطأ */}
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
    backgroundColor: '#101018',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  serverTitle: {
    color: '#FF9800',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    color: '#8888AA',
    fontSize: 14,
    marginBottom: 35,
    marginTop: 5,
  },
  status: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 18,
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
    backgroundColor: '#FF9800',
    borderRadius: 6,
  },
  percent: {
    color: '#FF9800',
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
