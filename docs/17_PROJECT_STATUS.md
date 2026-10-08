# Current Project Status — War Drone Sim

**Snapshot:** 2026-10-08. **Project phase:** experimental browser prototype implemented; G0/G1 phone evidence pending. **Playable source:** root `index.html`. **Target mobile build:** browser, no native package. **Runtime:** Canvas perspective, subject to device validation. **Owner approval for asset purchases:** not given. **Actual test outcomes:** 5 model tests and JS syntax checks passed locally; browser/device verification pending.

## Verified repository state at handoff
- Repo initialized with project charter, experience design, candidate Unity/mobile architecture, stage-gate schedule, risk and asset/license research, testing/release policy, AI-agent instructions, task JSON and roadmap.
- **55 GitHub issues created and linked** (T-001 to T-055). No implementation issue was closed or claimed complete in this planning task.
- WBS estimates **330 focused engineer hours** baseline + 30–50% reserve; scenario 20 hours/week, not a committed timeline.
- Dependencies validated without missing IDs or cycles. 55 issues unique on 2026-10-08.
- Primary-source examples logged for Quaternius, Kenney and engine licensing. **The finished external Deep Research report was not available to inspect in this pass**; integrate it only when supplied/accessibly linked.

## Stage gate dashboard
| Gate | Planning state | Execution state | Acceptance blocking evidence |
|---|---|---|---|
| G0 Feasibility | Specified | NOT STARTED | Real phone build, engine/channel ADR, CI baseline, control experiment |
| G1 Playable | Specified | BLOCKED BY G0 | Arcade flight, moving vehicle, contact, HUD/result/retry, 5-person study |
| G2 Slice | Specified | BLOCKED BY G1 | Forest/asset/license work, device profiler, coherent VFX/art, QA sign-off |
| G3 Beta | Specified | BLOCKED BY G2 | Content, expanded QA, performance and user study |
| G4 Release | Specified | BLOCKED BY G3 | Owner sign-off, platform signing, stores, policy and licenses |

## First issue-based actions
1. **[T-001 — engine/delivery ADR](https://github.com/statego2/War-Drone-Sim/issues/1)**: assess Unity native, Unity Web and Godot/mobile web using actual phone constraints.
2. **[T-002 — real-device proof](https://github.com/statego2/War-Drone-Sim/issues/2)** after engine feasibility, on owner's iPhone or other authorized test phone.
3. **[T-003 — engine project scaffolding](https://github.com/statego2/War-Drone-Sim/issues/3)** after choosing candidate for coding.
4. **[T-007 — starter assets/license audit](https://github.com/statego2/War-Drone-Sim/issues/7)** in parallel with G0 technical research as authorized.
5. Update `NEXT_ACTION.md` after completing each actual deliverable; close only with evidence.

## Producer notes / caveats
- No compiler or Unity editor was run, no CI or phone hardware was invoked. The existence of this planning project **is not proof of a running game**.
- Staff hours and start date remain scenario assumptions. Rebaseline after G0 device evidence and measured effort.
- Asset prices change; do not purchase without current source and license verification. Unity Web support is browser/platform compatibility, not project-specific guaranteed performance.
- AI agents must preserve one-screen portrait gameplay and avoid implementing unnecessary real-world drone/tactical integrations.

## Useful starting files
[AGENTS.md](../AGENTS.md) · [NEXT_ACTION.md](../NEXT_ACTION.md) · [Project Charter](00_PROJECT_CHARTER.md) · [Technical Architecture](02_TECHNICAL_ARCHITECTURE.md) · [Resource Schedule](16_RESOURCE_SCHEDULE.md) · [Task index](planning/github_issue_map.json).

## Update — browser prototype v0.1 (2026-10-08)
The owner explicitly chose browser play. Root `index.html`, `src/`, tests and CI now implement a perspective Canvas fly/contact/retry loop. The original Unity-native task sequence and 330h estimate are no longer the execution baseline. See `docs/18_BROWSER_PROTOTYPE.md` and `NEXT_ACTION.md`. G0 real-device validation and G1 fun gate remain open; earlier planning snapshot above is historical, not an implementation claim.

### Browser smoke evidence
Desktop Chrome loaded the public commit preview and showed the forest and vehicle, then `DIRECT CONTACT` +169 points. Retry and pause/resume were observed. GitHub Actions checks passed. This does not close the real iPhone or G1 playtest gate. GitHub Pages is not configured; the external preview URL is only a temporary way to play the repo code.
