import { NativeModules } from 'react-native';

const { GtaSetupModule } = NativeModules;

interface ServerData {
  address: string;
  name: string;
  playerName: string;
}

export default {
  startGame: () => GtaSetupModule.startGame(),
  
  // ← الدالة الجديدة
  launchGame: (data: ServerData) => GtaSetupModule.launchGame(data),
};
