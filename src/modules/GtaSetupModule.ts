import { NativeModules } from 'react-native';

const { GtaSetupModule } = NativeModules;

export default {
  startGame: () => GtaSetupModule.startGame(),
  launchGame: (data: any) => GtaSetupModule.launchGame(data),
};
