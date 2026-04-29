// Hush audio engine. Streams the per-mode bed/sample audio through a shared
// reverb tail. Designed to run from a single user gesture (Apple's autoplay
// rule) and shut down cleanly when the session ends.
//
// History note: this engine previously generated a research-grounded synth
// drone (110 Hz A2 + perfect fifth, low-pass 800 Hz, breath-synced gain
// envelope). The drone was removed 2026-04-27 at user direction — they
// preferred the bare bed/sample audio without a synthesized layer. The
// AudioPalette type still has drone fields; they are simply unused.

import * as Tone from 'tone';
import type { BreathLabel, ModeSpec } from '../modes';

// Sample registry — id → URL. AAC/M4A for universal browser + iOS Safari
// support (OGG/Vorbis is Safari-incompatible). Mono, 96 kbps.
const SAMPLE_URLS: Record<string, string> = {
  // Mode-specific ambient beds (loop session-wide, fade in/out).
  // All three files have a 1.5s baked-in fade-in and a 2s fade-out, so
  // playback edges are smooth even before the gain envelope rides on top.
  'silver-water':   '/audio/silver-bed.m4a',     // soft lake waves: parasympathetic bed
  'gold-chimes':    '/audio/gold-bed.m4a',       // wind chimes + light rain: grounded focus bed
  'rainbow-handpan':'/audio/rainbow-bed.m4a',    // handpan music (kalsstockmedia): joy/opening bed
};

// Module-level singleton. Exactly one engine per page load — Tone's Context
// is a global resource and we want all modes sharing the same reverb tail.
let engine: HushEngine | null = null;

