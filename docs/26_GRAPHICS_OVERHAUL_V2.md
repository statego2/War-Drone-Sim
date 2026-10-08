# Graphics Overhaul 2.0 — Technical Art & Rendering Plan

**Status:** PROPOSED DESIGN; zero runtime changes in this PR.  
**Baseline:** `main` commit `57a5d62a4cff83919f90bac2efaafbb130cba33f` (2026-10-08), Forest Encounter v0.8.  
**Primary platform:** GitHub Pages → portrait mobile browser / iPhone Safari.  
**Ownership:** art direction and feature costs await owner playtest approval.  
**North star:** A beautiful, fast, readable fictional forest encounter with convincing scale, unmistakable vehicle silhouettes, spectacular short impact payoffs, and immediate respawn. No real-world drone targeting or tactical fidelity.

## 1. Source-backed audit: what exists today

This is a **static code audit**, not a visual iPhone/device benchmark. The project's latest CI desktop Chromium browser smoke passed, and generated an image artifact; no on-device framerate, GPU time, thermal reading, screenshot approval, or measured art-readability result has been provided.

| Layer | Implemented in source | Limitation / graphics debt | Files |
|---|---|---|---|
| Renderer | Three.js 0.180.0, WebGL, sRGB, ACES exposure 1.27, hardware antialias and adaptive DPR | No renderer instrument panel or documented device performance; adaptive DPR uses smoothed main-loop frame interval (not GPU timing) | `src/game3d.mjs` 1-28, 716-732 |
| Lighting | One hemisphere and one directional light | No active renderer shadow map; vegetation uses translucent radial decals as contact shadows; standard materials have no dedicated environment lighting | `src/game3d.mjs` 29-32, 108-118, 275-277 |
| Atmosphere | Sky-gradient ShaderMaterial and sun disk, 27 cloud sprites, global distance fog | No near/mid/far atmosphere art direction; simplified horizon; sprite transparency and horizon value can obscure gameplay | `src/game3d.mjs` 35-45, 700-704; `src/atmosphere3d.mjs` |
| Terrain | Seeded height field, per-vertex colors, a generated texture, terrain tiles, farLand mesh | Tile texture is grain rather than authored ground material; ground/road transitions, repeated palette, procedural tile updates can look artificial and spike frame time | `src/game3d.mjs` 48-74, 131-169, 417-450 |
| Vegetation | Instanced layered conifers, broadleaf clusters, trunks, rocks, grass/flower instances | Shapes repeat; crown shading is basic; all main forest and decorative instanced batches force `frustumCulled=false`, rendering unseen tile groups; layered alpha decals can add overdraw | `src/game3d.mjs` 79-120, 198-267; `src/scenery3d.mjs` |
| Environment | Road strips, roadside posts, sparse cabins, creek/lake, 25 streamed 320m tiles (9 near-detail) | Not authored around a coherent three-vehicle encounter, with potentially inconsistent style and no consistent ground contact | `src/game3d.mjs` 175-196, 349-415; `src/scenery3d.mjs` |
| Vehicles | Three fixed, individually colored, box/cylinder game vehicles and static wreck substitutes | Very simple silhouette, no purposeful surface breakup, weak material response, no modeled damage progression | `src/game3d.mjs` 269-348; `src/encounter.mjs` |
| Drone | Procedural quadcopter with rotor animation, camera lens, LEDs, chase/FPV camera | Hard-edged assembly shapes and no coherent hierarchy of near-view surface detail; near-character polish has disproportionate aesthetic return | `src/game3d.mjs` 451-489, 615-644 |
| Hit VFX | One expanding emissive-looking mesh, 14 individual sparks, blocky wreck, one swaying smoke mesh, ~0.98s retry | Lacks layered impact progression, dust/ring/debris/smoke; impact may be visually small compared with flight speed | `src/game3d.mjs` 281-331, 573-588, 670-692 |
| Interface | Full-height overlay, HUD/speed/altitude, muted glass toolbar, pause/home, safe-area support | Text has accumulated version/debug clutter; controls + labels can compete with the target within portrait; no controlled visual-hierarchy system | `index.html`, `src/style3d.css`, `src/style.css` |
| Production | GitHub Pages and desktop smoke with screenshot artifact | No deterministic screenshot storyboard/golden shots, on-device quality tiers, asset validation or performance regression gate | `tests/browser-smoke.mjs`, `.github/workflows/browser-checks.yml` |

