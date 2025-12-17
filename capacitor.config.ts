import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pagerking.app',
  appName: 'PagerKing',
  webDir: 'build', // <-- this is important
  bundledWebRuntime: false
};

export default config;