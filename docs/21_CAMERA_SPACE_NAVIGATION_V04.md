# Open Sky v0.4 — camera-space controls and navigable world

Date: 2026-10-08. Basis: iPhone user feedback that both versions of left/right felt inverted, the camera could not rotate, and always-forward movement prevented exploring. Gameplay remains deliberately pending owner design, because this is not a racing/free-flight-only project.

## Root cause

The renderer looks into positive world Z. Three.js camera-relative screen-right therefore points to NEGATIVE world X, not positive world X. v0.3 unit/CI tests incorrectly treated positive world X as screen-right and passed despite the on-phone UX mismatch.

## Implemented

- `screenRightVector(cameraYaw)` maps screen horizontal input to `(-cos(cameraYaw), +sin(cameraYaw))`. It works for any camera heading, not just starting view. Horizontal screen drag translates accordingly; drag upward ascends; downward descends.
- `LOOK` toggle makes the **same primary drag** orbit and tilt the chase/FPV camera without steering. Horizontal drag adjusts camera yaw and vertical drag pitch; the move mode ignores these drags so the two intents don't conflict.
- `FACE ↗` aligns the drone's forward travel direction with the angle currently shown by the camera, making it possible to travel to places away from the original +Z corridor.
- Throttle cycles `CRUISE → FAST → REVERSE → HOVER → CRUISE`. The player can stop, back up, and choose a new forward direction. `CRUISE` still starts by default for quick first-run accessibility.
- Unit tests now verify **camera-space displacement** rather than naive +X/-X; browser smoke test checks camera orbit, pitch, FACE and speed modes. Preserve existing sound controls, 3D scenery and portrait responsive layout.

## Manual owner phone acceptance

1. Open Open Sky v0.4 in portrait. Drag finger to the RIGHT and verify the image/drone moves as expected relative to background; repeat LEFT. Drag UP/DOWN to change altitude.
2. Tap LOOK, then swipe horizontally and vertically. The camera should orbit around the drone and pitch up/down without moving drone sideways. Tap LOOK again to resume flight movement.
3. Point camera toward a recognizable landmark and tap FACE. The drone's subsequent cruise/fast travel should go toward that view. Check that this works more than once.
4. Cycle speed: FAST, REVERSE, HOVER, CRUISE. In HOVER, the aircraft should eventually stop moving forward. In REVERSE, it should actually travel backward.
5. Test mute/pause, UI safe areas, iOS safari framerate, heat and visual fidelity. No Safari physical device test has been performed by the coding agent.

## Gameplay decision — explicitly deferred

We have not built the final game loop. The previously discussed arcade fantasy is short, fast drone flight in an atmospheric fictional forest with an unoccupied fictional vehicle, a difficult-to-master cinematic contact and immediate retry. This v0.4 is a control/navigation sandbox for evaluating the right handling system, not the finished game. Separate gameplay design and owner approval are necessary before adding any new mission modes or goal UI. No real-world military operation or target guidance systems.

## Limitations

Three.js + procedurally stylized mobile WebGL is not GTA V quality or a validated military training simulator. Orbit/translation is an arcade scheme, not physically accurate aircraft control. The pipeline still needs actual phone manual approval and performance profiling before merging into main.
