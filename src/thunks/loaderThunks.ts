import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

// الحجم الفعلي المطلوب لملف اللعبة بالبايت (553.96 MB)
const TOTAL_FILE_BYTES = 580869325;
const FILE_NAME = '2.11.gtasa.zip';

// الرابط الخاص بك
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

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
  const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

  // 1. إعداد قناة إشعارات الأندرويد
  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e) {
    console.log('Notification channel setup error:', e);
  }

  // 2. الفحص المبكر: إذا كان الملف محملاً سابقاً بالكامل وبحجمه الصحيح
  if (await RNFS.exists(archivePath)) {
    try {
      const existingStat = await RNFS.stat(archivePath);
      if (Number(existingStat.size) >= TOTAL_FILE_BYTES - 100000) {
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

  // 3. تهيئة الواجهة لبدء التنزيل
  dispatch(
    setLoaderDownload({
      currentBytes: 0,
      needBytes: TOTAL_FILE_BYTES,
      fileName: FILE_NAME,
      numberOfDownloads: 0,
    })
  );

  // 4. بدء عملية التحميل
  const downloadTask = RNFS.downloadFile({
    fromUrl: DOWNLOAD_URL,
    toFile: archivePath,
    progressDivider: 1, // لتحديث شريط التقدم بسلاسة بدون تقطيع
    background: true,
    begin: (res) => {
      console.log('Download task started, status code:', res.statusCode);
    },
    progress: (res) => {
      const currentBytes = Number(res.bytesWritten);

      // تحديث شاشة اللانشر (Redux State)
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

  try {
    await downloadTask.promise;

    // 5. الفحص الصارم لمنع التنزيل الوهمي عند انقطاع النت
    let downloadedSize = 0;
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      downloadedSize = Number(stat.size);
    }

    // إذا انتهى التحميل وكان الحجم أقل من 553.96 MB (بسبب انقطاع الشبكة)
    if (downloadedSize < TOTAL_FILE_BYTES - 100000) {
      console.log('Incomplete download detected! Retrying automatically...');

      await notifee.displayNotification({
        id: 'download_notification',
        title: 'ضعف أو انقطاع في الشبكة',
        body: 'جاري إعادة محاولة التحميل تلقائياً...',
        android: { channelId },
      });

      // إعادة المحاولة تلقائياً بعد 3 ثوانٍ
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // 6. إعلان الاكتمال الحقيقي والفعلي
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
    console.log('Download connection failed, retrying in 3s:', error);

    await notifee.displayNotification({
      id: 'download_notification',
      title: 'تعذر الاتصال بالشبكة',
      body: 'جاري إعادة المحاولة والتوصيل تلقائياً...',
      android: { channelId },
    });

    // إعادة التوصيل والمحاولة تلقائياً عند انقطاع النت كلياً
    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 3000);
  }
};
