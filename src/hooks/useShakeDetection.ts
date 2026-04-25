import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';

// iOS 13+ exposes a requestPermission gate on DeviceMotionEvent.
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
export function useShakeDetection(onShake: (p: ShakePayload) => void) {
  const [state, setState] = useState<ShakeDetectionState>({
    supported: typeof DeviceMotionEvent !== 'undefined',
    permission: 'unknown',
    lastEvent: null,
  });

  const lastTriggerAtRef = useRef(0);
  const lastSampleAtRef = useRef(0);
  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const peakRef = useRef({ value: 0, atMs: 0 });
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const handleMotion = useCallback((ev: DeviceMotionEvent) => {
    const now = performance.now();
    if (now - lastSampleAtRef.current < CONFIG.shake.sampleIntervalMs) return;
    lastSampleAtRef.current = now;

    const acc = ev.accelerationIncludingGravity || ev.acceleration;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

    const x = acc.x, y = acc.y, z = acc.z;
    const last = lastAccelRef.current;
    lastAccelRef.current = { x, y, z };
    if (!last) return;

    const dx = x - last.x, dy = y - last.y, dz = z - last.z;
    const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Maintain a rolling peak across the window. If we get a stronger reading,
    // adopt it; otherwise let the window expire.
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

  const requestPermission = useCallback(async () => {
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
    // Android / desktop: no gate, permission is implicit.
    setState((s) => ({ ...s, permission: 'not-required' }));
    return 'granted' as const;
  }, []);

  // On non-iOS platforms (Android / desktop), attach automatically — no permission gate.
  useEffect(() => {
    const DM = DeviceMotionEvent as DeviceMotionEventStatic;
    if (typeof DM !== 'undefined' && typeof DM.requestPermission !== 'function') {
      setState((s) => ({ ...s, permission: 'not-required' }));
    }
  }, []);

  // iOS-only silent permission bootstrap. Apple requires a user gesture before
  // it'll grant motion-sensor access. We attach a one-time global listener for
  // ANY touchstart/click — the user's first stray tap on the screen requests
  // permission silently. There's no visible UI. After grant, this listener
  // detaches and shake takes over for all future sessions on this page load.
  useEffect(() => {
    if (state.permission !== 'unknown') return;
    const DM = DeviceMotionEvent as DeviceMotionEventStatic;
    if (typeof DM === 'undefined' || typeof DM.requestPermission !== 'function') return;

    const grant = () => {
      void requestPermission();
    };
    document.addEventListener('touchstart', grant, { once: true, passive: true });
    document.addEventListener('click', grant, { once: true });
    return () => {
      document.removeEventListener('touchstart', grant);
      document.removeEventListener('click', grant);
    };
  }, [state.permission, requestPermission]);

  // Attach listener once permission is granted or not required.
  useEffect(() => {
    if (state.permission !== 'granted' && state.permission !== 'not-required') return;
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [state.permission, handleMotion]);

  return { state, requestPermission };
}
