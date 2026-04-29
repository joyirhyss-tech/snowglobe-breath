# Hush — App Preview Video Storyboard

Drafted 2026-04-27. Plan for the 15-30 second app preview video uploaded
alongside screenshots in App Store Connect. Optional but high-leverage —
preview videos increase install conversion ~25% on average per Apple's
own data.

---

## Apple's specs (current — verify in App Store Connect at upload time)

| Field | Value |
|---|---|
| **Length** | 15–30 seconds (cannot exceed 30s) |
| **Format** | M4V, MP4, or MOV |
| **Codec** | H.264 or HEVC for video; AAC for audio |
| **Frame rate** | 30 fps |
| **Resolution** | 1290 × 2796 for the iPhone Pro Max class (matches the screenshots from `SCREENSHOTS.md`) |
| **Aspect ratio** | 9:19.5 portrait |
| **Audio** | Required track — silent is fine but the file must contain an audio stream; Hush's actual audio is a perfect fit |
| **Quantity** | Up to **3 preview videos** per device size; ship **1** for v1.0 |

Apple is strict on these — they reject videos that include their own
hardware (showing an iPhone in the video, "available on iPhone" copy,
prices, ratings, or anything outside the app itself). **Pure in-app
footage.**

---

## Storyboard — recommended: 30s Silver-mode "first half of a real session"

The preview is a literal capture of the first 30 seconds of a Silver
session, with one caption near the start. Hush's pace IS the preview's
pace; the preview becomes a demo of what the app does, in real time, with
no time compression. This embodies the app's restraint principle.

### Beat-by-beat (30s total)

