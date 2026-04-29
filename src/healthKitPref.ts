// User preference for writing completed sessions to Apple Health
// (Mindful Minutes). Off by default — opt-in. Stored in localStorage;
// mirrors the displayPref/narrationPref pattern.

const KEY = 'hush.healthkit';

export function loadHealthKitPref(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function persistHealthKitPref(enabled: boolean): void {
  try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch {}
}