**Encounter reality:** three fictional, empty and currently *stationary* vehicles are at z=235/277/319 in `src/encounter.mjs`; respawns start near z=55–89 at 32–37m above local terrain in `spawnDrone`. At normal ~56m/s, the first reveal is a matter of seconds. Graphics must create recognition and contrast early; rendering detail that delays spotting is counterproductive.

## 2. Art direction: Cinematic Stylized Realism

**Not** photo-realistic hardware training footage; **not** generic bright low-poly toy art. Aim for a premium authored 3D arcade forest:

- **Silhouette first:** recognisable sturdy pines and deciduous trees; unmistakable fictional SUV/van/utility-vehicle silhouettes; visible broken shapes after contact.
- **Lighting:** warm late-afternoon sun, cooler blue-green indirect fill, desaturated distant hills, precise warm rim accents around interactable assets. Ground feels physically occupied.
- **Palette (starting values, not sign-off):** deep fir `#244437`, moss `#526747`, olive grass `#84936E`, warm dry ground `#8F8067`, mist blue `#AABAC0`, sun gold `#F5C98A`, warm impact `#FFB25F`, charcoal wreck `#2B302F`. Target paint must be distinguishable by silhouette/contrast, not red/green alone.
- **Readability:** targets are readable without outlines or target-lock overlays; leave a clean clearing 20–35m around the encounter, preserve 1-2 framed reveal angles, ensure control chrome avoids lower-centre target area.
- **One coherent material language:** muted rough paints, lightly faceted foliage, asymmetric natural shapes, authored rock/soil patches, soft contact shadows.
- **Motion is part of the visual identity:** close-tree parallax, coherent prop blur, modest speed cues at FAST, subtle wind and camera inertia, never smear the target in a steep dive.
- **Impact reward:** a fast, luminous, chunky stylized shock + debris + dust + smoke/wreck, with visual separation between successful vehicle contact and ground failure.

**Reference imagery:** Firewatch forest atmosphere / Two Falls painterly woodland are *lighting and depth references only*, not assets, not a proposed engine change. These are targets for broad visual qualities, not promises of their level of rendering fidelity on mobile WebGL.

## 3. Define three cinematic zones within the actual encounter

Instead of adding foliage everywhere uniformly, author density and composition around the existing coordinates without altering collision rules:

1. **Spawn / acceleration, z=55–150:** varied foreground trunks, moving shadows, gently revealed road direction, small patches of sky, identifiable drone shell. Do not obscure initial navigation.
2. **Approach / visual reveal, z=150–225:** foliage creates a widening V-shaped view toward clearing, darker foreground framing against luminous road/target-background; 2–3 tree silhouettes that exaggerate speed parallax.
3. **Clearing / contact, z=225–345:** lower clutter directly behind target silhouettes; grounded tire shadows, environmental storytelling (road dirt edges, tire marks, gravel and a few props) without fake tactical signage; visibility remains good during a sudden nose dive.

Assets outside the primary encounter may remain procedural/low detail; invest production cost in what the portrait camera actually sees. Scene composition should allow divergent steering, not force an invisible corridor.

## 4. Proposed modular rendering design

Keep Three.js and the current physics/encounter models; isolate graphics progressively instead of a giant rewrite.

```text
src/game3d.mjs                        game-loop orchestration and integration only
src/render/quality.mjs                LOW/MED/HIGH config + device-safe DPR governor
src/render/metrics.mjs                perf overlay and deterministic shot capture
src/render/artPalette.mjs             centralized color/material family presets
src/render/worldDirector.mjs          set-dressing zones + lighting/atmosphere
src/render/terrainRenderer.mjs        existing mesh tiles, road/ground blending
src/render/foliageRenderer.mjs        instance packing, LOD, wind/culling
src/render/assetRegistry.mjs          validated GLB/texture loading and fallbacks
src/render/vehicleRenderer.mjs        vehicle & wreck appearance, damage states
src/render/droneRenderer.mjs          chase model appearance and prop blur
src/render/impactVfx.mjs              pooled one-event impact timeline
src/render/screenEffects.mjs          tiered color/post effects and motion options
src/render/uiTheme.css                reusable HUD/home/result appearance
assets/                                only reviewed, redistributable art
```

