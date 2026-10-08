# War Drone Sim

**Status:** Planning / pre-production — no playable build exists yet.  
**Planning baseline:** 2026-10-08 · **Owner:** repository owner · **Document language:** English (implementation specification), Greek discussion / review welcome.

## Product

A **portrait-first, mobile 3D arcade drone game**. Fly through a fictional forest, spot moving **unoccupied game vehicles**, commit to a precision impact, experience a satisfying cinematic consequence, and immediately return for another attempt. Visual reference: one-screen accessibility and flow of the owner's *Rocket Panic* project — not a claim of shared source code or shared engine.

**North star:** *Fly → find → line up → impact → rewarding payoff → immediate retry.*

We are **not** building a real-world training tool, tactical navigation system, weapon controller, or realistic targeting software. All targets are fictional game objects; simulation mechanics should be designed for entertainment, not physical-world applicability.

## Work status

- Repository was empty at planning start. All files in this initial commit are **specifications**, not shipped features.
- **Proposed engine:** Unity 6 LTS (exact version to be pinned during T-001), C#, Universal Render Pipeline, Unity Input System, Cinemachine. **PROVISIONAL until ADR-001 technical feasibility gate.**
- **Mobile target:** iOS + Android native builds; GitHub Pages/browser distribution is a separate feasibility experiment, **not guaranteed**.
- **First gate:** greyscale phone-playable flight + vehicle impact loop. Do not spend on premium assets or monetization until that gate passes.

## Documentation

| File | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Instructions and guardrails for AI coding agents |
| [NEXT_ACTION.md](NEXT_ACTION.md) | Source of truth for next safe execution steps |
| [docs/00_PROJECT_CHARTER.md](docs/00_PROJECT_CHARTER.md) | Charter, scope, objectives, stakeholders, approvals |
| [docs/01_GAME_DESIGN.md](docs/01_GAME_DESIGN.md) | Player experience, core loop, controls, camera, progression |
| [docs/02_TECHNICAL_ARCHITECTURE.md](docs/02_TECHNICAL_ARCHITECTURE.md) | Runtime system design, interfaces, build targets |
| [docs/03_ROADMAP_AND_GATES.md](docs/03_ROADMAP_AND_GATES.md) | Work packages, estimates, critical path, go/no-go gates |
| [docs/04_WBS_DEPENDENCIES.md](docs/04_WBS_DEPENDENCIES.md) | Complete work breakdown with IDs, estimates, predecessors |
| [docs/05_ASSETS_AND_LICENSES.md](docs/05_ASSETS_AND_LICENSES.md) | Buy/build matrix with verified research candidates |
| [docs/06_TESTING_AND_PERFORMANCE.md](docs/06_TESTING_AND_PERFORMANCE.md) | Test strategy, device tiers, budgets, evidence |
| [docs/07_DELIVERY_AND_RELEASE.md](docs/07_DELIVERY_AND_RELEASE.md) | Repository, CI, mobile distribution, compliance |
| [docs/08_RISKS.md](docs/08_RISKS.md) | Risk register, mitigations, trigger thresholds |
| [docs/09_DECISIONS.md](docs/09_DECISIONS.md) | Decisions, ADRs, alternatives and unresolved items |
| [docs/10_RESEARCH_SOURCES.md](docs/10_RESEARCH_SOURCES.md) | Prior deep-research input, primary asset and engine links |
| [docs/11_PLAYTESTS.md](docs/11_PLAYTESTS.md) | Research hypotheses and usability experiments |
| [docs/12_VISUAL_AUDIO_DIRECTION.md](docs/12_VISUAL_AUDIO_DIRECTION.md) | Art, UI, VFX, sonic identity |
| [docs/13_TELEMETRY_PRIVACY.md](docs/13_TELEMETRY_PRIVACY.md) | Optional, consent-based measurement schema |
| [docs/14_BUDGET_AND_RESOURCING.md](docs/14_BUDGET_AND_RESOURCING.md) | Commercial choices, effort model, staffing |
| [docs/15_TASK_ISSUES_INDEX.md](docs/15_TASK_ISSUES_INDEX.md) | GitHub issue tracking conventions |
| [docs/16_RESOURCE_SCHEDULE.md](docs/16_RESOURCE_SCHEDULE.md) | Dependency-validated 20h/week schedule & phase rollups |
| [docs/17_PROJECT_STATUS.md](docs/17_PROJECT_STATUS.md) | Current true project state, phase evidence and first issues |
| [docs/planning/github_issue_map.json](docs/planning/github_issue_map.json) | All 55 GitHub issue links indexed by work ID |

## Execution rules

1. Read AGENTS, NEXT_ACTION, relevant docs, and open GitHub issues **before making changes**.
2. Identify one unblocked P0 issue, implement, **run the tests you actually can run**, note what you could not test, and update project status.
3. Never equate a desktop-editor simulation with a validated mobile build.
4. No premium assets / external licenses / ads SDK / production release without an explicit go/no-go gate.
5. Keep gameplay accessible in portrait. Fun-first, simplest implementation that can be tested on a real phone.

**Planning baseline is now assembled: 55 live GitHub Issues, 330h nominal work and an evidence-gated roadmap.** See [current status](docs/17_PROJECT_STATUS.md). Production is complete only when real build, playtest and QA evidence proves the gates.
