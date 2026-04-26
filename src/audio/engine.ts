// Hush audio engine. Generates a breath-synced drone from scratch via
// Tone.js, plus triggers per-phase samples (singing bowl, cello, nature
// ambience) loaded on demand. Designed to run from a single user gesture
// (Apple's autoplay rule) and shut down cleanly when the session ends.
//
// Research-grounded defaults (do not change without evidence):
// - Drone fundamental ~110 Hz (A2) + perfect fifth — predictable harmonic
//   richness without muddying phone speakers (Koelsch 2014; Trappe 2012)
// - Slow attack ~800ms — avoids transients that trigger startle (Grillon 2008)
// - Low-pass ~800 Hz — keeps frequencies below the "alerting" 4kHz band
// - Inhale gain swell + exhale gain decay — non-verbal pacing cue, breath-
//   entrainment effect (Apple Breathe pattern; Vickhoff 2013)
// - Reverb ~6s decay — spaciousness without phrase muddiness

import * as Tone from 'tone';
import type { BreathLabel, ModeSpec } from '../modes';

// Sample registry — id → URL. Empty until samples are dropped into /public.
// Phase 1 ships drone-only; samples plug in after Pixabay selection.
const SAMPLE_URLS: Record<string, string> = {
  // 'singing-bowl': '/audio/singing-bowl.ogg',
  // 'cello-bow':    '/audio/cello-bow.ogg',
  // 'nature-ocean': '/audio/nature-ocean.ogg',
};

// Module-level singleton. Exactly one engine per page load — Tone's Context
// is a global resource and we want all modes sharing the same reverb tail.
let engine: HushEngine | null = null;

class HushEngine {
  private osc1: Tone.Oscillator | null = null;
  private osc2: Tone.Oscillator | null = null;
  private osc3: Tone.Oscillator | null = null;
  private filter: Tone.Filter | null = null;
  private droneGain: Tone.Gain | null = null;
  private reverb: Tone.Reverb | null = null;
  private masterGain: Tone.Gain | null = null;
  private samplePlayers: Map<string, Tone.Player> = new Map();
  private samplesLoading: Set<string> = new Set();

  private currentMode: ModeSpec | null = null;
  private currentLabel: BreathLabel | null = null;
  private isStarted: boolean = false;
  private masterEnabled: boolean = true;

  /**
   * Lazily start the audio context. MUST be called from a user gesture
   * (touch/click handler), or iOS Safari will refuse to play. Idempotent.
   */
  async start(): Promise<void> {
    if (this.isStarted) return;
    await Tone.start();           // unlocks the audio context
    this.buildSignalChain();
    this.isStarted = true;
  }

  private buildSignalChain(): void {
    // Master gain (mute toggle target).
    this.masterGain = new Tone.Gain(1).toDestination();
    // Reverb gives synthesized drone the spaciousness it needs to read as calming.
    this.reverb = new Tone.Reverb({ decay: 6, wet: 0.55 });
    this.reverb.connect(this.masterGain);
    // Low-pass filter rolls off "alerting" high frequencies above ~800 Hz.
    this.filter = new Tone.Filter({ type: 'lowpass', frequency: 800, Q: 1.2 });
    this.filter.connect(this.reverb);
    // Drone gain (breath-synced envelope target). Starts at 0 (silent).
    this.droneGain = new Tone.Gain(0);
    this.droneGain.connect(this.filter);
    // Three sine oscillators: fundamental, slightly detuned twin (for warmth),
    // perfect fifth above. All routed through droneGain → filter → reverb → master.
    this.osc1 = new Tone.Oscillator({ frequency: 110, type: 'sine' });
    this.osc2 = new Tone.Oscillator({ frequency: 110.3, type: 'sine' }); // detune
    this.osc3 = new Tone.Oscillator({ frequency: 165, type: 'sine' });    // 5th
    [this.osc1, this.osc2, this.osc3].forEach((o) => {
      o.connect(this.droneGain!);
      o.start();
    });
  }

  /**
   * Apply a mode's audio palette. Updates oscillator frequencies and stores
   * the palette for use by phase-tick callbacks. Safe to call repeatedly.
   */
  setMode(mode: ModeSpec): void {
    this.currentMode = mode;
    if (!this.isStarted) return;
    const p = mode.audio;
    if (this.osc1) this.osc1.frequency.value = p.droneFundamentalHz;
    if (this.osc2) this.osc2.frequency.value = p.droneFundamentalHz + 0.3;
    if (this.osc3) this.osc3.frequency.value = p.droneFundamentalHz * p.droneIntervalRatio;
    if (this.filter) this.filter.frequency.value = p.droneFilterHz;
    // Pre-warm any samples this mode wants to trigger.
    [p.inhaleSampleId, p.holdSampleId, p.exhaleSampleId].forEach((id) => {
      if (id) this.preloadSample(id);
    });
  }