Interfaces: `world.update(flight,dt)`, `vehicles.sync(encounter)`, `vfx.emit({type,id,position,seed})`, `quality.apply(preset)`, `metrics.sample(renderer,timestamp)`. Graphics do **not** mutate the encounter state, flight physics, hit registration or spawn logic. Random decorative elements are seeded and deterministic for screenshot comparisons.

**Implementation constraint:** the current page imports Three.js from a fixed jsDelivr version. GLTFLoader/KTX2Loader addons must resolve their imports against exactly the same Three.js version using a tested import map or a small bundling step. Avoid mixing CDN versions. Do not introduce a framework/engine migration as part of art polish.

## 5. Lighting, sky, weather and grading

1. Preserve ACES/sRGB foundation; centralize exposure and hue parameters into two scene palettes (sunny and hazy) but ship one approved default.
2. Retune hemisphere/directional intensities by looking at screenshots, rather than stacking extra real lights. Mark simple hero objects for better local specular/roughness response.
3. Add distant blue/neutral aerial perspective, coherent sky-fog blending, softened horizon; no dense opaque fog near the target.
4. Contact shadow strategy: **LOW** existing simplified blob under hero objects only; **MED** tuned projected/painted terrain shading + carefully bounded contact shadows; **HIGH** test one small (512–1024) near-field directional shadow map *only if measured feasible*. Avoid global tree shadows over kilometre-scale bounds.
5. High tier optional cheap warm sun glints / screen overlay on sparse reveals; do not ship real volumetric ray marching as an MVP requirement.
6. Bloom: start with a cheap selective emissive halo for the explosion and reflective glints; benchmark before adding full-screen multi-pass bloom, SSAO or motion blur. No permanent lens bloom that crushes small targets.

## 6. Forest, terrain and vegetation production

- Replace a subset of close tree prototypes with **3–5 consistent art-directed varieties** (2 fir/conifer, 1 broadleaf, 1 small/young tree, optional broken trunk). Keep procedural trunk+foliage as fallbacks, but don't indiscriminately populate every tile with expensive new meshes.
- Build LOD based on distance and projected silhouette: 0–90m hero tree (geometry readable at close fly-bys), 90–250m simplified silhouette, beyond 250m cheap impostor/simplified geometry as validated. **These are tuning starting points, not engine facts.**
- Continue instancing for geometry/material families, grouped in smaller spatial cells (e.g. 80–160m) instead of blanket false frustum culling for every 320m tile. Compute/update instance bounding sphere and test `frustumCulled=true`, then measure; Three.js `InstancedMesh` supports this mechanism.
- Reduce transparent grass/card overdraw by distance/quality tier. Favor opaque meshes on nearby features and vertex-color/texture patches on distant ground.
- Add restrained foliage wind through compatible vertex shader/instance phase *only if no costly CPU per-leaf updates*. Wind should not change obstacle physics.
- Terrain needs coherent macro color variation, ground-rock transitions, brighter road shoulders, tire-worn gravel and road edge blending. Use packed atlas / one few-material family rather than multiple full-resolution textures for every repeated prop.
- Avoid tile-transition hitching: schedule/pool construction over frames where possible, cache repeat geometries/materials, avoid allocating `Color` thousands of times for repeated recoloring, and retain correct disposal ownership for per-tile geometries.
- Keep existing farLand and fixed lake optional. Visual zoning must take priority over arbitrary extra cabins/streams that distract from the main loop.

## 7. Vehicle and drone asset pipeline

**Vehicles:** three visibly different *fictional* vehicle designs (compact utility, heavy van, rugged transporter silhouette); avoid real-brand markings. Use Blender original assets or appropriately licensed CC0 prototypes. Preserve the existing `encounter.vehicles` coordinates and hit-volume contract while replacing the meshes. Optimize for view from above and oblique sides; recognizable roofline, hood, wheel arches, lights and material breakups matter more than hidden mechanical details.

