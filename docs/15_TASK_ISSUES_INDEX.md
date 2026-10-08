# GitHub Backlog and Agent Execution Protocol

## Source of truth
- [WBS](04_WBS_DEPENDENCIES.md) — stable scope and traceable task IDs.
- [Machine-readable work items](planning/work_items.json) — titles, estimates, priorities, dependencies, acceptance and groupings.
- **GitHub Issues** — dynamic status, assignee, acceptance evidence, blockers and discussion.
- [NEXT_ACTION](../NEXT_ACTION.md) — one most important unblocked next action and honest handoff.
- [ADRs](09_DECISIONS.md) — approved technology choices and scope tradeoffs.

## Issue naming standard
`[T-001][G0][P0] Compare engine and distribution channel`

Body includes:
1. Objective and player/build impact.
2. Dependency IDs and stage gate.
3. Deliverable in repo / test evidence.
4. Objective acceptance checks.
5. Definition of done and true test status.
6. Estimate and risks / links.

Priority tags are text in titles **until GitHub label creation can be verified**; no dependence on admin-only project tools.

## Status rule
- **Backlog:** not ready until dependencies resolved.
- **Ready:** prerequisites accepted and implementable.
- **In progress:** branch started and owner identified.
- **In review:** PR and tests available.
- **Done:** acceptance + evidence, not merely merged or written.
- **Blocked:** explicit external dependency; report owner and next decision.

Labels may later reflect gate/P/role once configured. Avoid mass-assigning owner unless they actively work tasks.

## Schedule and issue ordering
**Preferred first unblocked issue:** T-001 engine and delivery ADR. Some tasks (T-007) may run in parallel as read-only asset research. Never do content polish while engine/device feasibility unresolved.

Work capacity model: one technical lead, WIP max 2; at 10/20/30/40 h weekly the same 330h backbone spans approximately 33 / 16.5 / 11 / 8.25 weeks before contingency and calendar waiting.

## Graph interpretation
For each issue, `depends_on` refers to prerequisite work IDs. An issue does not become ready just because an AI agent picks it; gate owner may conditionally waive with written justification. Critical path outlined in docs/03. Code-quality and legal tasks may finish ahead of G stages only if dependencies are satisfied.

## Agent session protocol
1. Read AGENTS, NEXT_ACTION, current tree/PR/issue.
2. Choose highest-priority unblocked issue, comment/assign if possible, open focused branch.
3. Execute implementation + tests with minimum independent behavior change.
4. Link PR/commit, confirm actual device/test evidence and update issue.
5. Review feature and docs; update NEXT_ACTION from actual state.
6. Request owner approval when charter/ADR/budget/release is involved.

## Do not fake status
Writing this document or creating an issue is **planning**, not code completion. Never close G0-4 issues on the strength of a plan. The default state after kickoff is all 55 tasks open. Device tests remain **pending** until real hardware evidence exists.
