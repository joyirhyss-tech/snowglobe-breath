# Hush — App Store Submission Package

Drafted 2026-04-27. Copy/paste each section into App Store Connect when
creating the app record. Edit anything that doesn't match TPC | AEQ's
voice — these are starting drafts grounded in what the app actually does.

---

## App Identity

| Field | Value |
|---|---|
| **App name** | Hush |
| **Subtitle** *(30 char max)* | A sixty-second breath practice |
| **Bundle ID** | `org.aidedeq.hush` *(suggested — match the Capacitor `appId` in `capacitor.config.ts` if different)* |
| **SKU** | `hush-ios-v1` |
| **Primary category** | Health & Fitness |
| **Secondary category** | Lifestyle |
| **Content Rights** | Yes, contains third-party content with proper rights *(audio: Pixabay Content License + Freesound CC0; code & visuals: original)* |

**Subtitle alternatives** (pick whichever lands best):
- "A sixty-second breath practice" *(30)*
- "Sixty seconds. Just breathe." *(28)*
- "Settle in sixty seconds." *(24)*
- "Breathe with light and water." *(29)*

---

## Description *(4000 char max — current draft ≈1900)*

> Sixty seconds. Three breaths. One settled mind.
>
> Hush is a small, deliberate breath practice. Shake your phone — or just tap — and watch silver dust burst, swirl, and settle. Five gentle inhales and five longer exhales bring you back to your body before the dust comes to rest. A line of poetry from a marginalized voice closes the practice. Then you go back to your day.
>
> **Three modes for three intentions:**
> • **Silver** — Daily reset. A 5-second inhale and 7-second exhale, repeated five times. The longer exhale activates the parasympathetic nervous system; this is the breath of letting go.
> • **Gold** — Grounded focus. Box breathing — 5 seconds in, 5 hold, 5 out, 5 hold — used by clinicians, athletes, and the U.S. Navy SEALs to anchor attention under pressure.
> • **Rainbow** — Joy and opening. Coherent breathing at six breaths per minute, the heart's resonant frequency. The handpan music carries the breath; the prismatic shimmer carries the mood.
>
> **Built around restraint.** No account. No tracking. No analytics. No in-app purchases, no subscriptions, no upsells. Settings live on your device.
>
> **Designed to be used, not consumed.** A session is sixty seconds. You won't be drawn back into a feed.
>
> **Research-grounded.** The breath patterns are sourced from peer-reviewed work on baroreflex sensitivity (Bernardi et al., Hypertension 2006), heart-rate-variability biofeedback (Lehrer & Gevirtz, Frontiers in Psychology 2014), and clinical use of box breathing. Each mode in the app has a tappable info icon with the technique summary and source links — read or skip, your choice.
>
> **Accessibility.** Honors `prefers-reduced-motion`. Works with VoiceOver. Optional spoken closing for the quotes. Four languages: English, Dutch, Korean, Spanish.
>
> Built by **TPC | AEQ**, a practice making tools that center care, equity, and human well-being in everyday tech. info@aidedeq.org

---

## Promotional Text *(170 char max — can be updated anytime without resubmission)*

> Sixty seconds. Three breaths. Shake your phone, watch the dust settle, come back to yourself. Three research-grounded modes. No account, no tracking. Just breath. *(168)*

---

## Keywords *(100 char max, comma-separated, NO spaces between commas)*

