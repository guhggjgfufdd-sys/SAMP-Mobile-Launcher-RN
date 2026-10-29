import { CACHE_URL, SERVER_ADDRESS } from '../config/launcher';

    export const DistributionService = {
      async get() {
        return {
          cdnLauncher: '',
          cdnCache: CACHE_URL,
          cacheMode: [],
          rss: '',
          versionHash: '1.0.1',
          packageName: 'com.touch.mobile.dark',
          projectName: 'Nightshift',
          servers: [
            {
              id: 1,
              show: true,
              version: '0.3.DL',
              icon: '',
              events: [],
              slot: 100,
              bonus: false,
              name: 'SA-MP Server',
              description: 'SA-MP',
              address: SERVER_ADDRESS,
              sampVersion: '0.3.DL',
            },
          ],
          launcher: {
            appVersion: '1.0.1',
            name: 'launcher.apk',
            hash: '',
            bytes: 1,
            size: '1',
          },
          filesContinue: [],
        };
      },
    };

    export type DistributionResponse = {
      cdnLauncher: string;
      cdnCache: string;
      cacheMode: any[];
      rss: string;
      versionHash: string;
      packageName: string;
      projectName: string;
      servers: ServerType[];
      launcher: LauncherType;
      filesContinue: string[];
    };

    export type LauncherType = {
      appVersion: string;
      name: string;
      hash: string;
      bytes: number;
      size: string;
    };

    export type EventType = { title: string; style: 'red' | 'blue' };

    export type ServerType = {
      id: number;
      show: boolean;
      version: string;
      icon: string;
      events: EventType[];
      slot: number;
      bonus: boolean;
      name: string;
      description: string;
      address: string;
      sampVersion: string;
    };
    