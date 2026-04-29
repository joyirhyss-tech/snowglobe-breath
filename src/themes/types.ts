export type ParticleShape = 'dust' | 'flake' | 'star' | 'prism';

export type Theme = {
  id: string;
  name: string;

  // Background: radial gradient from inner to outer, plus subtle caustic tint.
  background: {
    innerColor: string;
    outerColor: string;
    causticColor: string;
    causticIntensity: number; // 0..1
    // Optional directional sunlight beam — soft cone from the upper part of
    // the canvas, fading down/sides. Adds a sense of light entering the
    // water from above. Disabled (omitted) on v1 silver to preserve the
    // baseline contract; gold and rainbow use it for added depth.
    lightBeam?: {
      color: string;     // hex tint of the beam (warm or cool)
      intensity: number; // 0..1 — additive strength at peak
    };
    // Optional pile underglow — soft mode-tinted radial glow concentrated at
    // the bottom-center where the pile sits. Completes the "jewels at rest"
    // image at session end. Subtle enough not to compete with sparkle.
    underglow?: {
      color: string;
      intensity: number; // 0..1
    };
  };

  // Particle appearance. Physics comes from CONFIG; themes may override counts/size.
  particles: {
    palette: string[]; // sampled per-particle
    shape: ParticleShape;
    count?: number;    // overrides CONFIG.particles.count
    sizeMultiplier?: number;
    emissive?: number; // 0..2, feeds into bloom
    rainbow?: boolean; // hue shifts over lifetime when true
  };

  // Glass vessel tint.
  vessel: {
    rimColor: string;
    innerTint: string;
    innerTintAlpha: number;
  };

  // Breath text styling.
  text: {
    color: string;
    fontFamily: string;
  };

  // Post-processing overrides (optional).
  postfx?: {
    bloomIntensity?: number;
    vignetteDarkness?: number;
  };
};
