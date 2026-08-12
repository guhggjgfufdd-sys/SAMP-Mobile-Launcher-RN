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
    const filesContinue = state().distribution.filesContinue;
    const gpuSystem = state().app.gpu;
    const nodeType = state().settings.nodeType;
    const { freeSpace } = await RNFS.getFSInfo();

    let [
      needDownload,
      rejectCount,
      successCount,
      distributionCacheBytes,
      downloadsCacheBytes,
      needDownloadsCacheBytes,
    ] = [[], 0, 0, 0, 0, 0];

    for await (const cache of caches) {
      const { path, bytes, name, gpu: gpuCache } = cache;
      const bytesValid = bytes.length > 1 ? bytes[nodeType] : bytes[0];

      const isValidCache = await FileValidate.isValidCache({
        gpuCache,
        gpuSystem,
        path,
        name,
        bytes: bytesValid,
        filesContinue,
      });

      if (isValidCache === 'success') {
        downloadsCacheBytes += bytesValid;
        successCount++;
        distributionCacheBytes += bytesValid;
      } else if (isValidCache === 'download') {
        needDownload.push(cache);
        needDownloadsCacheBytes += bytesValid;
        rejectCount++;
        distributionCacheBytes += bytesValid;
      }
    }

    const isSuccessDownload = await AsyncStorage.getItem('isSuccessDownload');

    dispatch(
      setCompare({
        compare: {
          successCount,
          rejectCount,
          distributionCacheBytes,
          downloadsCacheBytes,
          needDownloadsCacheBytes,
        },
        needDownload,
        freeSpace,
        isSuccessDownload: isSuccessDownload === 'true' ? true : false,
      }),
    );
  };

export const fetchStartDownload = (): AppThunk => async (dispatch, state) => {
  const { cdnCache } = state().distribution;
  const { rejectCount } = state().loader.compare;
  const { needDownload } = state().loader;
  const nodeType = state().settings.nodeType;

  let numberOfDownloads = 0;
  let downloadBytes = 0;

  dispatch(createPushNotificationLoader());

  dispatch(
    onUploadTaskEventLoader({
      status: 'download',
      sizeFile: 0,
      currentFile: rejectCount,
      size: 0,
      current: rejectCount,
      file: '',
    }),
  );

  for await (const cache of needDownload) {
    const { id, path: toFile, name: toName, bytes } = cache;
    const bytesValid = bytes.length > 1 ? bytes[nodeType] : bytes[0];
    const urlValid =
      bytes.length > 1 && nodeType > 0 ? cdnCache + '_snow' : cdnCache;

    try {
      dispatch(
        setDownloadLoader({
          download: {
            fileName: toName,
            currentBytes: 0,
            needBytes: bytesValid,
            numberOfDownloads,
            downloadBytes,
          },
        }),
      );

      const res = await FileDownload.download({
        fromUrl: toFile ? `${urlValid}/${toFile}/${toName}` : `${urlValid}/${toName}`,
        toFile,
        toName,
        progress: ({ bytesWritten }: DownloadProgressType) => {
          dispatch(
            setDownloadLoader({
              download: {
                currentBytes: bytesWritten,
                downloadBytes: downloadBytes + bytesWritten,
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
            sizeFile: numberOfDownloads,
            currentFile: rejectCount,
            size: numberOfDownloads,
            current: rejectCount,
            file: toName,
          }),
        );

        dispatch(
          setDownloadLoader({
            download: {
              numberOfDownloads,
              downloadBytes,
            },
          }),
        );

        dispatch(setCacheReject(id));
      }
    } catch (error) {
      dispatch(onUploadTaskEventLoader({ status: 'complete' }));
      // return navigationRef.current?.dispatch(StackActions.replace('Error'));
    }
  }

  dispatch(onUploadTaskEventLoader({ status: 'complete' }));
  dispatch(fetchIsDownloadSuccess());
  // return navigationRef.current?.dispatch(StackActions.replace('Main'));
};

export const nameFileRecursion = (): AppThunk => async (dispatch, state) => {
  const cacheNode = state().distribution.cacheNode;
  const gpuSystem = state().app.gpu;
  const nodeType = state().settings.nodeType;
  let needDownload = [0, 0];

  for await (const cache of cacheNode) {
    const { path, name, gpu: gpuCache } = cache;

    const isValid = await FileValidate.isValidGpu({ gpuCache, gpuSystem });
    if (isValid) {
      try {
        const res = await FileName.reversFiles(path, name, nodeType);
        needDownload[nodeType] += res[nodeType];
      } catch (e) {}
    }
  }

  return needDownload[0] > 0;
};

export const fetchIsDownloadSuccess = (): AppThunk => async dispatch => {
  try {
    await AsyncStorage.setItem('isSuccessDownload', 'true');
    dispatch(setSuccessDownload({ isSuccessDownload: true }));
  } catch (error) {
    dispatch(setSuccessDownload({ isSuccessDownload: false }));
  }
};