| Time | What's on screen | Audio | Caption |
|---|---|---|---|
| **0:00** | Idle silver pile, settled, shimmering quietly | silence (drone hasn't started yet) | — |
| **0:01** | Caption fades in (1s ease) | — | *Sixty seconds. Just breathe.* |
| **0:03** | Caption holds | — | *(holds)* |
| **0:04** | Caption begins fading out (2s ease) | — | — |
| **0:05** | A subtle shake/burst — particles erupt up; shake-flash glows | drone fades in (110 Hz A2 + 5th); water bed begins fading in | — |
| **0:06** | Particles at peak height, mid-arc, glittering | drone at peak inhale gain | — |
| **0:08** | "**inhale**" word fades in at center-bottom | drone holds | — |
| **0:11** | "inhale" crossfades to "**exhale**" at phase boundary | drone gain dips for exhale | — |
| **0:13** | Particles drifting majestically, big arcs | water bed audible | — |
| **0:18** | Mid-session — drift continues, particles tumble in slow eddies | drone + water bed | — |
| **0:23** | Second inhale phase begins, "inhale" crossfades back | drone swell | — |
| **0:28** | Particles drifting, scene at peak visual richness | full audio | — |
| **0:30** | Hard cut to black (no fade — natural Apple App Preview ending) | hard cut | — |

The final hard cut is intentional — Apple expects preview videos to end
abruptly when the app's content is the preview itself. Don't add a logo
card, "Get Hush" text, or anything pointing back to the App Store. The
listing handles all that.

### Why Silver mode for the preview

- **Calmest first impression.** Reviewer + browsing user see the most
  meditative version of the app first.
- **Dark midnight blue background reads at every screen brightness.**
  Even at low brightness on the App Store carousel, the silver glitter
  still pops.
- **Universal sample.** Silver's lake-water bed is least likely to land
  wrong with random users; chimes (Gold) and handpan music (Rainbow) are
  more polarizing.
- **Sets the v1 precedent.** Silver was the v1 web version; the preview
  honors that lineage.

### Alternative: 30s three-mode trailer

If the conversion data later shows users want to see the variety upfront,
a v1.1 update can swap to a three-mode trailer:

| Time | Mode | Beat |
|---|---|---|
| 0:00 – 0:08 | Silver | idle pile → shake → inhale word |
| 0:08 – 0:09 | Hard cut | — |
| 0:09 – 0:18 | Gold | mid-burst → "hold" word → chimes audio swell |
| 0:18 – 0:19 | Hard cut | — |
| 0:19 – 0:28 | Rainbow | exhale phase, prismatic particles, handpan music |
| 0:28 – 0:30 | Quick fade | — |

I'd hold this for v1.1 and ship the focused single-mode preview first.

---

## How to capture the video

### Easiest path: macOS QuickTime + iPhone

1. Plug your iPhone into your Mac
2. **QuickTime Player → File → New Movie Recording**
3. Click the dropdown next to the record button → select your iPhone as
   both video AND microphone source
4. Your iPhone's screen mirrors at native resolution; iPhone audio
   captures cleanly
5. Open Hush on the iPhone, get to idle Silver state, click record
6. Wait 1 second, then start a session (shake or tap)
7. Let it run for 31-32 seconds, click stop
8. Trim to exactly 0:00 → 0:30 in QuickTime: **Edit → Trim** (Cmd+T) →
   drag yellow handles → click Trim

Output is a `.mov` file at native resolution + native audio.

### Adding the caption overlay

QuickTime can't add text. You'll need iMovie (free, on your Mac) or
DaVinci Resolve (free, more powerful):

**iMovie path:**
1. Open iMovie → New Movie → drag your trimmed `.mov` in
2. Click the title button (T icon) → choose "Standard" or "Lower" style
3. Drag the title to the timeline at 0:01 → 0:04 duration
4. Edit text: "Sixty seconds. Just breathe."
5. Style: SF Pro Display, white, 60% opacity, drop shadow
6. **Share → File → Format: Video and Audio → Resolution: 1080p →
   Quality: High → Compress: Faster → Save**
7. Output is `.m4v`

If output is 1080×1920 instead of 1290×2796, that's still acceptable to
Apple — they auto-scale up; visual quality is fine. Native 1290×2796 is
better but not required.

### Verifying file size

Apple caps preview video uploads at **500 MB**. A 30s, 1080p, H.264 video
typically lands in 10-30 MB. You should never hit the cap unless
something's wrong with the encode.

---

## What Apple's reviewer specifically watches for

(From WWDC 2023 "What's new in App Store Connect" + the App Review
Guidelines section 2.3.10):

- ❌ App icons appearing in the video
- ❌ Apple hardware visible (no iPhone in frame; you're doing in-app
     capture which avoids this)
- ❌ Pricing or promotional copy ("$2.99", "Get it now")
- ❌ "On the App Store" text
- ❌ Other apps' content visible
- ❌ Stock footage or non-app moments (the entire 30s must be in-app)
- ❌ Hardware features the user doesn't actually see in your app
     (e.g., touching the phone is OK; but don't show the phone itself)
- ✅ Captions are fine in moderation (1-2 short ones is normal)
- ✅ Music can be your own app's audio (Hush's drone + water bed are
     fully owned/licensed)
- ✅ Showing UI you have (Settings panel is fine)

The "first half of a Silver session with one caption" plan satisfies all
of the above by construction — there's no edge case to worry about.

---

## Submission checklist

- [ ] Capture 31s of Silver-mode session via QuickTime + iPhone
- [ ] Trim to exactly 0:00 → 0:30
- [ ] Add caption "Sixty seconds. Just breathe." between 0:01-0:04 in
      iMovie
- [ ] Export H.264 / AAC, 30 fps, 1080p or 1290×2796
- [ ] Verify file size < 500 MB (will be ~15 MB)
- [ ] Verify audio track is present and at proper volume (-12 dB peak,
      not clipping)
- [ ] Watch the preview at thumbnail size on the App Store Connect upload
      page — does it still read?
- [ ] Save as `hush-preview-v1.0.m4v` for archival

---

## What I will and won't do

I can:
- **Talk through the capture moment-by-moment** when you're ready to
  film — sit with you through the 30s and call out the beats
- **Help you tune the caption typography** in iMovie
- **Write a Playwright capture script** for browser-based capture if you
  want programmatic recording from `hush-aidedeq.netlify.app`
- **Validate the final file** against Apple's specs before you upload

I can't:
- Capture it without your phone running the app
- Operate iMovie remotely
- Predict your aesthetic preference for the caption font/color (drafted
  above is a baseline; you may want different)

The capture session is best done at your Mac when you have 15 quiet
minutes. The full pipeline (capture + trim + caption + export) is
~20-30 min for a polished v1.0 preview.
