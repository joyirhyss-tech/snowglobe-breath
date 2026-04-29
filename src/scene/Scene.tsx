import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Background } from './Background';
import { ParticleField } from './ParticleField';
import { CONFIG } from '../config';
import type { Theme } from '../themes/types';
import type { ParticlePhysics, BreathPhase } from '../modes';

type Props = {
  theme: Theme;
  shakeImpulse: { intensity: number; timestamp: number } | null;
  elapsedMs: number;
  sessionProgress: number;
  active: boolean;
  fadeOutProgress: number;
  physics?: ParticlePhysics;
  phases: ReadonlyArray<BreathPhase>;
  reducedMotion?: boolean;
};

// r3f Canvas owns the WebGL context. The orthographic camera makes world units
// map directly to viewport extents, which simplifies particle containment.
export function Scene(props: Props) {
  const bloomIntensity = props.theme.postfx?.bloomIntensity ?? CONFIG.postfx.bloomIntensity;
  const vignetteDarkness = props.theme.postfx?.vignetteDarkness ?? CONFIG.postfx.vignetteDarkness;

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 5], zoom: 100, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
    >
      <Background
        theme={props.theme}
        elapsedMs={props.elapsedMs}
        phases={props.phases}
        active={props.active}
        sessionProgress={props.sessionProgress}
        reducedMotion={props.reducedMotion ?? false}
      />
      <ParticleField
        // Forces a full remount when mode (count multiplier) or reduced-
        // motion (which halves count) changes. Three.js BufferAttributes
        // can't be resized in place — without this key, switching between
        // modes with different counts logs:
        //   "THREE.WebGLAttributes: The size of the buffer attribute's
        //    array buffer does not match the original size."
        key={`${props.theme.id}-${props.reducedMotion ? 'rm' : 'full'}`}
        theme={props.theme}
        shakeImpulse={props.shakeImpulse}
        elapsedMs={props.elapsedMs}
        sessionProgress={props.sessionProgress}
        active={props.active}
        fadeOutProgress={props.fadeOutProgress}
        physics={props.physics}
        reducedMotion={props.reducedMotion ?? false}
      />
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={CONFIG.postfx.bloomThreshold}
          luminanceSmoothing={CONFIG.postfx.bloomSmoothing}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.2} darkness={vignetteDarkness} />
      </EffectComposer>
    </Canvas>
  );
}
