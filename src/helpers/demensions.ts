import { Dimensions } from 'react-native';
import { moderateScale as MODERATE_SCALE } from 'react-native-size-matters';

// بديل وهمي لمعلومات الجهاز لتجاوز نقص المكتبة أثناء التجميع
const DeviceInfo = {
  isTablet: () => false,
  hasNotch: () => false,
  getSystemName: () => 'Android',
  getSystemVersion: () => '11',
  getModel: () => 'Generic',
  getBrand: () => 'Generic',
  isLandscape: () => false,
};

export { DeviceInfo, MODERATE_SCALE };
