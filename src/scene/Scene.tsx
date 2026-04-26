import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Background } from './Background';
import { ParticleField } from './ParticleField';
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
  physics?: ParticlePhysics;
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
      <Background theme={props.theme} />
      <ParticleField
        theme={props.theme}
        shakeImpulse={props.shakeImpulse}
        elapsedMs={props.elapsedMs}
        sessionProgress={props.sessionProgress}
        active={props.active}
        fadeOutProgress={props.fadeOutProgress}
        physics={props.physics}
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
