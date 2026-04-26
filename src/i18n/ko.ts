import type { Translations } from './types';

// Korean (한국어).
// - 들숨/날숨: standard Sino-Korean breath terms (Apple Breathe Korean,
//   Calm Korea, Mabo all use these)
// - 참기: breath-hold (vs. 멈춤 which is "pause/stop", a UI term).
//   Mabo uses 숨 참기; 참기 alone is the cleanest cue.
// - 켜짐/꺼짐: Apple iOS Korean's exact strings for On/Off toggles.
// - 기쁨과 열린 마음 ("joy and an open heart") — reads as meditation copy
//   (Calm KO style); 열림 alone is too bare.
export const ko: Translations = {
  inhale: '들숨',
  exhale: '날숨',
  hold: '참기',
  tap: '탭',
  modeSilver: '실버',
  modeSilverIntent: '하루를 비우다',
  modeGold: '골드',
  modeGoldIntent: '단단한 집중',
  modeRainbow: '레인보우',
  modeRainbowIntent: '기쁨과 열린 마음',
  settings: '설정',
  mode: '모드',
  audio: '소리',
  audioOn: '켜짐',
  audioOff: '꺼짐',
  language: '언어',
  close: '닫기',
  display: '표시',
  displayWords: '단어',
  displayCountdown: '카운트다운',
  displaySilent: '무음',
};
