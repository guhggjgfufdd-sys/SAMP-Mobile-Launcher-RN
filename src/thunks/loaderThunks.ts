import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

// حارس أمان يمنع تكرار التنزيل وتصفير العداد عند إعادة رندر الشاشة
let isDownloadingActive = false;
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
  // إذا كان التنزيل جارياً بالفعل، يمنع إعادة تصفيره وإلغاء العملية
  if (isDownloadingActive) {
    console.log('Download already running, ignoring duplicate trigger.');
    return;
  }

  isDownloadingActive = true;
  const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

  // 1. إنشاء قناة الإشعارات
  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e) {
    console.log('Channel error:', e);
  }

  // 2. فحص هل الملف موجود ومكتمل بالكامل مسبقاً؟
  if (await RNFS.exists(archivePath)) {
    try {
      const stat = await RNFS.stat(archivePath);
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
    } catch (e) {}
  }

  // 3. بدء عملية التحميل المباشرة
  const downloadTask = RNFS.downloadFile({
    fromUrl: DOWNLOAD_URL,
    toFile: archivePath,
    progressDivider: 1,
    background: true,
    begin: (res) => {
      console.log('Download started, status:', res.statusCode);
      dispatch(
        setLoaderDownload({
          currentBytes: 0,
          needBytes: TOTAL_FILE_BYTES,
          fileName: FILE_NAME,
          numberOfDownloads: 0,
        })
      );
    },
    progress: (res) => {
      const currentBytes = Number(res.bytesWritten);

      // تحديث واجهة اللانشر
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

      notifee.displayNotification({
        id: 'download_notification',
        title: 'جاري تحميل ملفات اللعبة...',
        body: `${progressPercent}% - (${mbCurrent} MB / ${mbTotal} MB)`,
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
  });

  activeJobId = downloadTask.jobId;

  try {
    await downloadTask.promise;
    isDownloadingActive = false;

    // 4. فحص الحجم الفعلي لمنع التنزيل الوهمي
    let downloadedSize = 0;
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      downloadedSize = Number(stat.size);
    }

    // لو انقطع النت وأصل الملف ناقص (أقل من 553.96 MB)
    if (downloadedSize < TOTAL_FILE_BYTES - 100000) {
      await notifee.displayNotification({
        id: 'download_notification',
        title: 'انقطع الاتصال بالشبكة',
        body: 'جاري إعادة محاولة التوصيل والتحميل...',
        android: { channelId },
      });

      // إعادة التوصيل التلقائي عند انقطاع النت
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // 5. إعلان النجاح الحقيقي
    await notifee.displayNotification({
      id: 'download_notification',
      title: 'تم اكتمال التحميل بنجاح! 🚀',
      body: 'ملفات اللعبة جاهزة للتثبيت.',
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
    console.log('Download error:', error);
    isDownloadingActive = false;

    // إعادة المحاولة التلقائية
    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 4000);
  }
};
