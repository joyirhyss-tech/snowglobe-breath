import { useState } from 'react';
import { MODE_LIST, MODES, type ModeId } from '../modes';
import { MODE_INFO, type ModeInfo } from '../modeInfo';
import { setLang, useLang, t, SUPPORTED_LANGS, LANG_NAMES, getLang, type StringKey } from '../i18n';
import type { DisplayMode } from '../displayPref';
import { isHealthKitPossible } from '../platform/healthkit';

// Settings panel for v2. Reachable via a faint gear icon in the top-right.
// Sections are collapsible — only the header is visible by default, showing
// the current selection on the right. Tap a header to expand and reveal
// options. Aesthetic is light and elegant, not a heavy modal.
type Props = {
  currentModeId: ModeId;
  onChangeMode: (id: ModeId) => void;
  audioEnabled: boolean;
  onChangeAudioEnabled: (enabled: boolean) => void;
  narrationEnabled: boolean;
  onChangeNarrationEnabled: (enabled: boolean) => void;
  healthKitEnabled: boolean;
  onChangeHealthKitEnabled: (enabled: boolean) => void;
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
};

type ExpandedSection = 'mode' | 'display' | 'audio' | 'narration' | 'health' | 'language' | 'about' | null;

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
  narrationEnabled,
  onChangeNarrationEnabled,
  healthKitEnabled,
  onChangeHealthKitEnabled,
  displayMode,
  onChangeDisplayMode,
}: Props) {
  // Only show the Apple Health section on iOS. On web/Android the toggle
  // would be a dead switch (HealthKit is iOS-only) — pure clutter.
  const showHealthSection = isHealthKitPossible();
  const lang = useLang(); // re-render on language change
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  // Which mode currently has its info expanded (only one at a time, like an
  // accordion within the mode section).
  const [infoOpenFor, setInfoOpenFor] = useState<ModeId | null>(null);

  // Tap handler for the in-settings Roo entry: closes the settings panel
  // first (so the Roo modal isn't competing with the settings backdrop)
  // and then opens the Roo modal.
  const openRoo = () => {
    setOpen(false);
    setExpanded(null);
    // Tiny delay so the settings overlay finishes its tap-out animation
    // before Roo's modal slides in.
    setTimeout(() => {
      const w = window as Window & { RooReporter?: { open: () => void } };
      w.RooReporter?.open();
    }, 60);
  };

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
          // role="dialog" + aria-modal lets VoiceOver users know they're
          // inside a modal panel; the rest of the app is paused. Backdrop
          // tap-to-close is preserved; keyboard users can press Escape too.
          role="dialog"
          aria-modal="true"
          aria-label={t('settings')}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            setExpanded(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
              setExpanded(null);
            }
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
                <ModeChoice
                  key={m.id}
                  selected={currentModeId === m.id}
                  onSelect={() => onChangeMode(m.id)}
                  title={t(m.labelKey)}
                  subtitle={t(m.intentKey)}
                  info={MODE_INFO[m.id]}
                  infoOpen={infoOpenFor === m.id}
                  onInfoToggle={() => setInfoOpenFor((c) => (c === m.id ? null : m.id))}
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
              label={t('narration')}
              currentValue={narrationEnabled ? t('audioOn') : t('audioOff')}
              isOpen={expanded === 'narration'}
              onToggle={() => setExpanded((e) => e === 'narration' ? null : 'narration')}
            >
              <Choice
                selected={narrationEnabled}
                onClick={() => onChangeNarrationEnabled(true)}
                title={t('audioOn')}
                subtitle={t('narrationDescription')}
              />
              <Choice
                selected={!narrationEnabled}
                onClick={() => onChangeNarrationEnabled(false)}
                title={t('audioOff')}
              />
            </CollapsibleSection>

            {showHealthSection && (
              <CollapsibleSection
                label={t('appleHealth')}
                currentValue={healthKitEnabled ? t('audioOn') : t('audioOff')}
                isOpen={expanded === 'health'}
                onToggle={() => setExpanded((e) => e === 'health' ? null : 'health')}
              >
                <Choice
                  selected={healthKitEnabled}
                  onClick={() => onChangeHealthKitEnabled(true)}
                  title={t('audioOn')}
                  subtitle={t('appleHealthDescription')}
                />
                <Choice
                  selected={!healthKitEnabled}
                  onClick={() => onChangeHealthKitEnabled(false)}
                  title={t('audioOff')}
                />
              </CollapsibleSection>
            )}

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

            {/* About — collapsible, last in panel. Consolidates the prior
                separate "Feedback" row with mission, contact, privacy. */}
            <CollapsibleSection
              label={t('about')}
              currentValue="TPC | AEQ"
              isOpen={expanded === 'about'}
              onToggle={() => setExpanded((e) => e === 'about' ? null : 'about')}
            >
              <AboutPanel onTellRoo={openRoo} />
            </CollapsibleSection>
          </div>
        </div>
      )}
    </>
  );
}

