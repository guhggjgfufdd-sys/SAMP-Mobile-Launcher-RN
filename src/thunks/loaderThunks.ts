import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

// الحجم الفعلي الكامل لملف اللعبة بالبايت (553.96 MB)
const TOTAL_FILE_BYTES = 580869325;
const DOWNLOAD_URL = 'https://raw.githubusercontent.com/guhggjgfuf/SAMP-Mobile-Launcher-RN/main/2.11.gtasa.zip';
const FILE_NAME = '2.11.gtasa.zip';

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

  // 1. إنشاء قناة الإشعارات في الأندرويد
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

  // 2. تحديث الشاشة بالوضع الابتدائي للتحميل
  dispatch(
    setLoaderDownload({
      currentBytes: 0,
      needBytes: TOTAL_FILE_BYTES,
      fileName: FILE_NAME,
      numberOfDownloads: 0,
    })
  );

  // 3. بدء عملية التنزيل المباشرة
  const downloadTask = RNFS.downloadFile({
    fromUrl: DOWNLOAD_URL,
    toFile: archivePath,
    progressDivider: 1, // تحديث مستمر ومباشر لشريط التقدم
    background: true,
    begin: () => {
      console.log('Download process started successfully.');
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

      // تحديث شريط الإشعارات العلوي للهاتف
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

    // 4. الفحص الدقيق والمحكم لمنع التحميل الوهمي
    let downloadedFileSize = 0;
    const exists = await RNFS.exists(archivePath);
    if (exists) {
      const stat = await RNFS.stat(archivePath);
      downloadedFileSize = Number(stat.size);
    }

    // إذا كان الحجم أقل من الحجم المطلوب (553.96 MB)
    if (downloadedFileSize < TOTAL_FILE_BYTES - 50000) {
      console.log(`Incomplete download detected (${downloadedFileSize} / ${TOTAL_FILE_BYTES}). Retrying...`);

      await notifee.displayNotification({
        id: 'download_notification',
        title: 'انقطع الاتصال قبل إكمال التحميل',
        body: 'جاري إعادة محاولة التحميل تلقائياً...',
        android: { channelId },
      });

      // إعادة المحاولة تلقائياً بعد 3 ثوانٍ عند ضعف الشبكة
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // 5. إعلان الاكتمال الحقيقي عند وصول الملف لـ 553.96 MB بالكامل
    await notifee.displayNotification({
      id: 'download_notification',
      title: 'تم اكتمال التحميل بنجاح! 🎮',
      body: 'ملفات اللعبة جاهزة للفك والتثبيت.',
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
      title: 'ضعف في تغطية الإنترنت',
      body: 'جاري إعادة الاتصال ومتابعة التحميل...',
      android: { channelId },
    });

    // عند انقطاع النت كلياً، إعادة المحاولة بعد 3 ثوانٍ
    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 3000);
  }
};