  /**
   * Mute / unmute everything. Master gain ramps over 200ms — never click.
   */
  setEnabled(enabled: boolean): void {
    this.masterEnabled = enabled;
    if (!this.masterGain) return;
    this.masterGain.gain.rampTo(enabled ? 1 : 0, 0.2);
  }

  /**
   * Called every time the breath phase changes. Drives:
   *   - Drone gain envelope (rises on inhale, falls on exhale, holds on hold)
   *   - Drone filter cutoff modulation (opens on inhale)
   *   - Sample triggers (per-phase optional samples from the mode palette)
   *
   * `phaseDurationMs` is the length of the new phase; we ramp gain/filter
   * across that exact window so the swell completes when the phase ends.
   */
  onPhaseChange(label: BreathLabel, phaseDurationMs: number): void {
    if (!this.isStarted || !this.currentMode || !this.droneGain || !this.filter) return;
    if (this.currentLabel === label) return; // no-op on identical phase
    this.currentLabel = label;
    const palette = this.currentMode.audio;
    const seconds = phaseDurationMs / 1000;
    const ctxNow = Tone.now();

    // Gain envelope per phase.
    if (label === 'inhale') {
      this.droneGain.gain.cancelScheduledValues(ctxNow);
      this.droneGain.gain.linearRampTo(palette.droneInhaleGain, seconds);
      this.filter.frequency.cancelScheduledValues(ctxNow);
      this.filter.frequency.linearRampTo(palette.droneFilterHz * 1.5, seconds);
      if (palette.inhaleSampleId) this.triggerSample(palette.inhaleSampleId);
    } else if (label === 'exhale') {
      this.droneGain.gain.cancelScheduledValues(ctxNow);
      this.droneGain.gain.linearRampTo(palette.droneExhaleGain, seconds);
      this.filter.frequency.cancelScheduledValues(ctxNow);
      this.filter.frequency.linearRampTo(palette.droneFilterHz, seconds);
      if (palette.exhaleSampleId) this.triggerSample(palette.exhaleSampleId);
    } else if (label === 'hold') {
      // No gain change during hold — sit at whatever the prior phase ended on.
      if (palette.holdSampleId) this.triggerSample(palette.holdSampleId);
    }
  }

  /**
   * Fade everything to silence over fadeMs. Call when session ends so audio
   * winds down gracefully alongside the closing quote.
   */
  fadeOut(fadeMs: number): void {
    if (!this.droneGain || !this.masterGain) return;
    const seconds = fadeMs / 1000;
    this.droneGain.gain.cancelScheduledValues(Tone.now());
    this.droneGain.gain.linearRampTo(0, seconds);
  }

  // ── Sample handling ──
  private async preloadSample(id: string): Promise<void> {
    if (this.samplePlayers.has(id) || this.samplesLoading.has(id)) return;
    const url = SAMPLE_URLS[id];
    if (!url) return; // sample not yet supplied; engine continues drone-only
    this.samplesLoading.add(id);
    try {
      const player = new Tone.Player({ url, autostart: false });
      // Each sample gets its own gain so we can mix per-instrument levels later.
      const sampleGain = new Tone.Gain(0.65);
      player.connect(sampleGain);
      sampleGain.connect(this.reverb!);
      await Tone.loaded(); // wait for buffer to load
      this.samplePlayers.set(id, player);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[Hush audio] sample "${id}" failed to load`, err);
    } finally {
      this.samplesLoading.delete(id);
    }
  }

  private triggerSample(id: string): void {
    const player = this.samplePlayers.get(id);
    if (!player) return;
    if (player.state === 'started') player.stop();
    player.start();
  }

  /** Audio context is unlocked. */
  get started(): boolean { return this.isStarted; }
  /** Master enabled (mute toggle). */
  get enabled(): boolean { return this.masterEnabled; }
}

/**
 * Get-or-create the singleton engine. The first call after a user gesture
 * MUST be `await getEngine().start()` — otherwise Tone.js will queue work
 * with a suspended context and silently fail.
 */
export function getEngine(): HushEngine {
  if (!engine) engine = new HushEngine();
  return engine;
}
