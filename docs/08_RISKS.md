# Risk Register — War Drone Sim
Scale: Probability (P) and Impact (I) 1–5; Exposure = P×I (qualitative prioritization, not mathematically calibrated probability). Review at least every stage gate. Owners: **Tech** lead engineer, **PO** product owner, **QA** test owner.

| ID | Risk | P | I | Exposure | Trigger / early warning | Mitigation / fallback | Owner |
|---|---|---:|---:|---:|---|---|---|
| R-01 | No frictionless iPhone link sharing | 4 | 5 | 20 | Web build fails Safari or frame budget | G0 compare native vs web; explicitly choose channel, don't promise Pages | Tech/PO |
| R-02 | Landscape destroys mobile FPS | 4 | 5 | 20 | p95 frame exceeds budget with >1 tree tile | greybox benchmark, LOD, opaque foliage, density per tier, small curated scene | Tech |
| R-03 | Drone flight hard for novices | 4 | 5 | 20 | ≥2/5 initial testers cannot intentionally steer/recover | A/B drag vs thumbstick, assisted movement, tuned camera | Design |
| R-04 | Core loop boring after 2 plays | 3 | 5 | 15 | few immediate retries / users don't request another try | G1 greybox fun gate, revise encounter pacing before content | PO |
| R-05 | Portrait camera hides target and trees | 4 | 4 | 16 | target frequently offscreen at normal approach | curated sightlines, responsive chase rig, occlusion checks, portrait-first art | Tech/Design |
| R-06 | Collision high-speed pass-through / double registration | 3 | 5 | 15 | repeated/missed contacts under physics | continuous detection where needed, single resolver, tests | Tech |
| R-07 | Asset license contamination in public GitHub | 3 | 5 | 15 | new binaries added with no manifest | CC0 defaults, ignore paid imports, explicit legal gate, scan PR | Tech/PO |
| R-08 | "Complete drone template" creates dependency trap | 4 | 4 | 16 | huge imported scripts, editor breakage, poor portrait support | build small controller first; timebox template evaluation and preserve interfaces | Tech |
| R-09 | Cinematic effects delay retry | 3 | 3 | 9 | retry exceeds 3s or feels tedious | pool VFX, quick skip, limit time dilation, phone user tests | Design |
| R-10 | iOS provisioning / SDK incompatibility | 3 | 4 | 12 | build cannot sign on reference Mac/iOS | G0 Xcode spike, fallback Android/web validated early | Tech |
| R-11 | Scope creep ("real sim", weapons, open world) | 4 | 4 | 16 | work added before G1 approval | change control, non-tactical entertainment focus, WIP ≤2, owner's stage gate | PO |
| R-12 | Multiple AI agents overwrite changes | 3 | 4 | 12 | conflicting edits to same scene/README | work issue ownership, branches, PR, preserve GUIDs, rebases, NEXT_ACTION | Tech |
| R-13 | Shader/URP package mismatch | 3 | 4 | 12 | pink materials, compile errors after import | pin versions, vendor smoke scene, compatibility screen per pack | Tech |
| R-14 | Device thermal throttling late in run | 4 | 4 | 16 | FPS degrades across 20–30 min | thermal profiling early, quality caps, dynamic scaling only after testing | QA/Tech |
| R-15 | Visual art lacks coherent identity | 3 | 4 | 12 | forest, vehicle, UI from unrelated styles | one palette/light direction, own presentation assets, visual approval | Design |
| R-16 | Store policy / privacy surprises | 3 | 5 | 15 | SDK permissions missing, store rejection | avoid ad/analytics SDK, real data inventory, release audit | PO/Tech |
| R-17 | Schedule overconfidence in AI-assisted coding | 5 | 3 | 15 | issues closed without device or tests | 30–50% reserve, evidence-based acceptance, 2-item WIP | PO/Tech |
| R-18 | Web GPU memory and downloads too large | 4 | 4 | 16 | iOS Safari crashes / reloads / long cold start | aggressive content simplification or native pivot; test actual browser | Tech |
| R-19 | Sound effects distract or clip | 3 | 3 | 9 | hard-to-hear target or repetitive hiss | layer mix / limiter / sound toggle / speakers+headphones QA | Design |
| R-20 | Real world militarized perception damages product clarity | 3 | 3 | 9 | players expect real combat tactics | fictional unoccupied targets, non-graphic stylization, entertainment descriptors | PO |
| R-21 | Paid purchases before design proven | 4 | 3 | 12 | spending requested while G1 fails | budget gate, free CC0 first, objective asset benchmark | PO |
| R-22 | User fatigue from technical complexity | 4 | 4 | 16 | requires scrolling, deciphering jargon to start run | visually clean one-screen launch, minimal labels, responsive retry | Design |

## Risk-driven development
**Do early:** R-01, R-02, R-03, R-05, R-06. They could kill the project after hundreds of hours unless disproven.  
**Do continuously:** R-04, R-07, R-11, R-12, R-17.  
**Do before release:** R-10, R-16, R-20.

## Contingency playbooks
- **Web fails but native works:** owner decides native iOS/Android release or pivot to lighter 3D web engine. Preserve asset/logic prototypes; budget a port separately, never count as a free option.
- **iOS native blocked:** profile Android / simulators only provisionally; don't declare G0 pass for iOS until owner phone test.
- **Controls fail:** replace motor tuning/control adapter, not entire world. Compare same scene same testers and input scheme.
- **Forest fails:** reduce simultaneous visible trees, occlusion layer, expensive leaves/shadows and use curated corridors; recheck visibility.
- **No fun after 2–3 iterations:** pause art purchases and revisit core game fantasy before stage G2.
- **Rights uncertain:** quarantine asset; replace with CC0 or original.
- **Release blocker:** postpone submission; release evidence takes precedence over dates.

## Issue template for risk escalations
```text
Risk ID:
Observation / evidence:
Affected gate:
Probability / impact revised:
Mitigation option A and expected effort:
Fallback option B and tradeoff:
Decision owner and deadline:
Link to experiments / ADR / blockers:
```
