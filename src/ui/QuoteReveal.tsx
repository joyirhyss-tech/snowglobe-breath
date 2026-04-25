import type { Quote } from '../quotes';
import { preventWidow } from '../quotes';
import type { Theme } from '../themes/types';

// easeInOutCubic — matches BreathText for visual consistency.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Props = {
  quote: Quote | null;
  // Active only during the session's "ending" phase. fadeOutProgress (0..1)
  // drives both fade-in and fade-out: ramps in over first ~18%, holds, then
  // fades out over last ~18%.
  visible: boolean;
  fadeOutProgress: number;
  theme: Theme;
};

// Closing quote rendered after the final exhale. Centered on screen, font
// size sits at the midpoint of the breath-text scale (between MIN and MAX of
// inhale/exhale), with the author below in a smaller weight. Quote text uses
// `text-wrap: balance` and a non-breaking space before the final word so no
// single word can sit on its own line.
export function QuoteReveal({ quote, visible, fadeOutProgress, theme }: Props) {
  if (!visible || !quote) return null;

  // Fade envelope tuned for a long readable hold and a slow tail-out.
  // With session.fadeOutMs = 12_000ms:
  //   0.00–0.10 (1.2s) → fade in
  //   0.10–0.65 (6.6s) → fully visible
  //   0.65–1.00 (4.2s) → slow fade out
  const FADE_IN_END = 0.10;
  const FADE_OUT_START = 0.65;
  let opacityT = 1;
  if (fadeOutProgress < FADE_IN_END) {
    opacityT = easeInOutCubic(fadeOutProgress / FADE_IN_END);
  } else if (fadeOutProgress > FADE_OUT_START) {
    const out = (fadeOutProgress - FADE_OUT_START) / (1 - FADE_OUT_START);
    // Linear-ish slow fade-out feels more meditative than a steep cubic.
    opacityT = 1 - Math.pow(out, 1.4);
  }

  // Quote font sits at the midpoint of the breath-text scale (BreathText
  // uses 1.4rem base × scale 0.78–1.40). Midpoint scale ≈ 1.09 → ~1.5rem.
  const QUOTE_PEAK_OPACITY = 0.78;
  const AUTHOR_PEAK_OPACITY = 0.55;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        padding: '0 9vw',
        opacity: opacityT,
        transition: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '28em',
          textAlign: 'center',
          fontFamily: theme.text.fontFamily,
          color: theme.text.color,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '1.5rem',
          lineHeight: 1.45,
          letterSpacing: '0.02em',
          textShadow: '0 1px 8px rgba(0,0,0,0.55)',
          // Modern browsers (Safari 17.4+, Chrome 114+, Firefox 121+):
          // distribute words evenly across lines so no widow words.
          textWrap: 'balance',
          opacity: QUOTE_PEAK_OPACITY,
        }}
      >
        {preventWidow(quote.text)}
      </div>
      <div
        style={{
          marginTop: '1.4em',
          fontFamily: theme.text.fontFamily,
          color: theme.text.color,
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '0.95rem',
          letterSpacing: '0.08em',
          opacity: AUTHOR_PEAK_OPACITY,
          textShadow: '0 1px 6px rgba(0,0,0,0.55)',
        }}
      >
        — {quote.author}
      </div>
    </div>
  );
}
