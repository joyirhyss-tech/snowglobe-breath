// Supported languages for v2 launch.
// English (default), Dutch (NL), Korean (KO), Spanish (ES).
// Quote text stays in original authored language; UI strings translate.
export type Lang = 'en' | 'nl' | 'ko' | 'es';

export const SUPPORTED_LANGS: Lang[] = ['en', 'nl', 'ko', 'es'];

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  nl: 'Nederlands',
  ko: '한국어',
  es: 'Español',
};

// All translatable string keys. Keep this list flat and small.
export type StringKey =
  // Breath cues
  | 'inhale'
  | 'exhale'
  | 'hold'
  // Pre-session affordance
  | 'tap'
  // Mode names + intent labels (shown in settings)
  | 'modeSilver'
  | 'modeSilverIntent'
  | 'modeGold'
  | 'modeGoldIntent'
  | 'modeRainbow'
  | 'modeRainbowIntent'
  // Settings UI
  | 'settings'
  | 'mode'
  | 'audio'
  | 'audioOn'
  | 'audioOff'
  | 'language'
  | 'close';

export type Translations = Record<StringKey, string>;