- Target starting geometric budgets: **~1k–4k triangles per nearby vehicle**, about 1–2 main material families, 512/1024 textures if genuinely beneficial; revise after profiling/screenshot.
- Destruction representation: intact → charred bent frame with one displaced roof/wheel component + localized ember → settled smoking wreck. Not rigid-body fracture or true-world physics; maintain one deterministic destroyed state.
- Ensure the prop's visible mesh and scoring volume remain visually aligned at dive speeds.
- Require a 390×844 screenshot proof that all three targets stand out before investing in high-detail texture work.

**Drone:** retopologize/style existing hull, consistent bevels/normal response, better visible rotor hubs/camera pod, subtle surface accents, physically coherent prop motion blur that does not fill the bottom third of the phone. Separate chase visual from FPV (which hides the drone). LOD after camera motion and priority shots are fixed.

**Asset ingestion:** `GLB/glTF 2.0` preferred; import through official Three.js `GLTFLoader`. Test Meshopt compression and KTX2/Basis texture compression with version-pinned decoders. Do not ship entire third-party asset packs; build a selective converted subset. Maintain manifest with original URL, author, license, asset version, original filename, provenance, optimized size, and conversion script. No paid source pack in public repository.

**Candidate sources (license independently verified before committing bytes):**
- Quaternius Ultimate Stylized Nature Pack (63 models, CC0, glTF): https://quaternius.com/packs/ultimatestylizednature.html
- Quaternius Stylized Nature MegaKit (116 advertised models, CC0, glTF; free version is a subset): https://quaternius.com/packs/stylizednaturemegakit.html
- Kenney Car Kit (45 files, CC0): https://kenney.nl/assets/car-kit
Reference source pages are not a claim that those models are already inside the repo.

## 8. Impact visual timeline and GPU-safe implementation

One `vehicle` event drives exactly one pooled effect. Preserve the current ~0.98s retry; do not add a modal menu or delay to admire an effect. Initial hypothesis:

| Relative time | Art direction | GPU/CPU mechanism |
|---|---|---|
| 0–50 ms | clear contact spark + brief emissive flash; strong scale cue | single additive/unlit mesh; capped opacity; no full-screen blinding flash |
| 50–180 ms | readable expanding warm core + shock ring; contrasting dark fragments | pooled meshes / limited instance batches; ring billboard faces camera |
| 180–450 ms | 8–16 stylized pieces, dust bloom, short ember tails | 1–3 batched effects; deterministic trajectories; no full-scene real physics |
| 450–800 ms | smoky depth, dark vehicle wreck remains; small warm embers | layered sparse opaque/translucent cards; no repeated mesh creation |
| 800–980 ms | camera and exposure recover, drone respawns at known height | uninterrupted world render, new drone after same existing result window |
| Post-contact | persistent wreck and fading smoke, two others still distinct | entity state drives appearance; pooled residual FX |

For ground contact use a deliberately different muted dust/thump cue; never reward a miss with an identical giant explosion. Subtle camera kick and time scaling are optional; reduced-motion settings must disable screen shakes. Add effect budget guards (max particles, lifespan, active emitters, draw calls). Sound timing is a separate integration concern.

## 9. Portrait HUD, landing and feedback design

- Landing: live forest background, large title without blocking the vehicle reveal; one obvious `BEGIN` action; no debug/version text as the primary visual focus. Keep the 3D scene alive behind a gradient rather than a flat opaque menu.
- In flight: keep visible only completed count and minimal speed/altitude if they contribute to feel; place pause/sound/camera controls at safe edges. Smaller labels and calm glass material. Keep aiming/steering area unobstructed; avoid military targeting reticles.
- During impact: temporary event text with clean hierarchy, visual explosion is the star; no persistent stacked banners.
- On respawn: no menu transition, maintain temporal continuity. Full three-target completion can have a short non-modal reward.
- CSS: tokenized typographic scale, 44px approximate comfortable touch targets where practical, `env(safe-area-inset-*)`, dynamic viewport and narrow-phone checks, reduced motion, high-contrast fallback.

