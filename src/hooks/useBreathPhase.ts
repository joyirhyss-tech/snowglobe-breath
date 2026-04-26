import { useMemo } from 'react';
import { CONFIG } from '../config';
import type { BreathLabel, BreathPhase } from '../modes';

export type BreathInfo = {
  label: BreathLabel;
  phaseIndex: number;
  phaseProgress: number; // 0..1 within the current phase
  pulse: number;         // inhale: 0→1, exhale: 1→0, hold: holds previous label's pulse
  isTransition: boolean; // true within crossfadeMs of a phase boundary
};

// Compute current breath from elapsed time + the active mode's phases.
// Called every frame; keep cheap. Phases array varies by mode (silver/gold
// /rainbow have different patterns); passing it in keeps the function pure.
export function getBreathAt(elapsedMs: number, phases: ReadonlyArray<BreathPhase>): BreathInfo {
  let cursor = 0;
  for (let i = 0; i < phases.length; i += 1) {
    const phase = phases[i];
    const end = cursor + phase.ms;
    if (elapsedMs <= end) {
      const phaseProgress = Math.max(0, Math.min(1, (elapsedMs - cursor) / phase.ms));
      // Pulse: inhale rises, exhale falls. Hold inherits prior label's resting
      // value (1 if last was inhale = "lungs full", 0 if last was exhale).
      let pulse = 0.5;
      if (phase.label === 'inhale') pulse = phaseProgress;
      else if (phase.label === 'exhale') pulse = 1 - phaseProgress;
      else if (phase.label === 'hold') {
        const prev = i > 0 ? phases[i - 1] : null;
        pulse = prev?.label === 'inhale' ? 1 : 0;
      }
      const msIntoPhase = elapsedMs - cursor;
      const msLeftInPhase = end - elapsedMs;
      const isTransition = msIntoPhase < CONFIG.breath.crossfadeMs || msLeftInPhase < CONFIG.breath.crossfadeMs;
      return { label: phase.label, phaseIndex: i, phaseProgress, pulse, isTransition };
    }
    cursor = end;
  }
  const last = phases[phases.length - 1];
  return {
    label: last.label,
    phaseIndex: phases.length - 1,
    phaseProgress: 1,
    pulse: last.label === 'inhale' ? 1 : 0,
    isTransition: true,
  };
}

export function useBreathPhase(elapsedMs: number, phases: ReadonlyArray<BreathPhase>): BreathInfo {
  return useMemo(() => getBreathAt(elapsedMs, phases), [elapsedMs, phases]);
}
