// iOS Safari Web Audio unlock.
//
// On iOS 18.x Safari, calling AudioContext.resume() inside a user gesture
// is NOT sufficient to route Web Audio output to the speaker. Tone.js's
// own start sequence reports success, samples decode and "play", but no
// sound reaches the user. Diagnostic confirmed via /diagnostic.html on a
// real iPhone 13 Pro / iOS 18.7:
//   - Web Audio test tone: reports played, silent
//   - Web Audio M4A decode + source.start(): reports playing, silent
//   - HTML5 <audio>.play() of the same M4A: works
//
// First attempt: play an HTML5 element briefly, then pause. Result: user
// heard a brief static crackle then silence — the audio session reverted
// to silent as soon as we paused.
//
// Working approach: keep a SILENT WAV looping continuously in the
// background. iOS treats this as ongoing media playback and keeps the
// audio session in the "playback" category for as long as the page is
// alive. Web Audio (Tone.js) routes through the same speaker output. The
// user hears nothing from the unlock element — its audio data is literal
// zeroes.

let unlockEl: HTMLAudioElement | null = null;
let attempted = false;

// Generate a silent 16-bit mono 8kHz WAV file as a base64 data URL. We
// generate it at runtime instead of shipping a static file so the unlock
// has zero network dependencies — purely synchronous setup.
function makeSilentWav(durationSec = 0.1): string {
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2;             // 16-bit PCM = 2 bytes per sample
  const totalSize = 44 + dataSize;
  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  let p = 0;
  const writeStr = (s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(p++, s.charCodeAt(i)); };
  const writeU32  = (n: number) => { view.setUint32(p, n, true); p += 4; };
  const writeU16  = (n: number) => { view.setUint16(p, n, true); p += 2; };
  writeStr('RIFF');           writeU32(totalSize - 8);    writeStr('WAVE');
  writeStr('fmt ');           writeU32(16);                writeU16(1);            // PCM
  writeU16(1);                writeU32(sampleRate);        writeU32(sampleRate * 2); // mono, byte rate
  writeU16(2);                writeU16(16);                                          // block align, bits/sample
  writeStr('data');           writeU32(dataSize);
  // Data section is already all zeros — that IS silence in 16-bit PCM.
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(binary);
}

async function unlock(): Promise<void> {
  if (attempted) return;
  attempted = true;
  try {
    const el = document.createElement('audio');
    el.src = makeSilentWav(0.1);
    el.loop = true;                          // keep looping for the lifetime of the page
    el.volume = 1;                           // doesn't matter — file content is zeros
    el.setAttribute('playsinline', '');
    document.body.appendChild(el);
    await el.play();
    unlockEl = el;
    // We deliberately do NOT pause or remove this element. iOS keeps the
    // audio session in "playback" category as long as it's playing, and
    // the user won't hear anything because the audio data is silent.
  } catch {
    // Autoplay blocked despite user gesture, or some other failure. Rare.
    // Audio just won't work; rest of the app still functions.
  }
}

/**
 * Attach a one-shot unlock listener. Runs on the first touchstart or click
 * that reaches the document. Idempotent — only the first call attaches the
 * listener; subsequent calls no-op. Should be invoked once at app boot.
 */
export function setupIOSAudioUnlock(): void {
  if (typeof document === 'undefined') return;
  if (attempted) return;
  // Use capture-phase to fire BEFORE any other click handlers consume the
  // gesture (e.g., the universal tap-to-start, settings buttons, etc).
  // capture: true is required because some handlers stop propagation.
  const handler = () => { void unlock(); };
  document.addEventListener('touchstart', handler, { once: true, passive: true, capture: true });
  document.addEventListener('click', handler, { once: true, capture: true });
}

/** True if the unlock element is currently playing — useful for diagnostics. */
export function isAudioUnlockActive(): boolean {
  return unlockEl !== null && !unlockEl.paused;
}
