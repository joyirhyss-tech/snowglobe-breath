# Hush — Audio Samples

Three samples power the per-mode audio palette. All three sourced from
**Pixabay** under the **Pixabay Content License** — free for commercial and
non-commercial use, no attribution required, App Store distribution allowed.

The samples are bundled directly with the app under `public/audio/`.
Total bundled audio: **~2.0 MB** (mono AAC at 96 kbps).

## Selected samples

| File | Source | Length | Used by | Why this one |
|------|--------|--------|---------|--------------|
| `silver-water.m4a` | [Pixabay / capaholiczsfx — waterside-soft-lake-lite-waves-402561](https://pixabay.com/sound-effects/waterside-soft-lake-lite-waves-402561/) | 60s | **Silver — ambient bed** (loops session-wide) | Soft lake waves. Parasympathetic water vibe matches Silver's "daily reset" intention and the snowglobe-fluid identity. Pairs with the 110 Hz A2 + perfect-fifth synth drone for "snowglobe in water" feel. |
| `gold-chimes.m4a` | [Pixabay / indigobunting — wind-chimes-with-wind-and-light-rain-171624](https://pixabay.com/sound-effects/wind-chimes-with-wind-and-light-rain-171624/) | 60s | **Gold — ambient bed** (loops session-wide) | Wind chimes + light rain + wind. Bell-like ringing reads as anchored presence — the "grounded focus" of box breathing. The wind + rain layers add grounded outdoor atmosphere. Replaces the singing-bowl pattern; the synth drone's gain envelope handles beat-marking that the bowl strikes used to do. |
| `rainbow-strings.m4a` | [Pixabay / fronbondi_skegs — pad-gentle-and-soothing-strings-ambient-358649](https://pixabay.com/sound-effects/pad-gentle-and-soothing-strings-ambient-background-track-358649/) | 48s | **Rainbow — exhale layer** (triggered per exhale) | Soothing strings ambient pad. Replaces the original `cello-bow` plan — broader strings character matches Rainbow's "joy and opening" intention better than a single cello. Loops cleanly across 5-second exhales. |

## How to swap or update samples

If you want to try alternates, the source MP3s live in `~/Downloads/`. To
re-process or pick a different file:

1. Trim + convert to mono AAC at 96 kbps:
   ```bash
   ffmpeg -y -i ~/Downloads/<source.mp3> \
     -ss <START_SEC> -t <DURATION_SEC> \
     -ac 1 -c:a aac -b:a 96k \
     "public/audio/<NAME>.m4a"
   ```
   - `silver-water.m4a` was trimmed to 60s starting at 5s
   - `gold-chimes.m4a` was trimmed to 60s starting at 10s
   - `rainbow-strings.m4a` was trimmed to 48s starting at 2s

2. If you change a filename, update the `SAMPLE_URLS` registry at the top
   of `src/audio/engine.ts` to match.

3. If you want a different mode mapping, update the `audio` palette block
   for that mode in `src/modes.ts`. Available slots:
   - `inhaleSampleId` — fires once at the start of each inhale phase
   - `holdSampleId` — fires once at the start of each hold phase
   - `exhaleSampleId` — fires once at the start of each exhale phase
   - `ambientBedSampleId` — loops continuously through the session

4. Rebuild + sync:
   ```bash
   npm run build
   npx cap sync ios   # only if you've already run cap add ios
   ```

## File format choice

**AAC/M4A**, not OGG/Vorbis. Reason: OGG doesn't play on Safari/iOS WebKit,
so the Capacitor wrapper would silently fail audio on iOS devices. AAC is
universally supported (Safari, Chrome, Firefox, Edge, iOS, Android).
Quality at 96 kbps mono is indistinguishable from the source for our
ambient-pad use case.

## Engine behavior

- **Ambient bed** (Silver, Gold): starts when session goes active, fades in
  over 1.5s, loops continuously, fades out over 1.5s when session ends.
  Disposed on session reset to prevent memory leak across sessions.
- **Per-phase trigger** (Rainbow strings on exhale): plays once at the
  start of each exhale phase. Cuts the previous instance if still playing
  so consecutive exhales don't pile up.

## License notes (for App Store privacy nutrition label)

All three samples: **Pixabay Content License**.

- Free for commercial and non-commercial use, no attribution required.
- Standard restrictions don't apply to ambient/instrumental samples.
- For the App Store: **no licensing disclosures required** in the privacy
  nutrition label or app description.

If you want to credit the original creators in an "About" or "Credits"
screen as a courtesy (not required), the names are: **capaholiczsfx**
(water), **indigobunting** (chimes), **fronbondi_skegs** (strings).

## What's not yet wired

- **Closing-quote narration** — Web Speech API scaffold exists in
  [src/audio/narration.ts](src/audio/narration.ts), opt-in via settings.
  Bespoke voice recordings (your voice, rainbow poems) replace the synth
  voice when added.
- **Rainbow closing poems** — `closingNarrationIds` in `modes.ts` is empty;
  populates when you record 5–7 short poems (10–25s each).
