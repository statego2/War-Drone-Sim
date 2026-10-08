# NEXT ACTION — War Drone Sim browser prototype

**Updated 2026-10-08.** Source of truth: `main`. Hosted portrait build: https://statego2.github.io/War-Drone-Sim/

## Landed in main

## Pullback reverse flight v2 — 2026-10-08

- **Merged PR #80** as `da5ba76`. Full upward gesture now smoothly tips the craft nose-high, cancels existing forward momentum over time and reverses arcade travel; small upward drags still climb forward. At full pullback it retains assisted climb and recovery from dive, with stronger diagonal left/right control and reduced forced yaw. Camera look-up is restrained; the speed display marks backward travel. Documentation: `docs/30_FLIGHT_PULLBACK_V2.md`.
- Node flight regression checks and portrait Chromium smoke passed on feature SHA `5d5c861` in GitHub Actions run `37831981695`; the subsequent PR change only clarified documentation. Post-merge main CI / Pages run results should be verified separately. **Actual iPhone Safari playtest, thermal and subjective feel are still unverified**.
- A separate general engineering issue [#81](https://github.com/statego2/War-Drone-Sim/issues/81) records software-WebGL simulation time dilation seen during browser smoke. This requires low-FPS profiling and bounded fixed-step catch-up work; do not assume Chrome headless timing represents iPhone FPS. Preserve swept-hit and automatic retry fairness.
- **Next tangible gameplay acceptance:** on iPhone check soft-up vs sustained full-up (forward→reverse), upper diagonals while moving backward, release→forward recovery and FAST. Recheck nose dives, target choice and ~1-second retry; tune only from observed failures.


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


## Owner-approved creative design plan — 2026-10-08 (planning only)

- **ACCEPTED identity:** Premium Cinematic Arcade / “Beauty in flight. Precision in motion. Spectacle in impact.” See [Creative Direction 2.0](docs/29_APPROVED_CREATIVE_DIRECTION_V2.md), CD-00…CD-09 and [ADR-006](docs/09_DECISIONS.md). This is **not a runtime visual release**.
- Order: CD-00 actual portrait baseline (coordinates with GP-00) → CD-01 CSS tokens → CD-02 single-CTA live forest launch → CD-03 minimal HUD; CD-04 authored clearing → CD-05 lighting → CD-06 drone/vehicle silhouettes → CD-07 reward polish → CD-08 pause/micro-UX → CD-09 live iPhone acceptance.
- Preserve high-priority flight/dive, impact audio and performance work from above. Do not merge PR #66 as-is without reconciling graphics-overhaul concepts against approved CD direction and current shipped VFX/audio.
- **Next safe art action:** capture current 390×844 home/flight/impact screenshot baselines; record which are desktop-only versus actually tested on iPhone, then implement a reversible launch-only PR. Do not modify game physics or hitboxes to achieve visual polish.

## Owner art clarification — military-style vehicle targets (2026-10-08, planning only)

- Owner confirmed the 3 encounter targets should look like **fictional military vehicles**, not generic civilian cars: **tank silhouette, APC/armored carrier silhouette, military transport truck silhouette**. Matte olive/military green, khaki/dust materials; recognizable from above at flight speed and distinct settled wrecks.
- Authoritative scope: [Creative Direction 2.0](docs/29_APPROVED_CREATIVE_DIRECTION_V2.md) CD-06 + [ADR-006](docs/09_DECISIONS.md), tracked under [Issue #76](https://github.com/statego2/War-Drone-Sim/issues/76). This is **plan approval only**, not imported meshes or deployed gameplay visuals.
- Preserve fixed 3-target encounter, fictional unoccupied objects, and existing hitbox/flight/instant-respawn contracts. No real vehicle replicas, military targeting UI or weapons simulation. Reconcile existing graphics PR #66 before implementing CD-06.

## Quiet Air-Glide v3 — owner listening complaint (2026-10-08)

- The owner still finds the constant drone sound irritating. `feat/quiet-air-glide-v3-rebased` eliminates the permanently running rotor oscillators instead of lowering their volume. See `docs/29_QUIET_AIR_GLIDE_V3.md`.
- Flight now communicates speed, banking and dives through quiet movement-reactive air layers; reward and impact sounds remain separate.
- Tests check that unlocking audio creates no continuous motor oscillator, plus speed/dive/turn response. Real iPhone listening remains the final comfort gate; passing automated tests does not establish sound quality.
