import { useState } from 'react';
import { MODE_LIST, type ModeId } from '../modes';
import { setLang, useLang, t, SUPPORTED_LANGS, LANG_NAMES } from '../i18n';

// Settings panel for v2. Reachable via a small gear icon top-right.
// Audio-enabled state is owned by App.tsx (so the audio engine can react)
// and threaded through this component as a controlled prop.
type Props = {
  currentModeId: ModeId;
  onChangeMode: (id: ModeId) => void;
  audioEnabled: boolean;
  onChangeAudioEnabled: (enabled: boolean) => void;
};

export function ThemePicker({ currentModeId, onChangeMode, audioEnabled, onChangeAudioEnabled }: Props) {
  const lang = useLang(); // re-render on language change
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Subtle gear icon, top-right. Opacity low so it doesn't compete. */}
      <button
        aria-label={t('settings')}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 12px)',
          right: '14px',
          width: 32,
          height: 32,
          padding: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.32,
          zIndex: 100,
          color: '#fff',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="100%" height="100%">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={(e) => {
            // Click on the backdrop (anywhere outside the inner content)
            // closes the panel. stopPropagation keeps the click out of the
            // window-level start-session handler either way.
            e.stopPropagation();
            setOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px',
            color: '#f4f7fc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}
          >

            {/* Mode */}
            <Section label={t('mode')}>
              {MODE_LIST.map((m) => (
                <Option
                  key={m.id}
                  selected={currentModeId === m.id}
                  onClick={() => onChangeMode(m.id)}
                  title={t(m.labelKey)}
                  subtitle={t(m.intentKey)}
                />
              ))}
            </Section>

            {/* Audio */}
            <Section label={t('audio')}>
              <Option
                selected={audioEnabled}
                onClick={() => onChangeAudioEnabled(true)}
                title={t('audioOn')}
              />
              <Option
                selected={!audioEnabled}
                onClick={() => onChangeAudioEnabled(false)}
                title={t('audioOff')}
              />
            </Section>

            {/* Language */}
            <Section label={t('language')}>
              {SUPPORTED_LANGS.map((langOpt) => (
                <Option
                  key={langOpt}
                  selected={langOpt === lang}
                  onClick={() => setLang(langOpt)}
                  title={LANG_NAMES[langOpt]}
                />
              ))}
            </Section>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 24,
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.08)',
                color: '#f4f7fc',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        opacity: 0.5,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function Option({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        background: selected ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
        color: '#f4f7fc',
        border: `1px solid ${selected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10,
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div>
        <div style={{ fontWeight: 500 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {selected && <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>✓</span>}
    </button>
  );
}
