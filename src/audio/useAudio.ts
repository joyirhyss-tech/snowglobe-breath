// React glue for the audio engine. Watches:
//   - The user's audio-enabled preference (from settings panel)
//   - The active mode (so engine swaps drone palette on mode change)
//   - The current breath phase (so drone gain swells/decays on inhale/exhale)
//   - Session phase (active vs ending vs idle — fades out cleanly)
//
// First start MUST come from a user gesture, so we wait for sessionState
// to flip to 'active' (which only happens after a tap or shake — both are
// gestures) before calling engine.start(). This satisfies iOS Safari's
// autoplay policy without any extra UI.

import { useEffect, useRef } from 'react';
import { getEngine } from './engine';
import { getBreathAt } from '../hooks/useBreathPhase';
import type { ModeSpec, BreathPhase } from '../modes';
import type { SessionPhase } from '../hooks/useSessionTimer';
import { CONFIG } from '../config';

type Args = {
  enabled: boolean;          // master mute toggle from settings
  mode: ModeSpec;            // currently selected mode
  sessionPhase: SessionPhase;
  elapsedMs: number;
  phases: ReadonlyArray<BreathPhase>;
};

export function useAudio({ enabled, mode, sessionPhase, elapsedMs, phases }: Args): void {
  // Track previously-applied breath label so we only call onPhaseChange
  // when the label actually changes (not on every elapsedMs tick).
  const lastLabelRef = useRef<string | null>(null);
  const sessionStartedRef = useRef(false);

  // Apply enabled state whenever it changes (and engine exists).
  useEffect(() => {
    const engine = getEngine();
    if (engine.started) engine.setEnabled(enabled);
  }, [enabled]);

  // Apply mode whenever it changes (and engine exists).
  useEffect(() => {
    const engine = getEngine();
    if (engine.started) engine.setMode(mode);
  }, [mode]);

  // Lifecycle: start engine when session goes active (user gesture context),
  // tick phase changes during active, fade out during ending, reset on idle.
  useEffect(() => {
    const engine = getEngine();

    if (sessionPhase === 'active' && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      lastLabelRef.current = null;
      // Fire-and-forget. Tone's start() resolves once the AudioContext is
      // running. If the user disabled audio in settings, we still start the
      // engine but with master gain at 0 so toggling on mid-session works.
      void (async () => {
        try {
          await engine.start();
          engine.setMode(mode);
          engine.setEnabled(enabled);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[Hush audio] failed to start', err);
        }
      })();
    }

    if (sessionPhase === 'ending' && sessionStartedRef.current) {
      engine.fadeOut(CONFIG.session.fadeOutMs);
    }

    if (sessionPhase === 'idle' || sessionPhase === 'done') {
      // Mark engine "between sessions" so the next active flips re-init the
      // drone gain envelope from zero.
      sessionStartedRef.current = false;
      lastLabelRef.current = null;
    }
  }, [sessionPhase, mode, enabled]);

  // Drive phase-aware drone modulation while a session is active.
  useEffect(() => {
    if (sessionPhase !== 'active') return;
    const engine = getEngine();
    if (!engine.started) return;
    const breath = getBreathAt(elapsedMs, phases);
    if (breath.label === lastLabelRef.current) return;
    lastLabelRef.current = breath.label;
    const phase = phases[breath.phaseIndex];
    engine.onPhaseChange(breath.label, phase.ms);
  }, [sessionPhase, elapsedMs, phases]);
}
