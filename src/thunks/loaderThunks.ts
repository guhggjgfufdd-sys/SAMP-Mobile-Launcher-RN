import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // الحجم الكامل المضمون (553.96 MB)
const DOWNLOAD_FILENAME = '2.11.gtasa.zip';

// ضع هنا رابط التنزيل المباشر الموثوق
const DIRECT_DOWNLOAD_URL = 'https://raw.githubusercontent.com/guhggjgfuf/SAMP-Mobile-Launcher-RN/main/2.11.gtasa.zip';

let currentJobId: number | null = null;
let watchdogTimer: NodeJS.Timeout | null = null;

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
  // 1. تنظيف أي عمليات تحميل سابقة متوقفة
  if (currentJobId !== null) {
    try {
      RNFS.stopDownload(currentJobId);
    } catch (e) {}
    currentJobId = null;
  }

  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }

  const archivePath = `${RNFS.DocumentDirectoryPath}/${DOWNLOAD_FILENAME}`;

  // 2. إعداد قناة إشعارات الأندرويد
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

  // 3. قراءة حجم الملف المحمّل سابقاً (إن وجد) لغرض الاستئناف
  let existingBytes = 0;
  const fileExists = await RNFS.exists(archivePath);
  if (fileExists) {
    try {
      const stat = await RNFS.stat(archivePath);
      existingBytes = Number(stat.size);
    } catch (e) {
      existingBytes = 0;
    }
  }

  // إذا كان الملف محمل بالكامل وبحجم صحيح
  if (existingBytes >= TOTAL_FILE_BYTES - 2000) {
    dispatch(
      setLoaderDownload({
        currentBytes: TOTAL_FILE_BYTES,
        needBytes: TOTAL_FILE_BYTES,
        fileName: DOWNLOAD_FILENAME,
        numberOfDownloads: 1,
      })
    );
    await notifee.displayNotification({
      id: 'download_notification',
      title: 'التحميل مكتمل! 🎮',
      body: 'ملفات اللعبة جاهزة للتثبيت والتشغيل.',
      android: { channelId },
    });
    return;
  }

  // 4. إعداد ترويسة Range للاستئناف التلقائي من نقطة التوقف
  const headers: { [key: string]: string } = {
    'User-Agent': 'Mozilla/5.0 (Android; Mobile)',
  };

  if (existingBytes > 0 && existingBytes < TOTAL_FILE_BYTES) {
    headers['Range'] = `bytes=${existingBytes}-`;
  }

  // 5. مراقب التجمّد (Watchdog) للتعامل مع الإنترنت الضعيف
  const resetWatchdog = () => {
    if (watchdogTimer) clearTimeout(watchdogTimer);
    watchdogTimer = setTimeout(() => {
      console.log('Download stalled due to weak network. Auto-resuming...');
      if (currentJobId !== null) {
        try { RNFS.stopDownload(currentJobId); } catch (e) {}
      }
      // إعادة استدعاء التنزيل لاستئناف التحميل تلقائياً
      dispatch(fetchStartDownload() as any);
    }, 12000); // إعطاء مهلة 12 ثانية للنت الضعيف قبل إعادة المحاولة
  };

  resetWatchdog();

  // تحديث الشاشة بالحجم الحالي المحمّل
  dispatch(
    setLoaderDownload({
      currentBytes: existingBytes,
      needBytes: TOTAL_FILE_BYTES,
      fileName: DOWNLOAD_FILENAME,
      numberOfDownloads: 0,
    })
  );

  // 6. بدء عملية التحميل
  const downloadTask = RNFS.downloadFile({
    fromUrl: DIRECT_DOWNLOAD_URL,
    toFile: archivePath,
    headers: headers,
    connectionTimeout: 20000,
    readTimeout: 25000,
    begin: (res) => {
      console.log('Download started, response code:', res.statusCode);
      // لو السيرفر لا يدعم Range وقدم خطأ 416، يُحذف الملف الجزئي للبدء النظيف
      if (res.statusCode === 416) {
        RNFS.unlink(archivePath).then(() => {
          dispatch(fetchStartDownload() as any);
        });
      }
    },
    progress: (res) => {
      resetWatchdog(); // إعادة ضبط المؤقت لأن البيانات تصل بنجاح

      const totalDownloaded = existingBytes + Number(res.bytesWritten);

      // تحديث واجهة اللانشر (Redux State)
      dispatch(
        setLoaderDownload({
          currentBytes: Math.min(totalDownloaded, TOTAL_FILE_BYTES),
          needBytes: TOTAL_FILE_BYTES,
          fileName: DOWNLOAD_FILENAME,
          numberOfDownloads: 0,
        })
      );

      // تحديث شريط الإشعارات العلوي
      const progressPercent = Math.min(100, Math.floor((totalDownloaded / TOTAL_FILE_BYTES) * 100));
      const mbCurrent = (totalDownloaded / (1024 * 1024)).toFixed(1);
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
    background: true,
    discretionary: true,
  });

  currentJobId = downloadTask.jobId;

  try {
    await downloadTask.promise;
    if (watchdogTimer) clearTimeout(watchdogTimer);

    // 7. التحقق الصارم من عدم وجود "تحميل وهمي"
    let finalSize = 0;
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      finalSize = Number(stat.size);
    }

    // إذا كان الحجم المحمّل أقل من الحجم الفعلي للملف
    if (finalSize < TOTAL_FILE_BYTES - 2000) {
      notifee.displayNotification({
        id: 'download_notification',
        title: 'ضعف في تغطية الإنترنت',
        body: 'جاري استئناف باقي التحميل تلقائياً...',
        android: { channelId },
      });

      // استئناف التحميل تلقائياً لاستكمال المتبقي
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // 8. إعلان النجاح الحقيقي عند وصول التحميل لـ 100%
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
        fileName: DOWNLOAD_FILENAME,
        numberOfDownloads: 1,
      })
    );
  } catch (error) {
    console.log('Download error, auto-retry:', error);
    if (watchdogTimer) clearTimeout(watchdogTimer);

    // إعادة المحاولة والاستئناف التلقائي عند قطع النت
    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 4000);
  }
};
