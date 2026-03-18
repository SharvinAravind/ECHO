import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.echowrite.app',
  appName: 'EchoWrite',
  webDir: 'web/dist',
  server: {
    androidScheme: 'https',
    hostname: 'echo-gamma-seven.vercel.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
