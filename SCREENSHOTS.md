# Hush — App Store Screenshot Strategy

Drafted 2026-04-27. The plan for the visual assets that go in the App Store
listing alongside the metadata in `APP_STORE.md`.

App Store screenshots are doing two jobs at once: helping a browsing user
decide whether to install (conversion), and giving Apple's reviewer a
visual record alongside the App Review Notes. Hush's restraint principle
applies here too — fewer, better screenshots beat many noisy ones.

---

## Apple's required sizes (as of iOS 17+)

You only **need** the largest current iPhone size. Apple auto-down-scales
for older devices, and as of iOS 17 they accept just one device family.

| Device family | Resolution | How many | Notes |
|---|---|---|---|
| **6.9" iPhone Pro Max** *(iPhone 15 Pro Max class)* | 1290 × 2796 | **3 minimum**, 10 max | Required for v1.0 |
| 6.5" iPhone *(iPhone 11 Pro Max / XR class)* | 1242 × 2688 | optional | Apple auto-scales from 6.9" |
| 5.5" iPhone *(iPhone 8 Plus class)* | 1242 × 2208 | optional | Skip — Hush iOS minimum target should be iOS 16+ |
| 12.9" iPad Pro | 2048 × 2732 | optional | Skip for v1.0 if not optimizing for iPad |

**Recommendation: ship 6 screenshots at 6.9".** Six tells the full story
without Apple cropping the carousel. Three is the legal minimum but reads
as "incomplete app."

---

## The six screenshots — story arc

The Hush practice has its own story: idle → shake → swirl → settle →
quote → done. Each screenshot maps to a beat in that arc, plus one for the
settings depth. **All shot in Silver mode** for consistency unless noted —
silver is the calmest entry point and Apple's preview reviewer should see
the calmest version first.

### 1. Hero (idle, mid-day)

**What's on screen**
The full Hush canvas in **Silver** mode at idle. Particles settled in a
shimmering pile at the bottom, deep midnight blue background. Just a
breath of stillness — no UI chrome at all.

**Caption (centered or top, ~60 px from top edge):**
> *Sixty seconds. Just breathe.*

**Why this one** — leads with the visual identity, no text inside the app
yet, lets the wallpaper do the talking. This is your billboard frame.

### 2. Mid-burst (shake just landed)

**What's on screen**
Silver mode, ~1.5 seconds after a shake. Particles in mid-arc, glittering
trails reaching toward the top of the vessel. The breath cue word
"**inhale**" beginning to fade in.

**Caption:**
> *Shake your phone, the dust rises.*

**Why** — answers the "what does it do" question instantly. Shows the
shake interaction (key for App Store reviewer compliance — your App
Review Notes call out the shake gesture as primary).

### 3. Three modes (Settings → Mode panel expanded)

**What's on screen**
Settings panel open, **Mode** section expanded showing the three options
(Silver, Gold, Rainbow) with their localized intent labels visible.
Background scene blurred behind the panel.

**Caption:**
> *Three breath patterns. Three intentions.*

**Why** — this is your 4.2 mitigation made visual. Reviewer sees you have
three distinct modes, not one trick. Browsing user sees there's depth here.

### 4. Gold mode at settle (~45s)

**What's on screen**
Switch to **Gold** mode for this one. Mid-late session, pile starting to
form, warm umber background, chimes-and-rain audio implicit. Breath cue
showing "**hold**" word (Gold uses box breathing, the only mode with hold
phases).

**Caption:**
> *Gold: grounded focus. Box breathing.*

**Why** — establishes mode variety visually. The "hold" cue is
Gold-specific; reviewer / user can tell modes are genuinely distinct.

### 5. Rainbow mode mid-swirl

**What's on screen**
**Rainbow** mode, ~10s in, prismatic particles in big arcs, the
silvery-grey water backdrop, the lavender light beam barely visible.
Breath cue showing **"exhale"**.

**Caption:**
> *Rainbow: joy and opening. Coherent breathing.*

