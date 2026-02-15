import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yomy.ramdan',
  appName: 'يومي في رمضان',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#D4A84B',
      sound: 'beep.wav',
    },
  },
};

export default config;
