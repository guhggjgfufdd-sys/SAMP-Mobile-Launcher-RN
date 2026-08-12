import KeepAwake from '@sayem314/react-native-keep-awake';
import React, { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { verticalScale } from 'react-native-size-matters';
import { LoaderContainer } from '../../components/Provider/LoaderContainer';
import { formatSizeUnits } from '../../helpers';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  selectCompare,
  selectLoaderDownload,
} from '../../selectors/loaderSelectors';
import { styles } from '../../styles/LoaderStyle';
import { compareFileRecursion, fetchStartDownload } from '../../thunks/loaderThunks';

const width = Dimensions.get('window').width;
const DEFAULT_TOTAL_BYTES = 524288000; // الحجم الكلي الافتراضي 500 ميجابايت

export const DownloadScreen = React.memo(() => {
  const download = useAppSelector(selectLoaderDownload);
  const compare = useAppSelector(selectCompare);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(compareFileRecursion({ caches: [] }));
    dispatch(fetchStartDownload());
  }, []);

  const numberOfDownloads =
    (compare?.successCount || 0) + (download?.numberOfDownloads || 0);

  // تحديد الحجم الكلي للعبة بدقة (500 ميجابايت)
  let totalCacheBytes = DEFAULT_TOTAL_BYTES;
  if (compare?.distributionCacheBytes && compare.distributionCacheBytes > 1000000) {
    totalCacheBytes = compare.distributionCacheBytes;
  } else if (download?.needBytes && download.needBytes > 1000000) {
    totalCacheBytes = download.needBytes;
  }

  // الحجم المحمل حالياً
  const downloadedCacheBytes = download?.currentBytes || download?.downloadBytes || 0;

  // النسبة المئوية محصورة دائماً من 0 إلى 100%
  const rawPercentage = (downloadedCacheBytes / totalCacheBytes) * 100;
  const percentage = Math.min(100, Math.max(0, Math.floor(rawPercentage)));

  // نسبة حركة الشريط البنفسجي من 0.0 إلى 1.0 لتحريكه بسلاسة
  const progressRatio = Math.min(1.0, Math.max(0.0, downloadedCacheBytes / totalCacheBytes));

  return (
    <LoaderContainer>
      <KeepAwake />
      <Text style={[styles.title, styles.titleUppercase]}>جاري تحميل اللعبة...</Text>
      <View>
        <Text style={styles.progressTitle}>
          <Text style={styles.progressName}>
            {download?.fileName || '2.11.gtasa.zip'}
          </Text>
          <Text style={styles.progressMemory}>
            {' '}
            {formatSizeUnits(downloadedCacheBytes)} / {formatSizeUnits(totalCacheBytes)}
          </Text>
        </Text>

        <Progress.Bar
          progress={progressRatio}
          animated={true}
          useNativeDriver={true}
          borderWidth={0}
          color={'#A647F4'}
          unfilledColor={'#2F3545'}
          borderRadius={20}
          height={10}
          width={width - verticalScale(40)}
        />

        <Text style={styles.progressSubtitle}>
          تحميل ملفات اللعبة ({numberOfDownloads}) من {' '}
          {(compare?.successCount || 0) + (compare?.rejectCount || 1)}
        </Text>
        <Text style={styles.progressPercent}>{percentage}%</Text>
      </View>
    </LoaderContainer>
  );
});

