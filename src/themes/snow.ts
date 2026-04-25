import type { Theme } from './types';

export const snow: Theme = {
  id: 'snow',
  name: 'Snowfall',
  background: {
    innerColor: '#0f1622',
    outerColor: '#020509',
    causticColor: '#c7daff',
    causticIntensity: 0.07,
  },
  particles: {
    palette: ['#ffffff', '#f1f6ff', '#dde7f7'],
    shape: 'flake',
    count: 260,
    sizeMultiplier: 1.3,
    emissive: 0.4,
  },
  vessel: {
    rimColor: '#e1ebff',
    innerTint: '#7890b8',
    innerTintAlpha: 0.07,
  },
  text: {
    color: '#f1f6ff',
    fontFamily: '"Cormorant Garamond", "Homemade Apple", serif',
  },
};
