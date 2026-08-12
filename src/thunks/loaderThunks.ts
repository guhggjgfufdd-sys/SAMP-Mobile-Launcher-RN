import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB

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
  const downloadDir = RNFS.CachesDirectoryPath;
  const archivePath = `${downloadDir}/2.11.gtasa.zip`;

  // تأكد من وجود مجلد الكاش
  const dirExists = await RNFS.exists(downloadDir);
  if (!dirExists) {
    await RNFS.mkdir(downloadDir);
  }

  // رابط التنزيل
  const downloadUrl = 'https://raw.githubusercontent.com/guhggjgfuf/SAMP-Mobile-Launcher-RN/main/2.11.gtasa.zip';

  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e) {
    console.log('Notification channel error:', e);
  }

  // مسح أي بقايا ملف تالف سابق
  const fileExists = await RNFS.exists(archivePath);
  if (fileExists) {
    const stat = await RNFS.stat(archivePath);
    if (Number(stat.size) < 1000) {
      await RNFS.unlink(archivePath);
    }
  }

  let isHttpOk = false;

  const downloadTask = RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: archivePath,
    begin: (res) => {
      if (res.statusCode === 200 || res.statusCode === 206) {
        isHttpOk = true;
      } else {
        isHttpOk = false;
        console.log('Download HTTP error code:', res.statusCode);
      }

      dispatch(
        setLoaderDownload({
          currentBytes: 0,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );
    },
    progress: (res) => {
      if (!isHttpOk) return;

      const bytesWritten = res.bytesWritten;
      dispatch(
        setLoaderDownload({
          currentBytes: bytesWritten,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );

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
    },
    background: true,
  });

  try {
    const result = await downloadTask.promise;

    if (!isHttpOk || result.statusCode >= 400) {
      const exists = await RNFS.exists(archivePath);
      if (exists) await RNFS.unlink(archivePath);

      notifee.displayNotification({
        id: 'download_notification',
        title: 'خطأ في رابط التحميل',
        body: 'الرابط غير صالح أو الملف غير موجود (404).',
        android: { channelId },
      });

      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 5000);
      return;
    }

    const stat = await RNFS.stat(archivePath);
    const finalSize = Number(stat.size);

    if (finalSize < 520000000) {
      notifee.displayNotification({
        id: 'download_notification',
        title: 'انقطع الاتصال قبل إكمال التحميل',
        body: 'جاري إعادة المحاولة...',
        android: { channelId },
      });

      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

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
  } catch (error) {
    console.log('Download error:', error);
    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 5000);
  }
};
