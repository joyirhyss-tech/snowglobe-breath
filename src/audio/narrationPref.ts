// User preference for closing-quote narration. Off by default — narration
// changes the meditative read of the closing significantly, so it's an
// opt-in. Stored in localStorage; mirrors the pattern of displayPref.ts.

const KEY = 'hush.narration';

export function loadNarrationPref(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function persistNarrationPref(enabled: boolean): void {
  try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch {}
}
