# War Drone Sim — Project Charter
Version 1.0 · 2026-10-08 · Status: **Proposed baseline, pending owner approval**

## 1. Executive case
Build an elegant, technically credible, **portrait mobile 3D arcade drone experience**, where a player pilots a fictional drone through a dense but readable woodland, finds a moving game vehicle and executes a precision **in-game collision**. Instant feedback and near-instant restart should make improvement satisfying and repeatable. The experience is a **game**, not a realistic combat/tactical simulator or physical drone training app.

**Design principle:** deliver the same approachable "one more run" satisfaction the owner seeks in *Rocket Panic* while making depth emerge from control mastery, spatial judgment and environmental variation—not menu complexity.

### Problem / opportunity
- Touchscreen drone flight often has high learning friction. The playable fantasy is exciting but a port of full FPV controls risks intimidating the player.
- Rendering attractive trees at smooth framerate on mobile is nontrivial; must prove architecture / device performance before a visual asset spend.
- The delivery channel is uncertain: Rocket Panic was link-accessible; a Unity 3D native mobile project does not automatically offer equally effortless iOS URL play.

### Vision
**"Sixty seconds to understand; an hour to master."** Not a promised average duration. A benchmark for designer intent.

### Outcomes and measurement (initial targets, not verified results)
| Outcome | Candidate measure | Gate |
|---|---|---|
| Intuitive | ≥4/5 new testers can start flying and understand goal without instruction within 45 s | G1 |
| Reliable | ≥90% perceived hit/miss outcomes explained by shown visuals in tester debrief | G2 |
| Short satisfying run | 20–120 s typical greybox attempt; replay reachable in ≤3 s from outcome | G1/G2 |
| Fun | ≥4/5 want another run after a 10-minute session (qualitative sample only) | G1 |
| Performance | Stable 30 fps fallback; 60 fps aspiration on reference target phone | G2 |
| Stability | No repeatable P0 crashes, data-loss or softlocks in release candidate | G4 |
| Scope | No unapproved expansion outside single-player offline impact loop | all |

**Validation caution:** 5-person samples are discovery tools, not statistically valid retention estimates. Expand to 15–30 testers for further confidence at G3.

## 2. Product scope
**Included (MVP):**
1. Portrait 3D fixed phone layout, notch-aware UI and simple start.
2. A smooth, assisted drone flight model with tuning options, predictable failure recovery.
3. Forested mission/playfield with curated routes/clearings and sparse vehicle movement.
4. Visual/sonic spotting cues, one or two fictional vehicle silhouettes, predictable visible collision.
5. Impact sequence (camera shake/particles/audio/time dilation as feasible), unambiguous success/failure, points/best, instant retry.
6. Local settings (audio/haptics/control invert/left handed), offline operation, QA and performance tiers.
7. Mobile build, privacy-compliant publishing *only after owner approval*.

**Excluded until after a later change request:** weapons/projectiles, explosive payload mechanics, real hardware/FPV drone connectivity, real-world map/coordinates/telemetry/target acquisition, enemy human actors, multiplayer, complex stealth/AIs, strategic war campaigns, extensive narrative, cloud accounts, ads/IAP, huge map, procedural open world, photorealism, realistic vehicle damage/soft-body physics, controller calibration software.

**Potential phase-2 ideas (not scope):** biome variants, dynamic weather, ghost replay, skins, missions, challenge conditions, leaderboards. Require evidence and scope approval.

## 3. Stakeholders and decision rights (RACI lightweight)
| Activity | Product owner | Lead engineer/agent | Designer/art | Testers |
|---|---|---|---|---|
| Product goals, scope, commercial spend | **A** | C | C | I |
| Architecture, estimates, ADR | C | **A/R** | C | I |
| Control / fun design acceptance | **A** | R | R | C |
| UI, audio, style | **A** | R | R | C |
| Licensing, releases, platform accounts | **A** | R | C | — |
| QA gate evidence | A (accepts) | R (produces) | C | C |
A=accountable, R=responsible, C=consulted, I=informed. One person or AI may fill multiple roles; avoid suggesting automatic approvals.

