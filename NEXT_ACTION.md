# NEXT ACTION — War Drone Sim

## 2026-10-21 — Premium forest launch v36 (CD-01)

Merged as [PR #139](https://github.com/statego2/War-Drone-Sim/pull/139): a reversible presentation-only slice of the approved [Premium Cinematic Arcade creative direction](docs/29_APPROVED_CREATIVE_DIRECTION_V2.md): a quieter full-bleed forest home, stronger ivory/gold hero typography, one pronounced FLY call-to-action and compact Greek exploration copy. No downloaded imagery, shaders, startup delay, extra modes, telemetry or physics changes. Added a staged Pages Chromium **320×568 launch fit check** and compact-home QA screenshot alongside the existing 390×844 reference.

**Evidence:** all three GitHub Actions jobs passed for PR #139 head `bc724b3`: full Node suite and syntax checks, staged-Pages Chromium browser smoke including 320×568 launch fit/screenshot, and desktop WebKit portrait boot. CSS and markup were merged into `main`. Owner iPhone visual approval remains pending. Playtest on a real narrow portrait phone before treating this as finished art; retain immediate FLY input and exact 3D build stamp.

## 2026-10-21 — Bounded frame clock v35 (issue #81)

Implemented and merged as [PR #138](https://github.com/statego2/War-Drone-Sim/pull/138), addressing the code component of [issue #81](https://github.com/statego2/War-Drone-Sim/issues/81): a small local fixed-budget accumulator replaces the old **100ms per rendered frame** time-dilation clamp. At steady **60, 30, 10 and 5fps**, simulated time equals wall time (deterministic pure-clock tests); after a temporary GPU stall, a maximum **220ms simulation step**, **360ms backlog**, and **850ms gap cutoff** bound catch-up cost. WebGL resolution sampling continues to use **actual wall-frame intervals**, not compensated simulation delta; paused tabs do not accrue missed play time. The 3D runtime exposes read-only simulation-time and backlog values for browser regressions.

**Test evidence:** six focused Node frame-clock tests were executed successfully in isolated local Node; GitHub PR #138 passed all three CI jobs: full Node unit suite and syntax checks, staged Pages Chromium browser smoke, and desktop WebKit portrait boot (head `bc401f9`). No real-device FPS or subjective feel has been measured. Existing swept vehicle/tree contact and one-drone respawn remain unchanged, but need physical-phone validation when frame pacing is poor.

**Next:** confirm CI, inspect any smoke regression under software WebGL, verify real Safari. If sustained sub-5fps hardware remains unplayable, reduce world draw work rather than increasing unbounded simulation catch-up.

## 2026-10-21 — Premium cockpit / pause settings v34

[PR #137](https://github.com/statego2/War-Drone-Sim/pull/137) implements the approved lightweight portrait-HUD direction without disturbing the sixteen-prop, three-biome exploration loop. The default cockpit hides the altitude/speed/vertical-rate cluster; progress, score, and earned discovery guidance stay visible. The player can now change FPV/chase, sound and compact/detailed HUD **from the pause sheet** instead of cluttering the one-finger flight canvas. Local HUD preference survives reload and degrades safely if storage is unavailable.

**Evidence:** four focused Node preference tests passed in local isolated execution; the GitHub PR head `fbe8ec7` completed all three GitHub Actions CI jobs: full `npm test`/Node syntax, staged Pages Chromium interaction smoke, and desktop WebKit boot. The pending documentation update does not change runtime logic, but always check the latest PR head before merging. Neither desktop renderer proves actual iPhone touch feel, phone frame pacing, thermals, nor subjective enjoyment.

**Next product gate:** standalone iPhone Safari QA against the Pages BUILD stamp; verify first-tank reachability, swipe reverse, fast dive, steering, audio comfort and pause settings at 320–390 CSS pixels wide. Confirm all three biomes and at least one hidden target per biome. If the new pause sheet is cramped on iPhone SE-sized viewports, adjust CSS only; keep the game free of permanent flight-mode controls.

**Updated 2026-10-21.** Canonical game: [mobile portrait browser build](https://statego2.github.io/War-Drone-Sim/). Source of truth: merged `main`; open PRs are not shipped until merge and Pages completes.

## Forest exploration + artistic quality release v23–v33 (2026-10-19)

**Design shift, merged into main:** a living three-biome exploration arcade instead of a visible row of vehicles beside one straight road. The only guaranteed introductory roadside objective is the opening tank; later empty, fictional military-style props live deeper in side pockets. The drone must approach, look in the right direction and often find a gap through existing tree canopies; passing straight above the road cannot reveal all objectives. Closer than 22 units reveals fairly, never demanding pixel-perfect occlusion. Spotted locations persist across fast drone retries. Precise compass and red edging are earned by discovery, not omniscient startup HUD.

**Implemented PRs:**
- [#113](https://github.com/statego2/War-Drone-Sim/pull/113): 82-unit proximity/orientation/terrain discovery; hidden until spotted; no opening omniscient GPS.
- [#114](https://github.com/statego2/War-Drone-Sim/pull/114): gradually blended deep pine / misty river / amber highland vegetation, sky and fog.
- [#115](https://github.com/statego2/War-Drone-Sim/pull/115): once-only scout and off-route grove discovery bonuses, positive short audio cues.
- [#116](https://github.com/statego2/War-Drone-Sim/pull/116): fallen grove, spring and stone arch procedural landmarks.
- [#120](https://github.com/statego2/War-Drone-Sim/pull/120): region-specific flowers, grasses, wetland reeds, rocky undergrowth with instanced meshes.
- [#122](https://github.com/statego2/War-Drone-Sim/pull/122): deeper 15/16 forest side-clearing hiding places, preserved first-tank training approach, broad trail/river/ridge hints.
- [#124](https://github.com/statego2/War-Drone-Sim/pull/124): three small flocks, one bounded instanced GPU draw.
- [#126](https://github.com/statego2/War-Drone-Sim/pull/126): 462-unit winding river corridor through the middle biome, with clear bank foliage.
- [#127](https://github.com/statego2/War-Drone-Sim/pull/127): proof all 16 can be found and finished, with continuous tree-free authored access corridors and no road auto-reveal.
- [#131](https://github.com/statego2/War-Drone-Sim/pull/131): existing tree hazards block distant sightline; ~8Hz capped scanning, short-range fairness exception.
- [#132](https://github.com/statego2/War-Drone-Sim/pull/132): very quiet region-dependent bird timing, wetland water wash and highland airflow, no continuous engine oscillator.

**Shipping QA:** deterministic Node tests + staged GitHub Pages artifact smoke in desktop Chromium/WebKit, including 16 objectives, no silent Canvas fallback and bounded drawing structures. A green desktop browser check does **not** prove iPhone Safari GPU performance, clear sightlines in all camera angles, enjoyable audio or genuine fun. No invented FPS or user satisfaction scores.

**Next highest-value action / acceptance gate:**
1. Confirm production Pages from final `main` commit and BUILD stamp; open in standalone iPhone Safari, not embedded ChatGPT browser.
2. In real mobile playtest, use 15–25 drones to visit **all three environments**, deliberately turn off the main road, locate at least one hidden objective per biome, inspect water/birds/landmarks, test first-tank landing and short-range discovery.
3. Record exact BUILD ID, device/iOS, a 20–30 second clip of steering/approach/impact and a 10–20 second clip for each biome. Evaluate **fun loop**, forest readability, obstacles/fair collisions, camera feel, sound comfort, heating and smoothness; identify top two frustrations.
4. Only after that evidence, iterate focused reversible enhancements: objective spacing/occlusion if search is too hard or too obvious; terrain/lighting/geometry if art is flat; adaptive resolution and foliage density if FPS/thermals fail; biome volume mix if sound is intrusive. Avoid uncontrolled additional modes before the gameplay passes owner testing.

## Implemented browser game

- [PR #85](https://github.com/statego2/War-Drone-Sim/pull/85): complete connected three-clearing forest level with **16 fictional empty military-style props** (5/5/6), wreck persistence, checkpoint spawns, replay, last-sector finish and local best drone count. No three-target reset or finite ammunition/lives.
- [PR #86](https://github.com/statego2/War-Drone-Sim/pull/86) and [#87](https://github.com/statego2/War-Drone-Sim/pull/87): six bounded moving props, swept vehicle/tree contacts, fair foliage hitboxes, next-objective direction, fast drone respawn, combos, dive points and saved best score. Scripted full-level Node integration checks.
- [PR #88](https://github.com/statego2/War-Drone-Sim/pull/88): subtle close-range goal glints (no targeting UI) with reduced-motion handling.
- [PR #89](https://github.com/statego2/War-Drone-Sim/pull/89): cached shared model geometries, per-tile instanced foliage frustum culling, bounded adaptive pixel ratio based on frame pacing. Tests measure algorithm, not actual phone FPS.
- [PR #90](https://github.com/statego2/War-Drone-Sim/pull/90): survive Safari app switch / pause during impact and WebGL context interruptions without losing progress.
- [PR #91](https://github.com/statego2/War-Drone-Sim/pull/91): quick redeploy (costs one drone, retains wrecks/points) and confirmed full restart in the pause overlay, no new in-flight touch controls.
- [PR #92](https://github.com/statego2/War-Drone-Sim/pull/92): first-frame, flight, pause, small 320×568 and maneuver screenshots in Chromium CI; touch/landscape assertions and larger pause control. [Main Chromium run](https://github.com/statego2/War-Drone-Sim/actions/runs/38282246202) succeeded.
- [PR #93](https://github.com/statego2/War-Drone-Sim/pull/93): **exact official MIT-licensed Three.js r180 local bundles**, removing external CDN dependency for WebGL boot; license and upstream provenance recorded. No promise of offline-first service worker support.
- [PR #94](https://github.com/statego2/War-Drone-Sim/pull/94): fixes a **real screenshot-discovered regression**: the first-flight thumb hint was accidentally positioned above and across the top sector/altitude HUD. Moves hint to root of game, below the play space and above the action deck; hides on launch/pause; asserts position in browser CI. Merged and production CI passed.

## P0 — 2026-10-12 iPhone regression and deployment root cause

- Owner sent a real iPhone screenshot of **FOREST RUN / BEST / 034 M**, definitively the `legacy-canvas.html` v0.1 page rather than the 16-target WebGL build.
- **Root cause established:** PR #93 moved Three.js r180 to local `vendor/` imports, but `.github/workflows/deploy-pages.yml` continued staging only `src/`, `index.html` and `legacy-canvas.html`. CI browser tested the repository root rather than the exact published `public/` output, masking the missing vendor files.
- Fix branch `fix/pages-vendor-three-boot-v11`: publish `vendor/` through shared verified `scripts/stage-pages.mjs`; run node regression tests and browser smoke against the exact `public/` artifact; avoid automatic `legacy-canvas.html` redirects on 3D errors and show a visible retry screen with opt-in legacy.
- **Acceptance:** Green Node and Chromium artifact tests; GitHub Pages deployment green; check actual public URLs for both Three.js modules and iPhone Safari. Do not declare iPhone acceptance from desktop CI alone.

## Owner iPhone playtest fixes — 2026-10-12 (main)

Owner reported the first tank was very difficult to hit, reversing sent the drone too high, turning around targets was too slow, descent/gravity felt underpowered, target readability was weak, vehicle silhouettes too boxy and three areas felt like a single road. Treat these as **real player feedback**, not green-test acceptance.

- [PR #97](https://github.com/statego2/War-Drone-Sim/pull/97) **merged**: stronger arcade yaw and lateral control, medium up for deliberate climbing vs full up for height-stable reversal, more decisive dive gravity. Added targeted 30/60FPS, diagonal/orbit/reverse tests. Old tests that expected full-up to climb uncontrollably were reconciled with the updated design.
- [PR #99](https://github.com/statego2/War-Drone-Sim/pull/99) **merged**: depth-tested red halo/outline cues around surviving fictional enemy vehicles in the active clearing. Scales with distance, hides on destruction, honors reduced-motion.
- [PR #101](https://github.com/statego2/War-Drone-Sim/pull/101) **merged**: wider 69-unit clearings, 16 targets arranged on both sides of road, meandering short dirt spurs, recognizable tank/APC/truck silhouette detailing. Original 5/5/6 sectors and fast retries preserved. Full logic/Chromium CI passed before merge.
- **Still NOT owner-approved on hardware**: how fast first tank can be hit; full reverse with little/no climb; 90–180° turn recovery; whether red halo clearly surrounds actual vehicle silhouette; visual quality/small-phone fps when tree lines and trail mesh render; sound satisfaction. Verify with the owner on the newest published SHA, then tune empirically. Do not promise realism or a fixed satisfaction percentage.
- **Next practical action:** test in standalone iPhone Safari (not ChatGPT in-app browser), capture 20–30 seconds showing first vehicle approach, full-right turnaround, full-up reverse and full-down dive, plus a view of the widened first clearing. Record build SHA and screenshot/video. If still blocked, prioritize flight/camera and objective visibility over more assets.

## 2026-10-12 — Owner gameplay feedback, implemented in v12–v16

- **Flight agility (#96, merged)**: faster arcade turnback, stronger lateral authority, deep-up gesture commands backwards travel while approximately holding height; intermediate-up retains climb, steep-down builds gravity-led dive. New 30/60 FPS, reverse-altitude and orbit tests. Real iPhone subjective responsiveness not yet validated.
- **Visible targets (#98, merged)**: bounded distance/sector-aware red mesh silhouette edges on intact vehicles. No real-world tracking/weapon control. Existing warm beacons remain. Visual readability on an actual phone remains to be judged.
- **Arena beyond one road (#102, merged)**: 6 forked forest side routes and 22 dirt staging/hub pads across the 3 connected clearings; still 16 vehicles and the original one-second respawn.
- **Visible build SHA (#105, merged)**: production `index.html` stamped by `scripts/stage-pages.mjs`; tiny always-visible BUILD identifier in screenshots prevents confusion with stale Safari cached builds. Test actual display on phone.
- **Military-style vehicle visual detail (#106, merged)**: 6 tanks get improved barrel, five APCs get dark visor/roof detail and 5 transports get windshield/grille/cargo roof. Browser smoke checks all 16 models.
- **New acceptance order:** confirm Pages deployment of latest main, play full route on actual iPhone using build stamp, evaluate one-finger turnaround/flat-height reverse/punchy dive, visibility and collision against first tank, aesthetics/sound at each site, and performance after many consecutive respawns. Record exact model/iOS/build and screenshot; iterate against concrete problems rather than claiming mobile acceptance from Chromium.

## 2026-10-12 — Follow-up production work v17–v22 (merged)

- **Impact fairness [#107](https://github.com/statego2/War-Drone-Sim/pull/107):** body-kind-specific forgiving ellipsoid gameplay collisions; full swept relative intersection handles high-speed crossings, while truly high/side passes remain misses.
- **Non-box vehicle models [#108](https://github.com/statego2/War-Drone-Sim/pull/108):** shared, faceted, low-poly sloped hulls on all 16 fictional tanks/carriers/trucks, with outward face-winding and actual GPU-model count tests.
- **Soft visual impact [#109](https://github.com/statego2/War-Drone-Sim/pull/109):** gentle procedural radial glow sprites instead of harsh polygonal explosion cores, warm rewards vs muted terrain misses; preserves original audio, sparks, shock and 0.98-second retry.
- **First target accessibility [#110](https://github.com/statego2/War-Drone-Sim/pull/110):** new 96-script deterministic test starting at the exact airborne spawn showed **1/96 successful simple swipes before tuning**. After lowering spawn 32→28 and slightly forgiving tank volume, **21/96** succeed (fastest 1.63 seconds versus 1.79). Test now requires at least 15 successes. This is repeatable simulation evidence, not proof the player's own gestures will feel intuitive.
- **Cross-browser QA [#111](https://github.com/statego2/War-Drone-Sim/pull/111):** independent desktop Linux WebKit portrait Three.js boot alongside Chromium; full 16-target scene, active GPU draw calls and authentic screenshot passed. Not physical iPhone Safari.
- **Screenshot-driven trail correction [#112](https://github.com/statego2/War-Drone-Sim/pull/112):** narrow grassy-dirt trails, smaller staging pads and transparent feathered 3D dirt vertices replace visually oversized opaque beige slabs. Both desktop Chromium and WebKit CI pass; screenshot demonstrates the actual change.

## 2026-10-19 — Forest Exploration & Art Direction v23–v33

**Player experience:** This is now a three-landscape forest **search → discovery → satisfying arcade collision → fast retry** loop, not a row of red highlighted targets on an empty main road. The old assumptions that every target is visible immediately or that each sector must be fully completed before travelling on are obsolete.

### Shipped and verified in code / browser regression
- [#113](https://github.com/statego2/War-Drone-Sim/pull/113): actual proximity/orientation/terrain discovery; initially no exact target GPS/halo; player earns precise cues only after seeing an object. Smaller safe tree pockets and thicker forest cover.
- [#114](https://github.com/statego2/War-Drone-Sim/pull/114): visually distinct Pine Shadows, Misty River, Amber Highlands biomes; transitional fog/lighting/sky, foliage species/colors, vegetation and rocks.
- [#115](https://github.com/statego2/War-Drone-Sim/pull/115): +35 point first vehicle discoveries, +75 optional camp exploration discoveries, pleasant non-alarm cues.
- [#116](https://github.com/statego2/War-Drone-Sim/pull/116): 3 natural 3D landmarks — fallen-log grove, spring, sandstone/rock arch.
- [#117](https://github.com/statego2/War-Drone-Sim/pull/117): airy wispy skies and consistent sRGB shader color for improved portrait readability.
- [#118](https://github.com/statego2/War-Drone-Sim/pull/118): authentic WebKit three-biome screenshot regression captures; all scenery remains procedural and locally hosted.
- [#119](https://github.com/statego2/War-Drone-Sim/pull/119): freely explore any forest biome without clearing earlier objectives; HUD and respawn use actual current area.
- [#123](https://github.com/statego2/War-Drone-Sim/pull/123): physical curved river and stone bridge through Misty River.
- [#125](https://github.com/statego2/War-Drone-Sim/pull/125): 15 non-tutorial fictional vehicles change position slightly each new run inside cleared pockets, deterministic tests verify 3D/collision alignment.
- [#128](https://github.com/statego2/War-Drone-Sim/pull/128): approximate SEARCH/FAINT TRACES/SIGNS NEARBY rather than false precision; scripted seeded non-linear full 16-target search-clear test.
- [#129](https://github.com/statego2/War-Drone-Sim/pull/129): one-time entry moments per landscape, boundary-hysteresis prevents sound spamming.
- Complementary merged landscape work from other development branches: realistic-looking stylized canopy occlusion for discoverability, visual foliage and birds, themed ambience and light fog banks, downward-focused chase-camera framing. Verify newest main commit and CI, not an old branch.

### Strict actual-device acceptance
1. Open **https://statego2.github.io/War-Drone-Sim/** directly in iPhone Safari, confirm the lower build hash matches current deployed main. The legacy Canvas page is never a successful test.
2. In one play session of 10–15 drones, find a target by actually exploring a side clearing; fly into and out of the Misty River and Amber Highlands; visit a landmark; reverse, turn around after overshooting, and make a fast nose-dive; destroy both fixed and moving props.
3. Observe whether the forest is visually appealing and *FUN*, especially search time, how discoverable hidden props feel, environmental variety, and whether an unspotted prop can appear unfairly invisible. Check sound pleasantness, temporary screen pauses, crashless respawns, Safari heat, FPS and layout after 10 minutes.
4. Before new content, prioritize exactly the top reproducible owner problem. Green CI proves technical correctness of exercised cases, **not** fun, visual approval, real iPhone thermals or human playability.

## 2026-10-19 — Additional production upgrades v32–v36

- [#130](https://github.com/statego2/War-Drone-Sim/pull/130): three deterministic sparse soft **mist-bank** treatments, most pronounced around the wetland; shared radial texture + instanced mesh, no new network assets. Node, desktop WebKit and Chromium checks passed.
- [#133](https://github.com/statego2/War-Drone-Sim/pull/133): **forest-first portrait chase camera** tips toward ground instead of wasting screen real estate on empty sky; adjusts with altitude, dive and reverse. Does not change one-finger flight physics, tests passed in Chromium and WebKit.
- [#134](https://github.com/statego2/War-Drone-Sim/pull/134): existing soft river ambiance now **varies with actual proximity to the fictional watercourse**, fades from the road or above the canopy. No new audio loops, no annoying constant motor oscillator.
- [#135](https://github.com/statego2/War-Drone-Sim/pull/135): **TREELINE SKIM / FOREST FLOW** bonuses reward intentional, low-fast maneuvering; capped to five per drone with distinct soft cue and no added control. Simulation tests reject passive cruise, hovering and exploit loops.
- [#136](https://github.com/statego2/War-Drone-Sim/pull/136): restrained GPU-only upper-canopy swaying, smoothly varied in three biomes and disabled by prefers-reduced-motion; shared shader uniforms rather than per-tree JS/extra draw calls. Node + Chromium + WebKit tests green.
- Do not infer subjective fun, actual iPhone heat or FPS from the above automated checks. The **highest remaining uncertainty** is genuine 10-minute owner playtesting in Safari, including whether searching for 15 hidden props is engaging vs frustrating.

## Quality and release truth

Desktop Chromium (software WebGL) automated checks and uploaded screenshots establish that a 3D forest, road, drone and UI render and the tested interactions execute. They **do not** establish iPhone Safari performance, 16-target human playability, fun, audio comfort, thermals, WebGL restoration on iOS, or the quality of collision feel.

## Next unblocked work / decisive acceptance blocker

1. Verify latest **main** GitHub Pages deployment and both browser engines (Chromium + desktop WebKit) on that exact SHA. Check the tiny in-game BUILD stamp; stale standalone bookmarks of legacy Canvas must never masquerade as the new game.
2. **Actual iPhone Safari owner playtest remains the decisive blocker.** Play 10–15 drones across three clearings; try the first tank, reverse at constant height, 90–180° turnaround, fast nose dive, diagonal chase, target contact vs missed trees, sound and automatic 0.98-second respawn. Record iPhone model/iOS, BUILD stamp, a 20–30s video or screenshots and temperature/FPS impressions.
3. Tune only issues reproducible from player evidence: target readability and camera feel first, then performance/thermal or sound if necessary. Keep all changes reversible and avoid premature extra game modes. Browser tests are a regression floor, not an invented phone satisfaction rating.

Only fictional arcade vehicles; no real-world targeting, hardware flight interfaces or real attack specifications.
