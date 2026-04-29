// Snowglobe physics tunables. Units: world units per second, seconds.
// Model: Stokes drag on plastic-glitter-like particles suspended in a viscous
// water/glycerin mix. All particles are denser than the fluid and eventually
// settle to the floor. Turbulence from shake decays exponentially (τ≈6s per
// real-fluid viscous-decay timescale for a 10cm globe).
export const CONFIG = {
  session: {
    durationMs: 60_000,
    fadeInMs: 600,
    // Quote reading window: 12 seconds total. ~1.2s fade in, ~6.5s fully
    // visible to read, ~4.3s slow fade out. Then session resets to idle.
    fadeOutMs: 12_000,
    // Audio finishes ~3 seconds before the quote vanishes — gives the user
    // a brief moment of pure visual reading at the end of the practice.
    audioFadeOutMs: 9_000,
  },
  shake: {
    threshold: 5,             // generous — even a casual shake fires reliably
    debounceMs: 500,          // shorter so a follow-up shake after a missed first try works
    sampleIntervalMs: 25,     // faster sampling = catch shorter peaks
    peakWindowMs: 320,
  },
  vessel: {
    glassOpacity: 0.03,
    edgeHighlight: 0.07,
  },
  particles: {
    count: 2600,                                    // bumped 2200 → 2600 to fill pile holes; same memory budget OK on iOS
    sizeRange: [0.025, 0.07] as [number, number],

    impulseStrength: 10.0,        // tuned for shake-as-primary input: 10.0 × shake intensity 2.5 still saturates the velocity cap on most particles, while a tap (1.1) eruption stays focused. Pulled back from 11.5 because over-injection caused over-aggressive top-wall bouncing on real shakes.
    maxSpeed: 6.5,                // bumped 5.5 → 6.5 — vigorous shakes briefly exceed v1's reach with a satisfying bounce-off-top-glass moment; tap users won't see it
    impulseMagMin: 0.3,           // wide variance — fast risers reach top, slow ones stay mid-vessel
    impulseMagMax: 2.0,

    // Per-particle terminal sink rate — sampled log-normal at creation so
    // small "fines" linger while large flakes fall fast. Matches real PET
    // glitter settling-time distribution (90th percentile ≈ 60s).
    // Tuned so the slowest particles are still falling through the final
    // exhale and complete settling at t≈60s — matching the last "exhale"
    // word fading out. Min sink rate is the load-bearing knob.
    // Sink rates retuned 2026-04-26 for the "delayed-heap" timing curve:
    // particles drift robustly through the swirl phase, then the heap forms
    // dramatically in the last ~12s. Median sink rate dropped 0.22 → 0.16
    // so most particles spend the bulk of the session floating; ceiling
    // dropped 1.10 → 0.55 so the fastest flakes don't dump immediately
    // after the shake burst. Floor 0.13 → 0.10 keeps the slowest fines
    // arriving exactly at t=60s with the new boost mult.
    sinkRateMean: 0.16,
    sinkRateSigma: 0.4,
    sinkRateRange: [0.10, 0.55] as [number, number],

    // Late-session sink boost — pushed to last 12s + stronger pull. Most
    // particles arrive at the floor in this window — the "grain of rice
    // becomes a heap" moment, timed to the final exhale. Math: slowest
    // fines at 0.10 × 2.2 = 0.22 unit/s × 12s = 2.64 units of travel,
    // vessel half-height ≈ 3 units, so even with curl having pushed them
    // sideways the boost reliably finishes them by 60s.
    sinkBoostStartSec: 48,
    sinkBoostMaxMul: 2.2,

    // Stokes relaxation — velocity-toward-target rate. Ramps from loose at
    // shake (impulse persists, particles travel through full vessel) to heavy
    // by mid-session (motion damps, particles settle). Without the ramp,
    // momentum dies in ~1s and most particles never reach the top.
    viscosityShake: 1.05,   // pulled below v1's 1.1 — the post-cap glide IS the "majestic float" phase and must be loose. With shake's wider velocity distribution, this lets chaos persist 12-15s instead of 5-6s before turbulence takes over as the sustaining force.
    viscositySettle: 4.5,   // slightly heavier end-state to compensate for the looser shake phase
    viscosityCurve: 1.5,    // CONVEX (was 0.7 = concave). Viscosity stays at the loose 1.05 value through ~70% of the session, then climbs sharply. Load-bearing knob for delayed heap formation.

    // Turbulence retuned 2026-04-26 for the delayed-heap timing curve.
    // Earlier the agent's research said lateral curl reads as "lightness" —
    // and we want exactly that during the float phase: particles drift in
    // big slow arcs across the full vessel volume, then sink wins late.
    // The buoyant feel is now intentional and time-bounded; the late
    // viscosity climb (curve=1.5) plus sink boost end the float decisively.
    turbulenceStrength: 1.15,      // more swirl — independent of shake intensity (turbulence is an ambient curl-noise field, not impulse)
    turbulenceDecayTau: 12.0,      // eddies persist into the heap-formation window — after a vigorous shake, this means the chaos *fades*, doesn't die
    curlScale: 0.32,               // bigger eddies → majestic slow drift across the vessel rather than nervous tumbling
    curlTimeSpeed: 0.06,

    // Pile-at-bottom accumulation. Pile sits flush with the bottom edge.
    floorMargin: 0.005,         // tiny margin so glitter isn't cut by the rim
    pileDepth: 0.55,            // deep pile — gives the mound real visual height
    pileWidthBias: 0.55,        // wider distribution → more variance, less line-shaped
    duneFreq1: 1.2,             // low-frequency dunes across width (large mounds)
    duneFreq2: 2.2,             // bumped down 3.4 → 2.2: higher-freq spikes were exposing pile-density holes; smoother top, fewer visible gaps
    duneAmplitude: 0.65,        // how much the dunes contribute to pile height (0..1)
    floorHFriction: 0.82,       // per-second horizontal drag on floored particles
    floorJitter: 0.012,         // (legacy; settled particles are now fully locked)

    // Per-particle twinkle.
    twinkleSpeedRange: [0.4, 1.6] as [number, number], // rad/s — slower, gentler shimmer
    twinkleSpeedSettled: 0.28,                          // very slow shimmer in the pile
    twinkleBaseFloor: 0.32,                             // higher floor — less blinky, more present

    // Shake-flash burst — brightness/size boost right after shake.
    shakeFlashDecayTau: 1.0,
    shakeFlashStrength: 0.8,
  },
  breath: {
    // Phase patterns now live in src/modes.ts (each of silver/gold/rainbow
    // has its own). Cross-mode visual styling stays here.

    // Crossfade window: previous word fades out while new word fades in over
    // this duration centered at the phase boundary. 800ms reads as a smooth
    // breath transition, never as a hard swap.
    crossfadeMs: 800,
    // Faint breath suggestion — the falling shimmer is the focal point;
    // the words whisper. Halved from v8 ([0.45, 0.95] → [0.22, 0.48]).
    opacityRange: [0.22, 0.48] as [number, number],
  },
  ui: {
    progressOpacity: 0.1,
    dotPulseMs: 2400,
  },
  postfx: {
    bloomIntensity: 0.45,    // gentle — adds softness without halo blowout
    bloomThreshold: 0.28,    // higher so only the brightest peaks bloom
    bloomSmoothing: 0.85,    // bumped 0.78 → 0.85 — softer halo edges around catches, more diamond-glow read
    vignetteDarkness: 0.78,
  },
} as const;

// BreathLabel moved to src/modes.ts (now includes 'hold' for box breathing).
