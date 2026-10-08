# Work Breakdown Structure — War Drone Sim

Generated baseline 2026-10-08. **55 sequenced, acceptance-testable work items**; statuses initially backlog. The tasks are organized by stage gates, priority, work package, dependencies, single-developer engineering-hour estimates and acceptance evidence. Full machine-readable records: [work_items.json](planning/work_items.json). GitHub issues are the operational task tracker. The hour estimates are **planning points**, not time guarantees; include 30–50% reserve at program level. Total here 330h; actual workstreams overlap gates and uncertainty is high.

## Legend
- G0 feasibility; G1 first playable; G2 vertical slice; G3 beta; G4 release
- WP0 product/research; WP1 platform; WP2 flight; WP3 environment; WP4 feel/UI; WP5 QA/performance; WP6 release
- P0 critical; P1 vertical slice; P2 polish/release. Dependency IDs are prerequisites that must be finished or explicitly waived with evidence.
- Progress states: backlog → ready → in-progress → in-review → done, or blocked. State lives in GitHub issues, this file is the baseline plan.

## Complete backlog
| ID | Gate | WP | Priority | Estimate | Dependencies | Deliverable |
|---|---|---|---|---:|---|---|
| T-001 | G0 | WP1 | P0 | 8h | — | Compare Unity 6 native, Unity web and Godot/web delivery |
| T-002 | G0 | WP1 | P0 | 8h | T-001 | Build signed portrait hello world on a real iPhone or Android |
| T-003 | G0 | WP1 | P0 | 6h | T-001 | Initialize clean engine project and ignore generated files |
| T-004 | G0 | WP5 | P0 | 4h | T-003 | Add CI build smoke and EditMode test skeleton |
| T-005 | G0 | WP5 | P0 | 5h | T-002, T-003 | Benchmark baseline forest greybox on reference phone |
| T-006 | G0 | WP2 | P0 | 6h | T-002, T-003 | Prototype portrait drag versus thumbstick controls |
| T-007 | G0 | WP0 | P0 | 3h | T-001 | Audit starter assets and source licenses |
| T-008 | G0 | WP0 | P0 | 3h | T-002, T-005, T-006 | Hold G0 architecture and distribution approval gate |
| T-009 | G0 | WP0 | P1 | 3h | T-008 | Lock thin vertical slice specification and quality baseline |
| T-010 | G1 | WP2 | P0 | 10h | T-006, T-008 | Implement assisted arcade drone motor |
| T-011 | G1 | WP2 | P0 | 9h | T-010 | Implement chase camera with occlusion and recovery |
| T-012 | G1 | WP3 | P0 | 5h | T-010 | Create curated greybox forest corridor and road |
| T-013 | G1 | WP3 | P0 | 6h | T-012 | Implement moving fictional vehicle and replayable route |
| T-014 | G1 | WP4 | P0 | 8h | T-010, T-013 | Implement contact resolver and outcome priority |
| T-015 | G1 | WP4 | P0 | 8h | T-014 | Build full run lifecycle state machine |
| T-016 | G1 | WP4 | P0 | 6h | T-015 | Implement score, best, HUD and local save |
| T-017 | G1 | WP4 | P0 | 7h | T-014, T-015 | Build temporary impact VFX, audio and rapid retry |
| T-018 | G1 | WP0 | P0 | 8h | T-011, T-016, T-017 | Run 5 first-player mobile usability sessions |
| T-019 | G1 | WP0 | P0 | 4h | T-018 | Decide G1 fun go/no-go and design revision |
| T-020 | G2 | WP0 | P1 | 6h | T-019, T-007 | Select coherent forest and vehicle art source |
| T-021 | G2 | WP3 | P1 | 14h | T-020 | Assemble optimized woodland route slice |
| T-022 | G2 | WP3 | P1 | 9h | T-021, T-013 | Finish forest road and moving traffic silhouettes |
| T-023 | G2 | WP4 | P1 | 6h | T-021, T-022 | Tune reveal cues and portrait readability |
| T-024 | G2 | WP2 | P1 | 8h | T-011, T-021 | Polish chase camera collision and comfort |
| T-025 | G2 | WP5 | P1 | 11h | T-021, T-022 | Profile forest on low/mid/high target devices |
| T-026 | G2 | WP4 | P1 | 7h | T-017, T-021 | Create polished stylized impact feedback |
| T-027 | G2 | WP4 | P1 | 5h | T-016, T-024 | Implement transparent result/home UX and options |
| T-028 | G2 | WP5 | P1 | 8h | T-023, T-025, T-026, T-027 | Run vertical-slice regressions on device matrix |
| T-029 | G2 | WP0 | P1 | 4h | T-028 | Conduct G2 performance and design sign-off |
| T-030 | G3 | WP3 | P2 | 9h | T-029 | Build 2–4 curated encounter variations |
| T-031 | G3 | WP2 | P2 | 6h | T-029 | Balance speed, drift, turn rate and challenge |
| T-032 | G3 | WP4 | P2 | 5h | T-029 | Refine beginner onboarding without menus |
| T-033 | G3 | WP5 | P2 | 7h | T-030, T-031 | Build matrix regression plan and test cases |
| T-034 | G3 | WP0 | P2 | 8h | T-030, T-032 | Observe expanded playtest round |
| T-035 | G3 | WP5 | P2 | 8h | T-025, T-030 | Optimize CPU/GPU spikes, warm-up and memory |
| T-036 | G3 | WP4 | P2 | 5h | T-031, T-034 | Tune scoring and progression for flow |
| T-037 | G3 | WP5 | P2 | 6h | T-033, T-035 | Hardening: app lifecycle, corrupt preferences, errors |
| T-038 | G3 | WP0 | P2 | 4h | T-034, T-037 | Review analytics need and privacy implications |
| T-039 | G3 | WP0 | P2 | 4h | T-036, T-037, T-038 | Approve beta content and release candidate gate |
| T-040 | G4 | WP6 | P2 | 5h | T-039 | Finalize icons, screenshots, listing copy |
| T-041 | G4 | WP6 | P2 | 6h | T-039 | Configure signing, identifiers and release builds |
| T-042 | G4 | WP6 | P2 | 4h | T-007, T-020, T-039 | Audit third-party asset licenses and attributions |
| T-043 | G4 | WP6 | P2 | 5h | T-038, T-039 | Complete privacy and store policy review |
| T-044 | G4 | WP6 | P2 | 5h | T-041 | Run external test distribution and crash triage |
| T-045 | G4 | WP5 | P2 | 5h | T-041, T-044 | Perform final stability/performance QA pass |
| T-046 | G4 | WP6 | P2 | 4h | T-040, T-042, T-043, T-045 | Prepare owner approval release checklist |
| T-047 | G4 | WP6 | P2 | 4h | T-046 | Publish to chosen store after approval |
| T-048 | G4 | WP6 | P2 | 4h | T-047 | Post-release crash, reviews and defect response |
| T-049 | G4 | WP6 | P2 | 3h | T-048 | Archive release baseline and next-version ideas |
| T-050 | G1 | WP5 | P1 | 4h | T-003, T-010 | Add flight state and scoring EditMode tests |
| T-051 | G1 | WP5 | P1 | 5h | T-014, T-015 | Add PlayMode contact and retry regression tests |
| T-052 | G2 | WP5 | P1 | 4h | T-020 | Set asset import and public-repo third-party policies |
| T-053 | G2 | WP1 | P1 | 6h | T-003, T-025 | Set low/mid/high adaptive graphics presets |
| T-054 | G3 | WP4 | P2 | 5h | T-026, T-033 | Finish coherent sonic identity and haptic options |
| T-055 | G4 | WP6 | P2 | 4h | T-039 | Write build/operator runbook and handoff template |

