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
import { fetchStartDownload } from '../../thunks/loaderThunks';

const width = Dimensions.get('window').width;

export const DownloadScreen = React.memo(() => {
  const download = useAppSelector(selectLoaderDownload);
  const compare = useAppSelector(selectCompare);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchStartDownload());
  }, []);

  // إضافة حماية من القيم الفارغة لمنع الانهيار
  const numberOfDownloads =
    (compare?.successCount || 0) + (download?.numberOfDownloads || 0);

  const totalCacheBytes = compare?.distributionCacheBytes || 1;
  const downloadedCacheBytes =
    (download?.downloadBytes || 0) + (compare?.downloadsCacheBytes || 0);

  let loaders = Math.floor((downloadedCacheBytes * 100) / totalCacheBytes);

  if (isNaN(loaders) || !isFinite(loaders)) {
    loaders = 0;
  }

  return (
    <LoaderContainer>
      <KeepAwake />
      <Text style={[styles.title, styles.titleUppercase]}>جاري تحميل اللعبة...</Text>
      <View>
        <Text style={styles.progressTitle}>
          <Text style={styles.progressName}>
            {download?.fileName || 'ملفات اللعبة'}
          </Text>
          <Text style={styles.progressMemory}>
            {' '}
            {formatSizeUnits(download?.currentBytes || 0)} من {' '}
            {formatSizeUnits(download?.needBytes || 0)}
          </Text>
        </Text>

        <Progress.Bar
          progress={loaders / 100 < 0.001 ? 0 : loaders / 100}
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
          {(compare?.successCount || 0) + (compare?.rejectCount || 0)}
        </Text>
        <Text style={styles.progressPercent}>{loaders > 0 ? loaders : 0}%</Text>
      </View>
    </LoaderContainer>
  );
});
