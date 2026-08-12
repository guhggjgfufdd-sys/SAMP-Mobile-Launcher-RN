import { Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325;
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

let isDownloadingActive = false;

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
  if (isDownloadingActive) return;
  isDownloadingActive = true;

  const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

  // 1. تجربة إنشاء الإشعارات مع التعامل مع الأخطاء
  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e: any) {
    console.log('Notifee Error:', e);
  }

  // 2. تصفير العداد
  dispatch(
    setLoaderDownload({
      currentBytes: 0,
      needBytes: TOTAL_FILE_BYTES,
      fileName: FILE_NAME,
      numberOfDownloads: 0,
    })
  );

  // 3. بدء التحميل مع إظهار أخطاء الأندرويد فوراً
  const downloadTask = RNFS.downloadFile({
    fromUrl: DOWNLOAD_URL,
    toFile: archivePath,
    progressDivider: 1,
    background: true,
    begin: (res) => {
      console.log('HTTP Status Code:', res.statusCode);
      if (res.statusCode >= 400) {
        Alert.alert('خطأ في السيرفر', `السيرفر أرجع كود خطأ: ${res.statusCode}`);
      }
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

      // تحديث الإشعار
      try {
        const progressPercent = Math.min(100, Math.floor((currentBytes / TOTAL_FILE_BYTES) * 100));
        notifee.displayNotification({
          id: 'download_notification',
          title: 'جاري تحميل ملفات اللعبة...',
          body: `${progressPercent}%`,
          android: {
            channelId,
            onlyAlertOnce: true,
            progress: { max: 100, current: progressPercent },
          },
        });
      } catch (e) {}
    },
  });

  try {
    const result = await downloadTask.promise;
    isDownloadingActive = false;

    if (result.statusCode === 200 || result.statusCode === 302) {
      dispatch(
        setLoaderDownload({
          currentBytes: TOTAL_FILE_BYTES,
          needBytes: TOTAL_FILE_BYTES,
          fileName: FILE_NAME,
          numberOfDownloads: 1,
        })
      );
    } else {
      Alert.alert('فشل التنزيل', `كود الاستجابة: ${result.statusCode}`);
    }
  } catch (error: any) {
    isDownloadingActive = false;
    // إظهار نافذة تنبيه على الجوال بالخطأ الفعلي
    Alert.alert('خطأ تنزيل أندرويد', error?.message || JSON.stringify(error));
  }
};
