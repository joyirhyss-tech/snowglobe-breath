// Apple Health (HealthKit) — Mindful Minutes write integration.
//
// We register a small custom Capacitor plugin called "HushHealth" with two
// methods: `requestAuthorization()` and `writeMindfulSession({ start, end })`.
// The native (iOS) implementation lives in Swift inside the iOS project —
// see IOS_SETUP.md for the exact code to paste into
// `ios/App/App/Plugins/HushHealth.swift` once you've run `npx cap add ios`.
//
// On web, the plugin's `web` implementation no-ops, so the JS abstraction is
// safe to call from any platform — it'll simply not write anything when
// running on a desktop browser or in the Netlify demo.
//
// Why a custom plugin instead of an off-the-shelf one?
//   - The most popular community plugin (`capacitor-health`) is read-only
//     for mindfulness; it can't write Mindful Session samples.
//   - The other option (`@perfood/capacitor-healthkit`) is pinned to
//     Capacitor 4; we're on Capacitor 8.
//   - A custom plugin is ~80 lines of Swift and gives us exactly the API
//     surface we need: request auth, write one sample. Easy to maintain.

import { registerPlugin, Capacitor } from '@capacitor/core';

export type WriteMindfulRequest = {
  startMs: number;   // ms epoch — session start
  endMs: number;     // ms epoch — session end
};

export type HealthKitPlugin = {
  /** Returns true if HealthKit is available on this device (iOS only). */
  isAvailable(): Promise<{ available: boolean }>;

  /**
   * Request authorization to write Mindful Sessions to Apple Health.
   * On iOS, prompts the user with the system Health share sheet (only the
   * first time per app install — subsequent calls resolve immediately).
   * On web, returns granted: false.
   */
  requestAuthorization(): Promise<{ granted: boolean }>;

  /**
   * Write a single Mindful Session sample to Apple Health for the given
   * time range. Idempotent for any given (startMs, endMs) pair — Apple
   * Health will store duplicates if called twice with the same range,
   * so callers should ensure they only call this once per completed
   * session.
   */
  writeMindfulSession(req: WriteMindfulRequest): Promise<{ saved: boolean }>;
};

const HushHealth = registerPlugin<HealthKitPlugin>('HushHealth', {
  // Web fallback — used in the Netlify demo + local dev. Does nothing.
  // Returns honestly so caller logic can branch.
  web: {
    isAvailable: async () => ({ available: false }),
    requestAuthorization: async () => ({ granted: false }),
    writeMindfulSession: async () => ({ saved: false }),
  },
});

/**
 * True if we're running natively on iOS where HealthKit can be reached.
 * Cheap to call — no plugin invocation.
 */
export function isHealthKitPossible(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export async function isHealthKitAvailable(): Promise<boolean> {
  if (!isHealthKitPossible()) return false;
  try {
    const res = await HushHealth.isAvailable();
    return !!res.available;
  } catch {
    return false;
  }
}

export async function requestHealthKitAuthorization(): Promise<boolean> {
  if (!isHealthKitPossible()) return false;
  try {
    const res = await HushHealth.requestAuthorization();
    return !!res.granted;
  } catch {
    return false;
  }
}

/**
 * Write one Mindful Session entry. Returns true on success, false on any
 * failure (no auth, web platform, native error). Failures are silent by
 * design — the user shouldn't see "Hush failed to save to Health" because
 * the practice itself completed fine.
 */
export async function writeMindfulSession(req: WriteMindfulRequest): Promise<boolean> {
  if (!isHealthKitPossible()) return false;
  try {
    const res = await HushHealth.writeMindfulSession(req);
    return !!res.saved;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[Hush HealthKit] write failed', err);
    return false;
  }
}
