import type { Translations } from './types';

// Korean (한국어). Native Korean (고유어) breath cues 들숨/날숨 are the
// standard in Korean meditation apps (Calm Korea, Mapum) — single-syllable
// rhythm, gentle register. The narration form 숨을 들이마시며 belongs in
// audio voiceover scripts, not on-screen cues.
export const ko: Translations = {
  inhale: '들숨',
  exhale: '날숨',
  hold: '멈춤',
  tap: '탭',
  modeSilver: '실버',
  modeSilverIntent: '하루를 비우다',
  modeGold: '골드',
  modeGoldIntent: '단단한 집중',
  modeRainbow: '레인보우',
  modeRainbowIntent: '기쁨과 열림',
  settings: '설정',
  mode: '모드',
  audio: '소리',
  audioOn: '켜짐',
  audioOff: '꺼짐',
  language: '언어',
  close: '닫기',
};
