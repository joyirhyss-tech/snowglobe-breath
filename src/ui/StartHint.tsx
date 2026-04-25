import { useCallback } from 'react';

type Props = {
  visible: boolean;
  onEnable: () => Promise<void> | void;
};

// Silent invisible full-screen tap target. Shown ONLY on iOS first-load when
// motion-sensor permission has not yet been granted (Apple requires a user
// gesture to grant). Has no visible UI — no text, no dot, no chrome. The user
// taps anywhere, the iOS permission prompt appears, they grant; from there on
// shake works and this component never renders again.
//
// Important: tap does NOT start a session. Shake is the only session trigger.
export function StartHint({ visible, onEnable }: Props) {
  const handleTap = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onEnable();
  }, [onEnable]);

  if (!visible) return null;

  return (
    <button
      aria-label="enable motion sensors"
      onClick={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        outline: 'none',
      }}
    />
  );
}
