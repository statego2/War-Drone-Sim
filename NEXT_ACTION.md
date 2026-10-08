# NEXT_ACTION — War Drone Sim

Updated: 2026-10-08. Current branch: fix/camera-relative-controls-navigation-v0-4. PR v0.2 #59 / v0.3 #60 remain open. GitHub Pages main still hosts the prior baseline, not this branch. Review before merge.

## Latest real user feedback

The physical iPhone screen shows that v0.3 still moves LEFT when the user commands RIGHT. They also cannot freely change direction/camera, and there is no gameplay. This is real user feedback, higher priority than green checks based on incorrect coordinate sign.

## v0.4 changes

- Correct screen-to-world mapping using negative X as camera-right when camera looks toward +Z. Rotate this vector when camera orbits.

- LOOK orbit/tilt toggle for the portrait swipe area; FACE action aligns forward drone direction with camera view.

- Speed button now cycles cruise, fast, reverse, hover. No gameplay modifications, scoring missions or weapon features.

- Unit tests and browser smoke tests verify camera-relative direction and orbit controls.

- docs/21_CAMERA_SPACE_NAVIGATION_V04.md contains full rationale and manual phone acceptance.

## Next unblocked actions

1. Run GitHub Actions tests for this PR head and inspect both logic and WebGL visual outcomes. Fix regressions.

2. Ask owner to open the commit-pinned v0.4 preview in iPhone portrait and personally verify left/right motion and camera/orientation semantics.

3. Continue portrait HUD tuning if buttons obstruct the game. Test HOVER, REVERSE, LOOK, FACE, pause/audio and hardware performance.

4. Gameplay remains unbuilt by intent: design a short, highly repeatable fictional-vehicle cinematic-impact skill loop as a separate owner's design decision before implementing it; no generic racing or aimless free-flight-only goal.

5. Merge only after visual sign-off; previously approved WebGL art v0.2 and v0.3 PRs are still separate. Use correct base order.

## Validation honesty

Do not equate world-coordinate unit assertions to visual screen movement. CI browser smoke is simulated Chromium with software WebGL, not Safari or device thermals. No military training equivalence or real drone controls.
