# Quality Assurance & Device Performance Strategy

**Purpose:** achieve reliable, legible, responsive portrait gameplay with **measured** evidence rather than emulator-only optimism.

## Test pyramid
| Layer | Test type | Scope | Frequency |
|---|---|---|---|
| Pure logic | EditMode automated | state machine, scoring, tuning clamps, seeded encounters, save migration | each PR |
| Unity integration | PlayMode | Rigidbody collisions, camera reset, pause/retry, VFX double-fire | each feature PR / nightly if feasible |
| Build smoke | Editor/CI | import project, package lock, compile assemblies, scenes list, unsigned Android/Web if supported | each merge |
| Phone manual | Device | controls, readibility, notches, crashes, performance | each G0/G1/G2 gate; material changes |
| Structured playtests | 5 then 15–30 players | can understand and enjoy without instructions, fairness, motion comfort | G1, G3 |
| Release | Store test builds | install/update/offline/restart/sleep, attribution and privacy | G4 |

## Device matrix — establish exact hardware in T-002
| Tier | Proposed device class | OS/build | Role |
|---|---|---|---|
| iOS reference | Owner's iPhone (must verify actual model/iOS and Xcode support) | pinned & recorded | crucial UX and native test |
| Android budget | low-mid modern 4–6 GB RAM class, actual model TBD | supported Android | 30fps fallback |
| Android mainstream | 6–8 GB current device, actual model TBD | supported Android | primary Android perf |
| iOS newer | second generation newer than reference, actual model TBD | current iOS | 60fps high-tier aspiration |
| Browser optional | mobile Safari + Android Chrome | exact tested browsers | only if G0 greenlights web |

Record GPU/SoC, OS, display ratio/resolution, thermal settings, build SHA, scene seed, in-game quality and profiler tool version for every benchmark.

## Numeric target thresholds — initial hypotheses, not current outcomes
- 60fps frame budget: 16.67ms, target p95 total ≤16.67ms with **some headroom** where feasible.
- 30fps budget: 33.33ms, aim p95 ≤33.33ms after initial warm-up on specified minimum reference devices.
- No consistent frame drops during direct target approach or particle impact; use p99 and per-event traces.
- Launch-to-play target ≤8s on named reference class; retry tap-to-control ≤3s. Actual thresholds can change after user tests.
- Avoid thermal throttling over **at least 20–30 min** and monitor batterydrain where available; not absolute device-independent energy claims.
- CPU/GPU time, rendering spikes, texture/mesh memory, draw calls, batching effectiveness, alloc/frame, GC pauses, player loop.
- Asset bundle/installed size budget **TBD by G0**; measure before imposing arbitrary claims.

## Performance experiment protocol
1. Pin Unity version, device model/OS, build type (non-development and development), quality tier, scene seed and test route.
2. Warm up shaders/content for 2 min, then record ≥3 stable runs and one 20–30 minute thermal soak.
3. Report min/median/p95/p99 **frame time** (ms) and 1% low FPS when available; include tools and counters.
4. Separate CPU main thread, render thread and GPU, not just `Application.targetFrameRate`.
5. Test tree-dense corridor, reveal window, vehicle impact burst and home/result overlay.
6. Compare only same builds/devices/settings; screenshot profiler trace and note confidence limits.
7. Fail a gate when outcome is consistently below agreed target; tune vegetation density, transparency, physics collider counts, dynamic shadows, render scale and heavy effects before reducing readability.

## Performance budget breakdown (illustrative planning envelope)
At 30fps, allocate ≤33.33ms for actual total frame. Seek CPU and GPU critical path times below budget with a 20% contingency. Numeric per subsystem CPU/GPU allocations set only after profiling and *not double counted* (GPU/CPU may overlap).
Candidate performance levers:
- Trees near-mid-far LOD, HLOD/low-poly billboards *only if readable*, small material palette, low overdraw leaf clusters, instancing vs static batching based on evidence.
- Limit shadow casters and shadow distance; mostly baked lighting. Prefer simple opaque surfaces to layered transparency.
- Fixed timestep collision filtering and layer matrix, pooled particle systems, minimal pooled debris, single-contact deduplication.
- One camera, avoid expensive postprocessing stack or multiple expensive URP passes; optimize render scale in graphics tiers.
- Simplified vehicle route motion; no expensive per-vehicle navigation.
- No runtime prefab instantiate/destroy inside critical impact windows if pooling sufficient.

## Test IDs
| ID | Setup | Expected |
|---|---|---|
| QA-001 | First fresh launch / 9:16 | one "FLY" action, correct safe area |
| QA-002 | 19.5:9 / tall phone with notch | no critical UI under system bars |
| QA-003 | One-finger continuous drag | consistent steer, no surprise release |
| QA-004 | Interruption during steering | paused, stale input cleared |
| QA-005 | High speed toward visual tree collider | predictable obstacle collision |
| QA-006 | Contact center/edge of moving fictional vehicle | exactly one registered hit |
| QA-007 | Repeat physics callbacks on one contact | one score event, no double VFX |
| QA-008 | Crash on terrain | visually distinguishable from success |
| QA-009 | Retry 20 consecutive times | no stale target, timers, audio or score |
| QA-010 | Reload after saved personal best | schema resilient, score persists |
| QA-011 | Corrupt/missing save | defaults restored safely |
| QA-012 | Audio off, haptics off, reduced motion | preference respected |
| QA-013 | Left hand / invert vertical | intuitive mapping and proper hint |
| QA-014 | Very dense forest camera | drone + vehicle remain visible |
| QA-015 | 25 min phone test / repeat impact | thermals and frame-times within tier |
| QA-016 | Airplane mode/no network | full game starts & plays |
| QA-017 | Re-enter result view fast while touching screen | no ghost tap/restart |
| QA-018 | Home screen / lock/unlock during VFX | resumes safe state, no looped audio |
| QA-019 | Install and uninstall on store test channel | works without unusual permissions |
| QA-020 | Cold boot after update | best/settings load or migrate safely |

## Reporting template
```text
Build / commit:
Editor + package lock:
Device / SoC / GPU / RAM / OS / screen:
Development or release:
Scene seed + quality:
Reproduction steps:
Expected / actual:
Automated tests executed / passed / skipped:
Profiler results: p50/p95/p99, CPU/GPU, memory, temperature:
Screenshots/video links:
Severity / owner / follow-up issue:
```

## Severity / stop ship
- **P0:** crashes every run, unsafe permissions/privacy, build cannot start, unusable controls, unlicensed shipped asset.
- **P1:** repeated wrong collision outcomes, severe target invisibility, persistent phone performance below approved tier, common infinite retry loops.
- **P2:** minor UX, audio layering, specific rare visual glitches.
Release requires zero known P0/P1 on approved supported device matrix, documented exceptions and owner acceptance.
