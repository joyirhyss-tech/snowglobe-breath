import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config';
import type { Theme } from '../themes/types';
import type { ParticlePhysics } from '../modes';

type Props = {
  theme: Theme;
  shakeImpulse: { intensity: number; timestamp: number } | null;
  elapsedMs: number;
  sessionProgress: number;
  active: boolean;
  fadeOutProgress: number;
  // Per-mode physics overrides (multipliers on shared CONFIG.particles).
  // Empty object = silver baseline. Gold and Rainbow override.
  physics?: ParticlePhysics;
};

// ── Noise helpers ────────────────────────────────────────────────────────
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s);
}
function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const n000 = hash3(xi, yi, zi), n100 = hash3(xi + 1, yi, zi);
  const n010 = hash3(xi, yi + 1, zi), n110 = hash3(xi + 1, yi + 1, zi);
  const n001 = hash3(xi, yi, zi + 1), n101 = hash3(xi + 1, yi, zi + 1);
  const n011 = hash3(xi, yi + 1, zi + 1), n111 = hash3(xi + 1, yi + 1, zi + 1);
  const nx00 = n000 + u * (n100 - n000);
  const nx10 = n010 + u * (n110 - n010);
  const nx01 = n001 + u * (n101 - n001);
  const nx11 = n011 + u * (n111 - n011);
  const nxy0 = nx00 + v * (nx10 - nx00);
  const nxy1 = nx01 + v * (nx11 - nx01);
  return (nxy0 + w * (nxy1 - nxy0)) * 2 - 1;
}
// Curl of 3D noise potential — divergence-free vector field (fluid-like eddies).
function curl3(x: number, y: number, z: number, eps = 0.35): [number, number, number] {
  const dyN = (noise3(x, y + eps, z) - noise3(x, y - eps, z)) / (2 * eps);
  const dzN = (noise3(x, y, z + eps) - noise3(x, y, z - eps)) / (2 * eps);
  const dxN = (noise3(x + eps, y, z) - noise3(x - eps, y, z)) / (2 * eps);
  return [dyN - dzN, dzN - dxN, dxN - dyN];
}

// ── Log-normal sampler for per-particle sink rates ──────────────────────
// Real glitter sizes are log-normal → settling rates too. Fines linger, large
// flakes settle fast. Clamped to prevent absurd tails.
function sampleLogNormal(mean: number, sigma: number, min: number, max: number) {
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // std normal
  const v = Math.exp(Math.log(mean) + sigma * z);
  return Math.min(max, Math.max(min, v));
}

// Pile height at a given x. Determines the top of the pile column at that x.
// Used both at spawn time AND during runtime settle so the pile shape is
// preserved across sessions regardless of where particles drift to.
//
// Profile: power-law falloff from a flat-ish center to clean edges, plus
// organic noise scaled by local height. Noise vanishes where the pile
// vanishes — keeps the silhouette clean.
function pileHeightAtX(px: number, halfW: number, pileDepth: number): number {
  const xN = px / halfW;                                  // -1..1
  // pow(|xN|, 1.5) gives a flatter top + faster edge taper than linear
  const tri = Math.max(0, 1 - Math.pow(Math.abs(xN), 1.5));
  const n1 = (Math.sin(xN * 4.3 + 1.7) * 0.5 + 0.5) * 0.18;
  const n2 = (Math.sin(xN * 11.2 + 0.4) * 0.5 + 0.5) * 0.09;
  return Math.max(0, tri + (n1 + n2) * tri) * pileDepth;
}

