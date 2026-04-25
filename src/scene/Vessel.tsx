import { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { Theme } from '../themes/types';
import { CONFIG } from '../config';

// Subtle inner glass tint + rim highlight. Suggests a vessel without framing the screen.
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uRim;
  uniform vec3 uTint;
  uniform float uTintAlpha;
  uniform float uRimStrength;
  uniform vec2 uResolution;

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;
    float r = length(uv);
    // Rim: bright thin ring near the viewport edge.
    float rim = smoothstep(0.82, 0.98, r) * (1.0 - smoothstep(0.98, 1.2, r));
    // Inner tint: subtle colored wash across the interior.
    float tintMask = 1.0 - smoothstep(0.0, 0.9, r);
    vec3 color = uRim * rim * uRimStrength + uTint * tintMask * uTintAlpha;
    float alpha = rim * uRimStrength + tintMask * uTintAlpha;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function Vessel({ theme }: { theme: Theme }) {
  const { size } = useThree();
  const uniforms = useMemo(() => ({
    uRim: { value: new THREE.Color(theme.vessel.rimColor) },
    uTint: { value: new THREE.Color(theme.vessel.innerTint) },
    uTintAlpha: { value: theme.vessel.innerTintAlpha },
    uRimStrength: { value: CONFIG.vessel.edgeHighlight },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  }), [theme, size.width, size.height]);

  return (
    <mesh frustumCulled={false} renderOrder={10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}
