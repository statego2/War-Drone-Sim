# Gameplay Focus Rebaseline — Forest Encounter (web-first)
**Date:** 2026-10-08 · **Status:** active gameplay sequencing proposal, tracked by [Issue #68](https://github.com/statego2/War-Drone-Sim/issues/68).  
**Product owner intent:** a fast, compact **portrait browser arcade encounter**: launch an agile fictional drone into a forest, see several clearly visible unoccupied fictional vehicles, choose one, execute a committed dive/contact, get an exceptionally clear short visual/audio payoff, and continue automatically with another drone in about one second. The flight and impact must themselves feel rewarding.

## 1. Why the original plan needs a rebaseline

The original [55-item WBS](04_WBS_DEPENDENCIES.md), [roadmap](03_ROADMAP_AND_GATES.md) and [schedule](16_RESOURCE_SCHEDULE.md) were drafted for a native Unity-first project with signed mobile builds, Unity EditMode/PlayMode tests and later browser evaluation. Actual production moved directly to a **Three.js/WebGL GitHub Pages browser prototype**. Treat the native-only prerequisites/330-hour estimates as **historical scenarios**, not a live blocking sequence for browser work.

The repo has a real v0.8 Three.js playable baseline on `main`, and GitHub Pages serves the encounter, but code/desktop CI do **not** establish iPhone Safari playability, frame rate, thermal stability, accessibility or enjoyment. Relevant legacy issues are still **open**; do not claim completion from the mere presence of code.

Parallel work checked at authoring:
- The previous [PR #67](https://github.com/statego2/War-Drone-Sim/pull/67) proposed nose-down braking, which the owner rejected. [PR #74](https://github.com/statego2/War-Drone-Sim/pull/74) merged a momentum-preserving diagonal/sideways model. Do not resurrect brake behavior without new player approval.
- [PR #66](https://github.com/statego2/War-Drone-Sim/pull/66) contains a graphics overhaul **design proposal**, not completed runtime visuals. Coordinate its priorities, but do not let it block critical gameplay validation.
- [NEXT_ACTION.md](../NEXT_ACTION.md) describes v0.8 and should continue serving as the **coding-session handoff**. This document sets the gameplay priority/acceptance context; Issue #68 tracks the active checklist.

### Scope boundary
**In:** high-speed flight feeling, immediate predictable one-finger control, readable dramatic dives, several visible vehicle choices, deterministic non-graphic impact, a clear wreck/result, 1-second automatic airborne respawn, same-field repeatability, portrait Safari/performance.  
**Out for G1:** racing, unrelated free-flight mode, campaign, unlock trees, crafting, realistic hardware/autopilot/targeting guidance, real-world attack simulations, new menus or score complexity. More content is useful *only after* the one repeated encounter feels great.

## 2. Reality check: implemented vs accepted

| Element | Code/repo evidence | Still to prove |
|---|---|---|
| Browser 3D forest | Three.js in `src/game3d.mjs`, deployed v0.8 | iPhone Safari framerate, scene readability, thermals |
| Acceleration and dive | `src/flight3d.mjs`; #74 adds inertial descent, strafe and diagonals | verify side/diagonal gestures, FAST dive and target approach on real phone |
| Targets | `src/encounter.mjs`: three fixed, unoccupied fictional vehicles | early visibility and genuine intuitive player choice, reliable high-speed contacts |
| Feedback | flash/sparks, simple wreck/smoke, synthesized impact in `src/audio3d.mjs` | professionally coherent audio/visual payoff, with no clipping or fatigue |
| Loop | `src/game3d.mjs`: impact window ~0.98 s then next drone | uninterrupted device loop, persistent wreck visibility, no stuck pointer/audio |
| Quality control | Node model tests and desktop Chrome CI smoke | actual owner/five-player phone feedback and sustained frame pacing |

**Current main** includes #74 inertial gesture flight, but not proof of approved game feel on phone. Do not silently mark historical issues done.

## 2A. Approved art and UI direction — coordinated with gameplay (2026-10-08)

Owner approved [**Premium Cinematic Arcade / Creative Direction 2.0**](29_APPROVED_CREATIVE_DIRECTION_V2.md): cinematic golden-hour forest, one-action live-scene FLY launch, minimalist HUD, three distinguishable original fictional vehicle silhouettes, hero drone, choreographed short impact, elegant pause, continuous respawn. This is **design approval, not implementation completion**.

**Single-source rule:** this file remains the official **GP implementation sequence**. The art plan owns CD-00…CD-09 and visual acceptance. Existing [graphics-overhaul PR #66](https://github.com/statego2/War-Drone-Sim/pull/66) is an **unmerged technical proposal**; reconcile with CD and current main before merge, not an independent art direction. Do not let a new UI or art branch overwrite flight/encounter, sound, impact, or NEXT_ACTION work.

**Scheduling:** GP-00 phone/device baseline and GP-01 flight feel stay high priority. CD-00/01 non-invasive baselines/tokens may run independently; launch (CD-02) and minimal HUD (CD-03) can be reversible UI-only slices, validated before/after against flight feel. First authored clearing (CD-04) supports GP-03. Atmosphere/vehicles/impact/finish (CD-05…08) follow the same verified fun/performance gates. CD-09 provides iPhone real-device, accessibility and regression acceptance. **No new mode, gameplay score complexity, target-lock UI, forced transitions, or delay to approx. 1-second retry.**

## 3. Active execution queue (small, ordered vertical slices)

**Work in progress limit: one implementation gameplay PR at a time.** Each change should be small enough to compare before/after and revert independently. Documentation/art planning may happen in parallel without overwriting the flight/encounter branch.

| ID | Priority | Task and owner-visible effect | Dependencies | Legacy links | Acceptance evidence |
|---|---|---|---|---|---|
| GP-00 | P0 | **Ground truth / iPhone baseline.** Record Pages build commit, screen capture of first round, Safari/iOS/model, input/sound/pause/resume, smoothness/heat. | Deployed v0.8 | [T-002](https://github.com/statego2/War-Drone-Sim/issues/2), [T-005](https://github.com/statego2/War-Drone-Sim/issues/5), [T-018](https://github.com/statego2/War-Drone-Sim/issues/18) | Successful/full and failed contact, 10–15 drone attempts, device-specific observations and reproducible bugs |
| GP-01 | P0 | **Flight feel and dive.** Make turn/dive response and camera motion intuitive, high-speed but controllable; full committed dive keeps earned forward velocity while gaining downward speed, steep descent remains visible, release restores cruise. | v0.8 baseline; reconcile [PR #67](https://github.com/statego2/War-Drone-Sim/pull/67) | [T-006](https://github.com/statego2/War-Drone-Sim/issues/6), [T-010](https://github.com/statego2/War-Drone-Sim/issues/10), [T-011](https://github.com/statego2/War-Drone-Sim/issues/11) | Deterministic tests for neutral/shallow/full/released dive in cruise+FAST, steering both directions, phone video; player understands trajectory; no physics teleport or unearned success |
| GP-02 | P0 | **Impact payoff.** Replace primitive flash + basic oscillator sound with coherent, short *stylized* non-graphic impact sequence. Visually differentiate vehicle hit vs terrain failure, reveal wreck without hiding scene, layer low/mid/transient sound that works on phone speakers. | GP-00, stable contact semantics | [T-017](https://github.com/statego2/War-Drone-Sim/issues/17), [T-026](https://github.com/statego2/War-Drone-Sim/issues/26), [T-054](https://github.com/statego2/War-Drone-Sim/issues/53) | No double-trigger, clipping, excessive shake or audio stacking; muted/suspended modes reliable; owner prefers new impact in A/B; total forced impact gap target <= 1.2 s |
| GP-03 | P0 | **Encounter readability and fairness.** Tune existing three-vehicle clearing before adding vehicle counts: visible distinct silhouettes, attractive reveal at speed, player choice, predictable collision volumes, persistent wrecks, unambiguous ground miss. | GP-01, GP-02 as needed | [T-013](https://github.com/statego2/War-Drone-Sim/issues/13), [T-014](https://github.com/statego2/War-Drone-Sim/issues/14), [T-015](https://github.com/statego2/War-Drone-Sim/issues/15), [T-023](https://github.com/statego2/War-Drone-Sim/issues/23) | At least three reachable choices on portrait; high-speed swept-contact tests; retry never miscounts a previous target; 3/3 advances the encounter |
| GP-04 | P0 | **Rapid no-menu loop.** On success/failure, restore a controllable airborne drone automatically; reset touch/camera/sound cleanly; no extra start screens between attempts. | GP-01 to GP-03 integration | [T-015](https://github.com/statego2/War-Drone-Sim/issues/15), [T-017](https://github.com/statego2/War-Drone-Sim/issues/17) | User can repeat 10–15 attempts; no stale input, HUD desync, sound cut, lost terrain or stuck restart; target pause ~1 sec |
| GP-05 | G1 Gate | **Fun & device acceptance.** Run owner iPhone feel test + five unprompted first-player tests. Observe voluntary retries, comprehension of target choice, why a collision registered, control precision, audio appeal, frustration and overheating. | GP-00…GP-04 | [T-018](https://github.com/statego2/War-Drone-Sim/issues/18), [T-019](https://github.com/statego2/War-Drone-Sim/issues/19) | Owner signs keep/tune/revert decision; bug notes include build+device; recorded evidence, not invented satisfaction percentages |
| GP-06 | P1 / after G1 | **Variety inside same core loop:** 2–3 alternate arrangements/vehicle silhouettes/reveal moments; perhaps moving *fictional* vehicles if still readable on phone. No new gameplay mode. | GP-05 approved | [T-030](https://github.com/statego2/War-Drone-Sim/issues/29), [T-031](https://github.com/statego2/War-Drone-Sim/issues/30) | Distinct repeats but immediate recognition; FPS + collision fairness remain acceptable |

### Practical order
1. **Now:** GP-00 record iPhone findings (or mark external phone access explicitly blocked); **review** existing PR #67 without duplicating its code. An automated test pass cannot approve flight feel.
2. **Next implementation iteration:** select GP-01 *or* GP-02 based on owner device feedback. Priority if no feedback: finish reversible GP-01 proof and compare footage; do not stack several experimental fixes into one PR.
3. **Then:** GP-02 polish, GP-03/04 loop integration, GP-05 test/gate, GP-06 variation only after player confirmation.

## 4. Acceptance protocol and measurable hypotheses

Phone playtest (portrait): **first take one untouched play session**, then focused tests for (a) left/right, (b) shallow vs full dive, (c) 3 target recognition/choice, (d) hit and miss, (e) 10–15 consecutive drones, (f) pause, mute, Safari app switch/resume.

Suggested observations, not promises: first target recognized naturally; full dive has obvious distinct character compared with shallow down; each collision seems explainable; result-to-next-controllable-drone near 1s; sufficient frame pacing to steer at speed; the player elects to retry without prompting. Record negatives rather than forcing a go.

Unit/integration tests: variable time step + collision sweep; no duplicate impact events; three-state persistence and round reset; press/release pointer on respawn; no silent audio when muted; performance checked on real hardware. Desktop CI continues as a regression floor, never as a phone substitute.

## 5. The workflow question: is the team following a plan?

**Partially.** Actual main commits and PRs show real, iterative WebGL development and CI activity. But old WBS issues still describe signed native builds and Unity tests as prerequisites; this does not map to the active architecture. Several implemented features remain attached to open historical tickets. Also multiple proposals edit `NEXT_ACTION.md` and may conflict if merged blindly.

From now on:
- **`docs/27_GAMEPLAY_FOCUS_PLAN.md`** = web-first gameplay direction and task sequencing.
- **[Issue #68](https://github.com/statego2/War-Drone-Sim/issues/68)** = working GP checklist/coordination and links to implementation PRs.
- **`NEXT_ACTION.md`** = factual current main build, merged changes, unmerged changes explicitly separate, next one unblocked coding action.
- **Original 55 issues/WBS** = historic traceability and related acceptance requirements; re-scope native-only issues rather than falsely closing them.
- **One implementation PR at a time** for game feel. Every PR: problem + target behavior + changed files + unit/CI results actually seen + owner/device evidence or explicit pending note + rollback if worse.
- **Weekly or at each merge:** reconcile main SHA, deployed version, one active GP task, PR states, blockers, test observations. Treat estimates as ranges only after observing actual work rate.

**Definition of success:** the player says "this captures the exhilarating fast forest-drone experience I tried" because the moment-to-moment loop feels great, not because more systems or documents were added.
