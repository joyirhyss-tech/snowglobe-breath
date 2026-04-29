// Screen-reader-only visual style. Content stays in the DOM (so VoiceOver
// and other assistive tech read it) but is invisible to sighted users.
// Standard pattern from WCAG / Web AIM. Applied via inline style so it
// works without a CSS file dependency.
import type { CSSProperties } from 'react';

export const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
