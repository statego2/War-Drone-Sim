# NEXT ACTION — War Drone Sim

**Updated 2026-10-19.** Canonical game: [mobile portrait browser build](https://statego2.github.io/War-Drone-Sim/). Source of truth: merged `main`; open PRs are not shipped until merge and Pages completes.

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

## Quality and release truth

Desktop Chromium (software WebGL) automated checks and uploaded screenshots establish that a 3D forest, road, drone and UI render and the tested interactions execute. They **do not** establish iPhone Safari performance, 16-target human playability, fun, audio comfort, thermals, WebGL restoration on iOS, or the quality of collision feel.

## Next unblocked work / decisive acceptance blocker

1. Verify latest **main** GitHub Pages deployment and both browser engines (Chromium + desktop WebKit) on that exact SHA. Check the tiny in-game BUILD stamp; stale standalone bookmarks of legacy Canvas must never masquerade as the new game.
2. **Actual iPhone Safari owner playtest remains the decisive blocker.** Play 10–15 drones across three clearings; try the first tank, reverse at constant height, 90–180° turnaround, fast nose dive, diagonal chase, target contact vs missed trees, sound and automatic 0.98-second respawn. Record iPhone model/iOS, BUILD stamp, a 20–30s video or screenshots and temperature/FPS impressions.
3. Tune only issues reproducible from player evidence: target readability and camera feel first, then performance/thermal or sound if necessary. Keep all changes reversible and avoid premature extra game modes. Browser tests are a regression floor, not an invented phone satisfaction rating.

Only fictional arcade vehicles; no real-world targeting, hardware flight interfaces or real attack specifications.
