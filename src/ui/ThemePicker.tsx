import { useState } from 'react';
import { MODE_LIST, MODES, type ModeId } from '../modes';
import { setLang, useLang, t, SUPPORTED_LANGS, LANG_NAMES, getLang, type StringKey } from '../i18n';
import type { DisplayMode } from '../displayPref';

// Settings panel for v2. Reachable via a faint gear icon in the top-right.
// Sections are collapsible — only the header is visible by default, showing
// the current selection on the right. Tap a header to expand and reveal
// options. Aesthetic is light and elegant, not a heavy modal.
type Props = {
  currentModeId: ModeId;
  onChangeMode: (id: ModeId) => void;
  audioEnabled: boolean;
  onChangeAudioEnabled: (enabled: boolean) => void;
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
};

type ExpandedSection = 'mode' | 'display' | 'audio' | 'language' | null;

const DISPLAY_OPTIONS: Array<{ id: DisplayMode; key: StringKey }> = [
  { id: 'words',     key: 'displayWords' },
  { id: 'countdown', key: 'displayCountdown' },
  { id: 'silent',    key: 'displaySilent' },
];

export function ThemePicker({
  currentModeId,
  onChangeMode,
  audioEnabled,
  onChangeAudioEnabled,
  displayMode,
  onChangeDisplayMode,
}: Props) {
  const lang = useLang(); // re-render on language change
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedSection>(null);

  const currentMode = MODES[currentModeId];

  return (
    <>
      {/* Faint gear icon, top-right. Lower opacity so it disappears into the scene. */}
      <button
        aria-label={t('settings')}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 12px)',
          right: '14px',
          width: 28,
          height: 28,
          padding: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.18,
          zIndex: 100,
          color: '#fff',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="100%" height="100%">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            setExpanded(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 12, 24, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px',
            color: '#f4f7fc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 300,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 360,
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CollapsibleSection
              label={t('mode')}
              currentValue={t(currentMode.labelKey)}
              isOpen={expanded === 'mode'}
              onToggle={() => setExpanded((e) => e === 'mode' ? null : 'mode')}
            >
              {MODE_LIST.map((m) => (
                <Choice
                  key={m.id}
                  selected={currentModeId === m.id}
                  onClick={() => onChangeMode(m.id)}
                  title={t(m.labelKey)}
                  subtitle={t(m.intentKey)}
                />
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              label={t('display')}
              currentValue={t(DISPLAY_OPTIONS.find((o) => o.id === displayMode)?.key ?? 'displayWords')}
              isOpen={expanded === 'display'}
              onToggle={() => setExpanded((e) => e === 'display' ? null : 'display')}
            >
              {DISPLAY_OPTIONS.map((opt) => (
                <Choice
                  key={opt.id}
                  selected={displayMode === opt.id}
                  onClick={() => onChangeDisplayMode(opt.id)}
                  title={t(opt.key)}
                />
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              label={t('audio')}
              currentValue={audioEnabled ? t('audioOn') : t('audioOff')}
              isOpen={expanded === 'audio'}
              onToggle={() => setExpanded((e) => e === 'audio' ? null : 'audio')}
            >
              <Choice
                selected={audioEnabled}
                onClick={() => onChangeAudioEnabled(true)}
                title={t('audioOn')}
              />
              <Choice
                selected={!audioEnabled}
                onClick={() => onChangeAudioEnabled(false)}
                title={t('audioOff')}
              />
            </CollapsibleSection>

            <CollapsibleSection
              label={t('language')}
              currentValue={LANG_NAMES[lang]}
              isOpen={expanded === 'language'}
              onToggle={() => setExpanded((e) => e === 'language' ? null : 'language')}
            >
              {SUPPORTED_LANGS.map((langOpt) => (
                <Choice
                  key={langOpt}
                  selected={langOpt === getLang()}
                  onClick={() => setLang(langOpt)}
                  title={LANG_NAMES[langOpt]}
                />
              ))}
            </CollapsibleSection>
          </div>
        </div>
      )}
    </>
  );
}

// Collapsible section — header always visible (with current value on right),
// children only render when expanded. Header is NOT styled as a button —
// it's a row of text with subtle interaction (color shift on hover).
function CollapsibleSection({
  label,
  currentValue,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  currentValue: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 4px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            opacity: 0.55,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.95rem',
            opacity: 0.85,
          }}
        >
          <span style={{ fontWeight: 300 }}>{currentValue}</span>
          <Chevron open={isOpen} />
        </span>
      </div>
      {isOpen && (
        <div style={{ padding: '4px 4px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      style={{
        opacity: 0.55,
        transform: open ? 'rotate(180deg)' : 'rotate(0)',
        transition: 'transform 200ms ease',
      }}
    >
      <path d="M2.5 4 L5.5 7 L8.5 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A single choice within an expanded section. Styled as a soft row, not a
// hard button. Selected state shown by a delicate left-edge accent + check.
function Choice({
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 12px',
        background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderLeft: selected ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
        borderRadius: 6,
        fontSize: '0.95rem',
        color: '#f4f7fc',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 180ms ease',
      }}
    >
      <span>
        <span style={{ fontWeight: selected ? 400 : 300 }}>{title}</span>
        {subtitle && (
          <span style={{ display: 'block', fontSize: '0.78rem', opacity: 0.55, marginTop: 2, fontWeight: 300 }}>
            {subtitle}
          </span>
        )}
      </span>
      {selected && (
        <span style={{ fontSize: '0.85rem', opacity: 0.75, fontWeight: 300 }}>✓</span>
      )}
    </div>
  );
}
