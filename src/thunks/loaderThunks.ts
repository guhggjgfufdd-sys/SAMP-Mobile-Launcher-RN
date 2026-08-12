import { Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';
import { setCompare, setLoaderDownload } from '../reducers/loaderReducer';

const TOTAL_FILE_BYTES = 580869325;
const FILE_NAME = '2.11.gtasa.zip';
const DOWNLOAD_URL = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip';

let isDownloadingActive = false;

export const compareFileRecursion = ({ caches }: { caches: any[] }) => async (dispatch: any) => {
  dispatch(setCompare({ distributionCacheBytes: TOTAL_FILE_BYTES, downloadsCacheBytes: 0, rejectCount: 0, successCount: 0 }));
};

export const fetchStartDownload = () => async (dispatch: any) => {
  if (isDownloadingActive) return;
  isDownloadingActive = true;

  const archivePath = `${RNFS.DocumentDirectoryPath}/${FILE_NAME}`;
  
  // تصفير الواجهة
  dispatch(setLoaderDownload({ currentBytes: 0, needBytes: TOTAL_FILE_BYTES, fileName: FILE_NAME, numberOfDownloads: 0 }));

  try {
    // اختبار الاتصال أولاً
    const checkConn = await fetch(DOWNLOAD_URL, { method: 'HEAD' });
    console.log('Server Reachability Check:', checkConn.status);

    if (checkConn.status !== 200 && checkConn.status !== 302) {
      Alert.alert('خطأ في الاتصال', `السيرفر رفض الاتصال برمز: ${checkConn.status}`);
      return;
    }

    // بدء التحميل
    const downloadTask = RNFS.downloadFile({
      fromUrl: DOWNLOAD_URL,
      toFile: archivePath,
      background: false,
      progressDivider: 1,
      begin: (res) => {
        console.log('Download started. Status:', res.statusCode);
      },
      progress: (res) => {
        const currentBytes = Number(res.bytesWritten);
        dispatch(setLoaderDownload({ currentBytes: currentBytes, needBytes: TOTAL_FILE_BYTES, fileName: FILE_NAME, numberOfDownloads: 0 }));
      },
    });

    const result = await downloadTask.promise;
    
    if (result.statusCode === 200) {
      dispatch(setLoaderDownload({ currentBytes: TOTAL_FILE_BYTES, needBytes: TOTAL_FILE_BYTES, fileName: FILE_NAME, numberOfDownloads: 1 }));
    } else {
      Alert.alert('فشل التحميل', `الخادم عاد بكود: ${result.statusCode}`);
    }

  } catch (error: any) {
    isDownloadingActive = false;
    console.log('CRITICAL DOWNLOAD ERROR:', error);
    Alert.alert('خطأ فني', `لا يمكن الاتصال بالخادم: ${error.message}`);
  }
};
