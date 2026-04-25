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
