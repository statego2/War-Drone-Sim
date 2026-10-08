# Open Sky v0.5 — single-finger steering and follow camera

Updated 2026-10-08. User tested v0.4 on an iPhone and explicitly rejected LOOK and FACE as unnecessary. Desired UX: swiping left steers left, swiping right steers right, and the chase camera follows the aircraft naturally; upward/downward drag changes altitude. Holding a turn should continue around a full bend, without manual camera toggles.

## Changes
- Removed LOOK and FACE buttons and control states.
- Single horizontal touch axis directly changes aircraft yaw. Rightward gesture produces negative heading in this world coordinate convention (camera faces +Z and world -X appears screen right), leftward gesture produces positive heading.
- The aircraft actually curves its path, rather than only sliding sideways, and can continue turning as long as the gesture is held.
- Follow camera yaw continuously eases toward drone heading using shortest angular interpolation across the -PI/+PI seam. Both FPV and chase views follow the same automatic yaw.
- Vertical drag still controls altitude; existing speed/mute/FPV/pause functions remain.
- Model tests assert both turn directions and sustained turn. WebGL smoke asserts camera yaw follows heading while controls are active and LOOK/FACE buttons are absent.

## Deliberate product boundaries
This remains an entertainment/browser 3D free-flight control prototype. It is not military-grade flight dynamics, real-drone integration or a finished gameplay loop. User has asked to design meaningful gameplay separately: short, skill-based, highly rewarding 3D forest gameplay is the aspiration, not indefinite aimless exploration. Do not add missions without direction agreement.

## Owner iPhone playtest
1. Open the new branch preview in iPhone Safari portrait. Tap Begin.
2. Hold one finger to the left: craft progressively turns left and the landscape/camera follows. Keep holding to test a sustained bend.
3. Repeat to the right. There should be no secondary LOOK or FACE button and no need to manually reorient the camera.
4. Check up/down altitude, FPV, pause, speed, sound, and Safari fluidity.
5. Confirm actual feel with the owner before merging. Chromium headless automation is not evidence of target-device UX or thermal performance.
