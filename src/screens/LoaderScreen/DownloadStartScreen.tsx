import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import { DownloadSvg } from '../../assets/svg/index';
import { ButtonLauncher, LoaderContainer } from '../../components';
import { usePermissionFile } from '../../hooks/usePermissionFile';
import { useSpaceDownload } from '../../hooks/useSpaceDownload';
import { styles } from '../../styles/LoaderStyle';

type InitiationScreenType = NativeStackScreenProps<any>;

export const DownloadStartScreen = React.memo(
  ({ navigation }: InitiationScreenType) => {
    const { fetchPermision } = usePermissionFile();
    const { fetchSpace } = useSpaceDownload();

    const onPressDownload = () => {
      // تم إلغاء فحص الصلاحية والمساحة لتجاوز التجمّد والانتقال للتحميل فوراً
      /*
      if (!fetchPermision()) {
        return;
      }

      if (!fetchSpace()) {
        return;
      }
      */

      return navigation.replace('DownloadScreen');
    };

    return (
      <LoaderContainer>
        <Text style={styles.titleSub}>Привет 👋</Text>
        <Text style={styles.subtitle}>
          Рады видеть тебя на{'\n'}
          нашем проекте!
        </Text>
        <View style={styles.buttons}>
          <ButtonLauncher
            btnWidth={'100%'}
            background={'#5476db'}
            IconLeft={DownloadSvg}
            onPress={onPressDownload}
          >
            Скачать игру
          </ButtonLauncher>
        </View>
      </LoaderContainer>
    );
  },
);
