import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './RangeLauncherStyle';

// بديل وهمي لشريط التمرير لتجاوز نقص المكتبة أثناء التجميع
const Slider = (_props: any) => null;

export const RangeLauncher = (props: any) => {
  return (
    <View style={styles.container}>
      {props.title && <Text style={styles.title}>{props.title}</Text>}
      <Slider {...props} />
    </View>
  );
};

export default RangeLauncher;
