# Open Sky v0.7 — camera stabilization and perceived speed polish

Date: 2026-10-08. Review branch: `feat/camera-stability-speed-cues-v0-7`, based on v0.6. Prior code remains available on v0.6.

## Owner feedback
Player liked the v0.6 update and requested more stable normal flight, a faster and more forceful ground dive, and a stronger advanced/military style of game feel.

## Delivered in this change
- Smoothed automatic chase-camera heading and pitch response to reduce sudden view movement while keeping one-finger steering.
- Limited the amount of visible camera nose-down rotation slightly, helping users read the scene when attitude changes quickly.
- Added a subtle velocity-based perspective/FOV widening for a stronger sensation of speed **without modifying actual flight velocity, dive physics, impact behavior, or any real aircraft characteristics**.
- Kept v0.6 physics, audio and controls intact. No new buttons.

## Not implemented
The request to increase drone performance and build a high-speed steep terminal impact simulation was not implemented. This branch only contains camera and presentation polish, not a more physically accurate or more powerful drone. It must not be described as such.

## Manual acceptance
- On iPhone portrait, compare v0.6 and v0.7 normal movement, turns, and nose-down camera transition.
- Check whether the camera is calmer but remains responsive.
- Observe whether acceleration *feels* faster because of the lens without expecting a higher physical HUD speed.
- Confirm WebGL still opens, pauses, FPV works, and the sound toggle is preserved.
- Profile phone FPS and image quality before promoting this branch.

## Development guardrails
This is a stylized entertainment drone world, not a military vehicle simulation or live hardware interface. Later gameplay and impact effects need a separately reviewed non-operational design.
