import type { Theme } from './types';

// Silver — silver/cool-white gems against deep WARM darkness.
// Color principle: contrast across the wheel. Cool silver particles need
// warm dark to pop. Background is deep aubergine/wine — the velvet-jewelry
// pairing that makes silver look most luminous (cf. classic jewelry
// photography: silver on burgundy or aubergine velvet).
//
// This breaks v1's mistake of putting silver-blue particles on dark blue
// background — same color family, low visual impact. Now they sing.
export const silver: Theme = {
  id: 'silver',
  name: 'Silver Drift',
  background: {
    innerColor: '#1a0e22',     // deep aubergine — warm dark with depth
    outerColor: '#0a0510',     // purple-black at the rim
    causticColor: '#7a9bc0',
    causticIntensity: 0.42,
  },
  particles: {
    palette: ['#ffffff', '#fff7ec', '#eef4ff', '#f4f8fc', '#ffffff', '#dfe7f4'],
    shape: 'dust',
    emissive: 1.15,
  },
  vessel: {
    rimColor: '#c4a8d8',
    innerTint: '#3d2240',
    innerTintAlpha: 0.03,
  },
  text: {
    color: '#f6f0ff',
    // Cormorant Garamond italic — delicate, ethereal, classical
    fontFamily: '"Cormorant Garamond", "Caveat", serif',
  },
};
