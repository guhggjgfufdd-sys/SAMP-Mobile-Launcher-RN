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

    // 1. مسح حالة التحميل السابقة المخبأة في ذاكرة الهاتف
    await AsyncStorage.removeItem('isSuccessDownload');

    const downloadItem = {
      id: 1,
      path: '',
      name: fileName,
      bytes: [fileSize, fileSize],
      gpu: 'all',
    };

    const needDownload = [downloadItem];

    // 2. تحديث الشاشة فوراً بالحجم الحقيقي 500 ميجابايت
    dispatch(
      setCompare({
        compare: {
          successCount: 0,
          rejectCount: 1,
          distributionCacheBytes: fileSize,
          downloadsCacheBytes: 0,
          needDownloadsCacheBytes: fileSize,
        },
        needDownload: needDownload,
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

  // في حال كانت القائمة فارغة لأي سبب، يتم ملؤها تلقائياً
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

  let numberOfDownloads = 0;
  let downloadBytes = 0;

  dispatch(createPushNotificationLoader());

  dispatch(
    onUploadTaskEventLoader({
      status: 'download',
      sizeFile: 0,
      currentFile: 1,
      size: 1,
      current: 1,
      file: fileName,
    }),
  );

  for await (const cache of needDownload) {
    const { id, path: toFile, name: toName, bytes } = cache;
    const bytesValid = bytes[0] || fileSize;

    try {
      dispatch(
        setDownloadLoader({
          download: {
            fileName: toName,
            currentBytes: 0,
            needBytes: bytesValid,
            numberOfDownloads: 0,
            downloadBytes: 0,
          },
        }),
      );

      const downloadUrl = `${cdnBaseUrl}/${toName}`;

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
                needBytes: bytesValid,
              },
            }),
          );
        },
      });

      if (res.statusCode === 200) {
        numberOfDownloads++;
        downloadBytes += bytesValid;

        dispatch(
          onUploadTaskEventLoader({
            status: 'download',
            sizeFile: 1,
            currentFile: 1,
            size: 1,
            current: 1,
            file: toName,
          }),
        );

        dispatch(
          setDownloadLoader({
            download: {
              numberOfDownloads: 1,
              downloadBytes: bytesValid,
            },
          }),
        );

        dispatch(setCacheReject(id));
      }
    } catch (error) {
      console.error('Download error:', error);
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

