import { CONFIG } from '../config';
import { getBreathAt } from '../hooks/useBreathPhase';
import type { Theme } from '../themes/types';
import type { BreathPhase, BreathLabel } from '../modes';
import { t } from '../i18n';
import type { DisplayMode } from '../displayPref';

const MIN_SCALE = 0.78;
const MAX_SCALE = 1.4;

// easeInOutSine for breath scale — nature-of-breath curve.
function easeInOutSine(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2; }
// easeInOutCubic for opacity transitions — smoother than linear, classier than sine for crossfades.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Each phase has an associated scale. Inhale ends at MAX, exhale ends at MIN,
// hold sits at whichever the previous phase ended on (lungs full or empty).
function scaleForPhase(label: BreathLabel, progress: number, prevLabel: BreathLabel | null): number {
  const eased = easeInOutSine(progress);
  if (label === 'inhale') return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased;
  if (label === 'exhale') return MAX_SCALE - (MAX_SCALE - MIN_SCALE) * eased;
  // hold — sits at the previous label's resting scale
  return prevLabel === 'inhale' ? MAX_SCALE : MIN_SCALE;
}

// Resolve the localized word for a phase label.
function wordFor(label: BreathLabel): string {
  if (label === 'inhale') return t('inhale');
  if (label === 'exhale') return t('exhale');
  return t('hold');
}

type WordProps = {
  word: string;
  scale: number;
  opacity: number;
  theme: Theme;
};

function BreathWord({ word, scale, opacity, theme }: WordProps) {
  if (opacity <= 0.001) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: '15vh',
        textAlign: 'center',
        pointerEvents: 'none',
        fontFamily: theme.text.fontFamily,
        color: theme.text.color,
        fontSize: '1.4rem',
        letterSpacing: '0.06em',
        fontWeight: 300,
        fontStyle: 'italic',
        opacity,
        textShadow: '0 1px 6px rgba(0,0,0,0.55)',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
      }}
    >
      {word}
    </div>
  );
}

// True crossfade: at every phase boundary, render BOTH the previous and
// the current label simultaneously. Previous fades out; current fades in;
// they cross at 50% over crossfadeMs centered on the boundary. No gap.
//
// Pure derivation — no state, no useEffect — so React rendering can't
// introduce visual stutter at phase boundaries. Phases array is supplied
// by the active mode (silver / gold / rainbow each have their own pattern).
export function BreathText({
  elapsedMs,
  active,
  fadeOutProgress,
  theme,
  phases,
  displayMode,
  totalDurationMs,
}: {
  elapsedMs: number;
  active: boolean;
  fadeOutProgress: number;
  theme: Theme;
  phases: ReadonlyArray<BreathPhase>;
  displayMode: DisplayMode;
  totalDurationMs: number;
}) {
  if (!active) return null;
  // Silent mode renders nothing — visuals + audio + haptics carry the practice.
  if (displayMode === 'silent') return null;

  // Countdown mode: show MM:SS time remaining, scale-pulsed gently with breath
  // so it still feels alive but the user doesn't track words.
  if (displayMode === 'countdown') {
    const remainingSec = Math.max(0, Math.ceil((totalDurationMs - elapsedMs) / 1000));
    const mm = Math.floor(remainingSec / 60);
    const ss = remainingSec % 60;
    const text = `${mm}:${ss.toString().padStart(2, '0')}`;
    // Subtle breath-scale on the clock so it pulses with the rhythm.
    const breath = getBreathAt(elapsedMs, phases);
    const prevLabel: BreathLabel | null = breath.phaseIndex > 0 ? phases[breath.phaseIndex - 1].label : null;
    const scale = scaleForPhase(breath.label, breath.phaseProgress, prevLabel);
    const [, peakOp] = CONFIG.breath.opacityRange;
    const opacity = peakOp * (1 - fadeOutProgress);
    return (
      <BreathWord word={text} scale={0.85 + (scale - 1) * 0.15} opacity={opacity} theme={theme} />
    );
  }

  // Words mode (default) — original cue rendering.
  const breath = getBreathAt(elapsedMs, phases);
  const phase = phases[breath.phaseIndex];
  const phaseMs = phase.ms;
  const elapsedInPhase = breath.phaseProgress * phaseMs;
  const remainingInPhase = phaseMs - elapsedInPhase;
  const cf = CONFIG.breath.crossfadeMs;
  const [, peakOpacity] = CONFIG.breath.opacityRange;

  // Continuous scale across phases. Hold sits at the prior phase's resting
  // scale so motion is smooth: inhale rises to MAX → hold sits at MAX →
  // exhale falls from MAX to MIN → hold sits at MIN → inhale rises again.
  const prevLabel: BreathLabel | null = breath.phaseIndex > 0 ? phases[breath.phaseIndex - 1].label : null;
  const scale = scaleForPhase(breath.label, breath.phaseProgress, prevLabel);

  // Current word opacity: fade in over crossfade, hold, then crossfade out
  // when the next phase starts (rendered as "previous" in that phase).
  let currentOpacity = peakOpacity;
  if (elapsedInPhase < cf) {
    currentOpacity = peakOpacity * easeInOutCubic(elapsedInPhase / cf);
  }

  // Previous word: visible during the crossfade window of a new phase.
  let previousWord: string | null = null;
  let previousOpacity = 0;
  if (elapsedInPhase < cf && breath.phaseIndex > 0) {
    previousWord = wordFor(phases[breath.phaseIndex - 1].label);
    previousOpacity = peakOpacity * (1 - easeInOutCubic(elapsedInPhase / cf));
  }

  // Final phase: gentle tail-fade as session ends.
  const sessionFade = 1 - fadeOutProgress;
  const isLastPhase = breath.phaseIndex === phases.length - 1;
  if (isLastPhase && remainingInPhase < cf) {
    const tailFade = easeInOutCubic(remainingInPhase / cf);
    currentOpacity *= tailFade;
  }

  return (
    <>
      {previousWord && (
        <BreathWord
          word={previousWord}
          scale={scale}
          opacity={previousOpacity * sessionFade}
          theme={theme}
        />
      )}
      <BreathWord
        word={wordFor(breath.label)}
        scale={scale}
        opacity={currentOpacity * sessionFade}
        theme={theme}
      />
    </>
  );
}