```
breathing,breathwork,meditation,mindfulness,calm,focus,box breathing,coherent breathing,relax,sleep
```
*(99 char — verify in App Store Connect's char counter; localized variants per market are optional but uncommon for v1)*

**Reasoning:** primary terms (`breathing`, `meditation`, `mindfulness`) cover discovery; technique-specific terms (`box breathing`, `coherent breathing`) catch users who already know the modality and convert at higher rates; secondary `relax` and `sleep` widen the funnel without leaning into wellness-influencer territory.

---

## What's New *(release notes — for v1.0 initial submission)*

> First release. Sixty-second breath practice in three modes — Silver, Gold, Rainbow. Each pairs a research-grounded breath pattern with its own visual, audio, and intention. No account, no tracking. Built by TPC | AEQ.

---

## Age Rating

**4+** (lowest setting). Answer all rating-questionnaire categories with **None**:
- No violent or sexual content
- No alcohol/tobacco/drug references
- No mature/suggestive themes
- No simulated gambling
- No horror/fear themes
- No medical/treatment information *(important: Hush is for relaxation, not medical advice — keep this honest)*
- Made for Kids: **No** *(meditation app, not designed specifically for children)*

---

## Privacy Nutrition Label

**Data Collection: NONE.** All four sections answered the same way:

| Data Type | Collected? | If yes: tracking? Linked? Why? |
|---|---|---|
| Data Used to Track You | **No** | — |
| Data Linked to Your Identity | **No** | — |
| Data Not Linked to Your Identity | **No** | — |
| Data Not Collected | **All** | — |

**Why this is honest for v1.0:** Hush stores the user's mode/language/audio preferences in `localStorage` (on-device only) and ships no analytics SDK, no crash reporter, no third-party telemetry. The in-app Roo feedback widget currently captures messages to `localStorage` only (Supabase backend not wired) — so even feedback doesn't leave the device for v1.0.

**⚠️ If/when you wire Roo to a real Supabase backend before launch**, update this section to declare:
- Data Not Linked to You: *Diagnostics* (the active mode + free-text feedback message), *purpose: App Functionality*

Either ship Roo as backend-less (current state) and answer "None" honestly, or wire Supabase and declare Diagnostics. Don't ship with Roo claiming to send feedback while the privacy label says "No data collected" — that's a guideline 5.1.2 violation risk.

**Privacy policy URL** *(required field)*: live at `https://hush-aidedeq.netlify.app/privacy.html` (v2-hush deploys here; v1 demo stays frozen at `snowglobe-breath.netlify.app`). Source lives in `public/privacy.html`. Update there + redeploy via the Netlify MCP `deploy-site` tool if collection ever changes.

---

## App Review Notes *(this is the load-bearing 4.2-rejection insurance)*

```
Hi App Review team,

Hush is a 60-second breath practice. Below is context that may help with
the review:

PRIMARY INTERACTION: Shake gesture
The intended way to start a session is to shake the device. Tap-anywhere is
also supported as a universal fallback (and is what most reviewers will
discover first). On first interaction we silently request iOS device-motion
permission via DeviceMotionEvent.requestPermission(); no visible permission
prompt is shown until the user attempts the gesture.

THREE DISTINCT BREATH MODES
The app is not a single-purpose breathing animation. It implements three
peer-reviewed breath techniques with distinct visual, audio, and pacing:
  • Silver: 5s inhale / 7s exhale × 5 cycles (parasympathetic; Bernardi
    et al. 2006)
  • Gold: 5-5-5-5 box breathing × 3 cycles (autonomic balance; Navy SEAL
    and clinical use)
  • Rainbow: 5s/5s coherent breathing × 6 cycles (HRV resonance; Lehrer
    & Gevirtz 2014)
Each mode also has its own background, particle physics, and ambient
audio bed (lake water, wind chimes, handpan music respectively).

USER PREFERENCES
The Settings panel includes:
  • Mode selection (with research info per mode)
  • Display mode (words / countdown / silent)
  • Master audio toggle
  • Closing-quote narration toggle (off by default)
  • Language: English, Dutch, Korean, Spanish
  • About / Feedback to TPC | AEQ
  • Pre-session info icon links to peer-reviewed citations

NO ACCOUNT, NO TRACKING, NO IAP
The app collects no personal data, has no account system, no in-app
purchases, no subscriptions, no analytics SDK, and no advertising. All
preferences are stored in on-device localStorage.

ACCESSIBILITY
The app honors prefers-reduced-motion (lower particle counts, no beam
drift). VoiceOver labels are present. Optional spoken narration of the
closing quote. Reduced-motion was tested on iOS Simulator.

NO MEDICAL CLAIMS
Copy throughout the app uses language like "designed for relaxation" and
"may help" — never "treats", "cures", or "reduces anxiety". Research info
links go to authoritative sources (AHA Journals, Cleveland Clinic, APA,
Frontiers in Psychology, HeartMath).

CONTACT
info@aidedeq.org for any questions during review.

Thank you,
TPC | AEQ
```

---

## Required URLs

| Field | Value |
|---|---|
| **Marketing URL** *(optional)* | `https://hush-aidedeq.netlify.app` |
| **Support URL** *(required)* | `https://hush-aidedeq.netlify.app` *(or `mailto:info@aidedeq.org` if Apple accepts mail-only — usually wants a web URL)* |
| **Privacy Policy URL** *(required)* | `https://hush-aidedeq.netlify.app/privacy.html` |

---

## Pricing & Availability

| Field | Value |
|---|---|
| **Price tier** | $2.99 (Tier 3) for launch; periodic sales to $1.99 (Tier 2) |
| **Availability** | All territories *(unless TPC \| AEQ has reasons to limit)* |
| **Apple Small Business Program** | **Enroll** — drops Apple's commission from 30% to 15% on apps grossing under $1M/year *(per project memory; the form is at developer.apple.com/app-store/small-business-program/)* |
| **Pre-order** | Optional — useful if you want to gauge demand before launch |

---

## Submission Checklist (before you click "Submit for Review")

- [ ] App icon set installed in Xcode (1024×1024 + all derivatives — see future `scripts/gen-icons.sh`)
- [ ] Screenshots uploaded for required device sizes:
  - 6.9" iPhone (Pro Max class) — 3 minimum, 10 max
  - 6.5" iPhone — 3 minimum *(if you ship to older devices)*
  - 5.5" iPhone — only if you support iPhone 8 Plus *(probably skip)*
  - 13" iPad / 12.9" iPad Pro — only if you support iPad
- [ ] App preview video *(optional but recommended for breath/meditation apps — 15-30s of the actual practice)*
- [ ] Build uploaded via Xcode → Archive → Distribute App → App Store Connect
- [ ] HealthKit usage description set in Info.plist *(when HealthKit is wired)*
- [ ] Motion & Fitness usage description set in Info.plist *(for shake detection)*
- [ ] All metadata fields filled (description, keywords, etc.)
- [ ] Privacy policy URL is publicly accessible
- [ ] Privacy nutrition label answered honestly
- [ ] App Review Notes pasted into Review Information field
- [ ] Demo account *(N/A — no account system)*
- [ ] Test on a real device *(simulator alone insufficient — shake gesture won't work in simulator)*

---

## What I deliberately did NOT draft

- **App icon.** You design the master 1024×1024. I'll scaffold the size-generation script when you have the master ready.
- **Screenshots.** Best taken from real device with real session running. We can plan composition together once visuals are locked.
- **Preview video.** Same — film a real session, edit to 30s.
These are Phase 5 final-polish items. The metadata above is what App Store Connect needs filled in; the assets above are what gets uploaded alongside.

*Privacy policy is shipped — see `public/privacy.html`.*

---

## Two questions before submission day

1. **Bundle ID confirmation** — `org.aidedeq.hush`? Or do you already have one registered in App Store Connect?
2. **Roo backend decision** — keep the localStorage stub for v1.0 launch (declared "No data collected") OR wire Supabase for real feedback (declare "Diagnostics, not linked")? Either is fine; we just need to ship consistent with the answer.
