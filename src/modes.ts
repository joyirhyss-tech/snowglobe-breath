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
  // Per-mode pile shape — each mode gets a unique settled silhouette so the
  // closing read of the pile is itself a brand cue.
  pileDepthMul?: number;      // >1 = taller mound (gold), <1 = flatter spread (rainbow)
  pileWidthMul?: number;      // <1 = concentrated narrow pile (gold), 1.0 = full-width spread (silver/rainbow)
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
  // Long looping bed for the entire session — distinct from per-phase
  // triggers. Silver: water; Gold: chimes; Rainbow: null (the cello-on-
  // exhale carries the textural layer instead).
  ambientBedSampleId: string | null;
  // Per-mode override for the engine fadeOut duration (ms). When unset,
  // CONFIG.session.audioFadeOutMs (currently 9000) is used. Silver and
  // Gold use a longer 18000ms fade for a more relaxed ending — the user
  // experience there is meditative, slower fades feel right. Rainbow
  // sticks with the default since handpan music has its own pacing.
  fadeOutMs?: number;
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
    // Soft lake waves bed — parasympathetic water vibe, pairs with snowglobe identity.
    ambientBedSampleId: 'silver-water',
    fadeOutMs: 18_000,           // doubled from default 9s — water fades more gently into the closing quote
    closingNarrationIds: [],
  },
  // Silver = baseline. Subtle drift-snow pile: full-width, modest depth.
  physics: {
    pileDepthMul: 1.0,
    pileWidthMul: 0.95,         // slightly inset from rim — clean drift silhouette
  },
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
    holdSampleId: null,             // bowl removed — chimes bed carries the marker character
    exhaleSampleId: null,
    // Wind chimes + light rain bed — bell-like grounded focus, anchors box breathing.
    ambientBedSampleId: 'gold-chimes',
    fadeOutMs: 18_000,              // doubled from default 9s — chimes ring out more gently
    closingNarrationIds: [],
  },
  // Gold: heaviest of the three modes. Grounding intent → particles fall
  // with committed weight. sinkRateMul was previously inverted (0.85 =
  // SLOWER fall = lighter feel, contradicting the "grounded" label); now
  // 1.15 = ~15% faster fall than silver baseline. Curl reduced for less
  // drift; size up for bulk presence; twinkle slow for steadiness.
  // sizeMul 1.18 → 1.35: lighter bg (#48403e) needed bigger gold catches
  // to read with the same shimmer/wow against more luminous backdrop.
  physics: {
    sinkRateMul: 1.15,
    curlStrengthMul: 0.7,
    sizeMul: 1.35,
    twinkleSpeedMul: 0.7,
    // Gold pile = tall, narrow, dense mound. Reads as a substantial heap.
    pileDepthMul: 1.20,
    pileWidthMul: 0.78,
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
    exhaleSampleId: null,                  // 2026-04-27: per-exhale strings pad replaced by handpan-music ambient bed
    ambientBedSampleId: 'rainbow-handpan', // handpan music as continuous bed; carries the joy/opening character
    closingNarrationIds: [
      // Will be populated with the user's recorded poems.
      // For now, closing falls back to visual quote until audio is recorded.
    ],
  },
  // Rainbow: still the most dynamic mode (more curl, more twinkle, more
  // particles, hue-cycling) but no longer floaty. sinkRateMul was 0.7
  // (much slower fall = lighter feel); now 0.95 — close to silver baseline
  // so fines still finish at 60s, but the mode keeps its distinct
  // wow-factor identity through curl and density, not buoyancy.
  // curlStrengthMul nudged 1.4 → 1.25 for the same reason.
  // sizeMul bumped 0.88 → 1.1: prismatic catches were reading too small
  // against the smoky grey backdrop during the burst/flutter phase. 25%
  // size increase makes each catch carry more visual weight without
  // tipping into chunky.
  physics: {
    sinkRateMul: 0.95,
    curlStrengthMul: 1.25,
    sizeMul: 1.1,
    twinkleSpeedMul: 1.3,
    countMul: 1.15,
    hueShift: true,
    // Rainbow pile = flat, wide spread. Reads as scattered prismatic dust
    // across the floor rather than a heap — fits the "expansion" intent.
    pileDepthMul: 0.82,
    pileWidthMul: 1.0,
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
