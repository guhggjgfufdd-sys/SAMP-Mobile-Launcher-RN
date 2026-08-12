import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
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

  // 1. تنظيف الملف القديم المعطوب إن وجد لفك قفل الذاكرة
  try {
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      // إذا كان الملف محملاً سابقاً وبحجمه الكامل يتخطى التنزيل
      if (Number(stat.size) >= TOTAL_FILE_BYTES - 100000) {
        isDownloadingActive = false;
        dispatch(
          setLoaderDownload({
            currentBytes: TOTAL_FILE_BYTES,
            needBytes: TOTAL_FILE_BYTES,
            fileName: FILE_NAME,
            numberOfDownloads: 1,
          })
        );
        return;
      }
      // إذا كان ناقصاً نحذفه لنبدأ تنزيل نظيف بدون تعليق
      await RNFS.unlink(archivePath);
    }
  } catch (e) {
    console.log('File cleanup error:', e);
  }

  // 2. إعداد قناة الإشعارات
  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e) {}

  // 3. تصفير واجهة اللانشر لبدء العداد
  dispatch(
    setLoaderDownload({
      currentBytes: 0,
      needBytes: TOTAL_FILE_BYTES,
      fileName: FILE_NAME,
      numberOfDownloads: 0,
    })
  );

  // 4. التنزيل المباشر السريع الصافي بدون fetch
  const downloadTask = RNFS.downloadFile({
    fromUrl: DOWNLOAD_URL,
    toFile: archivePath,
    progressDivider: 1,
    background: false,
    connectionTimeout: 30000,
    readTimeout: 30000,
    begin: (res) => {
      console.log('Download task successfully started! Code:', res.statusCode);
    },
    progress: (res) => {
      const currentBytes = Number(res.bytesWritten);

      // تحديث شاشة اللانشر
      dispatch(
        setLoaderDownload({
          currentBytes: currentBytes,
          needBytes: TOTAL_FILE_BYTES,
          fileName: FILE_NAME,
          numberOfDownloads: 0,
        })
      );

      // تحديث شريط الإشعارات العلوي
      const progressPercent = Math.min(100, Math.floor((currentBytes / TOTAL_FILE_BYTES) * 100));
      const mbCurrent = (currentBytes / (1024 * 1024)).toFixed(1);
      const mbTotal = (TOTAL_FILE_BYTES / (1024 * 1024)).toFixed(1);

      try {
        notifee.displayNotification({
          id: 'download_notification',
          title: 'جاري تحميل ملفات اللعبة...',
          body: `${progressPercent}% - (${mbCurrent} MB / ${mbTotal} MB)`,
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
    await downloadTask.promise;
    isDownloadingActive = false;

    // 5. فحص حجم الملف النهائي لمنع التنزيل الوهمي
    let downloadedSize = 0;
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      downloadedSize = Number(stat.size);
    }

    if (downloadedSize < TOTAL_FILE_BYTES - 100000) {
      await notifee.displayNotification({
        id: 'download_notification',
        title: 'انقطع الاتصال قبل إكمال الملف',
        body: 'جاري إعادة المحاولة تلقائياً...',
        android: { channelId },
      });

      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // 6. إعلان النجاح الحقيقي
    await notifee.displayNotification({
      id: 'download_notification',
      title: 'تم اكتمال التحميل بنجاح! 🚀',
      body: 'جاهز الآن لتثبيت واستخراج اللعبة.',
      android: { channelId },
    });

    dispatch(
      setLoaderDownload({
        currentBytes: TOTAL_FILE_BYTES,
        needBytes: TOTAL_FILE_BYTES,
        fileName: FILE_NAME,
        numberOfDownloads: 1,
      })
    );
  } catch (error) {
    console.log('Download failed, retrying in 4s:', error);
    isDownloadingActive = false;

    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 4000);
  }
};
