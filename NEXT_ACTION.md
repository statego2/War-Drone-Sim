# NEXT ACTION — Forest Encounter v0.8

2026-10-08. Based on `feat/camera-stability-speed-cues-v0-7` (`9700fd6`).

## Implemented

- Actual cruise speed is higher (43 m/s spawn, converging toward 56 m/s) and FAST converges toward 78 m/s; v0.7 only widened the FOV.
- Steep downward gesture builds falling velocity and ground contact ends the current drone. Downward velocity remains available at contact, rather than silently bouncing.
- One fixed fictional clearing with three empty colored vehicles, swept contact, one result per vehicle, persistent wreck/smoke, distinct ground failure, automatic drone continuation and a new round after all three.
- Flash, reusable sparks and synthetic impact sound, with a 0.98 s result window. The previous touch state clears on respawn.
- Pure model checks for speed, dive/ground and encounter transitions. `npm test` and syntax checks passed locally. The local browser server was blocked by `EPERM`; GitHub Actions desktop Chromium browser smoke passed on PR #65 (run 97). GitHub Pages deployed successfully from main commit `d2c8b0b` in deployment run 37822913999.

## Next acceptance gate

Play [the published build](https://statego2.github.io/War-Drone-Sim/) in portrait iPhone Safari. Check that all three targets are visible and hittable, that a full downward drag can end in the ground, that a vehicle hit leaves a wreck, and that the next drone arrives without a new tap. Tune spawn distance, altitude, flight speed, collision generosity, feedback and frame pacing from that device evidence. Test pause, mute and app switching. Five-player and performance gates remain open; no claims of measured FPS or validated fun.

This is an arcade fictional vehicle encounter. It includes no real-world vehicle models, drone control protocols, targeting assistance, operational terrain or physical attack calculations.

## Graphics Overhaul v2 — proposed parallel design package (2026-10-08)

- Reviewed current `main` Forest Encounter v0.8 rendering (`src/game3d.mjs`, `src/scenery3d.mjs`, `src/atmosphere3d.mjs`), HUD, encounter model and CI. Wrote **[docs/26_GRAPHICS_OVERHAUL_V2.md](docs/26_GRAPHICS_OVERHAUL_V2.md)** on isolated `design/graphics-overhaul-v2` branch. This is **design only**, not a graphics implementation.
- Immediate unblocked work after owner reviews direction: implement GFX-00 baseline diagnostics and reproducible portrait screenshot gallery, then GFX-01 one hand-authored clearing reveal; maintain flight/encounter contracts.
- Existing GitHub Pages/desktop Chromium CI passed at baseline commit `57a5d62a4cff83919f90bac2efaafbb130cba33f`, but iPhone Safari framerate, visuals, thermals and fun are **not yet measured**. Do not treat estimates as performance results.
- Preserve branch-only proposal until visual slice and phone evidence are evaluated. No assets added, no runtime behavior changed, no release or merge completed by this design task.
