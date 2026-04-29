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

### Disable iOS Shake to Undo (so the system alert doesn't intercept shakes)

iOS shows a "Shake to Undo" prompt globally when users shake the device — this
intercepts our shake-to-start gesture and replaces it with the system's
typing-undo dialog. Web Hush on Safari has the same problem; on the native
build we can opt out explicitly so end users don't have to disable the
accessibility setting themselves.

In `ios/App/App/AppDelegate.swift`, add **one line** to `application(_:didFinishLaunchingWithOptions:)`:

```swift
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
    application.applicationSupportsShakeToEdit = false   // ← add this
    return true
}
```

This disables the OS-level shake-to-undo for our app only. Capacitor's
@capacitor/motion plugin still receives accelerometer samples normally
through CoreMotion — only the system UI alert is suppressed.

### Info.plist additions

The Capacitor Motion plugin reads accelerometer data. iOS requires a usage
description string even for accelerometer (no prompt is shown, but the App
Store reviewer checks the value). In `ios/App/App/Info.plist` add:

```xml
<key>NSMotionUsageDescription</key>
<string>Hush uses motion to detect when you shake your phone, starting a 60-second breath practice.</string>
```

For HealthKit (Mindful Minutes write), add **both** of these — even though
we only write data, Apple requires both keys to be present:

```xml
<key>NSHealthShareUsageDescription</key>
<string>Hush does not read any health data.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Hush saves each completed breath session to Apple Health as Mindful Minutes, so you can see your practice in the Health app.</string>
```

(If `cap add ios` doesn't include these automatically, add them before first
submission.)

---

### HealthKit capability + entitlement

In Xcode, with the `App` target selected:

1. Click **Signing & Capabilities** tab
2. Click **+ Capability** in the toolbar
3. Choose **HealthKit**
4. Leave the "Clinical Health Records" checkbox **unchecked** — Hush only
   writes Mindful Sessions, not clinical records

Xcode will create `ios/App/App/App.entitlements` containing:

```xml
<key>com.apple.developer.healthkit</key>
<true/>
<key>com.apple.developer.healthkit.access</key>
<array/>
```

Commit this file alongside the rest of the iOS project.

---

### Native HealthKit plugin (Swift)

Hush ships a small custom Capacitor plugin called `HushHealth` for writing
Mindful Session samples. The JS side is already in
`src/platform/healthkit.ts`. The native side is two Swift files you paste
into the Xcode project once after `npx cap add ios`.

**Step 1 — create the folder:**

```bash
mkdir -p ios/App/App/Plugins
```

**Step 2 — create `ios/App/App/Plugins/HushHealth.swift`:**

```swift
import Foundation
import Capacitor
import HealthKit

// HushHealth — minimal HealthKit bridge for writing Mindful Session
// samples. Read access is not requested; we only ever write. iOS still
// requires NSHealthShareUsageDescription to be present in Info.plist.
@objc(HushHealthPlugin)
public class HushHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HushHealthPlugin"
    public let jsName = "HushHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable",          returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "writeMindfulSession",  returnType: CAPPluginReturnPromise),
    ]

    private let healthStore = HKHealthStore()

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["granted": false])
            return
        }
        guard let mindful = HKObjectType.categoryType(forIdentifier: .mindfulSession) else {
            call.resolve(["granted": false])
            return
        }
        // We only request write (share) access — Hush never reads.
        healthStore.requestAuthorization(toShare: [mindful], read: nil) { success, error in
            if let error = error {
                call.reject("HealthKit auth failed: \(error.localizedDescription)")
                return
            }
            // Note: on iOS, success=true means "the prompt completed" — not
            // that the user said yes. We can't reliably detect refusal for
            // write-only access, so we optimistically return granted=true
            // and let the writeMindfulSession call fail silently if denied.
            call.resolve(["granted": success])
        }
    }

    @objc func writeMindfulSession(_ call: CAPPluginCall) {
        guard let startMs = call.getDouble("startMs"),
              let endMs   = call.getDouble("endMs") else {
            call.reject("startMs and endMs required")
            return
        }
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["saved": false])
            return
        }
        guard let mindful = HKObjectType.categoryType(forIdentifier: .mindfulSession) else {
            call.resolve(["saved": false])
            return
        }
        let start = Date(timeIntervalSince1970: startMs / 1000.0)
        let end   = Date(timeIntervalSince1970: endMs   / 1000.0)
        let sample = HKCategorySample(
            type: mindful,
            value: HKCategoryValue.notApplicable.rawValue,
            start: start,
            end: end
        )
        healthStore.save(sample) { success, error in
            if let error = error {
                // Don't reject — the breath practice itself completed. Log
                // and report saved=false so JS can decide what to do.
                print("[HushHealth] save failed: \(error.localizedDescription)")
                call.resolve(["saved": false])
                return
            }
            call.resolve(["saved": success])
        }
    }
}
```

