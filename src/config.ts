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
    count: 2200,                                    // dense field — impactful at idle and through the burst
    sizeRange: [0.025, 0.07] as [number, number],

    impulseStrength: 9.0,         // strong enough to lift particles through the full vessel height
    maxSpeed: 5.5,
    impulseMagMin: 0.3,           // wide variance — fast risers reach top, slow ones stay mid-vessel
    impulseMagMax: 2.0,

    // Per-particle terminal sink rate — sampled log-normal at creation so
    // small "fines" linger while large flakes fall fast. Matches real PET
    // glitter settling-time distribution (90th percentile ≈ 60s).
    // Tuned so the slowest particles are still falling through the final
    // exhale and complete settling at t≈60s — matching the last "exhale"
    // word fading out. Min sink rate is the load-bearing knob.
    sinkRateMean: 0.18,
    sinkRateSigma: 0.4,
    sinkRateRange: [0.13, 0.55] as [number, number],

    // Gentle late-session sink boost — just enough to guarantee complete
    // settle by 60s without rushing particles into the pile early.
    sinkBoostStartSec: 42,
    sinkBoostMaxMul: 1.5,

    // Stokes relaxation — velocity-toward-target rate. Ramps from loose at
    // shake (impulse persists, particles travel through full vessel) to heavy
    // by mid-session (motion damps, particles settle). Without the ramp,
    // momentum dies in ~1s and most particles never reach the top.
    viscosityShake: 1.1,    // seconds^-1 at t=0 — particles glide
    viscositySettle: 4.0,   // seconds^-1 at t=60 — heavy damping
    viscosityCurve: 0.7,    // ease exponent on session progress (0.7 = ramps in early)

    // Turbulent eddies from the shake. Decays exponentially so bulk flow is
    // effectively gone by ~20s, matching Re-transition observations.
    turbulenceStrength: 1.2,
    turbulenceDecayTau: 9.0,       // eddies persist through first ~25s, then die out
    curlScale: 0.35,
    curlTimeSpeed: 0.06,

    // Pile-at-bottom accumulation. Pile sits flush with the bottom edge.
    floorMargin: 0.005,         // tiny margin so glitter isn't cut by the rim
    pileDepth: 0.55,            // deep pile — gives the mound real visual height
    pileWidthBias: 0.55,        // wider distribution → more variance, less line-shaped
    duneFreq1: 1.2,             // low-frequency dunes across width (large mounds)
    duneFreq2: 3.4,             // higher-frequency variance on top of dunes
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
    // 5 slower cycles × (5s inhale / 7s exhale) = 12s/cycle = 60s total.
    // Slower than v9's 4/6 — gives the user more time inside each breath,
    // reads as elegant rather than rushed. Exhale longer than inhale for
    // parasympathetic activation (the calming nervous-system response).
    phases: [
      { label: 'inhale', ms: 5000 },
      { label: 'exhale', ms: 7000 },   // cycle 1 (t=12)
      { label: 'inhale', ms: 5000 },
      { label: 'exhale', ms: 7000 },   // cycle 2 (t=24)
      { label: 'inhale', ms: 5000 },
      { label: 'exhale', ms: 7000 },   // cycle 3 (t=36)
      { label: 'inhale', ms: 5000 },
      { label: 'exhale', ms: 7000 },   // cycle 4 (t=48)
      { label: 'inhale', ms: 5000 },
      { label: 'exhale', ms: 7000 },   // cycle 5 (t=60) — last exhale ends as glitter settles
    ] as const,
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
    bloomSmoothing: 0.78,
    vignetteDarkness: 0.78,
  },
} as const;

export type BreathLabel = 'inhale' | 'exhale';
