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

  // 1. فحص الحجم الحالي للملف الموجود محلياً (إن وجد)
  let existingSize = 0;
  const fileExists = await RNFS.exists(archivePath);
  if (fileExists) {
    const stat = await RNFS.stat(archivePath);
    existingSize = Number(stat.size);
  }

  // إذا كان الملف مكتمل تماماً بالفعل
  if (existingSize >= TOTAL_FILE_BYTES) {
    dispatch(
      setLoaderDownload({
        currentBytes: TOTAL_FILE_BYTES,
        needBytes: TOTAL_FILE_BYTES,
        fileName: '2.11.gtasa.zip',
        numberOfDownloads: 1,
      })
    );
    return;
  }

  // 2. إعداد الترويسة للتحميل المكتمل أو المتبقي (Range Header للاستئناف)
  const headers: { [key: string]: string } = {};
  if (existingSize > 0) {
    headers['Range'] = `bytes=${existingSize}-`;
  }

  const downloadTask = RNFS.downloadFile({
    fromUrl: downloadUrl,
    toFile: archivePath,
    headers: headers,
    begin: () => {
      dispatch(
        setLoaderDownload({
          currentBytes: existingSize,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );
    },
    progress: (res) => {
      const currentTotalBytes = existingSize + res.bytesWritten;

      dispatch(
        setLoaderDownload({
          currentBytes: currentTotalBytes,
          needBytes: TOTAL_FILE_BYTES,
          fileName: '2.11.gtasa.zip',
          numberOfDownloads: 0,
        })
      );

      const progressPercent = Math.min(100, Math.floor((currentTotalBytes / TOTAL_FILE_BYTES) * 100));
      notifee.displayNotification({
        id: 'download_notification',
        title: 'جاري تحميل ملفات اللعبة...',
        body: `${progressPercent}% - (${(currentTotalBytes / 1024 / 1024).toFixed(1)}MB / 553.9MB)`,
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

    // فحص الحجم النهائي بعد انتهاء المحاولة
    const finalStat = await RNFS.stat(archivePath);
    const finalSize = Number(finalStat.size);

    if (finalSize < TOTAL_FILE_BYTES - 1000) {
      // إذا لم يكتمل بعد بسبب انقطاع النت، يُعيد المحاولة لاستكمال المتبقي
      notifee.displayNotification({
        id: 'download_notification',
        title: 'انقطع الاتصال بالشبكة',
        body: 'جاري استئناف التحميل من نقطة التوقف...',
        android: { channelId },
      });

      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 4000);
      return;
    }

    // إشعار الاكتمال النهائي
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
    // عند حدوث خطأ في الشبكة، أعد المحاولة بعد 4 ثوانٍ لاستئناف التنزيل
    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 4000);
  }
};
