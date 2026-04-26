import type { Theme } from './types';

// Gold — warm gold/amber gems against deep COOL water.
// Color principle: classic gold-on-teal jewelry pairing. Cool teal sets off
// warm gold the way nothing else does — used by Cartier, Tiffany, museum
// goldsmith displays. Cool depth makes gold read as luminous, never muddy.
//
// Bodoni Moda italic for breath cues — high-contrast, ornate, premium. Pairs
// with the heavier physics (slower fall, larger particles) for a grounded,
// substantial feel.
export const gold: Theme = {
  id: 'gold',
  name: 'Gold Shimmer',
  background: {
    innerColor: '#0a2538',     // deep teal — the goldsmith's velvet
    outerColor: '#020812',     // sapphire-black at the rim
    causticColor: '#6ad5e8',
    causticIntensity: 0.38,
  },
  particles: {
    palette: ['#ffefb0', '#ffd56a', '#e8b34a', '#c08820', '#a06820'],
    shape: 'star',
    emissive: 1.25,
    sizeMultiplier: 1.0,
  },
  vessel: {
    rimColor: '#d4a868',
    innerTint: '#3d2810',
    innerTintAlpha: 0.04,
  },
  text: {
    color: '#fff4c2',
    // Bodoni Moda italic — high-contrast, premium, substantial
    fontFamily: '"Bodoni Moda", "Cormorant Garamond", serif',
  },
  postfx: { bloomIntensity: 0.65 },
};
