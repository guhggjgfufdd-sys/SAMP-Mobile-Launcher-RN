export const DistributionService = {
  async get() {
    return {
      cdnLauncher: '',
      cdnCache: 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip',
      cacheMode: [],
      rss: '',
      versionHash: '1.0.0',
      packageName: 'com.touch.mobile.dark',
      projectName: 'Touch Mobile Dark',
      servers: [
        {
          id: 1,
          show: true,
          version: '0.3.7',
          icon: '',
          events: [],
          slot: 100,
          bonus: false,
          name: 'Las Venturas RP',
          description: 'Main Server',
          address: '142.132.203.47:21299',
          sampVersion: '0.3.7',
        },
      ],
      launcher: {
        appVersion: '1.0.0',
        name: 'launcher.apk',
        hash: 'd41d8cd98f00b204e9800998ecf8427e',
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

export type EventType = {
  title: string;
  style: 'red' | 'blue';
};

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
  sampV
