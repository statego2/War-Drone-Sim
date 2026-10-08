# NEXT_ACTION — War Drone Sim

Updated: 2026-10-08. Current branch: `fix/single-stick-turn-follow-camera-v0-5`, based on unmerged v0.4 (PR #61), which is based on v0.3 (PR #60) and v0.2 (PR #59).

## Latest owner acceptance feedback
On iPhone v0.4, the player rejected LOOK/FACE as poor UX: steering left or right should turn the drone and make the camera follow automatically. One intuitive drag input, no manual camera controls.

## Implementation delivered in review branch
- flight3d.mjs: steering now controls turn rate/aircraft heading instead of strafing; horizontal gestures follow the phone-screen turn convention; up/down altitude retained.
- game3d.mjs: removed LOOK/FACE state, events and camera controls; camera yaw follows heading smoothly; FPV and chase stay supported.
- index.html + style3d.css: removed LOOK/FACE, simplified single-row buttons and onscreen instructions.
- tests/flight3d.test.mjs and tests/browser-smoke.mjs: verify left/right sustained turns and automatic chase follow, with obsolete strafe/orbit tests removed.
- docs/22_SINGLE_FINGER_CHASE_V05.md: design and owner phone acceptance plan.

## Immediate next action
1. Check new PR and latest GitHub Actions both logic and WebGL smoke. Fix failures if observed.
2. Owner tests preview on physical iPhone: hold left/right through long curves and verify camera rotates automatically and smoothly (no inverted movement), plus up/down/FPV.
3. Preserve all unmerged prior PRs. When owner approves actual handling, merge in branch dependency order or rebase.
4. Separate gameplay design session: no racing/free-flight-only loop or extra buttons. Product fantasy is rapid forest drone skill challenge with cinematic fictional-object contact, but precise rewarding gameplay still requires design and owner signoff.

## Honest status
This is stylized browser WebGL, not a military training simulator. CI runs on headless Chromium, not Safari on a device. Work is on a review branch rather than published on main GitHub Pages.
