import { Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325; // الحجم المطلوب 553.96 MB
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

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
  // 1. إيقاف أي عملية تحميل معلقة لتفادي التجميد
  if (activeJobId !== null) {
    try {
      RNFS.stopDownload(activeJobId);
    } catch (e) {}
    activeJobId = null;
  }

  // 📍 [مكان حفظ الملف]: المجلد الداخلي الخاص بالتطبيق
  const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;

  try {
    await RNFS.mkdir(RNFS.DocumentDirectoryPath);
  } catch (e) {}

  // 2. إعداد قناة الإشعارات
  let channelId = 'download_channel';
  try {
    channelId = await notifee.createChannel({
      id: 'download_channel',
      name: 'Game Download',
      importance: AndroidImportance.LOW,
    });
  } catch (e) {}

  // 3. تصفير الواجهة
  dispatch(
    setLoaderDownload({
      currentBytes: 0,
      needBytes: TOTAL_FILE_BYTES,
      fileName: FILE_NAME,
      numberOfDownloads: 0,
    })
  );

  // 📁 [فحص الملفات المحفوظة سابقاً]: إذا كان الملف محملاً بـ 100% سابقاً يتخطى التحميل
  try {
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      if (Number(stat.size) >= TOTAL_FILE_BYTES - 100000) {
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
      // إذا كان الملف ناقصاً أو معطوباً، يحذفه لنبدأ تحميلاً كاملاً
      await RNFS.unlink(archivePath);
    }
  } catch (e) {}

  // 4. بدء التحميل وتخزين البيانات في المسار المحفوظ
  const downloadTask = RNFS.downloadFile({
    fromUrl: DOWNLOAD_URL,
    toFile: archivePath, // 👈 هنا يتم حفظ الأجزاء المحملة في الذاكرة
    progressDivider: 1,
    background: false,
    connectionTimeout: 30000,
    readTimeout: 30000,
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

  activeJobId = downloadTask.jobId;

  try {
    await downloadTask.promise;
    activeJobId = null;

    // 🛑 [منع التحميل الوهمي]: الفحص الحقيقي لحجم الملف المحفوظ على الذاكرة
    let downloadedSize = 0;
    if (await RNFS.exists(archivePath)) {
      const stat = await RNFS.stat(archivePath);
      downloadedSize = Number(stat.size);
    }

    // لو انقطع النت واكتمل التحميل شكلياً بحجم أقل من (553.96 MB)
    if (downloadedSize < TOTAL_FILE_BYTES - 100000) {
      Alert.alert('تحميل غير مكتمل', 'انقطع الاتصال قبل إكمال الملف. جاري إعادة المحاولة...');
      setTimeout(() => {
        dispatch(fetchStartDownload() as any);
      }, 3000);
      return;
    }

    // ✅ اكتمال التحميل الحقيقي والتأكد من الملف 100%
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
  } catch (error: any) {
    activeJobId = null;
    console.log('Download Error:', error);
    Alert.alert('خطأ أثناء التنزيل', error?.message || 'تعذر الاتصال بالسيرفر');
  }
};