**Step 3 — add `HushHealth.m`** in the same `Plugins` folder so the plugin is
discovered at runtime by Capacitor's Objective-C registration:

```objc
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(HushHealthPlugin, "HushHealth",
    CAP_PLUGIN_METHOD(isAvailable,          CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestAuthorization, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(writeMindfulSession,  CAPPluginReturnPromise);
)
```

**Step 4 — add HealthKit framework to the project:**

In Xcode: target **App** → **General** tab → **Frameworks, Libraries, and
Embedded Content** → click **+** → search **HealthKit** → select
**HealthKit.framework** → set to **Do Not Embed**.

(Modern Xcode usually auto-links HealthKit when you add the capability in
step 2, but verify here if you see a "no such module 'HealthKit'" error.)

**Step 5 — clean build & run:**

```bash
npm run build && npx cap sync ios && npx cap open ios
```

Then in Xcode: **Product** → **Clean Build Folder** (Shift+Cmd+K) → run on a
simulator first, then on a real device. The Mindful Minutes write requires
a real device or a simulator with the Health app available.

---

### Verifying the HealthKit integration

1. Run Hush on a device.
2. Open **Settings** → scroll to **Apple Health** → tap **On**.
3. iOS shows the system Health share sheet — toggle "Mindful Sessions" to
   **on** when prompted, then tap **Allow**.
4. Tap to start a session. Wait the full 60 seconds for it to complete.
5. Open the **Health** app on the same device → **Browse** → **Mindfulness**
   → **Show All Data**. Hush's session should appear with the correct
   start time, end time, and source ("Hush").
6. Run a second session. Verify a second entry appears.
7. To revoke: **Settings → Health → Data Access & Devices → Hush**, toggle
   off **Mindful Sessions**.

### Status bar + safe areas

Already handled by `capacitor.config.ts` — status bar is transparent over
the dark background, content extends edge-to-edge.

### Splash screen

The default splash is a black screen with the app name. For App Store launch
you'll want a custom splash matching the Hush identity. Replace
`ios/App/App/Assets.xcassets/Splash.imageset/` with your final assets.

### App icon

You design **one** 1024×1024 master PNG (in Canva, Figma, etc.). Constraints:
- **Exactly 1024×1024 pixels**
- **PNG**, **no transparency** (iOS rejects transparent icons)
- **No rounded corners** in the design — iOS adds them automatically
- **No padding for safe areas** — fill the whole canvas

Then run the bundled generator from the project root:

```bash
./scripts/gen-icons.sh ~/Desktop/hush-icon-1024.png
```

It uses macOS-native `sips` to write all 15 sizes Xcode needs into
`ios/App/App/Assets.xcassets/AppIcon.appiconset/` plus the matching
`Contents.json`. After the script finishes:

```bash
npm run build && npx cap sync ios
```

Verify in Xcode → **App** → **Assets.xcassets** → **AppIcon**. Each slot
should show your icon at the right size with no warnings.

**To re-run after a design change**: just run the script again. It overwrites
all 15 files and the `Contents.json` so revisions are clean.

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
- [ ] HealthKit Mindful Minutes write — Swift plugin pasted in, capability enabled in Xcode, `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription` in Info.plist, verified on device
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
