import type { Translations } from './types';

// Spanish (Español). Tú-imperative form (inhala / exhala / sostén / toca)
// matches Apple Breathe's Spanish localization and the warm-but-direct
// register used by Calm ES and Petit BamBou ES. Pan-regional vocabulary
// (toca over pulsa) keeps it natural for both Spain and Latin America.
// Lowercase preserved across breath cues for the soft visual aesthetic.
export const es: Translations = {
  inhale: 'inhala',
  exhale: 'exhala',
  hold: 'sostén',
  tap: 'toca',
  modeSilver: 'Plata',
  modeSilverIntent: 'Calma diaria',
  modeGold: 'Oro',
  modeGoldIntent: 'Enfoque firme',
  modeRainbow: 'Arcoíris',
  modeRainbowIntent: 'Alegría y apertura',
  settings: 'Ajustes',
  mode: 'Modo',
  audio: 'Sonido',
  audioOn: 'Activado',
  audioOff: 'Desactivado',
  language: 'Idioma',
  close: 'Cerrar',
};
