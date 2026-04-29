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
    // 2026-04-28: pulled inner from #48403e (~26% luminance) down to
    // #2a2522 (~15%) after iPhone testing. Phone displays render mid-
    // luminance grays much brighter than calibrated desktop monitors,
    // and the prior off-white was washing out the warm gold sparkle on
    // mobile. The new value keeps the warm-neutral whisper (R/G/B
    // within 8 units of each other, NOT yellow, NOT green) but gives
    // gold catches ~85% additive headroom instead of ~74% — visibly more
    // shimmer at small particle sizes. Still clearly distinct from
    // silver's deep midnight blue, just a quieter off-white tone now.
    innerColor: '#2a2522',     // warm-neutral charcoal — quieter off-white
    outerColor: '#100c0a',     // deep dark rim (unchanged)
    causticColor: '#d4c4b0',   // softer cream caustic — neutral, no yellow saturation
    causticIntensity: 0.42,
    // Soft warm sunbeam descending into the gold water — tint stays warm so
    // the gold particles still feel "lit from above" but intensity remains
    // low to preserve catch clarity at the brighter bg.
    lightBeam: { color: '#ffd8a0', intensity: 0.06 },
    underglow: { color: '#c89858', intensity: 0.04 },     // ramps in over last 30% of session via Background shader
  },
  particles: {
    palette: ['#ffefb0', '#ffd56a', '#e8b34a', '#c08820', '#a06820'],
    shape: 'star',
    emissive: 1.45,            // bumped 1.15 → 1.45: lighter bg (#48403e ~26%) ate sparkle headroom; pushing gold catches brighter restores the shimmer/wow
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
  postfx: { bloomIntensity: 0.65 },     // bumped 0.45 → 0.65 to compensate for the lighter bg eating sparkle headroom; gives gold catches the diamond-glow halo silver gets from its dark bg
};
