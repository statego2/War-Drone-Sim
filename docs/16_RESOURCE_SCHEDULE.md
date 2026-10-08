# Resource-constrained Execution Schedule (scenario)

**Planning baseline:** 2026-10-08. **Illustrative kickoff:** Monday 2026-10-12. **No user-confirmed delivery date or staffing exists.** This model assumes **one focused developer, 20 productive hours/week**, tasks serialized in a dependency-valid order, no external waiting, no rework. It is deliberately a scenario rather than a contract or automatic background task.

## Summary
- 55 issue-level tasks; **330h base** / **429–495h with 30–50% contingency**.
- One-developer baseline **16.5 weeks** starting 2026-10-12 (roughly 2027-02-04 before risk reserve and owner review waiting).
- Risk-adjusted production scenario **21.4–24.8 maker weeks**, approximately 2027-03-11 to 2027-04-03 *if* uninterrupted capacity and approvals.
- **Unlimited parallelism dependency lower bound** 204h across 32 tasks; does not represent single-dev runtime.
- Actual **calendar schedule must be rebased after G0** with measured velocity and specific developer/device availability.

## Phase capacity and milestones (nominal, 20h/week)
| Gate | Estimate | Aggregate effort through gate | Week after kickoff | Approx finish date | Release decision |
|---|---:|---:|---:|---|---|
| G0 | 46h | 46h | W3 | 2026-10-28 | Engine/device decision |
| G1 | 80h | 126h | W7 | 2026-11-25 | Fun proof |
| G2 | 88h | 214h | W11 | 2026-12-25 | Slice/profile sign-off |
| G3 | 67h | 281h | W15 | 2027-01-18 | Beta acceptance |
| G4 | 49h | 330h | W17 | 2027-02-04 | Owner release approval + submit |

## Resourcing and execution logic
- Maximum work-in-progress: **2 items**; only one primary implementation thread. Read-only asset/license research may overlap when spare time exists, but **this chart does not count its time twice**.
- The next actionable issue is T-001, then T-002/T-003; T-007 asset audit may begin once T-001 starts.
- Every work item's prerequisite IDs must be accepted before starting; stage gates need human/product-owner sign-off.
- Re-estimate remaining hours after each tested milestone based on real completed hours, defects and test results.
- If a platform/channel pivot is required, rebaseline schedule: the model assumes Unity candidate and does not include a complete engine rewrite.

## Ordered 20h/week baseline task schedule
| ID | Gate | Effort | Week start | Week finish | Prerequisites |
|---|---|---:|---:|---:|---|
| T-001 | G0 | 8h | W1 | W1 | — |
| T-002 | G0 | 8h | W1 | W1 | T-001 |
| T-003 | G0 | 6h | W1 | W2 | T-001 |
| T-004 | G0 | 4h | W2 | W2 | T-003 |
| T-005 | G0 | 5h | W2 | W2 | T-002, T-003 |
| T-006 | G0 | 6h | W2 | W2 | T-002, T-003 |
| T-007 | G0 | 3h | W2 | W2 | T-001 |
| T-008 | G0 | 3h | W3 | W3 | T-002, T-004, T-005, T-006, T-007 |
| T-009 | G0 | 3h | W3 | W3 | T-008 |
| T-010 | G1 | 10h | W3 | W3 | T-006, T-008, T-009 |
| T-011 | G1 | 9h | W3 | W4 | T-010 |
| T-012 | G1 | 5h | W4 | W4 | T-010 |
| T-013 | G1 | 6h | W4 | W4 | T-012 |
| T-014 | G1 | 8h | W4 | W5 | T-010, T-013 |
| T-015 | G1 | 8h | W5 | W5 | T-014 |
| T-016 | G1 | 6h | W5 | W5 | T-015 |
| T-017 | G1 | 7h | W5 | W6 | T-014, T-015 |
| T-050 | G1 | 4h | W6 | W6 | T-003, T-010 |
| T-051 | G1 | 5h | W6 | W6 | T-014, T-015 |
| T-018 | G1 | 8h | W6 | W7 | T-011, T-016, T-017, T-050, T-051 |
| T-019 | G1 | 4h | W7 | W7 | T-018 |
| T-020 | G2 | 6h | W7 | W7 | T-019, T-007 |
| T-021 | G2 | 14h | W7 | W8 | T-020 |
| T-022 | G2 | 9h | W8 | W8 | T-021, T-013 |
| T-023 | G2 | 6h | W8 | W9 | T-021, T-022 |
| T-024 | G2 | 8h | W9 | W9 | T-011, T-021 |
| T-025 | G2 | 11h | W9 | W9 | T-021, T-022 |
| T-026 | G2 | 7h | W10 | W10 | T-017, T-021 |
| T-027 | G2 | 5h | W10 | W10 | T-016, T-024 |
| T-052 | G2 | 4h | W10 | W10 | T-020 |
| T-053 | G2 | 6h | W10 | W11 | T-003, T-025 |
| T-028 | G2 | 8h | W11 | W11 | T-023, T-025, T-026, T-027, T-052, T-053 |
| T-029 | G2 | 4h | W11 | W11 | T-028 |
| T-030 | G3 | 9h | W11 | W12 | T-029 |
| T-031 | G3 | 6h | W12 | W12 | T-029 |
| T-032 | G3 | 5h | W12 | W12 | T-029 |
| T-033 | G3 | 7h | W12 | W13 | T-030, T-031 |
| T-034 | G3 | 8h | W13 | W13 | T-030, T-032 |
| T-035 | G3 | 8h | W13 | W13 | T-025, T-030 |
| T-036 | G3 | 5h | W13 | W14 | T-031, T-034 |
| T-037 | G3 | 6h | W14 | W14 | T-033, T-035 |
| T-038 | G3 | 4h | W14 | W14 | T-034, T-037 |
| T-054 | G3 | 5h | W14 | W14 | T-026, T-033 |
| T-039 | G3 | 4h | W14 | W15 | T-036, T-037, T-038, T-054 |
| T-040 | G4 | 5h | W15 | W15 | T-039 |
| T-041 | G4 | 6h | W15 | W15 | T-039 |
| T-042 | G4 | 4h | W15 | W15 | T-007, T-020, T-039 |
| T-043 | G4 | 5h | W15 | W16 | T-038, T-039 |
| T-044 | G4 | 5h | W16 | W16 | T-041 |
| T-045 | G4 | 5h | W16 | W16 | T-041, T-044 |
| T-055 | G4 | 4h | W16 | W16 | T-039 |
| T-046 | G4 | 4h | W16 | W16 | T-040, T-042, T-043, T-045, T-055 |
| T-047 | G4 | 4h | W16 | W17 | T-046 |
| T-048 | G4 | 4h | W17 | W17 | T-047 |
| T-049 | G4 | 3h | W17 | W17 | T-048 |

## Weekly producer review / go-no-go template
```text
Week starting:
Hours actually available / delivered:
Completed issue IDs + acceptance evidence:
Open P0/P1 bugs and affected gates:
Latest actual phone build identifier:
Performance/UX metric and exact test device:
Top two blockers and owner decision needed:
New estimate to next gate (hours):
Budget spent (cash only, actual):
Next two ready issues:
```

## Scenarios
For 10h/week duration is ~33.0w base, 30h/week ~11.0w base; risk reserve extends by 30–50%. Avoid inferring that multiple simultaneous AIs produce linear speedup: Unity scene/prefab merge conflicts and untested code add overhead. Signed store release also depends on external vendor review, which is not included in calendar formulas.
