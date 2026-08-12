import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB الحجم الكامل للملف

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

export const fetchStartDownload = () => async (dispatch: any, getState: any) => {
  const archivePath = `${RNFS.DocumentDirectoryPath}/2.11.gtasa.zip`;

  // إنشاء قناة الإشعارات
  const channelId = await notifee.createChannel({
    id: 'download_channel',
    name: 'Game Download',
    importance: AndroidImportance.LOW,
  });

  const downloadUrl = 'https://raw.githubusercontent.com/guhggjgfuf/SAMP-Mobile-Launcher-RN/main/2.11.gtasa.zip';

  const task = RNBackgroundDownloader.download({
    id: 'gtasa_download',
    url: downloadUrl,
    destination: archivePath,
  })
    .begin((expectedBytes) => {
      dispatch(
        setLoaderDownload({
          currentBytes: 0,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );
    })
    .progress((percent, bytesWritten, totalBytes) => {
      dispatch(
        setLoaderDownload({
          currentBytes: bytesWritten,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );

      // تحديث إشعار شريط التقدم في الأندرويد
      const progressPercent = Math.min(100, Math.floor((bytesWritten / TOTAL_FILE_BYTES) * 100));
      notifee.displayNotification({
        id: 'download_notification',
        title: 'جاري تحميل ملفات اللعبة...',
        body: `${progressPercent}% - (${(bytesWritten / 1024 / 1024).toFixed(1)}MB / 553.9MB)`,
        android: {
          channelId,
          onlyAlertOnce: true,
          progress: {
            max: 100,
            current: progressPercent,
          },
        },
      });
    })
    .done(async () => {
      // التحقق من الحجم الفعلي قبل إعلان الاكتشاب
      const fileExists = await RNFS.exists(archivePath);
      let fileSize = 0;
      if (fileExists) {
        const stat = await RNFS.stat(archivePath);
        fileSize = stat.size;
      }

      // إذا كان الحجم المحمل أقل من 500 ميجابايت، فهذا انقطاع وهمي للشبكة
      if (fileSize < 520000000) {
        notifee.displayNotification({
          id: 'download_notification',
          title: 'توقف التحميل بسبب الشبكة',
          body: 'جاري إعادة محاولة التحميل...',
          android: { channelId },
        });
        // إعادة تشغيل التحميل للتكملة
        dispatch(fetchStartDownload() as any);
        return;
      }

      // إشعار الاكتمال الحقيقي
      await notifee.displayNotification({
        id: 'download_notification',
        title: 'تم اكتمال تحميل اللعبة بنجاح!',
        body: 'جاهز للتثبيت والتشغيل.',
        android: { channelId },
      });

      dispatch(
        setLoaderDownload({
          currentBytes: TOTAL_FILE_BYTES,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 1,
        })
      );
    })
    .error((error) => {
      console.log('Download error:', error);
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
    });
};
