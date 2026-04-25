import { CONFIG } from '../config';
import { getBreathAt } from '../hooks/useBreathPhase';
import type { Theme } from '../themes/types';

const MIN_SCALE = 0.78;
const MAX_SCALE = 1.4;

// easeInOutSine for breath scale — nature-of-breath curve.
function easeInOutSine(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2; }
// easeInOutCubic for opacity transitions — smoother than linear, classier than sine for crossfades.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type WordProps = {
  word: string;
  scale: number;
  opacity: number;
  theme: Theme;
};

// Single word renderer — both current and previous label use this.
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
// they cross at 50% over CROSSFADE_MS centered on the boundary. No gap,
// no abrupt swap. Scale is continuous because phases meet at the same scale.
//
// Pure derivation — no state, no useEffect — so React rendering can't
// introduce visual stutter at phase boundaries.
export function BreathText({
  elapsedMs,
  active,
  fadeOutProgress,
  theme,
}: {
  elapsedMs: number;
  active: boolean;
  fadeOutProgress: number;
  theme: Theme;
}) {
  if (!active) return null;

  const breath = getBreathAt(elapsedMs);
  const phase = CONFIG.breath.phases[breath.phaseIndex];
  const phaseMs = phase.ms;
  const elapsedInPhase = breath.phaseProgress * phaseMs;
  const remainingInPhase = phaseMs - elapsedInPhase;
  const cf = CONFIG.breath.crossfadeMs;
  const [, peakOpacity] = CONFIG.breath.opacityRange;

  // Continuous scale: inhale grows, exhale shrinks, both meet at the same
  // value at the phase boundary so the visual is uninterrupted.
  const eased = easeInOutSine(breath.phaseProgress);
  const scale =
    breath.label === 'inhale'
      ? MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased
      : MAX_SCALE - (MAX_SCALE - MIN_SCALE) * eased;

  // Current word opacity: fade in over crossfade, hold, then start fading
  // out as the next phase begins (handled by the next phase rendering us as
  // "previous"). At session start, the very first word fades in from 0.
  let currentOpacity = peakOpacity;
  if (elapsedInPhase < cf) {
    currentOpacity = peakOpacity * easeInOutCubic(elapsedInPhase / cf);
  }

  // Previous word: only visible during the crossfade window of a new phase.
  // Pull its label from the prior phase if it exists.
  let previousLabel: string | null = null;
  let previousOpacity = 0;
  if (elapsedInPhase < cf && breath.phaseIndex > 0) {
    previousLabel = CONFIG.breath.phases[breath.phaseIndex - 1].label;
    previousOpacity = peakOpacity * (1 - easeInOutCubic(elapsedInPhase / cf));
  }

  // Final phase: fade out as session ends. The fadeOutProgress drives this.
  const sessionFade = 1 - fadeOutProgress;
  // Also: in the very last cf window, fade out instead of holding (no next phase to crossfade to).
  const isLastPhase = breath.phaseIndex === CONFIG.breath.phases.length - 1;
  if (isLastPhase && remainingInPhase < cf) {
    const tailFade = easeInOutCubic(remainingInPhase / cf);
    currentOpacity *= tailFade;
  }

  return (
    <>
      {previousLabel && (
        <BreathWord
          word={previousLabel}
          scale={scale}
          opacity={previousOpacity * sessionFade}
          theme={theme}
        />
      )}
      <BreathWord
        word={breath.label}
        scale={scale}
        opacity={currentOpacity * sessionFade}
        theme={theme}
      />
    </>
  );
}
