# NEXT_ACTION — War Drone Sim

Updated: 2026-10-08. Current branch: `feat/arcade-flight-physics-dive-v0-6` based on v0.5; all predecessors remain unmerged review branches.

## Current user request
After accepting v0.5 steering, the player wants believable inertia/pitch/gravity and a dramatic steep nose-down dive when pulling the touch downward, reminiscent of an FPV experience. Research official PX4/Betaflight flight-mode documentation; preserve one-finger controls. No real hardware or real-world combat function.

## Work just authored
- `src/flight3d.mjs`: velocity vector, pitch response, gravity vs tilted support, forward inertia and wind-like vertical damping, controllable recovery and terrain floor.
- `src/game3d.mjs`: drone/camera actually pitch nose-down, HUD descent velocity and sound reacting to overall speed.
- `index.html`: dive gesture text and vertical speed indicator, no extra controls.
- `tests/flight3d.test.mjs`, `tests/browser-smoke.mjs`: steep attitude, momentum, recovery, on-screen camera/vertical HUD.
- `docs/23_ARCADE_DIVE_PHYSICS_V06.md`: official educational references, constraints, visual acceptance and non-operational limits.

## Next actions
1. Open PR and fix any GitHub Actions logic, syntax or headless browser failures. Avoid claiming success until both pass.
2. Have owner try portrait iPhone: dive hard, watch visible nose/camera pitching downward and increase in falling speed, release then pull up.
3. Tune visual game feel, stability and touch sensitivity based on real playtest. Do not deploy as a real aircraft simulator.
4. Keep gameplay pending a separate design decision. Earlier v0.5 was accepted as much better, so retain steering behavior and remove unnecessary LOOK/FACE.

## Caveat
Three.js CDN dependency, automatic browser preview hosting remains imperfect; GitHub Pages main is older. Desktop Chromium tests do not prove iPhone behavior or physical validity.
