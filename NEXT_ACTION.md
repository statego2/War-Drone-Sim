# NEXT ACTION — War Drone Sim browser prototype

**Updated 2026-10-08.** Source of truth: `main`. Hosted portrait build: https://statego2.github.io/War-Drone-Sim/

## Landed in main

- Browser WebGL Forest Encounter: one-finger steering, three fictional empty vehicles, swept contact, visible wreck states, automatic next drone (~0.98 s), next round once all three have been hit.
- **Multidirectional inertial flight merged in `4e0e4e8` (#74):** sideways banking/strafe, all four diagonal gestures, HOVER lateral motion, faster forward-moving nose dive without air-braking, and gravity-led recovery. Speed/gesture/collision tests expanded. See `docs/28_OMNIDIRECTIONAL_FLIGHT.md`. This supersedes the earlier automatic steep-dive braking commits.
- Procedural audio director: merged as `e9ada33`. Dynamic rotor/wind/altitude mix and synthesized distinct ground/vehicle contacts, with unit tests. See `docs/26_AUDIO_DIRECTOR_V1.md`.
- Procedural visual impact pool: merged as `03cd218` via PR #71. Layered flash, planar shock ring, reusable embers and smoke, softer ground-impact treatment, mild FOV pulse, and deterministic envelope tests. See `docs/27_IMPACT_FEEDBACK_V1.md`.
- All effects are fictional arcade feedback, not operational hardware/damage simulation.

## Evidence and remaining validation

- The pre-merge impact-VFX implementation branch's GitHub Actions run `37826960086` passed both logic and desktop Chromium visual smoke. Main's post-merge checks are tracked in GitHub Actions; do not mark them green until completed.
- GitHub Pages deployment workflow `37827156003` reported success for merge commit `03cd218`. No actual iPhone Safari visual/audio/fps/haptics test has been performed in this session; do not claim professional sound mastering, 60fps, or player fun has been established.
- Open older PR #67 proposes the **rejected air-braking behavior**. It is superseded by #74; do not reintroduce the stop without new owner approval. The 3D browser suite on #74 passed logic checks and prior visual checks; a post-merge run must still be checked.
- The graphics overhaul design PR #66 is separate and does not by itself establish that the runtime visuals are implemented.

## Next unblocked game-feel work

1. On iPhone portrait, test all four diagonals, sideways HOVER and full dive on CRUISE/FAST. Verify the drone now **retains forward momentum instead of freezing** when pitched fully down, and can recover without sudden velocity changes.
2. Play ten consecutive vehicle and ground impacts. Check that shockwave/embers/smoke and newly merged audio blend cleanly, reset every drone, and do not cause fatigue or frame spikes.
3. Check three-target identification, first-approach timing, steering precision, pause/mute/resume and app switching. Document any reproducible failures in GitHub issues.
4. Tune spawn, speed and feedback from phone evidence *before* adding more persistent systems. G1 fun and G2 phone performance remain unverified.

No real-world targeting, vehicle damage calculations, live drone protocols or physical combat simulation belongs in this prototype.

## Sonic UX follow-up (2026-10-08, Feel-Good v2)

- Merged sound iteration `3d52feb8` (originally `feat/feel-good-sound-design-v2`) replaces unpleasant machine-like and brittle high-frequency audio with a softer original arcade palette and a deliberately restrained master mix. See `docs/28_FEEL_GOOD_AUDIO_V2.md`.
- Gameplay rewards sound progression across 3 empty fictional vehicle contacts: short confirmation, richer confirmation, special completion cadence. FAST and dive develop audio energy without harsh perpetual whistles.
- Unit tests include bounded timbre, dive-vs-level contrast, and unique chord-length reward design; CI will be tracked on the review PR. A passing browser test **does not prove acoustic enjoyment**.
- **Next acceptance step:** owner listens on real iPhone speaker and headphones and compares 20 consecutive flight/impact cycles; tune rotor/wind/explosion response based on the actual listening feedback.

## Quiet Air-Glide v3 — owner listening complaint (2026-10-08)

- The owner still finds the constant drone sound irritating. `feat/quiet-air-glide-audio-v3` eliminates the permanently running rotor oscillators instead of merely lowering their volume. See `docs/29_QUIET_AIR_GLIDE_V3.md`.
- Flight now communicates speed, banking and dives primarily with subtle moving-air layers. Impact/score and brief event sounds remain, with the environment comparatively quiet.
- Regression checks assert no constant motor oscillator and functioning mix controls. Real iPhone listening remains the final sound comfort gate; no claim of verified sound quality.
