# Effort, Budget, Staffing and Purchase Strategy

**Estimates are forecasts, not quotations or delivery commitments.** Baseline project was empty; no app, engine or assets were installed during the planning pass.

## Effort model
The [task baseline](planning/work_items.json) enumerates **55 tasks totaling 330 focused engineering hours** (sum of single-point estimates). Because no actual production velocity exists, add **30–50% contingency** for device integration, UI iteration, asset compatibility and AI-agent handoffs:
- **Base:** 330 hours.
- **Risk reserve:** +99 to +165 hours.
- **Indicative engineering:** 429–495 hours (not elapsed time).
This fits the wider charter / roadmap order-of-magnitude range of 220–435h base work when considering uncertainty in scope and role allocation. Full bespoke art/sound, production infrastructure and human QA services are additional.

## Calendar scenarios (illustrative, solo sustained capacity)
| Sustained true maker hours/week | 330h base | 429–495h with risk reserve |
|---|---:|---:|
| 10 | ~33 weeks | ~43–50 weeks |
| 20 | ~16.5 weeks | ~22–25 weeks |
| 30 | ~11 weeks | ~15–17 weeks |
| 40 | ~8.25 weeks | ~11–13 weeks |

These durations assume work is *actually available* at the stated capacity, that owner reviews/asset choices happen when needed, and that store review queues aren't on critical path. Several tasks are sequential; parallelism is limited for a solo dev. AI-generated code may shorten implementation but does **not** remove device QA, licensing and iterative playtesting.

## Spend envelopes (cash only, excluding labor and tax)
| Scenario | Assets / software | What it buys | Risks |
|---|---:|---|---|
| Lean | €0–€50 | Free toolchain where eligibility applies + CC0 forest, vehicles and built-in packages | More custom art polish needed, signing/store fees may apply |
| Controlled | €100–€300 | 1 cohesive forest/vehicle or audio/VFX upgrade after benchmark | Package incompatibility / asset flip |
| Polished | €500–€1500 | selective original art/audio commissions and independent phone QA | Can outspend core gameplay value, rights must be assigned |
Out-of-pocket budgets **exclude** taxes, platform developer programs, hardware purchases, contractor hourly fees and incidental services unless separately approved.

## Vendor acquisition gate
No purchase until:
1. G1 playtest has positive outcome.
2. Identified asset is needed for *measured* aesthetic/performance target.
3. Asset's price, currency, VAT, license, developer/publisher, editor compatibility, updates and refund terms captured.
4. Import benchmark compared with CC0/free baseline.
5. Owner explicitly authorizes item and cap.
Maintain invoice records private; store a public non-sensitive manifest.

## Role/capacity plan
| Role | Responsibilities | Actual assignment |
|---|---|---|
| Product owner | vision, control preference, milestones, budget, publishing approval | Owner |
| Lead developer | C#, gameplay, CI, profiler, builds, GitHub PRs | AI-assisted implementation / to be staffed |
| Level/art designer | sightlines, forest stylization, models and UI | To be assigned / can overlap with dev |
| Sound designer | layered audio, haptics, mixing, rights | To be assigned / may be built in house |
| QA/device testers | cross-OS, usability, frame capture | Owner + recruited testers as feasible |
| Release manager | signing, store submissions, policy reviews | Owner accountable; tech assists |

No role is counted as staffed simply because it appears here.

## Procurement priorities
- Priority 0: confirm test phone, native build path, selected engine, GitHub CI feasibility.
- Priority 1: build genuinely enjoyable arcade flight/controller and immediate retry; spend €0.
- Priority 2: CC0 environment/vehicles and original impact VFX, benchmark.
- Priority 3: buy modest polish only if coherent art and measurable benefit proven.
- Priority 4: stores, privacy, paid optional services, marketing after real beta.

## Financial risk controls
- Change requests over chosen € cap need owner approval.
- License and bundle contents reviewed by engineer before purchase approval; copyright claims can survive asset store purchase.
- No sunk-cost defense: replace an expensive but poor performing pack.
- No paid third-party scripts in public repo unless vendor license explicitly permits source redistribution.
