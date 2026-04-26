import { useCallback, useEffect, useRef, useState } from 'react';
import { Scene } from './scene/Scene';
import { BreathText } from './ui/BreathText';
import { QuoteReveal } from './ui/QuoteReveal';
import { ThemePicker } from './ui/ThemePicker';
import { useSessionTimer } from './hooks/useSessionTimer';
import { useShakeDetection } from './hooks/useShakeDetection';
import { pickRandomQuote, type Quote } from './quotes';
import { MODES, loadStoredMode, persistMode, type ModeId } from './modes';
import { useLang } from './i18n';
import { useAudio } from './audio/useAudio';
import { loadAudioPref, persistAudioPref } from './audio/preference';

// Hush — v2 (App Store version, branch v2-hush).
// Three modes (silver / gold / rainbow), each with its own breath pattern,
// audio palette, and glitter behavior. Web v1 stays frozen on `main`.
//
// Constraint: once a session begins, the full duration runs.
// Shake/tap during active/ending phases is a no-op.

type ShakeImpulse = { intensity: number; timestamp: number };

export default function App() {
  // Re-render when user changes language so localized strings refresh.
  useLang();

  const timer = useSessionTimer();
  const { state: sessionState, start, reset } = timer;

  // Active mode: persisted across launches. Default = silver (calmest entry).
  const [modeId, setModeId] = useState<ModeId>(() => loadStoredMode());
  const mode = MODES[modeId];

  // Audio enabled (default ON), persisted across launches.
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(() => loadAudioPref());

  const [shakeImpulse, setShakeImpulse] = useState<ShakeImpulse | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const sessionPhaseRef = useRef(sessionState.phase);
  sessionPhaseRef.current = sessionState.phase;

  // Persist mode and audio preference whenever they change.
  useEffect(() => { persistMode(modeId); }, [modeId]);
  useEffect(() => { persistAudioPref(audioEnabled); }, [audioEnabled]);

  // Drive the audio engine. Engine starts on session 'active' (which only
  // happens after a real user gesture — tap or shake — satisfying iOS).
  useAudio({
    enabled: audioEnabled,
    mode,
    sessionPhase: sessionState.phase,
    elapsedMs: sessionState.elapsedMs,
    phases: mode.breath,
  });

  // Shake/tap callback: starts a session if idle/done. No-op otherwise.
  const onShake = useCallback((p: ShakeImpulse) => {
    const phase = sessionPhaseRef.current;
    if (phase !== 'idle' && phase !== 'done') return;
    setShakeImpulse(p);
    setCurrentQuote(pickRandomQuote());
    start();
  }, [start]);

  const shake = useShakeDetection(onShake);
  void shake;

  useEffect(() => {
    if (sessionState.phase === 'done') {
      const t = setTimeout(reset, 400);
      return () => clearTimeout(t);
    }
  }, [sessionState.phase, reset]);

  // Universal tap-to-start. Works on every device. Phase guard inside
  // onShake means a tap during active is a no-op (the session is sacred).
  useEffect(() => {
    const handler = () => {
      onShake({ intensity: 1.1, timestamp: performance.now() });
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [onShake]);

  const active = sessionState.phase === 'active' || sessionState.phase === 'ending';

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Scene
        theme={mode.theme}
        shakeImpulse={shakeImpulse}
        elapsedMs={sessionState.elapsedMs}
        sessionProgress={sessionState.progress}
        active={active}
        fadeOutProgress={sessionState.fadeOutProgress}
      />

      <BreathText
        elapsedMs={sessionState.elapsedMs}
        active={sessionState.phase === 'active'}
        fadeOutProgress={sessionState.fadeOutProgress}
        theme={mode.theme}
        phases={mode.breath}
      />

      <QuoteReveal
        quote={currentQuote}
        visible={sessionState.phase === 'ending'}
        fadeOutProgress={sessionState.fadeOutProgress}
        theme={mode.theme}
      />

      <ThemePicker
        currentModeId={modeId}
        onChangeMode={setModeId}
        audioEnabled={audioEnabled}
        onChangeAudioEnabled={setAudioEnabledState}
      />
    </div>
  );
}
