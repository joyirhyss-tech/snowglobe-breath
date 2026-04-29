import type { Theme } from './types';

// Deep-water silver: dark blue-black water that recedes, with very subtle
// muted-blue caustic ripples. The silver glitter pops as the bright element;
// the background never competes for attention.
//
// This is the v1 baseline silver — frozen by user contract. Do not modify
// background, vessel, or text colors here without explicit approval.
export const silver: Theme = {
  id: 'silver',
  name: 'Silver Drift',
  background: {
    innerColor: '#0a1426',     // deep midnight blue, hint of cyan depth
    outerColor: '#01030a',     // near black at the rim
    causticColor: '#7a9bc0',   // brighter muted blue — ripples must read clearly as water
    causticIntensity: 0.42,
  },
  particles: {
    // Mixed palette: pure white anchors, warm-white and cool-white tints
    // give the field dimensional shimmer rather than uniform gray-blue.
    palette: ['#ffffff', '#fff7ec', '#eef4ff', '#f4f8fc', '#ffffff', '#dfe7f4'],
    shape: 'dust',
    emissive: 1.15,
  },
  vessel: {
    rimColor: '#a8b8cc',
    innerTint: '#3d4d66',
    innerTintAlpha: 0.03,
  },
  text: {
    color: '#f2f5fa',
    fontFamily: '"Cormorant Garamond", "Caveat", serif',
  },
};