**Why** — shows the most chromatic mode, the visual "wow" frame. Caps off
the three-modes story (Silver in #2, Gold in #4, Rainbow here).

### 6. Closing quote (the why)

**What's on screen**
End of a session. Silver mode (back to baseline). Particles fully settled
in a dense pile, very subtle underglow. **Closing quote visible at full
opacity** in italic Cormorant Garamond. Pick a quote from the equity-
vetted list that works on its own out of context — one that doesn't
require the practice context to land. Maybe:
> "*Each one of us must learn to identify the magic in our lives.*"
> — Audre Lorde

**Caption (small, beneath quote):**
> *A poem closes each practice.*

**Why** — sells the soul of the app. Quotes from marginalized voices is
your differentiator versus Calm/Headspace. This one frame says that.

---

## Captions — typography and placement

- **Font**: SF Pro Display (Apple's native; matches App Store listing
  cards) at **32-36 px**, **Regular** weight, **white** color, ~80%
  opacity
- **Placement**: top third of the screenshot, **above** the app's UI so
  it doesn't compete with breath cue text — leaves the bottom 60% as the
  visual hero
- **Width**: max 90% of the canvas width; text-balance for clean line
  breaks
- **Drop shadow**: subtle 0px 1px 6px rgba(0,0,0,0.5) so caption stays
  readable against light particle peaks

You can do this in Canva, Figma, or Sketch — any tool you're comfortable
with. Avoid Photoshop unless you already use it. **Don't use App Store
Connect's built-in caption tool** — it lays text over your image with
default styling that looks generic.

---

## How to capture the actual screen frames

**Easy path: Hush running in Safari iPhone simulator OR your real device.**

### From the running app at `https://hush-aidedeq.netlify.app`

1. Open Safari, navigate to the URL
2. **DevTools → Inspect → toggle device emulation → iPhone 15 Pro Max
   (1290×2796 logical, 3x physical)**
3. Trigger each session phase, pause animations at the right moment with
   DevTools' frame stepping (or just use Cmd+Shift+4 to capture during
   the sessions live — modern Macs run Hush smoothly)
4. Capture with `Cmd+Shift+4 → spacebar → click window` for clean window
   captures, or `Cmd+Shift+5` for region selection

The web version's particle physics, audio, and visuals are the same as
what ships on iOS — Capacitor wraps the web bundle. The shake interaction
won't fire (no accelerometer in browser DevTools), but you can use
**tap-anywhere** to start a session for screenshot purposes; the visuals
are identical.

### From a real iPhone (after Xcode build)

This is the higher-fidelity path. Once you have an iOS build running on
your phone:

1. Plug iPhone into Mac
2. **QuickTime Player → File → New Movie Recording → camera dropdown →
   select your iPhone**
3. iPhone screen mirrors to Mac at native resolution
4. Trigger sessions, screenshot with `Cmd+Shift+4`
5. Or just use the iPhone's native screenshot (`Side + Volume Up`) and
   AirDrop

Either path gives you genuine 1290×2796 captures.

---

## Composition tips that read at App Store thumb size

App Store browsing happens at thumbnail scale where each screenshot is
~250 px wide. Composition should survive that downscale.

- **High contrast** — the deep dark backgrounds + bright silver/gold/
  prism particles do this naturally; you're well-positioned
- **Don't crowd the breath text** — the "inhale" cue is small in-app on
  purpose; in the screenshot it should still be small (and the caption
  should be the primary text element)
- **Avoid Apple chrome** — iOS notch / status bar / home indicator. Apple
  recommends NOT including those in App Store screenshots since they vary
  by device. Use cropped frames where the chrome would normally appear
- **Use real session moments** — don't fake the "ideal" frame; use what
  the app actually shows. Reviewers notice mocked screenshots and it
  erodes trust

---

## Localization — only English for v1.0

App Store Connect lets you upload separate screenshots per locale.
Tempting for v1.0 since you ship in 4 languages, but:

- The captions are the only localizable element in screenshots; visuals
  stay the same
- Translating the in-screenshot captions to nl/ko/es **multiplies your
  asset count by 4** (24 screenshots instead of 6)
- For an unknown indie app at launch, English-only screenshots are
  industry standard and don't hurt conversion in localized markets — the
  app's UI itself is localized, that's what matters
- **Recommendation**: ship 6 English screenshots for v1.0. Add localized
  variants in v1.1 if downloads in those markets warrant it.

---

## Final checklist before upload

- [ ] All 6 screenshots are 1290 × 2796 pixels exactly
- [ ] Format: PNG or JPEG (PNG preferred for the dark backgrounds with
      bright particles — JPEG can introduce visible blocking artifacts)
- [ ] No Apple chrome (notch / status bar / home indicator)
- [ ] No third-party logos or copyrighted material
- [ ] Captions don't make medical claims (use "designed to" and "may"
      language; never "treats", "cures", "reduces anxiety")
- [ ] No personal information visible (test with your account)
- [ ] Sequence reads as a story (idle → shake → modes → quote)
- [ ] Files named in capture order so App Store Connect uploads in the
      right sequence (e.g., `01-hero.png`, `02-burst.png`, …)

---

## What I will and won't do

I can:
- **Help you frame each capture moment** — tell me when you're ready and
  I'll talk through what to look for in each beat
- **Write the caption copy** — already drafted above; can iterate
- **Set up a Playwright capture flow** for the web version if you want
  programmatic screenshots that are repeatable

I can't:
- Capture them for you in real time — needs your eyes on the actual
  motion, picking the right moment within the 60s session
- Apply caption typography in Canva/Figma — that's your design tool
  preference call

Tell me when you're ready to capture and we'll go through the six in
sequence.
