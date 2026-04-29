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
  narration: 'Vertelling',
  narrationDescription: 'Systeemstem leest het slotcitaat voor',
  appleHealth: 'Apple Gezondheid',     // matches Apple iOS NL string for the Health app
  appleHealthDescription: 'Sla elke voltooide sessie op als Mindful Minuten',
  about: 'Over',
  aboutMission: 'Hush wordt gemaakt door TPC | AEQ — een praktijk die tools bouwt waarin zorg, gelijkwaardigheid en menselijk welzijn centraal staan in alledaagse technologie.',
  aboutPrivacy: 'Privacy: alles blijft op je apparaat. Geen accounts, geen tracking, geen analytics. Feedback die je stuurt vermeldt de actieve modus maar geen persoonlijke informatie.',
  madeBy: 'Gemaakt door',
  aboutFounderLabel: 'Over de oprichter',
  founderBio: 'JoYi Rhyss richtte TPC | AEQ op om tools te bouwen die zorg, gelijkwaardigheid en menselijk welzijn centraal stellen in alledaagse technologie.',
  tellRoo: 'Roo iets vertellen',
  aboutTechnique: 'Over deze techniek',
};
