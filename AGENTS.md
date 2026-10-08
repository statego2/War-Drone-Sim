# AGENTS.md — War Drone Sim production instructions

Read this file at the beginning of **every autonomous coding or planning session**, then read [NEXT_ACTION.md](NEXT_ACTION.md), [docs/09_DECISIONS.md](docs/09_DECISIONS.md), and the open issues. These are part of the product specification, not optional context.

## Current web-first execution update (2026-10-08)

The repository has moved beyond its initial planning-only state. `main` now deploys a Three.js/WebGL Forest Encounter to GitHub Pages. The earlier Unity/native-specific scaffolding, signed-build prerequisites, `FixedUpdate`/`ScriptableObject` guidance and 330-hour schedule are historical references **where inconsistent with the live browser architecture**. Do not block web tasks on nonexistent Unity projects or claim Unity tests were run.

Before gameplay planning/coding, read [the web-first Gameplay Focus Rebaseline](docs/27_GAMEPLAY_FOCUS_PLAN.md) and [tracking Issue #68](https://github.com/statego2/War-Drone-Sim/issues/68), together with `NEXT_ACTION.md` and relevant existing tasks. Product objective: **fast one-finger portrait forest flight → several visible fictional unoccupied vehicle choices → dramatic short contact feedback → another airborne drone in about one second**. No racing/free-flight mode, open-world campaign, real vehicle attack or hardware control requirements. Record shipped `main` separately from open PRs (notably dive and graphics proposals), and preserve old WBS traceability while baselining new web tickets. Owner iPhone acceptance is not proven by desktop CI. Coordinate parallel writers rather than overwriting `NEXT_ACTION.md`.

## Role and mandate
Act as pragmatic lead game engineer + technical producer. Ship small, testable vertical slices of a **portrait, mobile-first, arcade 3D drone game**. Preserve player control, screen readability, framerate and restart flow above architecture novelty.

## Product invariants
- A single, immediately understandable loop: fly, spot fictional vehicle, line up impact, feedback, score, quick retry.
- Primarily **touch portrait**; no joystick clutter by default, no hidden controls. Arcade-assisted flight before authentic RC/Acro.
- In-fiction vehicle impacts only; do not implement actual-drone protocols, hardware integration, real targeting, real missions, physical-world targeting accuracy, or real world collision planning.
- Camera never obscures the target without purpose; both controls and target visible in portrait safe area.
- Offline single player, no account, multiplayer, open world, complex damage physics or monetization as MVP requirements.
- All estimates/benchmarks are **hypotheses until tested** on hardware.

## State of repo
Initial planning-only repository. No engine or build configuration has been committed at the planning start. Do not report features as implemented simply because there is a spec or an issue. Verify a file exists before editing.

## Startup checklist
1. Inspect `git status`, repo tree, existing branches/PRs and issues. Respect uncommitted work and other agents.
2. Check `NEXT_ACTION.md` for the current unblocker; cross-reference ID in WBS and GitHub issue.
3. Confirm engine choice, license status, actual target platform, and available CI secrets before changing build configuration.
4. Create a focused branch/PR for a coherent work package; avoid rewriting someone else's work.
5. Document progress, commands, results, **known missing validation**, blockers and recommended next step in `NEXT_ACTION.md` and issue/PR. If modifying the current code, do not fabricate test outcomes.

## Workflow: issue → implementation → evidence → status
- Issue must state: `ID / goal / dependencies / deliverable / acceptance checks / estimate`.
- Reproduction/test plan first for bug-fixes; unit tests for pure logic; play-mode integration for Unity components; real device tests for framerate/touch/safe areas.
- Make focused commits. Keep `Assets/ThirdParty` vendor-isolated, with manifests and license inventory. Do **not** upload purchased package source to public GitHub.
- Prefer dependency-injected interfaces and ScriptableObject tuning data, not giant managers/singletons.
- Ensure frame-rate independence of non-physics interpolation; work in `FixedUpdate` for Rigidbody interaction. Avoid per-frame allocation and physics/renderer cost explosions.
- Reconcile PR against latest main and run the same tests after merging if feasible.
- Update docs when behavior/decisions change; close an issue only when its acceptance evidence is captured.

## Engineering quality bar
- P0 gameplay: no random-looking failures; any tree/vehicle/terrain impact must have an unambiguous cause.
- Flight intent, flight model, camera, spotting, traffic, scoring, feedback are separable modules with bounded interfaces.
- Profile on-device before promising 60fps. Aim 60fps on target mid/high, stable 30fps fallback; full criteria in docs/06.
- Inputs work with left-handed settings, safe areas, pause/resume, interruptions and varying aspect ratios.
- Target no personally identifying data by default. Analytics disabled unless explicitly configured + lawful consent.

## Definition of Done — code task
- Feature matches acceptance tests and integrates with existing architecture.
- Automated tests added where useful; results reported precisely, with build identifier and device when tested.
- No unlicensed asset or secret committed, no broken project compilation, no new unexplained critical profiler regression.
- Relevant docs, issue and `NEXT_ACTION.md` synchronized.
- Manual validation TODOs surfaced clearly, never silently waived.

## Stop / escalation rules
- Stop purchasing/integrating a paid asset when license, engine version or redistribution rights are unclear.
- Stop feature expansion if G1 (fun loop) or G2 (phone feasibility) gates have not passed.
- Escalate product-changing decisions to owner, but proceed with reversible greybox experiments where possible.
- Do not publish game or enable monetization just to meet a planning date; publishing requires owner credentials and release approval.
- When unable to access engine/tool/device, produce honest implementation files and test instructions, not fictitious successful builds.

## GitHub collaboration
- `P0` blocks first playable; `P1` vertical slice; `P2` polish/release; `P3` optional.
- Prefer work package issue title `[T-###][P0][WP-N] Brief outcome`.
- Keep critical path unblocked: engine feasibility → device build → controls/flight → camera → targets/collision → playtest → optimized forest.
- One feature = one PR unless tiny docs-only.
- For any tool-assisted AI session, finish with a truthful handoff in `NEXT_ACTION.md` of completed items and next unblocked task.

## Authoritative decisions
`docs/09_DECISIONS.md` stores accepted decisions; do not silently convert proposed values to frozen requirements. The charter governs product intent, the GDD governs experience, ADRs govern technology, the WBS governs traceable scope, issues govern execution.
