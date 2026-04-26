// Platform abstraction. The same Hush codebase runs in two contexts:
//   1. Web browser (Vite dev / Netlify) — uses DeviceMotionEvent + CSS toys
//   2. Native iOS via Capacitor — uses CoreMotion + native haptics
//
// Capacitor is detected at runtime. When running natively, we get:
//   - No iOS Safari permission prompt for motion (CoreMotion plugin avoids it)
//   - Real haptic feedback (UIImpactFeedbackGenerator) on shake / phase
//   - True full-screen, status bar handled
//
// Web fallback keeps the existing v1 behavior intact for the demo URL.

import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
