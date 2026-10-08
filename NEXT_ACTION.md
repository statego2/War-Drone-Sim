# NEXT_ACTION — War Drone Sim

**Last updated:** 2026-10-08. **Stage:** G0 — foundation/planning. **Build available:** NO. **Engine project:** NOT YET CREATED.

## First action for the next agent

**T-001 / T-002 (P0): Perform engine and delivery feasibility spike.** Inspect repo docs and determine whether Unity 6 URP native iOS + Android is feasible with the available Mac / development environment and which native / browser path best matches the owner's ability to try the game. Create a minimal empty-engine project on a separate branch, pin editor/package versions, make a basic portrait app render on at least one **real device**. Record actual results (or precise blockers), not assumptions.

See [docs/09_DECISIONS.md](docs/09_DECISIONS.md), [docs/07_DELIVERY_AND_RELEASE.md](docs/07_DELIVERY_AND_RELEASE.md), WBS IDs T-001..T-006 and corresponding GitHub issues.

## Prioritized execution queue
1. **G0** — T-001 engine/target and distribution spike; T-002 real-device proof; T-003 repo/Unity scaffolding; T-004 smoke tests + CI; T-005 performance baseline; T-006 compare touch/tilt/one-stick prototypes.
2. **G1** — T-010..T-019 greybox first playable: controller, chase camera, one road + target, physics collisions, score/payoff/rapid retry, internal playtest.
3. **G2** — T-020..T-029 phone-stable vertical slice: forest LOD, traffic routes, spotting/visibility, polished core feedback, 30/60 performance on actual devices.
4. **G3+** — Expand, polish, optimize, evaluate retention; monetize only after explicit approval.

## Non-negotiable evidence required before advancing
- **G0→G1:** project compiles + documented device build or explicitly approved alternative distribution.
- **G1→G2:** phone-playable, understandable fly→spot→hit→retry prototype; at least 5 target users, qualitative + task success recorded.
- **G2→G3:** frame-time profile and thermal test; accepted control scheme; coherent art/audio feel; no systematic unfair collisions.
- All stage gates require **owner product acceptance**.

## Open decisions, not defaults
- Native iOS/Android **vs** link-playable mobile web (GitHub Pages like Rocket Panic). Unity WebGL on iOS browser is a feasibility spike; not a promise.
- Stylized low-poly **vs** semi-realistic forest. Start greybox; choose only after performance and readability tests.
- Exact Unity LTS version/package versions and minimum OS/device support.
- Final collision loop semantics (instant respawn, limited lives, or run timer). Prototype alternatives.

## Honest status
Only planning documentation/backlog is being created in this session; no engine build was downloaded, compiled or run. **Do not claim an app exists.** Next agent's first job is G0 implementation and evidence.
