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
