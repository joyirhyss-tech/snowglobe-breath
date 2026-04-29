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
import { tap as hapticTap, selection as hapticSelection } from './platform/haptics';
import { getBreathAt } from './hooks/useBreathPhase';
import { loadDisplayPref, persistDisplayPref, type DisplayMode } from './displayPref';
import { initRoo } from './roo';
import { setupIOSAudioUnlock } from './audio/iosUnlock';
import { useReducedMotion } from './accessibility/reducedMotion';
import { narrate, cancelNarration, warmNarrationVoices } from './audio/narration';
import { loadNarrationPref, persistNarrationPref } from './audio/narrationPref';
import { getLang } from './i18n';
import { loadHealthKitPref, persistHealthKitPref } from './healthKitPref';
import { writeMindfulSession, isHealthKitPossible, requestHealthKitAuthorization } from './platform/healthkit';
import { srOnly } from './accessibility/srOnly';

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
  // Respect OS-level reduced-motion preference (WCAG 2.3.3, Apple HIG).
  const reducedMotion = useReducedMotion();

  // Active mode: persisted across launches. Default = silver (calmest entry).
  const [modeId, setModeId] = useState<ModeId>(() => loadStoredMode());
  const mode = MODES[modeId];

  // Audio enabled (default ON), persisted across launches.
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(() => loadAudioPref());
  // Closing-quote narration (default OFF — opt-in).
  const [narrationEnabled, setNarrationEnabledState] = useState<boolean>(() => loadNarrationPref());
  // Apple Health Mindful Minutes write (default OFF — opt-in, iOS only).
  const [healthKitEnabled, setHealthKitEnabledState] = useState<boolean>(() => loadHealthKitPref());
  // Track session start time so we can write the correct interval to Health.
  const sessionStartMsRef = useRef<number | null>(null);
  // Display mode for the breath cue (words / countdown / silent).
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(() => loadDisplayPref());

  const [shakeImpulse, setShakeImpulse] = useState<ShakeImpulse | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const sessionPhaseRef = useRef(sessionState.phase);
  sessionPhaseRef.current = sessionState.phase;

  // Initialize Roo Reporter once on mount. The script tag in index.html
  // loads the global; this hooks the React lifecycle into init timing.
  useEffect(() => { initRoo(); }, []);

  // iOS Safari Web Audio unlock — must attach BEFORE the user's first tap.
  // Plays an HTML5 <audio> element silently on first interaction, which
  // unlocks Web Audio output. On iOS 18.x without this, Tone.js audio is
  // silent even though the audio context reports as running. See
  // src/audio/iosUnlock.ts for the full diagnostic story.
  useEffect(() => { setupIOSAudioUnlock(); }, []);

  // Pre-warm Web Speech voices once on boot so the first narration call has
  // results from getVoices() (some browsers populate it asynchronously).
  useEffect(() => { warmNarrationVoices(); }, []);

  // Closing-quote narration: speak when the session enters 'ending' phase
  // and a quote is set; cancel any in-flight utterance on phase change.
  useEffect(() => {
    if (!narrationEnabled) return;
    if (sessionState.phase === 'ending' && currentQuote) {
      // Read the quote and the author so the user gets full credit.
      const text = `${currentQuote.text} — ${currentQuote.author}`;
      narrate(text, getLang());
    }
    if (sessionState.phase === 'idle' || sessionState.phase === 'done') {
      cancelNarration();
    }
  }, [sessionState.phase, currentQuote, narrationEnabled]);

  // Persist preferences whenever they change.
  useEffect(() => { persistMode(modeId); }, [modeId]);
  useEffect(() => { persistAudioPref(audioEnabled); }, [audioEnabled]);
  useEffect(() => { persistNarrationPref(narrationEnabled); }, [narrationEnabled]);
  useEffect(() => { persistHealthKitPref(healthKitEnabled); }, [healthKitEnabled]);
  useEffect(() => { persistDisplayPref(displayMode); }, [displayMode]);

  // When the user turns Apple Health on for the first time, prompt for auth
  // immediately so they don't have to wait until session-end to see the
  // permission sheet. Web is a no-op via the platform abstraction.
  const lastHKEnabledRef = useRef<boolean>(healthKitEnabled);
  useEffect(() => {
    if (healthKitEnabled && !lastHKEnabledRef.current && isHealthKitPossible()) {
      void requestHealthKitAuthorization();
    }
    lastHKEnabledRef.current = healthKitEnabled;
  }, [healthKitEnabled]);

  // Stamp session start time when a new session activates; clear on idle.
  // We can't read CONFIG.session.durationMs here as the source of truth
  // because the iOS clock may have drifted slightly during the session —
  // the recorded interval is wall-clock start to wall-clock end.
  useEffect(() => {
    if (sessionState.phase === 'active' && sessionStartMsRef.current === null) {
      sessionStartMsRef.current = Date.now();
    }
    if (sessionState.phase === 'idle') {
      sessionStartMsRef.current = null;
    }
  }, [sessionState.phase]);

  // On session 'done', if HealthKit is enabled, write a Mindful Session
  // entry covering the actual duration. Fire-and-forget; failures are
  // silent (writeMindfulSession returns false rather than throwing).
  useEffect(() => {
    if (sessionState.phase !== 'done') return;
    if (!healthKitEnabled) return;
    const startMs = sessionStartMsRef.current;
    if (startMs === null) return;
    const endMs = Date.now();
    void writeMindfulSession({ startMs, endMs });
  }, [sessionState.phase, healthKitEnabled]);

  // Drive the audio engine. Engine starts on session 'active' (which only
  // happens after a real user gesture — tap or shake — satisfying iOS).
  useAudio({
    enabled: audioEnabled,
    mode,
    sessionPhase: sessionState.phase,
    elapsedMs: sessionState.elapsedMs,
    phases: mode.breath,
  });

  // Haptics: a single 'medium' tap when the session begins (the punctuation
  // matching the visual shake-flash) and a 'selection' tick on each phase
  // boundary so the user can feel the rhythm even with eyes closed.
  // Phase boundary haptics are most useful in gold mode (box breathing) but
  // work for all modes.
  const lastHapticPhaseRef = useRef<number>(-1);
  useEffect(() => {
    if (sessionState.phase === 'active' && sessionState.elapsedMs < 50) {
      void hapticTap('medium');
      lastHapticPhaseRef.current = -1;
    }
  }, [sessionState.phase, sessionState.elapsedMs]);

  useEffect(() => {
    if (sessionState.phase !== 'active') {
      lastHapticPhaseRef.current = -1;
      return;
    }
    const breath = getBreathAt(sessionState.elapsedMs, mode.breath);
    if (breath.phaseIndex !== lastHapticPhaseRef.current && lastHapticPhaseRef.current !== -1) {
      void hapticSelection();
    }
    lastHapticPhaseRef.current = breath.phaseIndex;
  }, [sessionState.phase, sessionState.elapsedMs, mode.breath]);

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
  // Also bind Space/Enter so keyboard + VoiceOver users can start a session
  // (VoiceOver activates focused elements with double-tap, which dispatches
  // a click — but desktop keyboard users need explicit key handling).
  useEffect(() => {
    const click = () => {
      onShake({ intensity: 1.1, timestamp: performance.now() });
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        // Don't intercept keys typed into form fields (e.g., the Roo textarea).
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
        e.preventDefault();
        onShake({ intensity: 1.1, timestamp: performance.now() });
      }
    };
    window.addEventListener('click', click);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('click', click);
      window.removeEventListener('keydown', key);
    };
  }, [onShake]);

  const active = sessionState.phase === 'active' || sessionState.phase === 'ending';
  const idle = sessionState.phase === 'idle' || sessionState.phase === 'done';

  return (
    <div
      // Outermost role is 'application' so screen readers know this is an
      // interactive practice surface, not a document. Helps Voice Control
      // and similar tools understand the model: tap-anywhere starts a
      // session, no document navigation needed.
      role="application"
      aria-label="Hush — sixty-second breath practice"
      style={{ position: 'fixed', inset: 0 }}
    >
      {/* Visually-hidden instructions, announced by VoiceOver when the app
          is idle. Without this, a blind user opens Hush to silence and has
          no way to know what to do. */}
      {idle && (
        <h1 style={srOnly}>
          Hush. Tap anywhere or shake your phone to start a sixty-second breath
          practice. To open settings, double-tap the gear icon at the top right.
        </h1>
      )}

      {/* The 3D scene is decorative — every meaningful state change is also
          announced through BreathText (aria-live) and QuoteReveal (role
          status). Hiding the canvas from VoiceOver prevents WebGL context
          announcements that add no information. */}
      <div aria-hidden="true">
        <Scene
          theme={mode.theme}
          shakeImpulse={shakeImpulse}
          elapsedMs={sessionState.elapsedMs}
          sessionProgress={sessionState.progress}
          active={active}
          fadeOutProgress={sessionState.fadeOutProgress}
          physics={mode.physics}
          phases={mode.breath}
          reducedMotion={reducedMotion}
        />
      </div>

      <BreathText
        elapsedMs={sessionState.elapsedMs}
        active={sessionState.phase === 'active'}
        fadeOutProgress={sessionState.fadeOutProgress}
        theme={mode.theme}
        phases={mode.breath}
        displayMode={displayMode}
        totalDurationMs={mode.durationMs}
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
        narrationEnabled={narrationEnabled}
        onChangeNarrationEnabled={setNarrationEnabledState}
        healthKitEnabled={healthKitEnabled}
        onChangeHealthKitEnabled={setHealthKitEnabledState}
        displayMode={displayMode}
        onChangeDisplayMode={setDisplayModeState}
      />
    </div>
  );
}

