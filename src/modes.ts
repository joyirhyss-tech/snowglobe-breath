// Three breath modes that ship in v2 (Hush). Each is a complete sensory
// practice — distinct breath pattern, audio palette, glitter behavior, and
// closing ritual. All three sessions clock to ~60 seconds for symmetry.
//
// Research grounding (do not override without evidence):
//   - Silver 5s/7s: longer exhale activates parasympathetic (Bernardi 2006)
//   - Gold 5-5-5-5 box: balanced sympathetic/parasympathetic, holds anchor
//     attention (NavySEAL pattern adapted for 60s)
//   - Rainbow 5/5: approximation of coherent 5.5/5.5 — heart-rate-variability
//     optimal frequency (HeartMath; close enough at 5/5 for 60s exact)

import type { Theme } from './themes/types';
import type { StringKey } from './i18n/types';
import { silver as silverTheme } from './themes/silver';
import { gold as goldTheme } from './themes/gold';
import { rainbow as rainbowTheme } from './themes/rainbow';

export type BreathLabel = 'inhale' | 'exhale' | 'hold';
export type ModeId = 'silver' | 'gold' | 'rainbow';

export type BreathPhase = {
  label: BreathLabel;
  ms: number;
};

// Per-mode particle physics overrides. Each value is a multiplier on the
// global CONFIG.particles default. 1.0 = identical to silver baseline. Modes
// distinguish themselves by tuning these — gold is heavier/slower, rainbow
// is lighter/more dynamic.
export type ParticlePhysics = {
  sinkRateMul?: number;       // <1 = particles linger longer (slower fall)
  curlStrengthMul?: number;   // >1 = more swirl
  sizeMul?: number;            // particle size multiplier
  twinkleSpeedMul?: number;   // >1 = faster sparkle / catches
  countMul?: number;           // density (rainbow can run more particles)
  hueShift?: boolean;          // shader cycles each particle's hue over time
};

export type AudioPalette = {
  // Synthesized drone foundation (Tone.js or Web Audio).
  droneFundamentalHz: number;       // base tone, e.g. 110 (A2)
  droneIntervalRatio: number;       // overtone ratio, e.g. 1.5 (perfect fifth)
  droneFilterHz: number;            // low-pass cutoff
  droneAttackMs: number;            // slow attack for warmth
  droneInhaleGain: number;          // peak gain on inhale
  droneExhaleGain: number;          // floor on exhale
  // Per-phase sample triggers (ids resolve to file paths in audioEngine).
  // null = no trigger for that phase.
  inhaleSampleId: string | null;
  holdSampleId: string | null;
  exhaleSampleId: string | null;
  // Closing audio.
  closingNarrationIds: string[];   // empty = visual quote only
};

export type ModeSpec = {
  id: ModeId;
  // i18n keys — not literal strings. Resolved via t() at render time.
  labelKey: StringKey;
  intentKey: StringKey;
  // Total session length (ms). Always 60s exact across modes for v2.
  durationMs: number;
  breath: BreathPhase[];
  theme: Theme;
  audio: AudioPalette;
  // Particle behavior overrides. Empty/omitted = silver baseline.
  physics?: ParticlePhysics;
  // Closing behavior.
  closing: 'quote' | 'poem-audio';
};

// ── Silver ────────────────────────────────────────────────────────────
// 5 cycles × (5s inhale / 7s exhale) = 60s. Existing v1 cadence.
const SILVER: ModeSpec = {
  id: 'silver',
  labelKey: 'modeSilver',
  intentKey: 'modeSilverIntent',
  durationMs: 60_000,
  breath: [
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 7000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 7000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 7000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 7000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 7000 },
  ],
  theme: silverTheme,
  audio: {
    droneFundamentalHz: 110,        // A2
    droneIntervalRatio: 1.5,        // perfect fifth (E3)
    droneFilterHz: 800,
    droneAttackMs: 800,
    droneInhaleGain: 0.30,
    droneExhaleGain: 0.05,
    inhaleSampleId: null,
    holdSampleId: null,
    exhaleSampleId: null,
    closingNarrationIds: [],
  },
  // Silver = baseline. No physics overrides.
  physics: {},
  closing: 'quote',
};

