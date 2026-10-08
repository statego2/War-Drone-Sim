# Flight Feel V2 — nose-up reverse glide

Date: 2026-10-08. **Implementation branch:** `feat/arcade-pullback-flight-v2`. Scope: browser arcade entertainment controls, not operational multirotor flight instructions.

## Problem from owner playtest

Under the previous arcade flight model, dragging upward gently or fully always pushed the aircraft forward. Full nose-down already built a dramatic dive, and lateral banking/diagonal gestures existed; the missing expression was a deliberate **nose-high backward glide**, without adding menu-heavy controls.

## Tuned behavior

- **Soft upward drag:** smooth forward climb with normal cruise speed.
- **Full upward drag:** drone visibly pitches to a high, non-inverted nose-up attitude. Forward inertia continues momentarily; a smoothly blended arcade pullback builds rearward speed. No position or velocity snap.
- **Strong pullback still climbs:** assisted vertical component compensates at very steep nose-up angles so sustained climbing and a high-altitude dive recovery are still possible.
- **Pullback + left/right:** heightened lateral bank/strafe control while turn authority is reduced during reverse. This prevents forced 180-degree spins or inverted thumb logic.
- **Release:** the aircraft levels and regains forward cruise over time; the previous rearward momentum must first be overcome.
- **Camera/UI:** reverse state is legible through drone attitude, a gentle camera pitch restraint, and a modest reverse speed marker. One-finger gestures remain the only needed input.
- No real-world lift or rotor parameter calibration. This is deliberately a responsive, tunable arcade rule.

## CI acceptance and manual playtest

- `tests/flight3d.test.mjs`: full/soft input separation, positive-to-negative speed transition, reversing in HOVER/CRUISE/FAST, sustained high-altitude climb, pull-out recovery, diagonal control continuity, variable-frame consistency.
- `tests/browser-smoke.mjs`: simulate holding a full upward gesture, confirm a reverse-speed state and continue normal diagonal, dive and UI lifecycle checks.
- Check GitHub Actions before merge. **Physical iPhone Safari touch, feel, heat, audio and performance are not yet validated.**

### Owner playtest

Start CRUISE: drag up slightly, then release. Drag up fully for 1–2 seconds: feel the initially forward-moving drone slow, reverse, and climb. Hold upper-right/upper-left: back and sideways. Release and pull down: regain a rapid forward/dive path. Repeat in HOVER and FAST. The game should feel fluid rather than twitchy, with visible momentum and no forced brake.

Next general work should emphasize actual phone target readability, camera framing, terrain/target polish and reliable fast restart rather than unrelated new game modes.
