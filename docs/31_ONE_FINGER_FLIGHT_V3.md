# One-Finger Flight V3 — remove speed modes

**Date:** 2026-10-08. **Source branch:** `feat/one-finger-speed-control-v3`. Owner playtest: current flight is improving but front/back reversal is too hard and multiple speed modes undermine the intended single-thumb experience.

## Player contract

The fast, fictional arcade drone still spawns airborne and automatically travels forward. The entire *movement* vocabulary is controlled by one thumb on the WebGL scene:

| One-finger gesture | Result |
|---|---|
| Released / center | Comfortable, automatic forward cruise |
| Slightly up (~0.2–0.45 normalized) | Forward climb; gentle pitch |
| Mid-up (~0.65–0.75) | Brake toward near-hover while ascending; fine aiming without another button |
| Further up (~0.8–1.0) | Prompt but inertial rearward movement and climbing |
| Down | Descend, then high-commitment fast dive; downward momentum accumulates |
| Left/right | Bank, steer and translate sideways; while braking the emphasis is on sideways correction |
| Diagonals | Blend horizontal and vertical commands without switching modes |

Releasing restores effortless forward cruise. User touch gesture uses `src/touchflight.mjs` independent normalized axes and short travel of 76px horizontal, 72px vertical, with tiny jitter deadzone. No speed selector is rendered or referenced in the main WebGL mode. FPV, mute and pause remain separate non-movement controls.

## Technical details

- The flight model uses a smooth brake band and reverse-intent band driven from the current gesture, not the animation's delayed attitude angle. World-space velocity still converges with finite acceleration and braking, no teleport/snap.
- The previous steep downward dive remains unbraked with its gravity-led descent. Steering gets extra lateral response in the braking band so correction doesn't require a major yaw turn.
- One fixed .72 baseline game cruise command remains for default forward motion; the player no longer sets the throttle externally. Sound uses a gesture-derived 'fast' acoustic mode during a strong dive and otherwise a low-intensity gesture mix.
- Mode-specific browser buttons and the keyboard R cycle are removed; the existing other control buttons do not change.
- The first-pass thresholds are **tuning constants**, not proven optimal. The lack of exact stationary vertical hover at zero input is an intentional auto-cruise arcade default.

## Validation

- `tests/touchflight.test.mjs`: short gestures and diagonals, bounds and jitter.
- `tests/flight3d.test.mjs`: cruise / brake / reverse / dive at one fixed mode, smooth reversal, diagonals and existing collision invariants.
- `tests/browser-smoke.mjs`: verify absence of the speed button and successful short brake gesture, reverse, climb, dive, pause, mute and fallback.
- GitHub Actions desktop Chromium and Node checks must pass; a real iPhone portrait test is a separate gate. CPU/software WebGL simulation-time dilation is tracked in issue #81.

## Owner A/B test

1. From a new drone, hold at center/no touch; fly forward. Drag 50px up: movement should decelerate toward near-hover. Drag another 10–20px up: backward motion should start.
2. Switch from up to down without lifting the finger: should feel decisive and continuous, not like changing a menu.
3. Mid-up + left/right: place the drone sideways without circling around the target. Check all four diagonals.
4. Dive to the ground and verify a clear crash, ~one-second auto-respawn and clean touch state.
5. Try mute, pause/resume and changing from chase to FPV; nothing should depend on a hidden speed selector.

**Stop/go:** keep only if the player consistently feels able to command desired motion with one thumb. If reverse is too abrupt, adjust normalized bands and acceleration; if directional movement becomes inconsistent because of camera-relative banking, fix that before adding new effects.
