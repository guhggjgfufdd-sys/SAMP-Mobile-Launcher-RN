import { NativeModules } from 'react-native';

    type GameLaunchData = { address: string; playerName: string };
    type GtaSetupNativeModule = { launchGame: (data: GameLaunchData) => Promise<void> };
    const nativeModule = NativeModules.GtaSetupModule as GtaSetupNativeModule | undefined;

    export default {
      launchGame: (data: GameLaunchData) => {
        if (!nativeModule?.launchGame) {
          return Promise.reject(new Error('وحدة تشغيل اللعبة غير متاحة في هذا البناء.'));
        }
        return nativeModule.launchGame(data);
      },
    };
    