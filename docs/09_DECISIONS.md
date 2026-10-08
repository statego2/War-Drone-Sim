# Architectural Decision Records — War Drone Sim

An ADR is **ACCEPTED** only with owner decision or delegated architectural authority *and* gate evidence. Candidate defaults are not claims of implementation.

## ADR-001 — Engine and primary player access channel
**Status:** ACCEPTED for primary browser channel on 2026-10-08 by explicit owner instruction; runtime implementation remains experimental. **Owner:** product owner.  
**Question:** Is War Drone Sim primarily a **native iOS/Android 3D game** or **URL-playable mobile web** experience?
- A **Unity 6 LTS + URP native first**: best ecosystem/visual tooling; requires installed app to test properly; Unity Web could be optional if phone Safari spike passes.
- B **Godot 4.x Mobile/Compatibility**: open source, leaner, compatibility web path; fewer mature paid game templates and renderer differences between native/web.
- C **Three.js/Babylon.js web-first**: ideal link accessibility and lightweight control; custom world/editor/tools and perf engineering; separate estimate needed.
- D **Unreal mobile**: not favored for small portrait flow game due integration/editor/distribution weight.
**Decision test:** 1 static foliage scene + 1 simple vehicle + touch steer; test performance, input delay, build signing and sharing on owner's device, with screenshots and build details.
**Suggested direction:** A while testing URL B/C; no lock until sign-off.
**Stop rule:** if mandatory link-play fails on Unity Web, do not quietly pivot native without owner choosing.

## ADR-002 — Flight-control abstraction
**Status:** PROPOSED.  
Choose arcade auto-forward motion with user drag steering by default, B virtual thumbstick variant. Tuned first on actual phone. A shared `IFlightInput` prevents engine motor from knowing input implementation. Authentic FPV/Acro not in MVP.
**Reopen if:** 3/5 novice testers cannot guide intentional movement.

## ADR-003 — Camera
**Status:** PROPOSED.  
Close third-person chase, restrained bank/roll, lookahead into corridor, occlusion mitigation; FPV view may be studied later. Prioritize usable narrow vertical phone screen and motion comfort. Use Cinemachine only if customization overhead < custom simple camera.
**Reopen if:** nausea/occlusion or object misframing in playtest.

## ADR-004 — Level/world generation
**Status:** PROPOSED.  
One handcrafted forest flight corridor first, with reusable vegetation/road/obstacle tiles and seeded target movement. No endless procedural forest/open world before G2. World traversal exists to enable fun flight, not cartographic fidelity.
**Reopen if:** G3 tests require variety that cannot be achieved with lightweight variants.

## ADR-005 — Contact outcomes and hit semantics
**Status:** PROPOSED.  
One event per run, with prioritized fictional vehicle vs tree/terrain contacts resolved by single deterministic contact state. No real-world targeting/weapon simulation. Contact itself, not explosives/damage physics, is the success mechanism.
**Reopen if:** ambiguous hit detection persists across real phone framerates.

## ADR-006 — Art direction
**Status:** PROPOSED.  
Stylized low-poly forest, readable lighting, clean silhouettes, subtle warm/cool contrast; CC0 placeholder packs first. Only paid content when it passes G1+performance. Avoid fragmented asset-pack appearance.
**Reopen if:** art direction rejected by user after representative slice.

## ADR-007 — Testing and quality
**Status:** PROPOSED.  
Automated pure logic + Unity PlayMode + device manual. Evidence required at each stage. 30fps low-tier baseline, 60fps medium/high goal based on measured device. No simulator-only gate.
**Reopen if:** device coverage demonstrates baseline unrealistic; explicitly change minimum support.

## ADR-008 — Storage, backend and privacy
**Status:** PROPOSED.  
No backend, no network, no user account, no analytics, no GPS/camera/mic, no ads SDK for MVP. Local preferences/best score only. Requires further decision if business model changes.
**Reopen if:** specific measurable need accepted by owner and platform/privacy consequences resolved.

## ADR-009 — Asset sourcing / repository policy
**Status:** PROPOSED.  
Use CC0 or original assets where possible, version proof/license; quarantine marketplace assets until editor and license pass. Public repo must not include unlicensed source packages, purchased raw models, or secrets. Third-party code encapsulated behind adapters.
**Reopen if:** asset redistribution/maintenance changes.

## ADR-010 — Game feel and feature budget
**Status:** PROPOSED.  
Core game loop must be demonstrably fun before progression, cosmetics, ads or elaborate mechanics. Prototype after every feel change. Simple input + impactful result + retry is highest priority.
**Reopen if:** quantified qualitative feedback suggests a smaller/more immediate game loop.

## ADR decision template
```
ADR-ID:
Context / observed data:
Decision and alternatives:
Acceptance tests and device evidence:
Benefits / irreversible tradeoffs:
Consequences / costs / licenses:
Decision owner + date:
Status: PROPOSED / ACCEPTED / SUPERSEDED / REJECTED
Links to issue / PR / test:
```

## ADR-011 — Fast browser prototype renderer
**Status:** EXPERIMENTAL, pending visual and phone test. **Date:** 2026-10-08.  
With browser play explicitly required, implement a zero-dependency Canvas perspective projection of 3D coordinates first. This provides a link-playable portrait slice and avoids native signing or a large WebGL engine download. It is not a claim of full mesh 3D, measured mobile performance, or G1 acceptance. Compare actual iPhone visual feel with a lightweight WebGL mesh alternative only after testing the playable loop. See `docs/18_BROWSER_PROTOTYPE.md`.