## 10. Mobile graphics quality matrix — PROPOSED

| Feature | LOW / constrained phone | MID / primary | HIGH / optional |
|---|---|---|---|
| DPR (adaptive) | 1.0–1.15 | 1.15–1.5 | up to 1.75 if profiled |
| Nearby forest density | 40–55% baseline | 70–85% | 100% if budget allows |
| Near/mid LOD | aggressive | 2 LOD steps | 3 LOD steps/longer hero range |
| Tree/hero contact | simple projected blob | controlled contact | small shadow map experiment |
| Grass/flowers | ground patches | selective instancing | increased detail near camera |
| Smoke/sparks | few opaque shapes | pooled 2–3 depth layers | richer but bounded |
| Post-processing | none | selective flash/glow only | optional one lightweight pass |
| VFX frame budget | prioritize frame stability | 1 impact at a time | slightly more chunks |

The table is a configuration experiment, **not measured device capacity**. Target 60fps on a supported mid/high phone, stable 30fps fallback. 60fps gives 16.7ms/frame; 30fps gives 33.3ms/frame. Quantitative thresholds below are acceptance targets to test and revise, not promises.

## 11. Telemetry and acceptance evidence

Enable diagnostics through `?perf=1` in dev/test builds only; no external analytics and no personally identifying information:

- `renderer.info.render.calls`, `triangles`, `renderer.info.memory.geometries/textures`, frame avg / median / p95, stutters, tile-build counts, DPR, visual quality preset, JS-side construction time. Use compatible info fields for the pinned WebGLRenderer version; do not mix legacy WebGLRenderer APIs with WebGPURenderer docs.
- Optional `EXT_disjoint_timer_query_webgl2` GPU timing where supported; otherwise report *GPU time unavailable*, not fabricated numbers.
- Capture deterministic **390×844** desktop screenshots of spawn, approach, first target closeup, impact frame, settled wreck, immediately respawned scene, and completed 3/3 state. Add 320×568 and 430×932 layouts.
- Record 10–15 minute actual iPhone Safari sessions: FPS/frame pacing, thermal throttling, battery comfort, iOS browser pause/background, visible clipping, WebGL context loss, target recognition and scene transitions. Desktop CI is a smoke test only.
- Candidate pass: no blank/pink materials, no missing GLB, no terrain pop under the drone, no more than one visible contact result, no target fully concealed by foreground foliage when approaching from default start.
- **Gameplay readability check:** ask testers to identify the next intact vehicle at first reveal and distinguish a wreck from an intact vehicle in one glance; log subjective results and their screenshots. A pretty shot that hides targets is a fail.
- **Visual comparison:** same camera/seed/exposure between baseline and candidate; owner reviews before making a global art change.

## 12. Implementation work packages and dependencies

All estimates are *rough focused engineering + art hours* until one representative slice is timed. Only create further issues for real unblocked implementation; existing issue map below should be reused to avoid duplication.

| WP | Order | Work item and code touchpoints | Deliverable / acceptance | Est. |
|---|---|---|---|---|
| GFX-00 | 1 | Baseline diagnostics; `src/render/metrics.mjs`, browser screenshots, quality hooks | reliable baseline gallery; actual draw calls, triangle count, DPR & p95 on desktop; device run TODO clearly flagged | 4–7h |
| GFX-01 | 2 | Art palette + deterministic cinematic zone layout and storyboard | approved 6-shot art board and screenshot composition around z=55–345 | 4–6h |
| GFX-02 | 3 | Extract renderer modules incrementally and split `game3d.mjs` responsibilities | no flight/encounter regression, fallback preserved | 6–10h |
| GFX-03 | 4 | Sky, indirect light, fog, grading, grounded props | visibly unified dawn/golden-hour lighting, no unreadable target silhouette | 5–9h |
| GFX-04 | 5 | Vegetation 3–5 varieties, scene zones, cell-wise culling/LOD, route ground texture | before/after screenshots, lower or stable main-thread/GPU cost vs unoptimized variants | 12–20h |
| GFX-05 | 6 | Three readable GLB fictional vehicles + destroyed variants, asset/license registry | all three instantly distinguishable, no gameplay hit-volume change | 8–14h |
| GFX-06 | 7 | Drone shell, rotor readability, chase/FPV presentation | camera visibility and high-speed readability pass | 4–7h |
| GFX-07 | 8 | Pooled layered impact, scorch/wreck persistence, ground miss cue | dramatic but <0.98s event; no new GC bursts in effect loop | 8–14h |
| GFX-08 | 9 | HUD/landing/result visual refinement, portrait accessibility | touch safe and unobscured flight, pause/mute unaffected | 5–8h |
| GFX-09 | 10 | Quality tiers, tile scheduling, resource cleanup, device soak and screenshot regression | phone stable, 30fps fallback, memory settles after repeated runs; record measured evidence | 8–14h |