## Acceptance and ownership
Every ticket's `deliverable` and `acceptance` fields in the JSON are the minimum criteria; issue body also specifies integration/testing/evidence and a status handoff. One developer is accountable for technical implementation; owner approves stage gates and spend. An issue is not closed on a textual declaration alone: link commit/PR and tested evidence or clearly document untestable limitations.

## Critical path
T-001 → T-002 → T-006 → T-010 → T-011/T-012 → T-013 → T-014 → T-015 → T-016/T-017 → T-018 → T-019 → T-020 → T-021 → T-022 → T-025/T-028 → T-029 → T-030 → T-033/T-037 → T-039 → T-041/T-045 → T-046.

## Resource allocation / recommended queue
Week blocks are illustrative capacity containers rather than dated deadlines; if only 10 productive hours/week available, adjust calendar proportionately and do not present 2-week gates as commitments.
- **Block 1 (G0):** technical spike, signing + device proof, repo scaffold, CI; output ADR + proof.
- **Blocks 2–3 (G1):** movement, camera, greybox, target/contact; output repeated device run.
- **Block 4 (G1):** HUD, payoff, reset, tests, five tester sessions, decision.
- **Blocks 5–7 (G2):** cohesive forest, traffic art, visibility, camera, optimization + device QA.
- **Blocks 8–10 (G3):** content variants, balance, accessibility, expanded tests, hardening.
- **Blocks 11–12 (G4):** signed release, store/legal review, distribution QA and owner go/no-go.
