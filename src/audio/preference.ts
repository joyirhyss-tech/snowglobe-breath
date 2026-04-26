// Audio-enabled preference (persisted across sessions).
// Default ON — audio is the v2 marquee feature; mute is a deliberate choice.
const KEY = 'hush.audio.enabled';

export function loadAudioPref(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    if (v === '0') return false;
    if (v === '1') return true;
  } catch {}
  return true;
}

export function persistAudioPref(enabled: boolean): void {
  try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch {}
}
