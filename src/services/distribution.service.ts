import axios from 'axios';

export const DistributionService = {
  async get() {
    return {
      cdnLauncher: '',
      cdnCache: 'https://github.com/guhggjgfufdd-sys/SAMP-Mobile-Launcher-RN/releases/download/v1.0/2.11.gtasa.zip',
      cache: [],
      rss: '',
      versionHash: '1.0.0',
      packageName: 'com.lasventuras.samp',
      projectName: 'Las Venturas RP',
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
          address: '142.132.203.47:2129',
          sampVersion: '0.3.7',
        },
      ],
      launcher: {
        appVersion: '1.0.0',
        name: 'launcher.apk',
        hash: '',
        bytes: 0,
        size: '0',
      },
      filesContinue: [],
    };
  },
};

export type DistributionResponse = {
  cdnLauncher: string;
  cdnCache: string;
  cache: any[];
  rss: string;
  versionHash: string;
  packageName: string;
  projectName: string;
  servers: ServerType[];
  launcher: LauncherType;
  filesContinue: string[];
};

type LauncherType = {
  appVersion: string;
  name: string;
  hash: string;
  bytes: number;
  size: string;
};

type EventType = {
  title: string;
  style: 'red' | 'blue';
};

type ServerType = {
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
