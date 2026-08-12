import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const RAW_DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

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

  // التأكد من وجود المجلد
  try {
    await RNFS.mkdir(RNFS.DocumentDirectoryPath);
  } catch (e) {}

  // 1. إعداد قناة الإشعارات
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

  // 2. تصفير واجهة اللانشر
  dispatch(
    setLoaderDownload({
      currentBytes: 0,
      needBytes: TOTAL_FILE_BYTES,
      fileName: FILE_NAME,
      numberOfDownloads: 0,
    })
  );

  // 3. استخراج الرابط المباشر المباشر المرفوع على الأمازون (objects.githubusercontent.com)
  let finalUrl = RAW_DOWNLOAD_URL;
  try {
    const controller = new AbortController();
    const response = await fetch(RAW_DOWNLOAD_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    if (response.url && response.url !== RAW_DOWNLOAD_URL) {
      finalUrl = response.url;
      console.log('Direct Amazon S3 URL extracted:', finalUrl);
    }
    controller.abort(); // إلغاء السحب عبر fetch بعد أخذ الرابط المباشر
  } catch (e) {
    console.log('Fetched redirect successfully or skipped:', e);
  }

  // 4. بدء التحميل بالرابط المباشر النهائي
  const downloadTask = RNFS.downloadFile({
    fromUrl: finalUrl,
    toFile: archivePath,
    progressDivider: 1,
    background: false,
    begin: (res) => {
      console.log('Download task started with HTTP code:', res.statusCode);
    },
    progress: (res) => {
      const currentBytes = Number(res.bytesWritten);

      // تحديث شاشة التطبيق
      dispatch(
        setLoaderDownload({
          currentBytes: currentBytes,
          needBytes: TOTAL_FILE_BYTES,
          fileName: FILE_NAME,
          numberOfDownloads: 0,
        })
      );

      // تحديث شريط الإشعارات
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
            progress: {
              max: 100,
              current: progressPercent,
            },
          },
        });
      } catch (e) {}
    },
  });

  try {
    await downloadTask.promise;
    isDownloadingActive = false;

    // 5. التأكد من حجم الملف لمنع التحميل الوهمي
    let downloadedSize = 0;
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      downloadedSize = Number(stat.size);
    }

    if (downloadedSize < TOTAL_FILE_BYTES - 100000) {
      await notifee.displayNotification({
        id: 'download_notification',
        title: 'انقطع الاتصال بالشبكة',
        body: 'جاري إعادة المحاولة تلقائياً...',
        android: { channelId },
      });

      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // 6. اكتمال التحميل الحقيقي
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
    console.log('Download failed, retrying:', error);
    isDownloadingActive = false;

    setTimeout(() => {
      dispatch(fetchStartDownload() as any);
    }, 4000);
  }
};
