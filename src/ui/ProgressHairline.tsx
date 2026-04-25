import { CONFIG } from '../config';

// 1px hairline along the bottom safe area. Width fills from 0 to viewport width over 60s.
export function ProgressHairline({ progress, visible }: { progress: number; visible: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'env(safe-area-inset-bottom, 0px)',
        height: 1,
        pointerEvents: 'none',
        opacity: visible ? CONFIG.ui.progressOpacity : 0,
        transition: 'opacity 600ms ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, progress * 100)}%`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))',
        }}
      />
    </div>
  );
}
