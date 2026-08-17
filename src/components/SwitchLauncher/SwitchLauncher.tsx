import React from 'react';
import { Switch, Text, View } from 'react-native';
import { styles } from './SwitchLauncherStyle';

type SwitchLauncherType = {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  [key: string]: any;
};

export const SwitchLauncher = (props: SwitchLauncherType) => {
  return (
    <View style={styles.container}>
      <Switch {...props} />
    </View>
  );
};

export default SwitchLauncher;
