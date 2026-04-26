# Hush — iOS / App Store setup

This document covers wrapping the v2-hush web build in a native iOS app via
Capacitor v7, and shipping it to the App Store. The web build (Vite) is
unchanged — Capacitor just wraps it.

**Prerequisites you (the user) need:**

- macOS (you have it)
- Xcode 16+ from the App Store (free)
- An Apple ID (free)
- An Apple Developer Program membership ($99/year) — only required when you're
  ready to submit. Local testing on a simulator is free.

---

## One-time setup

### 1. Build the web bundle

```bash
cd "/Users/jkr/Desktop/ALL Build Projects/snowglobe-web"
git checkout v2-hush
npm install
npm run build
```

This produces `dist/` — the web bundle Capacitor will wrap.

### 2. Add the iOS platform

```bash
npx cap add ios
```

This creates an `ios/App/` directory with an Xcode project. Capacitor reads
`capacitor.config.ts` (already in this repo) for app id, name, and plugin
configs. Commit the `ios/` directory; the next time you build you'll just
sync.

### 3. Sync (every time the web bundle changes)

```bash
npm run build && npx cap sync ios
```

`cap sync` copies the latest `dist/` into the iOS project.

### 4. Open the iOS project in Xcode

```bash
npx cap open ios
```

Xcode opens with the `App` workspace. From here you can run on a simulator
or a real device.

---

## iOS-specific configuration to do once

### Info.plist additions

The Capacitor Motion plugin reads accelerometer data. iOS requires a usage
description string even for accelerometer (no prompt is shown, but the App
Store reviewer checks the value). In `ios/App/App/Info.plist` add:

```xml
<key>NSMotionUsageDescription</key>
<string>Hush uses motion to detect when you shake your phone, starting a 60-second breath practice.</string>
```

(If `cap add ios` doesn't include this automatically, add it before first
submission.)

### Status bar + safe areas

Already handled by `capacitor.config.ts` — status bar is transparent over
the dark background, content extends edge-to-edge.

### Splash screen

The default splash is a black screen with the app name. For App Store launch
you'll want a custom splash matching the Hush identity. Replace
`ios/App/App/Assets.xcassets/Splash.imageset/` with your final assets.

### App icon

Drop a 1024×1024 PNG (no transparency, no rounded corners — iOS rounds them
automatically) into `ios/App/App/Assets.xcassets/AppIcon.appiconset/`. Use
`xcrun simctl --set previews-app icon` or just paste in Xcode.

---

## Audio samples to drop in

The audio engine is fully wired but the sample URLs in
`src/audio/engine.ts` are blank. Drop the chosen Pixabay/Freesound files
into `public/audio/` with these exact filenames and the engine picks them
up automatically:

- `public/audio/singing-bowl.ogg` — single Tibetan bowl strike, 3-6s, decay
- `public/audio/cello-bow.ogg` — sustained cello note, 5-8s, ~196 Hz
- `public/audio/nature-ocean.ogg` — calm ocean loop, 15-30s, seamless

Encode at 96 kbps mono OGG for size. After dropping in, rebuild + sync:

```bash
npm run build && npx cap sync ios
```

---

## Privacy nutrition label (required before submission)

In App Store Connect, when you create the app:

1. **Data collected:** None (Hush stores nothing on a server, no analytics, no
   tracking). Select "Data Not Collected."
2. **Tracking:** Not enabled. Skip the App Tracking Transparency prompt.

---

## App Store submission checklist

Before submitting:

- [ ] App icon (1024×1024) in place
- [ ] Splash screen matches brand
- [ ] All four languages tested (EN/NL/KO/ES) — settings switches them live
- [ ] Three modes tested on a real device (silver/gold/rainbow)
- [ ] Audio plays in all three modes (with samples in `public/audio/`)
- [ ] Shake detection works on a real device (CoreMotion via Capacitor)
- [ ] Tap-to-start works on iPad simulator (no shake there)
- [ ] HealthKit Mindful Minutes write — to be added in Phase 3
- [ ] Apple Developer Program enrolled
- [ ] Apple Small Business Program enrolled (15% commission)
- [ ] App Store Connect record created
- [ ] Screenshots: 6.9" required (1290×2796 portrait minimum)
- [ ] App preview video (15-30s, demonstrates shake → settle → quote)
- [ ] App Review Notes: explicitly call out the shake interaction, note that
      it works without an account, and that no data is collected

---

## Branch and deployment hygiene

- `main` branch: web v1 only. Never modify. Auto-deploys to Netlify
  (snowglobe-breath.netlify.app) — your shareable demo.
- `v2-hush` branch: all v2 work for iOS. Never auto-deploys.
- Web v2 (if/when we want a parallel web release with audio + 3 modes)
  could later merge from `v2-hush` to a separate branch like `v2-web`. For
  now web stays at v1, iOS gets v2.

---

## Troubleshooting

**`cap add ios` fails with "Xcode required"** — install Xcode from the App
Store, then `xcode-select --install` to ensure command-line tools.

**App builds but shake doesn't work in the simulator** — the iOS simulator
doesn't have an accelerometer. Use Xcode's Hardware → Shake (⌃⌘Z) to send a
fake shake. For real testing, plug in your iPhone.

**Audio doesn't play in the simulator** — the simulator's audio routing is
unreliable. Test on a real device.

**Hot reload while developing** — `npx cap run ios -l --external` runs the
Vite dev server and points the iOS WebView at it. Code changes hot-reload
without a rebuild. Set `server: { url: 'http://YOUR_LAN_IP:5173', cleartext: true }`
in `capacitor.config.ts` only during development; remove before submission.
