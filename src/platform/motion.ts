// Motion abstraction. On Capacitor (iOS) we use the native Motion plugin —
// no Safari permission prompt, more reliable update intervals, no tab-blur
// throttling. In web mode we fall back to the standard DeviceMotionEvent
// pipeline (with the iOS Safari permission flow already in useShakeDetection).
//
// Same payload shape on both platforms so useShakeDetection treats them
// identically: { x, y, z } in m/s² with gravity included.

import { isNative } from './index';

export type MotionSample = {
  x: number;
  y: number;
  z: number;
};

export type MotionListener = (sample: MotionSample) => void;
export type MotionUnsubscribe = () => void;

/**
 * Subscribe to motion samples. Returns an unsubscribe function.
 * On iOS via Capacitor: uses CoreMotion. No permission prompt.
 * On web: returns null (caller falls back to DeviceMotionEvent).
 */
export async function subscribeNativeMotion(listener: MotionListener): Promise<MotionUnsubscribe | null> {
  if (!isNative) return null;
  // Dynamic import so web bundle never includes the native plugin code.
  const { Motion } = await import('@capacitor/motion');
  const handle = await Motion.addListener('accel', (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    listener({ x: acc.x ?? 0, y: acc.y ?? 0, z: acc.z ?? 0 });
  });
  return () => {
    void handle.remove();
  };
}
