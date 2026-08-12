import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB الحجم الكامل المضمون

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
  const archivePath = `${RNFS.DocumentDirectoryPath}/2.11.gtasa.zip`;
  const downloadUrl = 'https://raw.githubusercontent.com/guhggjgfuf/SAMP-Mobile-Launcher-RN/main/2.11.gtasa.zip';

  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e) {
    console.log(e);
  }

  const downloadTask = RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: archivePath,
    begin: () => {
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
      const bytesWritten = res.bytesWritten;
      dispatch(
        setLoaderDownload({
          currentBytes: bytesWritten,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );

      // تحديث شريط التقدم في الإشعار
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
    await downloadTask.promise;

    // التحقق من حجم الملف الفعلي عند نهاية التنزيل
    const fileExists = await RNFS.exists(archivePath);
    let fileSize = 0;
    if (fileExists) {
      const stat = await RNFS.stat(archivePath);
      fileSize = Number(stat.size);
    }

    // إذا كان الحجم أقل من 520 ميجابايت فهذا انقطاع للشبكة وليس إكمالاً
    if (fileSize < 520000000) {
      await notifee.displayNotification({
        id: 'download_notification',
        title: 'توقف التحميل بسبب ضعف الشبكة',
        body: 'جاري إعادة المحاولة تلقائياً...',
        android: { channelId },
      });

      // إعادة المحاولة بعد 3 ثواني
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // الإشعار بالاكتمال الفعلي
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
    }, 3000);
  }
};
