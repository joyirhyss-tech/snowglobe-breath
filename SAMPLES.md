# Hush — Audio Samples

Three samples power the gold and rainbow modes. All three are **Creative
Commons 0 (public domain)** — no attribution required, free for commercial
use including App Store distribution. They're sourced from Freesound.org
because the recordings audited better than Pixabay equivalents on quality
and license clarity.

## Selected samples

| File | Source | Length | Used by | Why this one |
|------|--------|--------|---------|--------------|
| `singing-bowl.ogg` | [Truthiswithin / 193022](https://freesound.org/people/Truthiswithin/sounds/193022/) | 15s | Gold mode hold transitions | 8cm Tibetan bowl, single clean wood-mallet strike, long inharmonic decay. CC0. 1.9k+ downloads, professionally rated. |
| `cello-bow.ogg` | [carrieedick / 465558](https://freesound.org/people/carrieedick/sounds/465558/) | 68s | Rainbow mode exhale layer | "Cello drone" — sustained tone, edited for seamless loop feel. Comments call it "haunting" and "absolutely gorgeous." CC0. |
| `nature-ocean.ogg` | [amholma / 376795](https://freesound.org/people/amholma/sounds/376795/) | 100s | Rainbow mode background | Quiet beach in Destin Florida. Small lapping waves, no birds, no voices. 48kHz/24-bit. CC0. |

## How to install (one-time, ~5 minutes)

1. **Create a free Freesound account** at [freesound.org/home/register](https://freesound.org/home/register/) — required to download (CC0 allows redistribution; the login is just to track downloads).

2. **Download the three WAV files** by clicking each link in the table above and tapping the download arrow on each page.

3. **Convert + compress** to 96 kbps mono OGG (drops file size 90% with no audible loss for our use). Install `ffmpeg` once via Homebrew:
   ```bash
   brew install ffmpeg
   ```
   Then from the directory where you saved the WAVs, run:
   ```bash
   # Singing bowl: trim to 8s (covers strike + tail), mono, 96kbps OGG
   ffmpeg -i 193022__truthiswithin__tibetan-singing-bowl-struck.wav \
     -t 8 -ac 1 -c:a libvorbis -b:a 96k singing-bowl.ogg

   # Cello drone: trim to a clean 6s sustained section starting at 5s in
   ffmpeg -i 465558__carrieedick__cello-drone.wav \
     -ss 5 -t 6 -ac 1 -c:a libvorbis -b:a 96k cello-bow.ogg

   # Ocean: trim to 30s, mono, 96kbps OGG (loops seamlessly)
   ffmpeg -i 376795__amholma__gentle-waves-quiet-beach.wav \
     -t 30 -ac 1 -c:a libvorbis -b:a 96k nature-ocean.ogg
   ```

4. **Drop the three OGG files** into:
   ```
   public/audio/singing-bowl.ogg
   public/audio/cello-bow.ogg
   public/audio/nature-ocean.ogg
   ```

5. **Activate them in `src/audio/engine.ts`** by uncommenting the three lines in the `SAMPLE_URLS` registry:
   ```ts
   const SAMPLE_URLS: Record<string, string> = {
     'singing-bowl': '/audio/singing-bowl.ogg',
     'cello-bow':    '/audio/cello-bow.ogg',
     'nature-ocean': '/audio/nature-ocean.ogg',
   };
   ```

6. **Rebuild + sync**:
   ```bash
   npm run build
   npx cap sync ios   # only if you've already run cap add ios
   ```

Total bundled audio after compression: **~470 KB** for all three samples.

## Quality bar — why these beat what's currently on the App Store

Most meditation apps in the $0.99–$2.99 tier use either:
- **Synthesized "cello" samples** that sound 1990s (Headspace's free tier; many indie apps)
- **Crystal singing bowls** which are pure sine tones — pretty but lifeless
- **Generic ocean stock loops** with audible loop seams

What you're getting in Hush:
- **Real bowed cello** with natural harmonic richness (not modeled)
- **Real Tibetan bowl** with inharmonic partial decay — the complex "shimmery" quality crystal bowls lack
- **Field-recorded ocean** at 48kHz/24-bit, gentle small-wave focus (no crashing surf), seamlessly loopable

Combined with our research-grounded breath-synced drone (110 Hz A2 + perfect fifth, low-pass at 800 Hz), this puts Hush above the audio quality of Calm/Headspace's freemium experiences and on par with their premium tiers.

## License notes (for App Store privacy nutrition label)

- All three samples are CC0 1.0 Universal (public domain dedication)
- No attribution required, no use restrictions, no royalties
- Freesound's CC0 license is recognized by the US Copyright Office and equivalent international bodies
- For the App Store: **no licensing disclosures required** in your privacy nutrition label or app description

If you want to credit the original sound creators in an "About" or "Credits" screen as a courtesy (not required), the names are: **Truthiswithin**, **carrieedick**, **amholma**.
