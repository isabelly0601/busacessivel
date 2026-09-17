import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaideonibus.app',
  appName: 'Vai de Ônibus',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