// ── Gold ──────────────────────────────────────────────────────────────
// Box breathing 5-5-5-5 × 3 cycles = 60s. Holds anchor attention; bowl
// strikes mark hold transitions for non-counters.
const GOLD: ModeSpec = {
  id: 'gold',
  labelKey: 'modeGold',
  intentKey: 'modeGoldIntent',
  durationMs: 60_000,
  breath: [
    { label: 'inhale', ms: 5000 }, { label: 'hold', ms: 5000 },
    { label: 'exhale', ms: 5000 }, { label: 'hold', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'hold', ms: 5000 },
    { label: 'exhale', ms: 5000 }, { label: 'hold', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'hold', ms: 5000 },
    { label: 'exhale', ms: 5000 }, { label: 'hold', ms: 5000 },
  ],
  theme: goldTheme,
  audio: {
    droneFundamentalHz: 98,         // G2 — slightly warmer than A2
    droneIntervalRatio: 1.5,
    droneFilterHz: 700,
    droneAttackMs: 1000,
    droneInhaleGain: 0.25,
    droneExhaleGain: 0.08,
    inhaleSampleId: null,
    holdSampleId: 'singing-bowl',   // soft bowl strike at hold transitions
    exhaleSampleId: null,
    closingNarrationIds: [],
  },
  // Gold: heavier, slower, more grounded. Particles fall with intention.
  physics: {
    sinkRateMul: 0.85,
    curlStrengthMul: 0.7,
    sizeMul: 1.18,
    twinkleSpeedMul: 0.7,
  },
  closing: 'quote',
};

// ── Rainbow ───────────────────────────────────────────────────────────
// 6 cycles × (5s inhale / 5s exhale) = 60s. Approximation of HeartMath
// "coherent breathing" 5.5/5.5 — same intent (heart-rate-variability
// optimal), simplified to fit 60s exact.
const RAINBOW: ModeSpec = {
  id: 'rainbow',
  labelKey: 'modeRainbow',
  intentKey: 'modeRainbowIntent',
  durationMs: 60_000,
  breath: [
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 5000 },
    { label: 'inhale', ms: 5000 }, { label: 'exhale', ms: 5000 },
  ],
  theme: rainbowTheme,
  audio: {
    droneFundamentalHz: 110,
    droneIntervalRatio: 1.5,
    droneFilterHz: 900,
    droneAttackMs: 800,
    droneInhaleGain: 0.30,
    droneExhaleGain: 0.06,
    inhaleSampleId: null,
    holdSampleId: null,
    exhaleSampleId: 'cello-bow',    // sustained cello on exhale
    closingNarrationIds: [
      // Will be populated with the user's recorded poems.
      // For now, closing falls back to visual quote until audio is recorded.
    ],
  },
  // Rainbow: lighter, more dynamic, more particles, hue cycles over time
  // — the wow-factor mode.
  physics: {
    sinkRateMul: 0.7,
    curlStrengthMul: 1.4,
    sizeMul: 0.88,
    twinkleSpeedMul: 1.3,
    countMul: 1.15,
    hueShift: true,
  },
  closing: 'poem-audio',
};

export const MODES: Record<ModeId, ModeSpec> = {
  silver: SILVER,
  gold: GOLD,
  rainbow: RAINBOW,
};

export const MODE_LIST: ModeSpec[] = [SILVER, GOLD, RAINBOW];

// Default mode on first load. Silver is the calmest entry point.
export const DEFAULT_MODE_ID: ModeId = 'silver';

// User's last-selected mode is persisted; falls back to default.
const STORAGE_KEY = 'hush.mode';

export function loadStoredMode(): ModeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ModeId | null;
    if (stored && stored in MODES) return stored;
  } catch {}
  return DEFAULT_MODE_ID;
}

export function persistMode(id: ModeId): void {
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}
