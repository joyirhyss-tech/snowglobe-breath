// Tiny custom i18n. ~50 lines, zero dependencies. Fits ~25 string keys
// across 4 languages. The current language is module-level state, persisted
// in localStorage. Components subscribe via the `useLang()` hook so they
// re-render on language change.

import { useEffect, useState } from 'react';
import { en } from './en';
import { nl } from './nl';
import { ko } from './ko';
import { es } from './es';
import type { Lang, StringKey, Translations } from './types';

export type { Lang, StringKey } from './types';
export { SUPPORTED_LANGS, LANG_NAMES } from './types';

const TRANSLATIONS: Record<Lang, Translations> = { en, nl, ko, es };
const STORAGE_KEY = 'hush.lang';

// Detect the user's preferred language: stored choice → browser → English.
function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && stored in TRANSLATIONS) return stored;
  } catch {}
  if (typeof navigator !== 'undefined') {
    const code = navigator.language.slice(0, 2).toLowerCase();
    if (code in TRANSLATIONS) return code as Lang;
  }
  return 'en';
}

let currentLang: Lang = detectInitialLang();
const subscribers = new Set<(lang: Lang) => void>();

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  subscribers.forEach((fn) => fn(lang));
}

// Lookup a translation. Falls back to English, then to the key itself.
export function t(key: StringKey): string {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.en[key] ?? key;
}

// React hook: returns current language and re-renders on change.
export function useLang(): Lang {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const fn = () => setVersion((v) => v + 1);
    subscribers.add(fn);
    return () => { subscribers.delete(fn); };
  }, []);
  return currentLang;
}
