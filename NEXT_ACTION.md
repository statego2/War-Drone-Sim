# NEXT_ACTION — War Drone Sim

**Updated:** 2026-10-08. **Current work:** Open Sky v0.2 polygonal 3D experiment on branch `feat/webgl-open-world-flight-v0-2`, not yet proven on iPhone. **Default target:** portrait mobile browser.

## Just implemented in review branch

- `src/flight3d.mjs`: deterministic terrain + arcade free-flight with no arbitrary altitude ceiling or 24-second timeout, AGL terrain-floor checks and smooth yaw/climb; no real-world drone physics.
- `src/game3d.mjs`: genuine WebGL 3D scene (Three.js r180 CDN), streaming hilly tiles with visible depth, mixed conifer/deciduous meshes, roadside objects, low-poly vehicle scenery, chase/FPV camera, atmospheric sky/fog and high-altitude distant-terrain LOD.
- `index.html` and `src/style3d.css`: portrait first controls, altitude/speed/distance HUD, view toggle, cruising speed toggle, pause and intro.
- `legacy-canvas.html`: v0.1 preserved, with redirect fallback if WebGL or import is unavailable.
- `tests/flight3d.test.mjs` and CI workflow additional syntax checks authored (not yet independently confirmed green at this handoff).
- `docs/19_WEBGL_3D_OPEN_SKY.md`: scope, dependencies, acceptance plan, aesthetic limits and non-military-simulation boundaries.

## Immediate next action

1. Review PR for `feat/webgl-open-world-flight-v0-2`, inspect GitHub Actions results and repair any test/syntax failures.
2. Open actual `index.html` as a website on **iPhone portrait**; screenshot the forest/road from chase camera and FPV, test long climb/descending, pause, fast flight and Safari behavior. No browser runtime/device render confirmation has yet been supplied here.
3. Inspect actual forest density, road elevation and tile pop at altitude; tune rendering BEFORE creating new gameplay systems. Profile on target phone for sustained framerate and memory, and reduce tree counts/LOD if needed.
4. Decide whether to merge Open Sky as the main free-flight direction after phone visual review, or retain a mode switch alongside the old impact loop. Preserve old gameplay at `legacy-canvas.html`.
5. Record all observations and screenshots in `docs/11_PLAYTESTS.md`; revisit G1/G2 gate only with test evidence.

## Validation honesty

No actual iPhone Safari / Chrome graphical inspection or measured framerate is established here. Source changes, authored tests and CI workflow are **not** equivalent to a verified working browser session. CDN usage requires network on first launch. No real-world mission, targeting, flight-controller or military training integration. Desktop v0.1 testing evidence remains in `docs/18_BROWSER_PROTOTYPE.md`.
