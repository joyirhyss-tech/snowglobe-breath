// Closing-quote narration via the Web Speech API. v1 fallback before the
// user records bespoke voice tracks for rainbow mode (project plan).
//
// Goals
// -----
// - **Optional**: never speaks unless the user has opted in via settings.
// - **Honors language**: picks a voice matching the active locale (en/nl/
//   ko/es) and falls back to the default if unavailable.
// - **Calm prosody**: very slow rate (0.78), low pitch (0.92). The default
//   Web Speech voices read too fast and too high for a meditation closing.
// - **Idempotent + cancellable**: starting a new session cancels any
//   in-flight utterance so the previous quote doesn't bleed into the next
//   session.
// - **Replaceable**: when bespoke recordings exist (rainbow poems in your
//   voice), they take precedence — see audio/engine.ts. This module is
//   only the fallback / generic narrator for silver and gold quotes.
//
// API: callers use `narrate(text, lang)` once when the closing quote
// appears, and `cancelNarration()` on session reset.

import type { Lang } from '../i18n';

// Mapping from our 4 languages to BCP-47 voice locales the browser likely
// has. Browser will pick the first matching voice from getVoices().
const LANG_TO_BCP47: Record<Lang, string[]> = {
  en: ['en-US', 'en-GB', 'en'],
  nl: ['nl-NL', 'nl-BE', 'nl'],
  ko: ['ko-KR', 'ko'],
  es: ['es-ES', 'es-MX', 'es-419', 'es'],
};

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  for (const tag of LANG_TO_BCP47[lang]) {
    const exact = voices.find((v) => v.lang === tag);
    if (exact) return exact;
    const prefix = voices.find((v) => v.lang.startsWith(tag + '-') || v.lang === tag);
    if (prefix) return prefix;
  }
  return null;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isNarrationSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function narrate(text: string, lang: Lang): void {
  if (!isNarrationSupported()) return;
  // Cancel anything currently speaking. Web Speech queues by default —
  // unwanted bleed across sessions.
  cancelNarration();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = LANG_TO_BCP47[lang][0];
  utterance.rate = 0.78;     // calmer than default 1.0
  utterance.pitch = 0.92;    // slightly lowered — meditative, not chirpy
  utterance.volume = 0.85;   // sit under the drone, not over
  utterance.onend = () => { if (currentUtterance === utterance) currentUtterance = null; };
  utterance.onerror = () => { if (currentUtterance === utterance) currentUtterance = null; };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancelNarration(): void {
  if (!isNarrationSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

// Some browsers populate getVoices() asynchronously. Pre-warm so the first
// call to pickVoice() has results. Caller should run this once on app boot.
export function warmNarrationVoices(): void {
  if (!isNarrationSupported()) return;
  // Trigger initial fetch.
  window.speechSynthesis.getVoices();
  // Subscribe — voices may arrive after a tick.
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
