import { setDistribution } from '../actions/distributionActions';
import { compareFileRecursion } from './loaderThunks';
import { AppThunk } from '../store/store';

export const fetchDistribution = (): AppThunk => async (dispatch) => {
  try {
    const cdnBaseUrl = 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0';
    const fileName = '2.11.gtasa.zip';
    
    // حجم 500 ميجابايت بالبايت
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

    dispatch(compareFileRecursion({ caches: cacheNode }));
  } catch (error) {
    console.error('Error setting distribution:', error);
  }
};