## 4. Constraints, assumptions and dependencies
- Small independent team / AI-agent-assisted development; estimates are **effort-hours for a competent developer familiar with the engine**, not elapsed time guarantees.
- User owns a Mac mini with Apple Silicon and a modern iPhone. **Assume availability only for planning; actual Xcode signing / device enrollment / OS support must be verified.**
- May need native iOS provisioning / paid Apple developer account for external distribution; don't assume GitHub Pages hosts a native binary.
- Budget tier initially **€0–€300 out-of-pocket optional assets**, excluding labor, hardware, developer program fees, taxes.
- Offline, no backend. Minimize third-party SDKs and privacy exposure.
- Unity is a candidate recommendation, **not final choice before ADR-001**. Feasibility plan includes a mobile browser link comparison.
- No external deep-research report content was attached to this repository at planning time; independently verified references and unverified candidates are distinguished in `docs/10_RESEARCH_SOURCES.md`.
- Target devices chosen by T-002; default success criteria apply only to explicitly named devices/OS configurations.

## 5. Workstreams, deliverables, handoffs
- WP0 Product/research: charter, GDD, reference board, control prototype hypotheses, asset audit.
- WP1 Platform foundations: engine project, portrait pipeline, build/signing, CI and smoke tests.
- WP2 Flight systems: input, arcade dynamics, camera, collision policy, accessibility.
- WP3 World and targets: forest, route layout, traffic, object visibility.
- WP4 Game loop/feel: state machine, spotting, impact, scoring, restart, audiovisual feedback.
- WP5 Quality/performance: automated tests, profiler, device matrix, thermal/memory, art optimization.
- WP6 Release: compliance, distribution, storefront, documentation, crash diagnostics with privacy constraints.

Deliverables are version-controlled artifacts + running game + test evidence; a document alone never satisfies a playable gate.

## 6. Milestones and governance (stage gated)
| Gate | Deliverable | Decision |
|---|---|---|
| G0 Feasibility | Toolchain, 1 phone build, portrait input, device baseline, browser experiment report | Engine + delivery channel acceptance |
| G1 Fun proof | Greyscale 1-map playable impact loop, 5 initial tests, design metrics | Iterate core vs stop |
| G2 Vertical slice | One finished route, consistent art/audio, stable mobile performance, telemetry-free instrumentation | Greenlight content production |
| G3 Beta | Multiple tuned scenarios, settings, QA matrix, external testers | Release candidate |
| G4 Release | Build + store assets + legal checks, signed and owner approved | Publish or defer |

No gate passes solely by elapsed calendar time. Written acceptance in a GitHub issue / ADR suffices; explicit user approval remains necessary for commercial/publishing actions.

## 7. Success / non-success definitions
**Success:** on a phone, player launches, understands goal, controls flight, gets a coherent impact and can replay, in a visually attractive forest with smooth frame pacing. Most testers want another attempt without heavy explanation.

**Failure conditions:** controls feel awkward, target hard to see, frame-rate collapse behind trees, expensive purchased assets dominate identity, mobile/web distribution nonviable, or development advances aesthetics before validating the loop.

## 8. Change control
Change requests describe: player-facing benefit, dependency impacts, estimate delta, device/performance cost, license/financial consequences, risk and whether a simpler alternative exists. Owner approves additions that change MVP, budget or dates. Small reversible tuning within approved scope is delegated to engineering.

## 9. Financial authorization
- **Pre-G1:** only free/CC0 assets and free engine features unless explicit owner approval.
- **After G1:** asset spending in chosen cap based on documented license, compatibility, benchmark and replaceability.
- **Before G4:** platform / developer fees, privacy policies, legal and production distribution costs explicitly approved.

## 10. Baseline authorization checklist
- [ ] Owner accepts fantasy, single-player scope and non-tactical entertainment framing
- [ ] Owner accepts native vs browser trade-off after spike
- [ ] Engine/platform ADR-001 recorded with test evidence
- [ ] Control scheme selected by user playtest, not by preference alone
- [ ] Device matrix / baseline / license manifest agreed
- [ ] G1 demonstration accepted
- [ ] G2 performance / fun demonstration accepted
