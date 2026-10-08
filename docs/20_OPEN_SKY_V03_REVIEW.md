# Open Sky v0.3 — direct movement, world art, sound

Date: 2026-10-08. Status: experimental branch pending phone evidence.

Owner feedback: iPhone portrait screenshot of v0.2 shows genuine depth but repetitive low-poly trees, a basic road, and no environmental sound. Controls felt inverted. Gameplay is intentionally deferred.

## Changes

- flight3d.mjs: screen-relative left/right translation instead of yaw. Up ascends, down descends; retains auto-forward movement and gentle acceleration. This is arcade physics, not flight-controller simulation.

- audio3d.mjs: synthesized motor/rotor, reactive wind, birds, pause and sound toggle. Requires user gesture.

- scenery3d.mjs: procedural non-interactive cabins, grass, flowers, boulders, streams, road posts.

- atmosphere3d.mjs: softened cloud sprites.

- game3d.mjs: asphalt and ground texture noise, denser geometry/color variety, road-edge paint, drone gimbal and skids, soft tree shadows, sound integration.

- index.html and CSS: direct-movement instructions and sound toggle.

- flight3d unit tests and browser smoke: direct movement including left/right, sound toggle and existing flight controls.

## Limitations and acceptance

- This is entertainment-only polygonal 3D, not operational or military-grade simulation. No real-world targeting, drone connection, flight-controller protocol, or mission planning was developed.

- Assets are algorithmically created in source. No paid 3D assets used. Three.js is loaded from CDN. Appearance may still be stylized and does not match GTA V or photorealism.

- Test on the user's iPhone: right drag moves right, left drag moves left, upward drag gains altitude, down loses altitude; check FPV/chase.

- Check whether motor/wind/bird audio can be heard after BEGIN FLIGHT; mute and pause should silence it. Check impact of browser's sound settings.

- Review screenshot with old v0.2; inspect forest palette, road geometry, clouds, settlement, foliage shadows and shader output.

- Measure Safari FPS, startup time, heat, memory and tile-seam smoothness over five minutes before accepting this as quality gate evidence.

- Gameplay remains open and must be planned separately before adding new goals, combat or challenges.
