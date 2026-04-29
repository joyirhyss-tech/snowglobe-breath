import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Theme } from '../themes/types';
import type { BreathPhase } from '../modes';
import { getBreathAt } from '../hooks/useBreathPhase';

// Clean deep-water background. Radial gradient + strong vignette only —
// no caustic shader. Earlier attempts at simulated water ripples produced
// artifacts that read as fake; the silver shimmer carries the visual on its
// own without competing background noise.
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3  uInner;
  uniform vec3  uOuter;
  uniform vec2  uResolution;
  uniform vec3  uBeamColor;        // tint of the directional light beam
  uniform float uBeamIntensity;    // 0 = disabled (silver), >0 = enabled (gold/rainbow)
  uniform float uBreathPulse;      // 0..1 — modulates beam intensity with breath cadence
  uniform vec3  uUnderglowColor;   // pile-floor underglow tint
  uniform float uUnderglowIntensity; // 0 = disabled (silver baseline), >0 = enabled
  uniform float uUnderglowSessionRamp; // 0..1 — fades the underglow in over the last ~30% of the session so the swirl phase stays clean and the glow lights up only as the heap forms
  uniform float uMotionDampen;     // 0 = full motion, 1 = reduced-motion preference: kills beam drift and breath-pulse amplitude
  uniform float uTime;             // for slow beam-angle drift

  void main() {
    vec2 centered = vUv - 0.5;
    centered.x *= uResolution.x / uResolution.y;
    float r = length(centered);

    // Soft radial gradient: lighter at the center, deepening outward.
    vec3 base = mix(uInner, uOuter, smoothstep(0.0, 0.85, r));

    // Strong outer vignette pulls edges into deep dark — frames the field.
    float vignette = smoothstep(1.18, 0.18, r);
    base *= vignette;

    // Directional sunlight beam — soft elongated cone descending from the
    // upper-center, slowly drifting ±4° over a 28s cycle so it feels alive.
    // Beam intensity is breath-modulated: gentle ±18% swell on inhale, dim
    // on exhale. The visual literally breathes with the user.
    // Disabled when uBeamIntensity == 0 (silver baseline contract).
    if (uBeamIntensity > 0.001) {
      // Beam origin: top-center; angle drifts gently. Reduced-motion zeroes
      // out the drift so the cone holds steady instead of swaying.
      float drift = sin(uTime * 0.224) * 0.07 * (1.0 - uMotionDampen); // ±0.07 rad ≈ ±4°
      vec2 src = vec2(drift, 0.62);                     // source above the canvas
      vec2 toFrag = centered - src;
      float along = -toFrag.y;                           // distance below the source
      float across = toFrag.x + along * drift * 0.5;     // perpendicular offset, slight cone widening
      // Cone profile: bright at the source, falls off downward and sideways.
      float lengthwise = exp(-along * 0.95);             // brightest near top
      float widthwise  = exp(-pow(across * 1.9, 2.0));   // narrow horizontally
      float beam = lengthwise * widthwise;
      // Multiply by overall vignette so the beam doesn't punch through the rim.
      beam *= vignette;
      // Breath modulation: 0.82 (exhale floor) → 1.18 (inhale peak). Damped
      // toward a steady 1.0 when reduced-motion is set.
      float breathMod = mix(0.82, 1.18, uBreathPulse);
      breathMod = mix(breathMod, 1.0, uMotionDampen);
      base += uBeamColor * beam * uBeamIntensity * breathMod;
    }

    // Pile underglow — soft mode-tinted radial concentrated at bottom-center
    // where the settled pile lives. Completes the "jewels at rest" image at
    // session end. Subtle (intensity ~0.025–0.04) so it never competes with
    // the sparkle field. Disabled (intensity 0) on silver baseline. The
    // session ramp keeps the swirl phase visually clean; the glow grows in
    // smoothly over the last ~30% of the session, peaking right as the
    // heap finishes forming. The "grain of rice that makes a heap a heap"
    // moment lights up.
    if (uUnderglowIntensity > 0.001 && uUnderglowSessionRamp > 0.001) {
      // Glow source: just below the bottom edge (y ≈ -0.5 in centered coords).
      // Concentrated horizontally near the middle, vertical falloff is gentle
      // so the glow blends up into the pile silhouette rather than cutting.
      float vy = centered.y + 0.46;                       // distance from below-floor
      float vx = centered.x;
      float underVert = exp(-pow(vy * 2.6, 2.0));         // strongest at the floor line
      float underHoriz = exp(-pow(vx * 1.4, 2.0));        // soft horizontal falloff
      // Gentle breath modulation on the underglow too — same rhythm as beam.
      float underBreath = mix(0.85, 1.15, uBreathPulse);
      float underglow = underVert * underHoriz * vignette * underBreath * uUnderglowSessionRamp;
      base += uUnderglowColor * underglow * uUnderglowIntensity;
    }

    gl_FragColor = vec4(base, 1.0);
  }
`;

type BackgroundProps = {
  theme: Theme;
  // Breath-pulse inputs — the beam and underglow inhale/exhale with the user.
  // When `active` is false the pulse holds at a calm steady value (0.5).
  elapsedMs: number;
  phases: ReadonlyArray<BreathPhase>;
  active: boolean;
  sessionProgress: number;          // 0..1; drives the underglow's session-ramp fade-in
  reducedMotion: boolean;           // when true: kill beam drift, dampen beam intensity, soften breath modulation
};

export function Background({ theme, elapsedMs, phases, active, sessionProgress, reducedMotion }: BackgroundProps) {
  const { size } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  // Smooth pulse with a small EMA so phase boundaries don't snap.
  const smoothedPulseRef = useRef(0.5);

  const uniforms = useMemo(() => {
    const beam = theme.background.lightBeam;
    const ug = theme.background.underglow;
    return {
      uInner: { value: new THREE.Color(theme.background.innerColor) },
      uOuter: { value: new THREE.Color(theme.background.outerColor) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uBeamColor: { value: new THREE.Color(beam?.color ?? '#000000') },
      uBeamIntensity: { value: beam?.intensity ?? 0 },
      uBreathPulse: { value: 0.5 },
      uUnderglowColor: { value: new THREE.Color(ug?.color ?? '#000000') },
      uUnderglowIntensity: { value: ug?.intensity ?? 0 },
      uUnderglowSessionRamp: { value: 0 },
      uMotionDampen: { value: 0 },
      uTime: { value: 0 },
    };
  }, [theme, size.width, size.height]);

  useFrame(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uResolution.value.set(size.width, size.height);
    matRef.current.uniforms.uTime.value = performance.now() / 1000;
    // Compute breath pulse only during an active session; idle = held at 0.5
    // (calm steady glow, no pulsing). EMA-smooth across phase boundaries so
    // the visual breathes naturally instead of stepping.
    const targetPulse = active ? getBreathAt(elapsedMs, phases).pulse : 0.5;
    smoothedPulseRef.current += (targetPulse - smoothedPulseRef.current) * 0.08;
    matRef.current.uniforms.uBreathPulse.value = smoothedPulseRef.current;
    // Underglow session ramp: 0 until t = 0.7 of session, then climbs
    // smoothly to 1.0 by t = 1.0. Idle = 0 (no glow). This is the
    // "grain of rice → heap" moment lighting up.
    const ramp = active ? Math.max(0, Math.min(1, (sessionProgress - 0.7) / 0.3)) : 0;
    matRef.current.uniforms.uUnderglowSessionRamp.value = ramp;
    matRef.current.uniforms.uMotionDampen.value = reducedMotion ? 1 : 0;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
