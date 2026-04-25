# Snowglobe Web

Mobile-first web build of the calming snowglobe breathing experience. Three.js + React Three Fiber with shader-driven background and a CPU-integrated GPU particle system.

## Run

```bash
npm install
npm run dev
```

Vite prints a local URL and a LAN URL (`--host` is enabled). Open the LAN URL on your phone, tap **enable motion** (iOS requirement), then shake.

## Architecture

- `src/App.tsx` — session state machine and wiring. No visuals here.
- `src/config.ts` — every tunable in one place: shake thresholds, particle counts, drag curve, breath phase timings, post-fx strength.
- `src/themes/` — theme contract + 4 themes (silver, gold, snow, rainbow). Each theme is a pure data file; adding one is a single file.
- `src/hooks/useSessionTimer.ts` — 60s ticker with `idle → active → ending → done` phases. `endEarly` flips active to ending so fadeOut runs.
- `src/hooks/useShakeDetection.ts` — `DeviceMotion` listener, iOS 13+ permission prompt, delta-based threshold + debounce.
- `src/hooks/useBreathPhase.ts` — derives current inhale/exhale phase from elapsed ms. 6 full cycles across the minute.
- `src/scene/Scene.tsx` — r3f Canvas + post-fx composer (bloom + vignette).
- `src/scene/Background.tsx` — full-screen shader: radial gradient + stacked-noise caustics.
- `src/scene/ParticleField.tsx` — Points mesh with ~420 particles. Curl noise drives swirl; drag ramps from near-zero to heavy over 60s; shake injects randomized 3D velocities.
- `src/scene/Vessel.tsx` — inner tint + rim highlight shader over the scene.
- `src/ui/` — handwritten breath text, progress hairline, start hint, hidden theme picker (long-press top-left).

## Acceptance criteria vs current state

- Mobile-first web ✓
- Shake starts the effect ✓ (DeviceMotion + threshold)
- Full-screen calming snowglobe ✓ (no chrome)
- Multidirectional particle motion ✓ (3D impulse + curl noise)
- 60s settle ✓ (drag ramps via `dragAt()`)
- 5–6 inhale/exhale cycles ✓ (6 in `CONFIG.breath.phases`)
- Subtle timer ✓ (1px progress hairline at bottom, opacity 0.14)
- Auto-end at 60s ✓
- Shake again closes ✓ (`endEarly` in `App.tsx`)

## Tuning

Almost everything lives in `src/config.ts`:
- `shake.threshold` — lower = more sensitive
- `particles.count` — perf/density tradeoff
- `particles.drag.curve` — higher = settles faster early
- `breath.phases` — rewrite the entire cadence here
- `breath.opacityRange` — how whispered the text is
- `ui.progressOpacity` — how visible the hairline is

Per-theme overrides live in the theme file itself.

## Adding a theme

Copy `src/themes/silver.ts`, change the values, register in `src/themes/index.ts`. Long-press top-left corner on device to reveal the dev picker.