class HushEngine {
  private reverb: Tone.Reverb | null = null;
  private masterGain: Tone.Gain | null = null;
  // Each sample id maps to its own player + gain node so cross-mode beds
  // can fade independently without sharing buffers (which Tone.js does
  // unreliably when you pass a buffer reference to a new Player).
  private samplePlayers: Map<string, { player: Tone.Player; gain: Tone.Gain }> = new Map();
  // Map of id → in-flight load promise. Crucial: when two callers want the
  // same sample concurrently (e.g., setMode preloads it AND startAmbientBed
  // awaits it), the second caller must AWAIT the existing promise — not
  // skip past it and try to use a player that hasn't finished loading.
  private samplesLoading: Map<string, Promise<void>> = new Map();
  // Ambient bed — a long looping sample that runs through the whole session
  // (silver: water, gold: chimes). Distinct from per-phase triggered samples.
  // Just tracks which sample id is currently the active bed; the actual
  // player/gain live in samplePlayers so we don't lose buffers between sessions.
  private bedActiveId: string | null = null;

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
    // Reverb gives the bed/sample audio spaciousness so it doesn't read as
    // dry/clinical. Wet 0.55 mixes 55% reverberated, 45% direct.
    this.reverb = new Tone.Reverb({ decay: 6, wet: 0.55 });
    this.reverb.connect(this.masterGain);
  }

  /**
   * Apply a mode's audio palette. Pre-warms the samples this mode wants to
   * trigger or loop as a bed. Drone fields on the palette are ignored.
   */
  setMode(mode: ModeSpec): void {
    this.currentMode = mode;
    if (!this.isStarted) return;
    const p = mode.audio;
    [p.inhaleSampleId, p.holdSampleId, p.exhaleSampleId, p.ambientBedSampleId].forEach((id) => {
      if (id) this.preloadSample(id);
    });
  }

  /**
   * Start the per-mode ambient bed — plays the loaded sample once
   * (loop=false) for that sample id and fades its gain in.
   *
   * Bed audio files are 70 seconds long while the session+ending window
   * is 72s. The engine's gain fadeOut completes at t=69s (silent for the
   * remaining ~1s), and the audio file ends naturally at t=70s — no loop,
   * no restart artifact at the session boundary. (Earlier 60s files with
   * loop=true caused an audible "stops then starts" right before the
   * closing quote because the loop boundary fell exactly at the session
   * end with the baked-in fade-in restarting from silence.)
   */
  async startAmbientBed(id: string, fadeInMs: number = 1500): Promise<void> {
    if (!this.isStarted) return;
    if (this.bedActiveId === id) return; // already on
    // Stop the previous bed (if any) before we switch ids.
    if (this.bedActiveId && this.bedActiveId !== id) {
      this.stopAmbientBed(fadeInMs);
    }
    // Lazy-load if not yet preloaded — this is what makes per-mode beds
    // genuinely distinct: each id resolves to its own URL via SAMPLE_URLS.
    await this.preloadSample(id);
    const entry = this.samplePlayers.get(id);
    if (!entry) return; // load failed, silently no-op
    entry.player.loop = false;     // play through once; file outlasts session window
    if (entry.player.state !== 'started') entry.player.start();
    entry.gain.gain.cancelScheduledValues(Tone.now());
    entry.gain.gain.value = 0;
    entry.gain.gain.linearRampTo(0.7, fadeInMs / 1000);
    this.bedActiveId = id;
  }

  /**
   * Fade and stop the ambient bed. Keeps the loaded player around so the
   * next session can re-use it without re-fetching the audio file.
   */
  stopAmbientBed(fadeOutMs: number = 1500): void {
    if (!this.bedActiveId) return;
    const id = this.bedActiveId;
    const entry = this.samplePlayers.get(id);
    this.bedActiveId = null;
    if (!entry) return;
    entry.gain.gain.cancelScheduledValues(Tone.now());
    entry.gain.gain.linearRampTo(0, fadeOutMs / 1000);
    setTimeout(() => {
      try { entry.player.stop(); entry.player.loop = false; } catch {}
    }, fadeOutMs + 100);
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
   * Called every time the breath phase changes. Triggers per-phase samples
   * (e.g., Rainbow's strings pad on exhale). With the synth drone removed,
   * this is the only thing it does.
   */
  onPhaseChange(label: BreathLabel, phaseDurationMs: number): void {
    if (!this.isStarted || !this.currentMode) return;
    if (this.currentLabel === label) return; // no-op on identical phase
    this.currentLabel = label;
    void phaseDurationMs;     // retained on signature for future drone return; unused now
    const palette = this.currentMode.audio;

    if (label === 'inhale' && palette.inhaleSampleId) {
      this.triggerSample(palette.inhaleSampleId);
    } else if (label === 'exhale' && palette.exhaleSampleId) {
      this.triggerSample(palette.exhaleSampleId);
    } else if (label === 'hold' && palette.holdSampleId) {
      this.triggerSample(palette.holdSampleId);
    }
  }

  /**
   * Fade everything to silence over fadeMs. Call when session ends so audio
   * winds down gracefully alongside the closing quote.
   */
  fadeOut(fadeMs: number): void {
    if (!this.masterGain) return;
    const seconds = fadeMs / 1000;
    if (this.bedActiveId) {
      const entry = this.samplePlayers.get(this.bedActiveId);
      if (entry) {
        entry.gain.gain.cancelScheduledValues(Tone.now());
        entry.gain.gain.linearRampTo(0, seconds);
      }
    }
    // Also taper any per-phase trigger gain that may still be ringing out.
    this.samplePlayers.forEach((entry, id) => {
      if (id === this.bedActiveId) return; // already handled above
      entry.gain.gain.cancelScheduledValues(Tone.now());
      entry.gain.gain.linearRampTo(0, seconds);
    });
  }

  // ── Sample handling ──
  private preloadSample(id: string): Promise<void> {
    if (this.samplePlayers.has(id)) return Promise.resolve();
    // If a load is already in flight for this id, return THAT promise so
    // the caller awaits the same completion. This is the load-bearing fix
    // for a race where setMode kicked off preloadSample and startAmbientBed
    // immediately followed up — the old code returned an instantly-resolved
    // promise on the second call, letting startAmbientBed proceed before
    // the player was ready, and the bed never started.
    const existing = this.samplesLoading.get(id);
    if (existing) return existing;
    const url = SAMPLE_URLS[id];
    if (!url) return Promise.resolve(); // sample not yet supplied
    const loadPromise = (async () => {
      try {
        const player = new Tone.Player({ url, autostart: false });
        // Each sample owns its own gain so beds and per-phase triggers can
        // ramp independently. Starts at 0; consumers ramp up on use.
        const gain = new Tone.Gain(0);
        player.connect(gain);
        gain.connect(this.reverb!);
        await Tone.loaded(); // wait for buffer to load
        this.samplePlayers.set(id, { player, gain });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[Hush audio] sample "${id}" failed to load`, err);
      } finally {
        this.samplesLoading.delete(id);
      }
    })();
    this.samplesLoading.set(id, loadPromise);
    return loadPromise;
  }

  private triggerSample(id: string): void {
    const entry = this.samplePlayers.get(id);
    if (!entry) return;
    // Per-phase trigger gain (rainbow strings on exhale): pop to 0.85 each
    // fire (was 0.65, bumped now that the drone no longer underlays).
    // Cancel any in-flight ramp first (e.g., from a prior bed use).
    entry.gain.gain.cancelScheduledValues(Tone.now());
    entry.gain.gain.value = 0.85;
    if (entry.player.state === 'started') entry.player.stop();
    entry.player.loop = false;
    entry.player.start();
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

// Debug exposure — lets us inspect engine state and call methods directly
// from the browser console or Playwright eval.
if (typeof window !== 'undefined') {
  (window as unknown as { HUSH_ENGINE: () => HushEngine | null }).HUSH_ENGINE = () => engine;
  (window as unknown as { HUSH_DEBUG: () => unknown }).HUSH_DEBUG = () => {
    const e = engine as unknown as {
      isStarted: boolean;
      bedActiveId: string | null;
      currentMode: { id: string } | null;
      currentLabel: string | null;
      masterGain: { gain: { value: number } } | null;
      samplePlayers: Map<string, { player: { state: string; loop: boolean }; gain: { gain: { value: number } } }>;
    } | null;
    if (!e) return { engine: 'not-created' };
    const samples: Record<string, { state: string; loop: boolean; gain: number }> = {};
    e.samplePlayers.forEach((entry, id) => {
      samples[id] = {
        state: entry.player.state,
        loop: entry.player.loop,
        gain: entry.gain.gain.value,
      };
    });
    return {
      isStarted: e.isStarted,
      bedActiveId: e.bedActiveId,
      currentMode: e.currentMode?.id,
      currentLabel: e.currentLabel,
      masterGain: e.masterGain?.gain.value,
      samples,
    };
  };
}
