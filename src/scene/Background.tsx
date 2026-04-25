import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Theme } from '../themes/types';

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
  uniform vec3 uInner;
  uniform vec3 uOuter;
  uniform vec2 uResolution;

  void main() {
    vec2 centered = vUv - 0.5;
    centered.x *= uResolution.x / uResolution.y;
    float r = length(centered);

    // Soft radial gradient: lighter at the center, deepening outward.
    vec3 base = mix(uInner, uOuter, smoothstep(0.0, 0.85, r));

    // Strong outer vignette pulls edges into deep dark — frames the field.
    float vignette = smoothstep(1.18, 0.18, r);
    base *= vignette;

    gl_FragColor = vec4(base, 1.0);
  }
`;

export function Background({ theme }: { theme: Theme }) {
  const { size } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uInner: { value: new THREE.Color(theme.background.innerColor) },
    uOuter: { value: new THREE.Color(theme.background.outerColor) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  }), [theme, size.width, size.height]);

  useFrame(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uResolution.value.set(size.width, size.height);
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
