import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import {
  CacheType,
  setCacheReject,
  setCompare,
  setDownloadLoader,
  setSuccessDownload,
} from '../actions/loaderActions';
import {
  DownloadProgressType,
  FileDownload,
  FileName,
  FileValidate,
  FileUnzip,
} from '../features/fileManager';
import { navigationRef } from '../routers/RootNavigation';
import { AppThunk } from '../store/store';
import {
  createPushNotificationLoader,
  onUploadTaskEventLoader,
} from './notificationThunks';

export const compareFileRecursion =
  ({ caches }: { caches: CacheType[] }): AppThunk =>
  async (dispatch, state) => {
    const fileSize = 524288000; // 500 MB
    const fileName = '2.11.gtasa.zip';

    await AsyncStorage.removeItem('isSuccessDownload');

    const downloadItem = {
      id: 1,
      path: '',
      name: fileName,
      bytes: [fileSize, fileSize],
      gpu: 'all',
    };

    dispatch(
      setCompare({
        compare: {
          successCount: 0,
          rejectCount: 1,
          distributionCacheBytes: fileSize,
          downloadsCacheBytes: 0,
          needDownloadsCacheBytes: fileSize,
        },
        needDownload: [downloadItem],
        freeSpace: 10000000000,
        isSuccessDownload: false,
      }),
    );
  };

export const fetchStartDownload = (): AppThunk => async (dispatch, state) => {
  const fileSize = 524288000;
  const fileName = '2.11.gtasa.zip';
  const cdnBaseUrl =
    'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0';

  let needDownload = state().loader.needDownload;

  if (!needDownload || needDownload.length === 0) {
    needDownload = [
      {
        id: 1,
        path: '',
        name: fileName,
        bytes: [fileSize, fileSize],
        gpu: 'all',
      },
    ];
  }

  dispatch(createPushNotificationLoader());

  for await (const cache of needDownload) {
    const { id, path: toFile, name: toName } = cache;
    const downloadUrl = `${cdnBaseUrl}/${toName}`;

    try {
      dispatch(
        setDownloadLoader({
          download: {
            fileName: toName,
            currentBytes: 0,
            needBytes: fileSize,
            numberOfDownloads: 0,
            downloadBytes: 0,
          },
        }),
      );

      // 1. تنزيل الملف
      const res = await FileDownload.download({
        fromUrl: downloadUrl,
        toFile: toFile || '',
        toName: toName,
        progress: ({ bytesWritten }: DownloadProgressType) => {
          dispatch(
            setDownloadLoader({
              download: {
                currentBytes: bytesWritten,
                downloadBytes: bytesWritten,
                needBytes: fileSize,
              },
            }),
          );
        },
      });

      // 2. بدء فك الضغط عبر نظام اللانشر المدمج
      if (res.statusCode === 200) {
        dispatch(
          onUploadTaskEventLoader({
            status: 'unzip',
            file: toName,
          }),
        );

        const targetDir = `${RNFS.ExternalStorageDirectoryPath}/Android/data/com.rockstargames.gtasa/files`;
        const zipFilePath = `${targetDir}/${toName}`;

        await RNFS.mkdir(targetDir).catch(() => {});

        if (await RNFS.exists(zipFilePath)) {
          // استخدام دالة فك الضغط المدمجة في اللانشر
          await FileUnzip.unzip(zipFilePath, targetDir).catch(() => {});
          await RNFS.unlink(zipFilePath).catch(() => {});
        }

        dispatch(setCacheReject(id));
      }
    } catch (error) {
      console.error('Download/Unzip Error:', error);
      dispatch(onUploadTaskEventLoader({ status: 'complete' }));
    }
  }

  dispatch(onUploadTaskEventLoader({ status: 'complete' }));
  dispatch(fetchIsDownloadSuccess());
};

export const nameFileRecursion = (): AppThunk => async (dispatch, state) => {
  return true;
};

export const fetchIsDownloadSuccess = (): AppThunk => async dispatch => {
  try {
    await AsyncStorage.setItem('isSuccessDownload', 'true');
    dispatch(setSuccessDownload({ isSuccessDownload: true }));
  } catch (error) {
    dispatch(setSuccessDownload({ isSuccessDownload: false }));
  }
};

