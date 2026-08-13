import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const { width } = Dimensions.get('window');

// ⚠️ اسـم الحـزمـة الخـاص بـمشـروعـك
const PACKAGE_NAME = 'com.touch.mobile.dark';

// المسارات الأساسية في الجهاز
const TARGET_PATH = `${RNFS.ExternalStorageDirectoryPath}/Android/data/${PACKAGE_NAME}/files`;
const ZIP_FILE_PATH = `${TARGET_PATH}/2.11.gtasa.zip`;

// 🔗 رابط تحميل الكاش الخاص بك (ضع رابط المباشر هنا)
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

export default function DownloadScreen({ navigation }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('جاري التحقق من ملفات اللعبة...');
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    checkAndProcess();
  }, []);

  // 1️⃣ دالة التحقق من وجود الكاش (لمنع إعادة التحميل)
  const isCacheInstalled = async () => {
    try {
      const texdbExists = await RNFS.exists(`${TARGET_PATH}/texdb`);
      const sampExists = await RNFS.exists(`${TARGET_PATH}/SAMP`);
      const dataExists = await RNFS.exists(`${TARGET_PATH}/data`);

      // إذا كانت مجلدات اللعبة الأساسية موجودة فالمفروض لا يعيد التحميل
      return texdbExists && sampExists && dataExists;
    } catch (err) {
      console.log('Error checking cache files:', err);
      return false;
    }
  };

  // 2️⃣ التحقق والتوجيه للشاشة التالية
  const checkAndProcess = async () => {
    setHasError(false);
    const installed = await isCacheInstalled();

    if (installed) {
      setStatusText('تم العثور على الملفات، جاري الدخول...');
      setProgress(1);
      
      // ✅ الانتقال التلقائي المباشر لشاشة السيرفرات
      setTimeout(() => {
        navigation.replace('Servers'); // تأكد من اسم شاشة السيرفرات في Navigation
      }, 800);
      return;
    }

    // إذا لم تكن الملفات موجودة يبدأ التنزيل
    startDownloadProcess();
  };

  // 3️⃣ عملية التنزيل وفك الضغط
  const startDownloadProcess = async () => {
    try {
      setIsDownloading(true);
      setHasError(false);
      
      // التأكد من وجود المجلد الرئيسي
      const exists = await RNFS.exists(TARGET_PATH);
      if (!exists) {
        await RNFS.mkdir(TARGET_PATH);
      }

      setStatusText('جاري تحميل ملفات اللعبة...');

      // خيارات التنزيل
      const downloadOptions = {
        fromUrl: DOWNLOAD_URL,
        toFile: ZIP_FILE_PATH,
        progress: (res) => {
          if (res.contentLength > 0) {
            let p = res.bytesWritten / res.contentLength;
            // التحميل يأخذ من 0% إلى 80% من الشريط
            setProgress(p * 0.8);
          }
        },
        progressDivider: 1,
      };

      const downloadRes = await RNFS.downloadFile(downloadOptions).promise;

      if (downloadRes.statusCode === 200) {
        setStatusText('جاري فك الضغط والتثبيت... (يرجى الانتظار)');
        setProgress(0.85);

        // فك الضغط
        await unzip(ZIP_FILE_PATH, TARGET_PATH);

        // مسح ملف الـ ZIP التالف/المؤقت بعد الفك لتوفير الذاكرة
        if (await RNFS.exists(ZIP_FILE_PATH)) {
          await RNFS.unlink(ZIP_FILE_PATH);
        }

        setProgress(1);
        setStatusText('تم تثبيت اللعبة بنجاح!');

        // ✅ الانتقال التلقائي لشاشة السيرفرات
        setTimeout(() => {
          navigation.replace('Servers');
        }, 1200);

      } else {
        throw new Error(`فشل التحميل، رمز الاستجابة: ${downloadRes.statusCode}`);
      }

    } catch (error) {
      console.error('Download/Unzip Error:', error);
      setIsDownloading(false);
      setHasError(true);
      setStatusText('حدث خطأ أثناء التحميل أو فك الضغط');

      // تنظيف الملف المضغوط إن وجد حتى لا يتعطل التحميل القادم
      if (await RNFS.exists(ZIP_FILE_PATH)) {
        await RNFS.unlink(ZIP_FILE_PATH).catch(() => {});
      }

      Alert.alert(
        'خطأ في العملية',
        'لم نتمكن من إكمال التحميل وفك الضغط. تأكد من توفر مساحة كافية على ذاكرة الهاتف ومن ثبات شبكة الإنترنت.',
        [{ text: 'حسناً' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تطبيق GTA SAMP</Text>
      
      <Text style={styles.statusText}>{statusText}</Text>

      {/* شريط التقدم */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>

      {isDownloading && progress < 1 && (
        <ActivityIndicator size="small" color="#FF9800" style={{ marginTop: 15 }} />
      )}

      {hasError && (
        <TouchableOpacity style={styles.retryButton} onPress={checkAndProcess}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statusText: {
    color: '#CCCCCC',
    fontSize: 15,
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBarBackground: {
    width: width * 0.85,
    height: 12,
    backgroundColor: '#22222e',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333344',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 6,
  },
  percentText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 25,
    backgroundColor: '#e53935',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