// ── Sparkle texture: radial glow + cross streaks (the "diamond" sparkle) ─
function makeSparkleTexture(size = 128): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // Radial glow (soft falloff).
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.16)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // Cross streaks — the glitter-catch effect.
  ctx.globalCompositeOperation = 'lighter';
  const streak = ctx.createLinearGradient(0, size / 2, size, size / 2);
  streak.addColorStop(0, 'rgba(255,255,255,0)');
  streak.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  streak.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  streak.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  streak.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = streak;
  ctx.fillRect(0, size / 2 - 1, size, 2);
  const streakV = ctx.createLinearGradient(size / 2, 0, size / 2, size);
  streakV.addColorStop(0, 'rgba(255,255,255,0)');
  streakV.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  streakV.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  streakV.addColorStop(0.55, 'rgba(255,255,255,0.35)');
  streakV.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = streakV;
  ctx.fillRect(size / 2 - 1, 0, 2, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// ── Custom shader: per-particle twinkle + optional hue shift (rainbow) ──
const VERT = /* glsl */ `
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aRot;
  attribute vec3  aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uShakeFlash;
  uniform float uFloorY;
  uniform float uPileDepth;
  uniform float uTwinkleSettled;
  uniform float uTwinkleFloor;
  uniform float uOpacity;
  uniform float uHueShift;            // 0 = off, 1 = on (rainbow mode)
  varying float vTwinkle;
  varying float vRot;
  varying vec3  vColor;
  varying float vOpacity;

  // Proper YIQ-space hue rotation. Cleaner color than RGB-axis rodrigues.
  vec3 hueRotate(vec3 c, float angle) {
    const mat3 toYIQ = mat3(
      0.299,  0.587,  0.114,
      0.596, -0.274, -0.322,
      0.211, -0.523,  0.311
    );
    const mat3 toRGB = mat3(
      1.0,  0.956,  0.621,
      1.0, -0.272, -0.647,
      1.0, -1.106,  1.703
    );
    vec3 yiq = toYIQ * c;
    float cs = cos(angle);
    float sn = sin(angle);
    vec2 rotIQ = vec2(yiq.y * cs - yiq.z * sn, yiq.y * sn + yiq.z * cs);
    return toRGB * vec3(yiq.x, rotIQ);
  }

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;

    // Settled amount: 0 while suspended, 1 while in the pile.
    float settled = 1.0 - smoothstep(uFloorY, uFloorY + uPileDepth + 0.08, position.y);
    float twinkleSpeed = mix(aSpeed, uTwinkleSettled, settled);

    // Composite twinkle: gentle sine baseline + occasional subtle catch peaks.
    float base = 0.45 + 0.55 * sin(uTime * twinkleSpeed + aPhase);
    float catch_ = pow(max(sin(uTime * twinkleSpeed * 2.4 + aPhase * 2.1), 0.0), 14.0);
    float tw = base * 0.55 + catch_ * 0.45;
    tw = max(uTwinkleFloor, min(tw, 1.0));
    tw = mix(tw, 1.0, uShakeFlash * 0.6);

    vTwinkle = tw;
    vRot = aRot + uTime * 0.4;
    vOpacity = uOpacity;

    // Hue shift for rainbow mode: each particle's color cycles slowly over
    // time, with a per-particle phase offset so they don't all change in
    // unison. Effect = "stained-glass dancing" without any cost when off.
    vec3 col = aColor;
    if (uHueShift > 0.5) {
      float angle = uTime * 0.22 + aPhase * 0.4;
      col = hueRotate(col, angle);
    }
    vColor = col;

    float sizeMul = 1.0 + 0.25 * tw + uShakeFlash * 0.3;
    gl_PointSize = aSize * sizeMul * uPixelRatio;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uSprite;
  varying float vTwinkle;
  varying float vRot;
  varying vec3  vColor;
  varying float vOpacity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float c = cos(vRot), s = sin(vRot);
    uv = mat2(c, -s, s, c) * uv + 0.5;
    vec4 tex = texture2D(uSprite, uv);
    float a = tex.a * vTwinkle * vOpacity;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor * tex.rgb * vTwinkle, a);
  }
`;

export function ParticleField({ theme, shakeImpulse, elapsedMs, sessionProgress, active, fadeOutProgress, physics }: Props) {
  const phys = physics ?? {};
  // Per-mode multipliers. 1.0 = silver baseline.
  const sinkMul = phys.sinkRateMul ?? 1;
  const curlMul = phys.curlStrengthMul ?? 1;
  const physSizeMul = phys.sizeMul ?? 1;
  const twinkleMul = phys.twinkleSpeedMul ?? 1;
  const countMul = phys.countMul ?? 1;
  const hueShift = phys.hueShift ?? false;

  const baseCount = theme.particles.count ?? CONFIG.particles.count;
  const count = Math.round(baseCount * countMul);
  const sizeMul = (theme.particles.sizeMultiplier ?? 1) * physSizeMul;
  const emissive = theme.particles.emissive ?? 0.9;
  const { viewport, size: screen } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Per-particle state. Some attributes live on the GPU (color, phase, speed,
  // size, rotation); physics state (velocity, sink rate) stays on CPU.
  const buffers = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const rotations = new Float32Array(count);
    const pixelSizes = new Float32Array(count);
    const sinkRates = new Float32Array(count);
    // Per-particle column fraction (0..1) — determines how high in its column
    // a particle rests. Combined with pileHeightAtX(currentX) at runtime gives
    // the y-position of the pile top for that particle.
    const pileColFractions = new Float32Array(count);

    const P = CONFIG.particles;
    const palette = theme.particles.palette.map((c) => new THREE.Color(c));
    const [sMin, sMax] = P.sizeRange;
    const [twMin, twMax] = P.twinkleSpeedRange;
    const [skMin, skMax] = P.sinkRateRange;

    // Base pixel size for point sprites — scales roughly with device viewport.
    const basePixel = Math.max(6, Math.min(screen.width, screen.height) * 0.012) * sizeMul;

    // Spawn particles ALREADY at the pile so on first open the scene reads as
    // a settled snowglobe sitting on a shelf. Action only begins when shaken.
    const halfH = viewport.height * 0.5;
    const floorY = -halfH + viewport.height * P.floorMargin;

    // The pile profile is now a deterministic function of x (pileHeightAtX).
    // Each particle gets a fraction-of-column home; the y position is computed
    // from the particle's CURRENT x position both at spawn and at settle time,
    // so the pile shape is preserved no matter where particles drift to.
    const halfW = viewport.width * 0.5;

    for (let i = 0; i < count; i += 1) {
      // x: random across viewport. Visible pile shape comes from column height.
      const px = (Math.random() - 0.5) * viewport.width * 0.99;
      positions[i * 3 + 0] = px;

      // Per-particle column fraction. Bias toward 0 → denser at the base than
      // the top, like real settled glitter.
      const fraction = Math.pow(Math.random(), 1.25);
      pileColFractions[i] = fraction;

      const colHeight = pileHeightAtX(px, halfW, P.pileDepth);
      positions[i * 3 + 1] = floorY + fraction * colHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      const col = palette[i % palette.length];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      phases[i] = Math.random() * Math.PI * 2;
      // Per-particle twinkle speed — multiplied by mode override (rainbow:
      // faster sparkle; gold: slower).
      speeds[i] = (twMin + Math.random() * (twMax - twMin)) * twinkleMul;
      rotations[i] = Math.random() * Math.PI * 2;
      pixelSizes[i] = basePixel * ((sMin + Math.random() * (sMax - sMin)) / sMax);
      // Per-particle sink rate — multiplied by mode override (rainbow:
      // slower fall, particles linger; gold: also slower for weight).
      sinkRates[i] = sampleLogNormal(P.sinkRateMean, P.sinkRateSigma, skMin, skMax) * sinkMul;
    }
    return { positions, velocities, colors, phases, speeds, rotations, pixelSizes, sinkRates, pileColFractions };
  }, [count, theme, viewport.width, viewport.height, sizeMul, screen.width, screen.height, twinkleMul, sinkMul]);

  // Shake kick: inject velocity from where particles currently rest. No
  // teleport, no redistribution. Particles rise out of the pile and spread
  // through the volume via the physics — strong upward-biased impulse plus
  // the curl-noise turbulence handles dispersion over the first 1-2 seconds,
  // exactly like fluid agitated inside a real globe.
  //
  // Tracking (buffers ref, timestamp) instead of just timestamp ensures the
  // injection re-runs when a new session creates new buffers (theme change),
  // even if React batches the shakeImpulse update before the buffers have
  // been recreated. useLayoutEffect runs synchronously after render, before
  // r3f's next useFrame — so velocities are guaranteed in place by the time
  // the settled-detection check looks at them.
  const injectedRef = useRef<{ velocities: Float32Array; timestamp: number } | null>(null);
  const shakeFlashStartRef = useRef(-999);
  useLayoutEffect(() => {
    if (!shakeImpulse) return;
    const last = injectedRef.current;
    if (last && last.velocities === buffers.velocities && last.timestamp === shakeImpulse.timestamp) {
      return; // already injected this exact impulse into this exact buffer
    }
    shakeFlashStartRef.current = performance.now() / 1000;
    const P = CONFIG.particles;
    const strength = P.impulseStrength * shakeImpulse.intensity;
    const { velocities, positions } = buffers;
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;        // azimuth
      const cosPhi = Math.random();                      // upper hemisphere
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      const magMul = P.impulseMagMin + Math.random() * (P.impulseMagMax - P.impulseMagMin);
      const mag = strength * magMul;
      velocities[i * 3 + 0] = sinPhi * Math.cos(theta) * mag;
      velocities[i * 3 + 1] = cosPhi * mag;              // always upward
      velocities[i * 3 + 2] = sinPhi * Math.sin(theta) * mag * 0.4;
      // Defense-in-depth: lift the particle slightly off the pile so the
      // settled-detection check (py <= pileTop + 0.015) cannot snap them
      // back to zero on the first frame after a fresh-buffers re-spawn.
      positions[i * 3 + 1] += 0.08;
    }
    injectedRef.current = { velocities: buffers.velocities, timestamp: shakeImpulse.timestamp };
  }, [shakeImpulse, buffers, count]);

  const sprite = useMemo(() => makeSparkleTexture(128), []);

  useFrame((_, rawDt) => {
    const points = pointsRef.current;
    const mat = matRef.current;
    if (!points || !mat) return;

    const geo = points.geometry as THREE.BufferGeometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const { velocities, sinkRates, pileColFractions } = buffers;

    const dt = Math.min(rawDt, 1 / 45);
    const t = performance.now() / 1000;
    const elapsedSec = elapsedMs / 1000;

    const P = CONFIG.particles;
    // Turbulence only flows during an active session. When idle (no shake yet)
    // or after the session ends, curl is zero so the pile sits perfectly still.
    const turb = active ? Math.exp(-elapsedSec / P.turbulenceDecayTau) : 0;
    const curlMag = P.turbulenceStrength * turb * curlMul;

    // Late-session sink boost. After sinkBoostStartSec, ramp effective sink
    // up to sinkBoostMaxMul so any lingering fines definitely reach the pile
    // before 60s. Guarantees the "everything settled" end-state.
    const boostT = Math.max(0, (elapsedSec - P.sinkBoostStartSec) / (CONFIG.session.durationMs / 1000 - P.sinkBoostStartSec));
    const sinkBoost = active ? 1 + Math.min(1, boostT) * (P.sinkBoostMaxMul - 1) : 1;

    const halfH = viewport.height * 0.5;
    const halfW = viewport.width * 0.5;
    const floorY = -halfH + viewport.height * P.floorMargin;
    const maxSpeedSq = P.maxSpeed * P.maxSpeed;

    // Viscosity ramp: low at shake (impulse persists, particles travel up
    // through the full vessel), high by mid-session (Stokes regime, gentle
    // settling). Without this ramp momentum dies in ~1s and most particles
    // never escape the bottom third.
    const sessionT = active
      ? Math.min(1, elapsedSec / (CONFIG.session.durationMs / 1000))
      : 1;
    const viscT = Math.pow(sessionT, P.viscosityCurve);
    const visc = P.viscosityShake + (P.viscositySettle - P.viscosityShake) * viscT;

    for (let i = 0; i < count; i += 1) {
      const ix = i * 3;
      const py = positions[ix + 1];
      // Pile top is computed dynamically from the particle's CURRENT x. This
      // preserves the triangular pile shape across sessions even if particles
      // drift horizontally during the swirl.
      const colHeight = pileHeightAtX(positions[ix], halfW, P.pileDepth);
      const pileTop = floorY + pileColFractions[i] * colHeight;
      // Velocity-aware settled detection: a particle is "in the pile" only if
      // it's at the floor AND essentially motionless. A fresh shake injects
      // velocity, which lets pile particles lift off without being re-zeroed.
      const speedSq = velocities[ix] ** 2 + velocities[ix + 1] ** 2 + velocities[ix + 2] ** 2;
      const settled = py <= pileTop + 0.015 && speedSq < 0.012;

      if (settled) {
        // Locked in place. The shader still animates per-particle twinkle, so
        // the pile shimmers without any positional movement — exactly what a
        // resting snowglobe looks like in real life.
        positions[ix + 1] = pileTop;
        velocities[ix] = 0;
        velocities[ix + 1] = 0;
        velocities[ix + 2] = 0;
      } else {
        // Suspended: curl turbulence + per-particle sink rate; velocity relaxes
        // toward the target at Stokes-like rate (visc * dt capped at 1).
        const sd = i * 0.137;
        const nx = positions[ix] * P.curlScale + sd;
        const ny = py * P.curlScale + sd * 1.31;
        const nz = t * P.curlTimeSpeed + sd * 2.17;
        const [cx, cy, cz] = curl3(nx, ny, nz, 0.35);

        const targetVx = cx * curlMag;
        const targetVy = cy * curlMag - sinkRates[i] * sinkBoost;
        const targetVz = cz * curlMag * 0.3;

        const k = Math.min(1, visc * dt);
        velocities[ix]     += (targetVx - velocities[ix])     * k;
        velocities[ix + 1] += (targetVy - velocities[ix + 1]) * k;
        velocities[ix + 2] += (targetVz - velocities[ix + 2]) * k;

        const spSq = velocities[ix] ** 2 + velocities[ix + 1] ** 2 + velocities[ix + 2] ** 2;
        if (spSq > maxSpeedSq) {
          const s = P.maxSpeed / Math.sqrt(spSq);
          velocities[ix] *= s;
          velocities[ix + 1] *= s;
          velocities[ix + 2] *= s;
        }

        positions[ix]     += velocities[ix]     * dt;
        positions[ix + 1] += velocities[ix + 1] * dt;
        positions[ix + 2] += velocities[ix + 2] * dt;

        // Soft horizontal containment — bounce back at edges.
        const halfW = viewport.width * 0.5;
        if (positions[ix] > halfW)  { positions[ix] = halfW;  velocities[ix] *= -0.25; }
        else if (positions[ix] < -halfW) { positions[ix] = -halfW; velocities[ix] *= -0.25; }
        if (positions[ix + 1] > halfH) { positions[ix + 1] = halfH; velocities[ix + 1] *= -0.25; }

        // Catch particles that went past the floor this frame.
        if (positions[ix + 1] < pileTop) {
          positions[ix + 1] = pileTop;
          velocities[ix + 1] = 0;
        }
      }
    }
    posAttr.needsUpdate = true;

    // Shake flash decays with its own fast timescale.
    const flashAge = t - shakeFlashStartRef.current;
    const flash = Math.exp(-flashAge / P.shakeFlashDecayTau) * P.shakeFlashStrength;
    const clampedFlash = Math.max(0, Math.min(1, flashAge >= 0 ? flash : 0));

    mat.uniforms.uTime.value = t;
    mat.uniforms.uShakeFlash.value = clampedFlash;
    mat.uniforms.uFloorY.value = floorY;
    // Opacity fades during session ending. Also dim slightly when idle.
    const baseOpacity = emissive;
    mat.uniforms.uOpacity.value = baseOpacity * (1 - fadeOutProgress) * (active ? 1 : 0.72);
    // sessionProgress is currently used only as a visual-cue input; physics
    // derives settle from real time elapsed + turbulence decay.
    void sessionProgress;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uSprite: { value: sprite },
    uShakeFlash: { value: 0 },
    uFloorY: { value: -viewport.height * 0.5 + viewport.height * CONFIG.particles.floorMargin },
    uPileDepth: { value: CONFIG.particles.pileDepth },
    uTwinkleSettled: { value: CONFIG.particles.twinkleSpeedSettled },
    uTwinkleFloor: { value: CONFIG.particles.twinkleBaseFloor },
    uOpacity: { value: emissive },
    uHueShift: { value: hueShift ? 1 : 0 },
  }), [sprite, viewport.height, emissive, hueShift]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={buffers.positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor"   count={count} array={buffers.colors}    itemSize={3} />
        <bufferAttribute attach="attributes-aPhase"   count={count} array={buffers.phases}    itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed"   count={count} array={buffers.speeds}    itemSize={1} />
        <bufferAttribute attach="attributes-aRot"     count={count} array={buffers.rotations} itemSize={1} />
        <bufferAttribute attach="attributes-aSize"    count={count} array={buffers.pixelSizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
