import { NativeModules, Platform } from 'react-native';

const { GtaSetupModule } = NativeModules;

interface ServerData {
  address: string;
  name: string;
  playerName: string;
}

export const launchGame = (serverData: ServerData): void => {
  if (Platform.OS === 'android') {
    GtaSetupModule.launchGame(serverData);
  } else {
    console.warn('launchGame is only supported on Android');
  }
};

export default GtaSetupModule;
