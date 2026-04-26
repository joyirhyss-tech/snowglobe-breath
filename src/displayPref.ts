// Display preference: how the breath cue is shown during a session.
//   - 'words'    : "inhale" / "exhale" / "hold" — the original cue
//   - 'countdown': numeric timer counting down from session length to zero
//   - 'silent'   : no text at all; visual + audio + haptics only
export type DisplayMode = 'words' | 'countdown' | 'silent';

const KEY = 'hush.display';
const DEFAULT: DisplayMode = 'words';
const VALID: DisplayMode[] = ['words', 'countdown', 'silent'];

export function loadDisplayPref(): DisplayMode {
  try {
    const v = localStorage.getItem(KEY) as DisplayMode | null;
    if (v && (VALID as string[]).includes(v)) return v;
  } catch {}
  return DEFAULT;
}

export function persistDisplayPref(mode: DisplayMode): void {
  try { localStorage.setItem(KEY, mode); } catch {}
}
