import { setDistribution } from '../actions/distributionActions';
import { setCompare } from '../actions/loaderActions';
import { AppThunk } from '../store/store';

export const fetchDistribution = (): AppThunk => async (dispatch) => {
  try {
    const cdnBaseUrl = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0';
    const fileName = '2.11.gtasa.zip';
    
    // حجم الملف: 500 ميجابايت بالبايتات بالضبط
    const fileSize = 524288000; 

    const cacheNode = [
      {
        id: 1,
        path: '',
        name: fileName,
        bytes: [fileSize],
        gpu: 'all',
      },
    ];

    dispatch(
      setDistribution({
        cdnCache: cdnBaseUrl,
        filesContinue: true,
        cacheNode: cacheNode,
      }),
    );

    dispatch(
      setCompare({
        compare: {
          successCount: 0,
          rejectCount: 1,
          distributionCacheBytes: fileSize,
          downloadsCacheBytes: 0,
          needDownloadsCacheBytes: fileSize,
        },
        needDownload: cacheNode,
        freeSpace: 10000000000,
        isSuccessDownload: false,
      }),
    );
  } catch (error) {
    console.error('Error setting local distribution:', error);
  }
};
