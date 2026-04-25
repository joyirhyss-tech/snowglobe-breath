import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';

export type SessionPhase = 'idle' | 'active' | 'ending' | 'done';

export type SessionState = {
  phase: SessionPhase;
  startedAt: number;   // performance.now() when session began
  endingAt: number;    // performance.now() when phase flipped to 'ending'
  elapsedMs: number;
  progress: number;    // 0..1 over session duration (clamped)
  fadeOutProgress: number; // 0..1 during the ending fadeOut window
};

const initial: SessionState = {
  phase: 'idle',
  startedAt: 0,
  endingAt: 0,
  elapsedMs: 0,
  progress: 0,
  fadeOutProgress: 0,
};

export function useSessionTimer() {
  const [state, setState] = useState<SessionState>(initial);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.phase !== 'active' && state.phase !== 'ending') return;

    const tick = () => {
      setState((prev) => {
        if (prev.phase !== 'active' && prev.phase !== 'ending') return prev;
        const now = performance.now();
        const elapsed = now - prev.startedAt;
        const progress = Math.min(1, elapsed / CONFIG.session.durationMs);

        if (prev.phase === 'active' && elapsed >= CONFIG.session.durationMs) {
          return { ...prev, phase: 'ending', endingAt: now, elapsedMs: elapsed, progress: 1 };
        }

        if (prev.phase === 'ending') {
          const fade = Math.min(1, (now - prev.endingAt) / CONFIG.session.fadeOutMs);
          if (fade >= 1) {
            return { ...prev, phase: 'done', elapsedMs: elapsed, progress, fadeOutProgress: 1 };
          }
          return { ...prev, elapsedMs: elapsed, progress, fadeOutProgress: fade };
        }

        return { ...prev, elapsedMs: elapsed, progress };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.phase]);

  const start = () => {
    setState({ ...initial, phase: 'active', startedAt: performance.now() });
  };

  // Shake-during-active: immediately flip to ending; fadeOut window then runs.
  const endEarly = () => {
    setState((prev) => {
      if (prev.phase !== 'active') return prev;
      return { ...prev, phase: 'ending', endingAt: performance.now() };
    });
  };

  const reset = () => setState(initial);

  return { state, start, endEarly, reset };
}
