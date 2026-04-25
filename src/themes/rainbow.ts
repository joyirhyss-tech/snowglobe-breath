import type { Theme } from './types';

export const rainbow: Theme = {
  id: 'rainbow',
  name: 'Prism',
  background: {
    innerColor: '#1a1030',
    outerColor: '#050208',
    causticColor: '#e8d5ff',
    causticIntensity: 0.12,
  },
  particles: {
    palette: ['#ff6b9d', '#ffb36b', '#ffe86b', '#7bffb3', '#6bc8ff', '#b46bff'],
    shape: 'prism',
    emissive: 1.0,
    rainbow: true,
  },
  vessel: {
    rimColor: '#e8d5ff',
    innerTint: '#6a3fb0',
    innerTintAlpha: 0.09,
  },
  text: {
    color: '#f8ebff',
    fontFamily: '"Cormorant Garamond", "Caveat", serif',
  },
  postfx: { bloomIntensity: 0.9 },
};
