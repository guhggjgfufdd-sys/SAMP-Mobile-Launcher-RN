import { Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const GITHUB_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

let activeJobId: number | null = null;

export const compareFileRecursion = ({ caches }: { caches: any[] }) => async (dispatch: any) => {
  dispatch(
    setCompare({
      distributionCacheBytes: TOTAL_FILE_BYTES,
      downloadsCacheBytes: 0,
      rejectCount: 0,
      successCount: 0,
    })
  );
};

export const fetchStartDownload = () => async (dispatch: any) => {
  // 🔴 اختبار مباشر: إجبار الهاتف على إظهار نافذة تنبيه أول ما يشتغل الكود
  Alert.alert('تنبيه فحص', 'تم تشغيل كود التحميل بنجاح!');

  try {
    // 1. فحص هل مكتبة RNFS محملة بالجهاز
    if (!RNFS || !RNFS.DocumentDirectoryPath) {
      Alert.alert('خطأ مكتبة', 'مكتبة RNFS غير معرفة في النظام!');
      return;
    }

    const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

    // 2. تجديد الرابط المباشر لتفادي إعادة التوجيه (302 Redirect)
    let finalDownloadUrl = GITHUB_URL;
    try {
      const response = await fetch(GITHUB_URL, { method: 'HEAD' });
      if (response.url && response.url !== GITHUB_URL) {
        finalDownloadUrl = response.url;
      }
    } catch (e) {}

    // 3. تصفير واجهة اللانشر
    dispatch(
      setLoaderDownload({
        currentBytes: 0,
        needBytes: TOTAL_FILE_BYTES,
        fileName: FILE_NAME,
        numberOfDownloads: 0,
      })
    );

    // 4. إيقاف أي عملية سابقة
    if (activeJobId !== null) {
      try {
        RNFS.stopDownload(activeJobId);
      } catch (e) {}
      activeJobId = null;
    }

    // 5. بدء التنزيل بالمكتبة
    const downloadTask = RNFS.downloadFile({
      fromUrl: finalDownloadUrl,
      toFile: archivePath,
      progressDivider: 1,
      background: false,
      connectionTimeout: 30000,
      readTimeout: 30000,
      begin: (res) => {
        Alert.alert('بدء الاتصال', `تم الاتصال بالسيرفر بكود: ${res.statusCode}`);
      },
      progress: (res) => {
        const currentBytes = Number(res.bytesWritten);
        dispatch(
          setLoaderDownload({
            currentBytes: currentBytes,
            needBytes: TOTAL_FILE_BYTES,
            fileName: FILE_NAME,
            numberOfDownloads: 0,
          })
        );
      },
    });

    activeJobId = downloadTask.jobId;
    const result = await downloadTask.promise;
    activeJobId = null;

    if (result.statusCode === 200 || result.statusCode === 302) {
      Alert.alert('نجاح', 'تم اكتمال التحميل 100%!');
      dispatch(
        setLoaderDownload({
          currentBytes: TOTAL_FILE_BYTES,
          needBytes: TOTAL_FILE_BYTES,
          fileName: FILE_NAME,
          numberOfDownloads: 1,
        })
      );
    } else {
      Alert.alert('خطأ سيرفر', `السيرفر أرجع كود: ${result.statusCode}`);
    }
  } catch (outerError: any) {
    Alert.alert('خطأ عام', outerError?.message || String(outerError));
  }
};
