import type { CapacitorConfig } from '@capacitor/cli';

// Hush — Capacitor v7 configuration for the iOS App Store build.
// The web build (Vite output in `dist/`) is wrapped in a native shell.
// Web v1 (main branch, snowglobe-breath.netlify.app) stays untouched —
// this config only takes effect on the v2-hush branch + iOS build.
const config: CapacitorConfig = {
  appId: 'app.hush.breath',
  appName: 'Hush',
  webDir: 'dist',
  // Server is intentionally undefined: the iOS build serves the bundled
  // web assets locally, no live server. (Capacitor will auto-detect
  // capacitor:// scheme.)
  ios: {
    contentInset: 'always',         // respect safe areas (notch, home indicator)
    backgroundColor: '#01030a',     // matches the Hush deep-night background
    // iOS-specific quirks:
    scrollEnabled: false,           // we're full-screen, no scroll
  },
  plugins: {
    // The status bar overlays our deep-blue scene; keep it transparent
    // and don't reserve space.
    StatusBar: {
      style: 'DARK',                // dark content on dark bg = light text
      overlaysWebView: true,
      backgroundColor: '#00000000',
    },
    // Splash screen shown briefly while the WebView boots.
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#01030a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
