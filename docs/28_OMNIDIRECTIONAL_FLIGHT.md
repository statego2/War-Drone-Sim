# Arcade flight v1 — inertial 360-degree gesture control

**2026-10-08 · implementation branch `feat/omnidirectional-inertial-flight-v1` · user-reported issue:** near-vertical nose pitch killed forward travel, making the drone stop unrealistically. Owner requests fun, fluid multidirectional flight with upward-left, upward-right, downward-left and downward-right control.

## Applied game-feel experiment

- **Velocity inertia:** pitch no longer sets horizontal speed to zero or applies a special instant dive brake. Existing forward velocity carries through the turn/dive. Full nose-down commands add forward drive and accumulate gravity-led downward velocity, giving the player a powerful, recoverable descent.
- **Independent lateral motion:** dragging right/left produces bank and sideways velocity in addition to a speed-dependent gentle heading turn. A HOVER mode gesture travels sideways without yaw; both horizontal and vertical gesture axes apply simultaneously, including four diagonal combinations.
- **Stable fast arcade control:** cruise and FAST retain distinct acceleration speeds, and turning continues past 90 degrees with sustained horizontal input. Pitch, bank, velocity and yaw are smoothed and advanced in bounded substeps.
- **Unchanged core gameplay:** fictional three-vehicle clearing, collision scoring, procedural sounds, visual impact feedback, one-second auto respawn and no joystick/menu proliferation.
- **Not a hardware simulation:** these are stylized gameplay dynamics. No real-world drone protocols, tactical targeting, aircraft control gains or motor specifications.

## Player-visible test script

1. Open portrait Safari. Fly normally for a second; drag down fully and watch the ground approaching while the forest continues rushing past (no air-stop).
2. Immediately try steering upper-right, upper-left, lower-right and lower-left. Both screen-horizontal travel and vertical movement must register.
3. Choose HOVER; hold horizontal: drone travels sideways without requiring a 90-degree heading turn.
4. Try FAST, commit to a steep dive then pull upward; it takes time to cancel the descent.
5. Repeat several impacts, pause/resume, screen lock, and audio mute. Note any camera ambiguity, target overshoot, performance stutters or unintended contacts.

Automated coverage: updated `tests/flight3d.test.mjs` checks inertia, full versus shallow descent, cruise versus fast, diagonals, HOVER strafe, opposite-gesture continuity, frame-rate consistency. `tests/browser-smoke.mjs` checks simulated portrait touch diagonal on Chromium. **Actual iPhone/device acceptance and enjoyment are pending.**

### Next review priorities

Keep the central fun loop, not expansion into unrelated gameplay modes. Once the user reviews the gesture feel, tune camera lookahead, bank strength, target-arrival pacing and the encounter's hit fairness. When any subsequent design choice conflicts with owner feel, prioritize measured feel over naive realism.
