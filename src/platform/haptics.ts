// Haptics abstraction. iOS gets real haptic feedback via Capacitor; web
// falls back to navigator.vibrate where supported (Android browsers) and
// silently no-ops elsewhere. Functions are fire-and-forget — never throw.
//
// Use cases in Hush:
//   - tap('light') at session start (subtle "kick" alongside the visual burst)
//   - tap('medium') at end of session (closing punctuation)
//   - tap('selection') on each phase boundary in gold mode (anchors the holds)

import { isNative } from './index';

type ImpactStyle = 'light' | 'medium' | 'heavy';

let cachedHaptics: typeof import('@capacitor/haptics') | null = null;

async function loadHaptics() {
  if (!isNative) return null;
  if (!cachedHaptics) {
    try {
      cachedHaptics = await import('@capacitor/haptics');
    } catch {
      cachedHaptics = null;
    }
  }
  return cachedHaptics;
}

/**
 * Single haptic tap. Maps to UIImpactFeedbackGenerator on iOS.
 */
export async function tap(style: ImpactStyle = 'light'): Promise<void> {
  const haptics = await loadHaptics();
  if (haptics) {
    const impactStyle = style === 'heavy'
      ? haptics.ImpactStyle.Heavy
      : style === 'medium'
        ? haptics.ImpactStyle.Medium
        : haptics.ImpactStyle.Light;
    try {
      await haptics.Haptics.impact({ style: impactStyle });
    } catch { /* ignore */ }
    return;
  }
  // Web fallback: navigator.vibrate. Light = 10ms, Medium = 25ms, Heavy = 50ms.
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    const ms = style === 'heavy' ? 50 : style === 'medium' ? 25 : 10;
    try { navigator.vibrate(ms); } catch { /* ignore */ }
  }
}

/**
 * Selection change haptic — used for phase boundaries (subtler than impact).
 * On iOS this maps to UISelectionFeedbackGenerator (a "tick").
 */
export async function selection(): Promise<void> {
  const haptics = await loadHaptics();
  if (haptics) {
    try {
      await haptics.Haptics.selectionStart();
      await haptics.Haptics.selectionChanged();
      await haptics.Haptics.selectionEnd();
    } catch { /* ignore */ }
    return;
  }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(8); } catch { /* ignore */ }
  }
}
