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
  narration: '내레이션',
  narrationDescription: '시스템 음성이 마지막 인용구를 읽어줍니다',
  appleHealth: 'Apple 건강',           // matches Apple iOS KO string for the Health app
  appleHealthDescription: '완료된 세션을 마음챙김 시간으로 저장합니다',
  about: '소개',
  aboutMission: 'Hush는 TPC | AEQ에서 만들었습니다. 일상의 기술 안에 돌봄, 형평성, 인간의 안녕을 담는 도구를 만드는 곳입니다.',
  aboutPrivacy: '개인정보: 모든 데이터는 사용자의 기기에만 저장됩니다. 계정 없음, 추적 없음, 분석 없음. 보내는 피드백에는 현재 모드만 포함되며 개인 정보는 포함되지 않습니다.',
  madeBy: '만든 사람',
  aboutFounderLabel: '설립자 소개',
  founderBio: 'JoYi Rhyss는 일상의 기술에서 돌봄, 형평성, 인간의 안녕을 중심에 두는 도구를 만들기 위해 TPC | AEQ를 설립했습니다.',
  tellRoo: 'Roo에게 알리기',
  aboutTechnique: '이 기법에 대하여',
};
