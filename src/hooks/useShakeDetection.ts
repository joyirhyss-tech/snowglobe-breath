import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { isNative } from '../platform';
import { subscribeNativeMotion } from '../platform/motion';

// iOS 13+ exposes a requestPermission gate on DeviceMotionEvent (web only).
type DeviceMotionEventStatic = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export type ShakePayload = { intensity: number; timestamp: number };

export type ShakeDetectionState = {
  supported: boolean;
  permission: 'unknown' | 'granted' | 'denied' | 'not-required';
  lastEvent: ShakePayload | null;
};

// Detect shake by tracking the maximum delta in acceleration over a short
// window. Any peak > threshold triggers (with debounce). The window approach
// is more forgiving than instantaneous sampling — a quick wrist flick that
// peaks for 50ms still registers reliably even if sampling misses the apex.
//
// Two execution paths:
//   1. **Native iOS via Capacitor** — uses CoreMotion through the
//      @capacitor/motion plugin. No permission prompt. More reliable than
//      Safari's web DeviceMotion. Permission auto-marked 'not-required'.
//   2. **Web (Safari/Chrome/Firefox)** — uses DeviceMotionEvent. iOS Safari
//      requires a one-time tap to grant motion permission (handled by the
//      silent document-level click listener below).
export function useShakeDetection(onShake: (p: ShakePayload) => void) {
  const [state, setState] = useState<ShakeDetectionState>({
    supported: isNative || typeof DeviceMotionEvent !== 'undefined',
    permission: 'unknown',
    lastEvent: null,
  });

  const lastTriggerAtRef = useRef(0);
  const lastSampleAtRef = useRef(0);
  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const peakRef = useRef({ value: 0, atMs: 0 });
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  // Shared sample handler — called by both native and web paths.
  const handleSample = useCallback((acc: { x: number; y: number; z: number }) => {
    const now = performance.now();
    if (now - lastSampleAtRef.current < CONFIG.shake.sampleIntervalMs) return;
    lastSampleAtRef.current = now;

    const x = acc.x, y = acc.y, z = acc.z;
    const last = lastAccelRef.current;
    lastAccelRef.current = { x, y, z };
    if (!last) return;

    const dx = x - last.x, dy = y - last.y, dz = z - last.z;
    const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const peak = peakRef.current;
    if (delta > peak.value || now - peak.atMs > CONFIG.shake.peakWindowMs) {
      peakRef.current = { value: delta, atMs: now };
    }

    const peakNow = peakRef.current.value;
    if (peakNow < CONFIG.shake.threshold) return;
    if (now - lastTriggerAtRef.current < CONFIG.shake.debounceMs) return;

    lastTriggerAtRef.current = now;
    peakRef.current = { value: 0, atMs: now };
    const intensity = Math.min(2.4, peakNow / CONFIG.shake.threshold);
    const payload = { intensity, timestamp: now };
    setState((s) => ({ ...s, lastEvent: payload }));
    onShakeRef.current(payload);
  }, []);

  // Web DeviceMotionEvent handler — extracts acceleration and forwards.
  const handleMotion = useCallback((ev: DeviceMotionEvent) => {
    const acc = ev.accelerationIncludingGravity || ev.acceleration;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
    handleSample({ x: acc.x, y: acc.y, z: acc.z });
  }, [handleSample]);

  const requestPermission = useCallback(async () => {
    // On native, no permission gate — return granted immediately.
    if (isNative) {
      setState((s) => ({ ...s, permission: 'granted' }));
      return 'granted' as const;
    }
    const DM = DeviceMotionEvent as DeviceMotionEventStatic;
    if (typeof DM === 'undefined') {
      setState((s) => ({ ...s, supported: false }));
      return 'denied' as const;
    }
    if (typeof DM.requestPermission === 'function') {
      try {
        const res = await DM.requestPermission();
        setState((s) => ({ ...s, permission: res }));
        return res;
      } catch {
        setState((s) => ({ ...s, permission: 'denied' }));
        return 'denied' as const;
      }
    }
    setState((s) => ({ ...s, permission: 'not-required' }));
    return 'granted' as const;
  }, []);

  // On non-iOS platforms (Android web, desktop, native) — no permission gate.
  useEffect(() => {
    if (isNative) {
      // Native: motion access is implicit (Capacitor plugin handles it).
      setState((s) => ({ ...s, permission: 'not-required' }));
      return;
    }
    const DM = DeviceMotionEvent as DeviceMotionEventStatic;
    if (typeof DM !== 'undefined' && typeof DM.requestPermission !== 'function') {
      setState((s) => ({ ...s, permission: 'not-required' }));
    }
  }, []);

  // iOS Safari only: silent permission bootstrap on first tap. Skipped on
  // native (no prompt needed) and on Android (no prompt needed).
  useEffect(() => {
    if (isNative) return;
    if (state.permission !== 'unknown') return;
    const DM = DeviceMotionEvent as DeviceMotionEventStatic;
    if (typeof DM === 'undefined' || typeof DM.requestPermission !== 'function') return;

    const grant = () => { void requestPermission(); };
    document.addEventListener('touchstart', grant, { once: true, passive: true });
    document.addEventListener('click', grant, { once: true });
    return () => {
      document.removeEventListener('touchstart', grant);
      document.removeEventListener('click', grant);
    };
  }, [state.permission, requestPermission]);

  // Attach listener once permission is granted/not-required.
  useEffect(() => {
    if (state.permission !== 'granted' && state.permission !== 'not-required') return;

    if (isNative) {
      // Native: subscribe to CoreMotion via Capacitor plugin.
      let unsubscribe: (() => void) | null = null;
      void (async () => {
        unsubscribe = await subscribeNativeMotion(handleSample);
      })();
      return () => { if (unsubscribe) unsubscribe(); };
    }

    // Web: subscribe to DeviceMotionEvent.
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [state.permission, handleMotion, handleSample]);

  return { state, requestPermission };
}
