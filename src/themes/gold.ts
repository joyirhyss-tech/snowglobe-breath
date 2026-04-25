import type { Theme } from './types';

export const gold: Theme = {
  id: 'gold',
  name: 'Gold Shimmer',
  background: {
    innerColor: '#2a1d0c',
    outerColor: '#0a0604',
    causticColor: '#ffd88a',
    causticIntensity: 0.1,
  },
  particles: {
    palette: ['#fff4c2', '#ffd56a', '#d9a23a', '#8a5a12'],
    shape: 'star',
    emissive: 1.1,
    sizeMultiplier: 1.1,
  },
  vessel: {
    rimColor: '#ffe4a8',
    innerTint: '#6a4410',
    innerTintAlpha: 0.1,
  },
  text: {
    color: '#fff4c2',
    fontFamily: '"Cormorant Garamond", "Caveat", serif',
  },
  postfx: { bloomIntensity: 0.85 },
};
