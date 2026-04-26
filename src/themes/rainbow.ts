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
    innerColor: '#150828',     // deep aubergine — chromatic neutral
    outerColor: '#050208',     // near-black at the rim
    causticColor: '#d4a8ff',
    causticIntensity: 0.45,
  },
  particles: {
    palette: ['#ff6b9d', '#ffb36b', '#ffe86b', '#7bffb3', '#6bc8ff', '#b46bff'],
    shape: 'prism',
    emissive: 1.2,
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
  postfx: { bloomIntensity: 0.85 },
};
