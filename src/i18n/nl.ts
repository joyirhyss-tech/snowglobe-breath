import type { Translations } from './types';

// Dutch (Nederlands).
// - Bare prepositions "in"/"uit" for breath cues (Apple Watch Dutch
//   localization shortens to these in the bubble UI; native meditation
//   apps Meditation Moments NL and VGZ Mindfulness do the same).
// - "stil" (still/quiet) for breath hold — parallel one-word register to
//   in/uit. "vasthouden" is correct dictionary form but reads as an
//   instruction rather than a cue.
// - "Stevige focus" (firm/solid focus) for grounding — "geaard" is
//   electrical-engineering, not meditation.
// - "openheid" (openness) for the abstract sense; "opening" in Dutch
//   means a physical aperture.
export const nl: Translations = {
  inhale: 'in',
  exhale: 'uit',
  hold: 'stil',
  tap: 'tik',
  modeSilver: 'Zilver',
  modeSilverIntent: 'Dagelijkse rust',
  modeGold: 'Goud',
  modeGoldIntent: 'Stevige focus',
  modeRainbow: 'Regenboog',
  modeRainbowIntent: 'Vreugde en openheid',
  settings: 'Instellingen',
  mode: 'Modus',
  audio: 'Geluid',
  audioOn: 'Aan',
  audioOff: 'Uit',
  language: 'Taal',
  close: 'Sluiten',
  display: 'Weergave',
  displayWords: 'Woorden',
  displayCountdown: 'Aftellen',
  displaySilent: 'Stil',
};