// Inline content shown when "About" is expanded. Mission, contact, privacy,
// founder info, and a tap-to-feedback button. Matches the visual rhythm of
// Choice/info panels — left-edge accent, soft padding, restrained type.
function AboutPanel({ onTellRoo }: { onTellRoo: () => void }) {
  const [founderOpen, setFounderOpen] = useState(false);
  return (
    <div
      style={{
        margin: '4px 12px 10px 16px',
        padding: '10px 14px',
        borderLeft: '1px solid rgba(255,255,255,0.18)',
        fontSize: '0.82rem',
        lineHeight: 1.55,
        color: 'rgba(244,247,252,0.82)',
        fontWeight: 300,
      }}
    >
      <div style={{ marginBottom: 10 }}>{t('aboutMission')}</div>
      <div style={{ marginBottom: 10 }}>
        <a
          href="mailto:info@aidedeq.org"
          style={{
            color: 'rgba(196,212,240,0.88)',
            textDecoration: 'none',
            borderBottom: '1px dotted rgba(196,212,240,0.45)',
            fontSize: '0.78rem',
          }}
        >
          info@aidedeq.org →
        </a>
      </div>
      <div style={{ marginBottom: 12, fontSize: '0.76rem', opacity: 0.78 }}>
        {t('aboutPrivacy')}
      </div>

      {/* Founder line — small (i) toggle reveals a photo + bio inline. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: founderOpen ? 8 : 12,
          fontSize: '0.78rem',
          opacity: 0.86,
        }}
      >
        <span>{t('madeBy')} <strong style={{ fontWeight: 500 }}>JoYi Rhyss</strong></span>
        <button
          aria-label={t('aboutFounderLabel')}
          aria-expanded={founderOpen}
          onClick={() => setFounderOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '50%',
            width: 22,
            height: 22,
            padding: 0,
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.72rem',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 400,
            cursor: 'pointer',
            opacity: founderOpen ? 0.95 : 0.6,
            transition: 'opacity 160ms ease',
          }}
        >
          i
        </button>
      </div>
      {founderOpen && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: '10px 0 14px',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            opacity: 0.86,
          }}
        >
          <img
            src="/founder.jpg"
            alt="JoYi Rhyss, founder of TPC | AEQ"
            width={64}
            height={80}
            style={{
              width: 64,
              height: 80,
              borderRadius: 6,
              objectFit: 'cover',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
          <span>{t('founderBio')}</span>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={onTellRoo}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTellRoo(); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 6,
          fontSize: '0.82rem',
          cursor: 'pointer',
          userSelect: 'none',
          fontWeight: 300,
        }}
      >
        <img
          src="/roo/roo-btn.png"
          alt=""
          aria-hidden="true"
          width={20}
          height={20}
          style={{ borderRadius: 3, opacity: 0.92 }}
        />
        {t('tellRoo')}
      </div>
    </div>
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

// A mode choice — like Choice but with a small (i) info button on the right
// that toggles an inline panel below explaining the breathing technique and
// linking to research. Tapping anywhere else still selects the mode.
function ModeChoice({
  selected,
  onSelect,
  title,
  subtitle,
  info,
  infoOpen,
  onInfoToggle,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  info: ModeInfo;
  infoOpen: boolean;
  onInfoToggle: () => void;
}) {
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
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
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selected && (
            <span style={{ fontSize: '0.85rem', opacity: 0.75, fontWeight: 300 }}>✓</span>
          )}
          <button
            aria-label={t('aboutTechnique')}
            aria-expanded={infoOpen}
            onClick={(e) => { e.stopPropagation(); onInfoToggle(); }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '50%',
              width: 22,
              height: 22,
              padding: 0,
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.72rem',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              cursor: 'pointer',
              opacity: infoOpen ? 0.95 : 0.55,
              transition: 'opacity 160ms ease, background 160ms ease',
            }}
          >
            i
          </button>
        </span>
      </div>
      {infoOpen && <ModeInfoPanel info={info} />}
    </div>
  );
}

// Inline info panel that drops below a ModeChoice when the (i) is tapped.
// Keeps the visual weight light: no card border, just left-edge accent and
// generous line-height. Links open in a new tab.
function ModeInfoPanel({ info }: { info: ModeInfo }) {
  return (
    <div
      style={{
        margin: '4px 12px 10px 16px',
        padding: '10px 14px',
        borderLeft: '1px solid rgba(255,255,255,0.18)',
        fontSize: '0.82rem',
        lineHeight: 1.55,
        color: 'rgba(244,247,252,0.82)',
        fontWeight: 300,
      }}
    >
      <div style={{ fontStyle: 'italic', opacity: 0.9, marginBottom: 6 }}>
        {info.technique}
      </div>
      <div style={{ marginBottom: 10 }}>{info.description}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {info.research.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(196,212,240,0.88)',
              textDecoration: 'none',
              borderBottom: '1px dotted rgba(196,212,240,0.45)',
              padding: '2px 0',
              alignSelf: 'flex-start',
              fontSize: '0.78rem',
            }}
          >
            {r.label} →
          </a>
        ))}
      </div>
    </div>
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