**Total planning range: ~64–109 focused hours**, exclusive of third-party art production if custom assets cannot be sourced and revised quickly. Work is staged behind phone evidence; this is not a delivery deadline. The original Unity-first ~330-hour schedule is obsolete for this WebGL implementation.

**Existing task/issue mapping:** T-020 #20 asset sourcing, T-021 #21 forest assembly, T-022 #22 road/vehicles, T-023 #23 portrait target reveal, T-024 #24 chase camera, T-025 #25 device profiling, T-026 #26 impact graphics, T-027 #27 home/result, T-028 #28 device regression, T-029 #55 signoff, T-052 #51 asset policy, T-053 #52 graphics tier presets.

## 13. Release gates and rollback

- **Gate A — measure before beauty:** record existing v0.8 screenshots, draw calls, p95 frame duration and initial phone feedback; don't blame GPU without evidence.
- **Gate B — visual vertical slice:** one representative 20–30s flight sequence with new light/forest, one final vehicle style and one finished impact. Owner chooses between the old and new visual language. Changes reversible through focused PR branches.
- **Gate C — complete encounter:** three differentiated vehicles + two remaining wrecks + clear scene after respawn; every existing deterministic model test passes.
- **Gate D — mobile proof:** iPhone Safari with recorded screenshot/video, performance, accessibility, and crash checks. Disable premium effects/tier rather than trading away control responsiveness.
- **Gate E — public rollout:** no unverified rights, CDN/asset 404, new runtime console errors or performance regression. Deploy through existing GitHub Actions, retain rollback to last known stable main.

## 14. Deliberate non-goals and risk mitigation

Do **not** rewrite in Unity, move to native packaging, add physically modeled vehicle fragmentation, add real-world drone/munition physics, photogrammetric terrain, ray tracing, complex weather simulation, extensive bloom/SSAO, realistic military targeting HUD, or a cinematic camera that steals control. Avoid paying for giant packs before verifying one representative asset and the phone budget.

Biggest risks: (1) style fragmentation from multiple CC0 sources → rematerialize and curate a shared palette, (2) transparent overdraw in grass/smoke → selective layers and quality presets, (3) tile stutter / geometry churn → chunk culling and background-friendly generation, (4) WebGL shader compatibility → compile fallback and desktop/mobile checks, (5) effects hiding hit feedback → visual hierarchy and short event limits, (6) too much polish before fun is proven → finish Gate B before mass asset import.

## 15. Single next action

**Start GFX-00 and GFX-01 together:** capture a v0.8 deterministic before-gallery in three gameplay states and show performance counters; art-direct one specific clearing reveal and impact with cheap procedural changes. Review its portrait screenshot on a real iPhone before any full forest replacement.

### Verified external documentation (research, not imported assets)

- Three.js InstancedMesh: https://threejs.org/docs/pages/InstancedMesh.html
- Three.js WebGLRenderer metrics/options: https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js KTX2Loader: https://threejs.org/docs/pages/KTX2Loader.html
- Quaternius Stylized Nature / MegaKit / Kenney Car Kit publisher pages as listed above.

### Review truthfulness

No new assets, shader code, screenshots, performance measurements or graphics runtime improvements are implemented by this document. It specifies **what to build and how to verify it**.
