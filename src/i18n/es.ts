import type { Translations } from './types';

// Spanish (Español).
// - tú-imperative form (inhala/exhala/mantén/toca) — Apple Style Guide
//   for consumer apps; matches Calm ES and Apple Breathe ES.
// - "mantén" for hold (Apple Salud breathing exercises). NOT "sostén" —
//   that word also means "bra" in Spanish, which creates an unintended
//   comic ambiguity in a meditation context.
// - "Ajustes": Apple iOS ES Settings (es-ES; LatAm uses "Configuración"
//   but Apple ships "Ajustes" globally for Spanish).
// - "Activado/Desactivado": Apple iOS ES toggle strings.
// - "expansión" (expansion) for inner-opening — wellness-standard idiom;
//   "apertura" reads as architectural/business opening.
export const es: Translations = {
  inhale: 'inhala',
  exhale: 'exhala',
  hold: 'mantén',
  tap: 'toca',
  modeSilver: 'Plata',
  modeSilverIntent: 'Calma diaria',
  modeGold: 'Oro',
  modeGoldIntent: 'Enfoque firme',
  modeRainbow: 'Arcoíris',
  modeRainbowIntent: 'Alegría y expansión',
  settings: 'Ajustes',
  mode: 'Modo',
  audio: 'Sonido',
  audioOn: 'Activado',
  audioOff: 'Desactivado',
  language: 'Idioma',
  close: 'Cerrar',
  display: 'Pantalla',
  displayWords: 'Palabras',
  displayCountdown: 'Cuenta atrás',
  displaySilent: 'Silencio',
  narration: 'Narración',
  narrationDescription: 'La voz del sistema lee la cita final en voz alta',
  appleHealth: 'Apple Salud',          // matches Apple iOS ES string for the Health app
  appleHealthDescription: 'Guarda cada sesión completa como Minutos de Mindfulness',
  about: 'Acerca de',
  aboutMission: 'Hush está hecho por TPC | AEQ — una práctica que crea herramientas que ponen el cuidado, la equidad y el bienestar humano en el centro de la tecnología cotidiana.',
  aboutPrivacy: 'Privacidad: todo permanece en tu dispositivo. Sin cuentas, sin seguimiento, sin analíticas. Los comentarios que envías mencionan el modo activo pero ninguna información personal.',
  madeBy: 'Hecho por',
  aboutFounderLabel: 'Acerca de la fundadora',
  founderBio: 'JoYi Rhyss fundó TPC | AEQ para crear herramientas que ponen el cuidado, la equidad y el bienestar humano en el centro de la tecnología cotidiana.',
  tellRoo: 'Cuéntale a Roo',
  aboutTechnique: 'Acerca de esta técnica',
};
