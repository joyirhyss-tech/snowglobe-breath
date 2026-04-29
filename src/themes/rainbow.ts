import type { Theme } from './types';

// Rainbow — prismatic gems against deep aubergine-purple neutral.
// Color principle: full-spectrum particles need a deep, slightly chromatic
// neutral background that doesn't compete. Aubergine is the perfect choice —
// dark enough for color to pop, but with enough purple-violet richness that
// the prism of particles reads as iridescent rather than random.
//
// Pairs with hueShift in the shader (each particle slowly cycles its hue
// over time), faster twinkle, and slightly more particles for the wow-factor
// "stained glass dancing in deep night" effect.
//
// Italiana font — very thin classical Roman, ethereal and expansive. Pairs
// with the joyful expansion intent.
export const rainbow: Theme = {
  id: 'rainbow',
  name: 'Prism',
  background: {
    // Cool silvery-grey water at silver-baseline luminance (~5%, matching
    // v1 silver #0a1426). Particles use additive blending — anything
    // brighter than this washes out sparkle. Reads as "deep silvery water
    // with hint of cool violet" — distinct from silver's blue tint, but
    // same level of darkness so prism particles pop with the same
    // diamond-catch clarity silver delivers.
    innerColor: '#16161e',     // pulled slightly darker (was #1a1a22) — kills residual violet haze that read as murky
    outerColor: '#06060a',     // near-black at the rim
    causticColor: '#c8c8e0',
    causticIntensity: 0.55,
    // Pale prismatic sunbeam — intensity dialed back from 0.09 → 0.05 so
    // the beam adds depth without graying out the prismatic catches with
    // its lavender wash. Reads as "filtered light through stained glass"
    // without competing with the particles for color attention.
    lightBeam: { color: '#e0d4ff', intensity: 0.03 },     // dialed back from 0.05 — even subtle additive layers fight silver-level catch clarity when stacked
    underglow: { color: '#c8c0d0', intensity: 0.025 },    // dialed back from 0.04; ramps in over last 30% of session so the swirl phase stays clean
  },
  particles: {
    palette: ['#ff6b9d', '#ffb36b', '#ffe86b', '#7bffb3', '#6bc8ff', '#b46bff'],
    shape: 'prism',
    emissive: 1.15,            // back to silver baseline — over-emissive was stacking into murk; the prismatic palette does the chromatic work, the dark bg does the contrast work
    rainbow: true,
  },
  vessel: {
    rimColor: '#e8d5ff',
    innerTint: '#3a1a55',
    innerTintAlpha: 0.05,
  },
  text: {
    color: '#fff0fc',
    // Italiana — ethereal, classical, expansive
    fontFamily: '"Italiana", "Cormorant Garamond", serif',
  },
  postfx: { bloomIntensity: 0.45 },     // matches silver's default — clarity comes from the dark bg + crisp catches, not from amplifying bloom
};
