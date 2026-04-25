import { useState } from 'react';
import { THEMES } from '../themes';
import type { Theme } from '../themes/types';

// Hidden dev picker. Long-press the top-left corner to reveal.
// Lets you tune/swap themes live on device without rebuilding.
export function ThemePicker({ current, onChange }: { current: Theme; onChange: (t: Theme) => void }) {
  const [open, setOpen] = useState(false);
  const [pressStart, setPressStart] = useState(0);

  return (
    <>
      <div
        aria-hidden
        onPointerDown={() => setPressStart(Date.now())}
        onPointerUp={() => {
          if (Date.now() - pressStart > 600) setOpen((v) => !v);
        }}
        onPointerLeave={() => setPressStart(0)}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 56,
          height: 56,
          zIndex: 100,
        }}
      />
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: 8,
            zIndex: 101,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange(t)}
              style={{
                background: current.id === t.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 6,
                color: '#fff',
                padding: '6px 10px',
                fontSize: 12,
                fontFamily: 'system-ui, sans-serif',
                textAlign: 'left',
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
