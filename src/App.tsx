import { useCallback, useEffect, useRef, useState } from 'react';
import { Scene } from './scene/Scene';
import { BreathText } from './ui/BreathText';
import { QuoteReveal } from './ui/QuoteReveal';
import { ThemePicker } from './ui/ThemePicker';
import { useSessionTimer } from './hooks/useSessionTimer';
import { useShakeDetection } from './hooks/useShakeDetection';
import { pickTheme, type Theme } from './themes';
import { pickRandomQuote, type Quote } from './quotes';

// This is a breath-practice tool, not a toy. Once a session begins it must
// run the full 60 seconds — shake during active is intentionally a no-op.

type ShakeImpulse = { intensity: number; timestamp: number };

export default function App() {
  const timer = useSessionTimer();
  const { state: sessionState, start, reset } = timer;
  const [theme, setTheme] = useState<Theme>(() => pickTheme(true));
  const [shakeImpulse, setShakeImpulse] = useState<ShakeImpulse | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const lastThemeIdRef = useRef(theme.id);
  const isFirstRef = useRef(true);
  const sessionPhaseRef = useRef(sessionState.phase);
  sessionPhaseRef.current = sessionState.phase;

  const pickAndSetNextTheme = useCallback(() => {
    const next = pickTheme(isFirstRef.current, lastThemeIdRef.current);
    isFirstRef.current = false;
    lastThemeIdRef.current = next.id;
    setTheme(next);
    return next;
  }, []);

  // Shake callback: ONLY starts a session when none is running. While a session
  // is active or ending, shakes are ignored — this is a breath practice and the
  // full 60 seconds is sacred. The user can re-shake to start a fresh round
  // only after the current one completes.
  const onShake = useCallback((p: ShakeImpulse) => {
    const phase = sessionPhaseRef.current;
    if (phase !== 'idle' && phase !== 'done') return;
    setShakeImpulse(p);
    pickAndSetNextTheme();
    setCurrentQuote(pickRandomQuote());
    start();
  }, [start, pickAndSetNextTheme]);

  const shake = useShakeDetection(onShake);

  useEffect(() => {
    if (sessionState.phase === 'done') {
      const t = setTimeout(reset, 400);
      return () => clearTimeout(t);
    }
  }, [sessionState.phase, reset]);

  // iOS motion-permission bootstrap is silent — see useShakeDetection. We
  // don't render any tap target here. Shake is the only session trigger
  // on phones. Desktop gets a hidden click-anywhere fallback below.
  void shake; // permission lifecycle is internal to the hook

  // Hidden desktop tap-to-start. Only enabled on devices with a precise
  // pointer (mouse/trackpad) — phone touch input doesn't qualify, so this
  // doesn't interfere with the shake-only behavior on iOS or Android.
  useEffect(() => {
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktop) return;
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
        theme={theme}
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
        theme={theme}
      />

      <QuoteReveal
        quote={currentQuote}
        visible={sessionState.phase === 'ending'}
        fadeOutProgress={sessionState.fadeOutProgress}
        theme={theme}
      />

      <ThemePicker current={theme} onChange={setTheme} />
    </div>
  );
}
