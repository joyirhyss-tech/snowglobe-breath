import { useMemo } from 'react';
import { CONFIG, type BreathLabel } from '../config';

export type BreathInfo = {
  label: BreathLabel;
  phaseIndex: number;
  phaseProgress: number; // 0..1 within the current phase
  pulse: number;         // 0..1 inhale = ramps up, exhale = ramps down
  isTransition: boolean; // true within textFadeMs of a phase boundary
};

// Compute current breath from elapsed time. Called every frame; keep cheap.
export function getBreathAt(elapsedMs: number): BreathInfo {
  const phases = CONFIG.breath.phases;
  let cursor = 0;
  for (let i = 0; i < phases.length; i += 1) {
    const phase = phases[i];
    const end = cursor + phase.ms;
    if (elapsedMs <= end) {
      const phaseProgress = Math.max(0, Math.min(1, (elapsedMs - cursor) / phase.ms));
      const pulse = phase.label === 'inhale' ? phaseProgress : 1 - phaseProgress;
      const msIntoPhase = elapsedMs - cursor;
      const msLeftInPhase = end - elapsedMs;
      const isTransition = msIntoPhase < CONFIG.breath.crossfadeMs || msLeftInPhase < CONFIG.breath.crossfadeMs;
      return { label: phase.label, phaseIndex: i, phaseProgress, pulse, isTransition };
    }
    cursor = end;
  }
  const last = phases[phases.length - 1];
  return { label: last.label, phaseIndex: phases.length - 1, phaseProgress: 1, pulse: 0, isTransition: true };
}

export function useBreathPhase(elapsedMs: number): BreathInfo {
  return useMemo(() => getBreathAt(elapsedMs), [elapsedMs]);
}
