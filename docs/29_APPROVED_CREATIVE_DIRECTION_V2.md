# War Drone Sim — Creative Direction 2.0 (APPROVED)

**Owner decision:** 2026-10-08 · **Status:** ART DIRECTION APPROVED / IMPLEMENTATION NOT YET ACCEPTED · **Platform:** portrait iPhone-first Three.js/WebGL browser game.  
**Official creative north star:** **Beauty in flight. Precision in motion. Spectacle in impact.**  
**Experience contract:** One-finger fast flight → see and choose among 3 fictional empty vehicle silhouettes → satisfying brief non-graphic impact → automatic controllable drone in approximately one second. **No new mode, simulator dashboard, tactical targeting, or gameplay rewrite.**

## 1. Decision and ownership

The owner approves **Premium Cinematic Arcade**, with a conceptual mix of 70% cinematic forest, 20% tactical minimalism in UI, 10% satisfying stylized arcade feedback. Percentages are a design metaphor, **not numerical rendering requirements**. Avoid copying Apple's branding or any third-party artwork.

This is the **single approved creative direction** for the shipped web-first game, including landing/home, forest, drone/vehicle design, HUD, cinematic impact, pause, restart, micro-interactions, typography and color.

- [docs/27_GAMEPLAY_FOCUS_PLAN.md](27_GAMEPLAY_FOCUS_PLAN.md) remains the **sole gameplay sequencing authority** (GP-00…GP-06). Visual tasks follow and support GP acceptance, not compete with it.
- [PR #66](https://github.com/statego2/War-Drone-Sim/pull/66) / its graphics-overhaul proposal is **technical research and optional implementation annex**, **not a second authoritative creative direction**; reconcile its branch with this approval before merging. Its design-only proposal is not proof of improved graphics.
- [docs/12_VISUAL_AUDIO_DIRECTION.md](12_VISUAL_AUDIO_DIRECTION.md) retains common audio/VFX/accessibility rules; this document is authoritative for approved visual identity and delivery prioritization.
- [NEXT_ACTION.md](../NEXT_ACTION.md) remains the factual main-build handoff. Do not mark CD tasks complete before actual source changes and acceptance checks.

## 2. Brand and art language

**Scene character:** calm, beautiful golden-hour pine forest, dappled natural sunlight, atmospheric blue/neutral aerial perspective, restrained warm highlights, carefully staged foreground trees and reveal clearing. The scene must look attractive **at play speed**, not merely as a still. Clean stylized realism; retain coherent, economical geometry for mobile.

**Palette tokens (starting values, approved identity / tunable in screenshots):**

| Token | Hex | Purpose |
|---|---|---|
| Deep Forest | #172B27 | UI backgrounds, shadow gradients, pause |
| Moss | #526D57 | tree/terrain family, quiet secondary surfaces |
| Soft Ivory | #F1EEE3 | readable headlines, main action surfaces |
| Golden Hour | #E4BB82 | sun warmth, small premium highlights |
| Ember | #FA874E | brief contact/reward accents |

**Vehicle-only color/material family (owner approved 2026-10-08):** olive/military green, dark forest green, khaki and subdued dusty brown; matte painted armor/cargo panels with restrained wear, dust and subtle metal variation. These are distinct from the general UI palette. Avoid shiny civilian paint; all three objects should read as a coherent fictional military-style group at speed and from above.

Do not tint the entire world with CSS tokens: terrain/sun/sky materials may vary realistically, subject to scene coherence and target readability. Limit saturation, avoid neon greens, heavy red HUD, military targeting reticles and noisy gradients. Contrast and silhouette beat color alone; verify low-brightness visibility and color-vision accessibility.

**Typography:** one expressive heavyweight compact uppercase display face/system-safe fallback for WAR DRONE SIM; one legible restrained sans-serif for actions, readable data and hints. Establish font-scale, tracking, weights and contrast tokens in CSS. No decorative tiny labels as essential instructions. Avoid large web font downloads or unlicensed typefaces.

**Motion:** crisp input response; visually coherent banking, speed parallax and camera smoothing. Motion must improve perceived flight and cannot obscure steering or physically change flight/contact semantics. Honor reduced-motion accessibility.

## 3. Signature moments / actual screen specifications

### A — Launch / Home (highest first-impression priority)
- Live WebGL forest fills the full portrait screen. Slow cinematic ambient camera drift *only while at home*; graceful fallback to static rendered frame when performance/reduced-motion requires it.
- Strong typographic WAR DRONE SIM title with warm ivory/gold accent, **one clear primary action: FLY**. At most one quiet line of flavor text.
- **Remove** lengthy marketing paragraph, permanent multi-line control instructions, dev version number and excessive label chrome from visual hierarchy. Technical build/version can live in a small About/debug area.
- Optional top-edge sound control should be discreet and accessible. Essential runtime setup cannot be hidden or unintelligible.
- On FLY: a short visually continuous camera move into the actual chase starting view, input-ready without extended interstitial/loading. Audio unlock on genuine tap as browsers require; never promise autoplay.
- Layout respects iPhone notch and home safe area, narrow screens, large text, right/left-hand touch tests, graceful loading/error/no-WebGL fallback. Main button ideally ≥44×44 CSS px in touch area.

### B — Flight / HUD
- Priority hierarchy: (1) unobstructed forest and visible 3 target options, (2) craft/trajectory, (3) subtle progress; interface should visually recede.
- Replace big "0/3 VEHICLES" presentation with **three small but distinguishable progress indicators** and accessible count text. Keep status comprehensible independently of color.
- Speed is **optional** as a quiet small display **only if it improves game feel**. Altitude and vertical speed are off in default minimal HUD; available in an optional expanded telemetry/debug view.
- FPV/camera and sound toggles live in accessible pause/settings by default. **Do not remove or bury an action required during the encounter**: test whether FAST/CRUISE requires an immediate control or whether fun-fast default is preferable. Preserve existing controls until validated replacement.
- Show steering help contextually on first flight, then fade. Preserve accessible way to rediscover controls. Never add fake military locks/aim assist UI.
- Pause stays reachable, clearly identified, and does not block camera center. Use consistent ivory/forest materials with translucency sufficient for content to remain visible.

### C — Forest / Gameplay staging
- Author one **representative** route and 3-vehicle clearing before attempting global asset overhaul.
- Compose spawn, acceleration, V-shaped reveal and luminous clearing; near-tree parallax communicates speed. Frame vehicles against lower-clutter ground so they remain distinguishable in downward dives.
- Keep seeded world generation/instancing; selectively art-direct hero trees, road shoulder/material transitions and ground contact shadows only where visible.
- **Owner-approved target vehicle art clarification (2026-10-08): not generic civilian cars.** Create three distinct **fictional, unoccupied, military-style game target silhouettes**:
  1. **Tank-style** — compact low heavy tracked hull, broad readable turret shape (visual silhouette only, no functional systems).
  2. **Armored personnel carrier (APC) / military carrier-style** — taller, blocky armored transport volume with distinctive broad roof and rugged wheel/track profile.
  3. **Military transport truck** — longer cargo/logistics silhouette, recognizable separate cab and large rear cargo body.
- All three use matte olive/military green, khaki and dusty dark-green variations, visibly military in *style* but not replicas of identifiable real-world models. No real flags/insignia, specific weapon mechanics, occupants, authentic armor stats, targeting behavior or operational details. Prioritize top-down/oblique recognition in fast portrait gameplay and make the three wreck variants as visually distinct as the intact targets.
- Preserve the current encounter state machine, 3-target count, collision volumes and hit/respawn semantics unless the independent gameplay plan approves an explicit change. These are purely fictional, non-graphic arcade props.
- Drone is a cohesive "hero product" silhouette: graphite industrial design, subtle warm accents, readable camera pod and animated rotors. Do not pay triangle or texture costs for invisible details.

### D — Impact / Reward
- Choreograph existing impact/audio implementations rather than replacing functional collision code.
- Proposed timing landmarks, **to tune in live playtest rather than fixed release requirements**:
  - ~0–80 ms: clear contact flash / audio transient;
  - ~80–220 ms: brief luminous shock pulse;
  - ~220–500 ms: debris/embers/dust separation and clear intact→wreck transition;
  - ~500–900 ms: settling smoke and camera handoff.
- Success visually distinct from ground miss; avoid huge opaque orange screen fill, graphic damage, duplicate triggers, flashing discomfort, loud repetitive harsh buzz or hard audio clipping. Options to reduce shake, flashes and haptics.
- No forced animation that delays the established approximately 1-second auto-respawn. Impact VFX must not hijack control or reclassify hits.

### E — Pause / Completion / Respawn / Micro-UX
- Pause: attractive translucent overlay over the living forest; one dominant RESUME action; small accessible Settings / Sound / Restart. Maintain the state without accidental motion.
- Target contact: brief reward; immediate controllable next drone; **no result modal after each hit**. After 3/3, a **very short non-modal completion beat** is allowed only if it keeps the loop flowing.
- One motion and sound language across interactions, including focus states, press response, loading/fallback, icon/manifest, error paths and 3D-to-UI transitions.
- Avoid unlock menus, XP economy, rankings, progression systems or mandatory tutorials in this art pass.

## 4. Work packages and dependencies — small reversible vertical slices

Tasks start **NOT IMPLEMENTED**. Work on a focused branch and PR per slice; do not bundle art redesign with flight physics changes. Prefer **one implementation PR at a time** touching shared runtime files; the independent art planning can overlap GP work.

| ID | Priority | Deliverable / likely files | Dependencies and order | Acceptance / rollback |
|---|---|---|---|---|
| CD-00 | P0 / evidence | Capture current live portrait home, flight, reveal, vehicle contact, pause, 3/3 and no-WebGL states; record main SHA and target phone | GP-00; if phone unavailable, desktop screenshot baselines explicitly marked provisional | 390×844 plus actual iPhone proof, clear baseline comparisons; no claim of performance measured when missing |
| CD-01 | P0 / foundations | Centralize CSS color, typography, safe-area and animation tokens; CSS component inventory (src/style.css, src/style3d.css) | CD-00 provisional screenshots | Stable contrast/accessibility, no affected input or legacy fallback |
| CD-02 | P0 / first impression | Premium live-forest launch/home, minimal copy, FLY CTA and seamless camera handoff (index.html, CSS, game3d) | CD-01; GP stability | Player can start within one tap; iPhone landscape/safe areas/back/refresh/audio unaffected; compare A/B screenshot |
| CD-03 | P0 / clarity | Minimal HUD, dots 0/3, first-flight hint, pause/settings migration for secondary toggles (index.html, CSS, game3d) | CD-01, GP-00 and GP-01 controls test | All essential controls reachable; FAST cannot be silently removed; screen readability improves at dive; no HUD desync |
| CD-04 | P0 / signature world | Hand-authored spawn→reveal→three-vehicle clearing composition, art-directed near trees, readable target contrast (src/game3d, scenery3d, optional render modules) | CD-00, GP-03 needs | At speed all three fictional objects recognizable; no change to hitboxes, collision, spawn or fairness without GP owner review |
| CD-05 | P1 / atmosphere | Golden-hour lighting, sky/fog coherence, terrain/road palette, restrained quality settings | CD-04 screenshot baseline | Consistent look, no washed-out target, smooth mobile frametime; low-tier visual fallback |
| CD-06 | P1 / silhouettes | Polished hero drone plus **three fictional military-style target models**: tracked tank silhouette, armored carrier/APC silhouette and cargo transport truck silhouette; olive/khaki matte materials and individually recognizable wrecks; original/CC0 provenance | CD-04, performance budget | All 3 clearly read as distinct military-style vehicles from above/in portrait at high speed; contrasts survive sunlight, meshes fit existing hitboxes/swept contact model and no new real-world weapon mechanics |
| CD-07 | P1 / impact choreography | Timing/polish of existing flash, shock, embers, wreck, smoke, audio/game transition | GP-02, GP-04, CD-04 | Successful vehicle hit visually rewarding yet short; no repeat audio fatigue or FPS hitch; around 1s respawn |
| CD-08 | P2 / polish | Unified pause/completion overlays, icon/loading/sound/micro-interactions | CD-02, CD-03, CD-07 | Cohesive presentation, no extra menus, honors reduced motion, controls and accessibility |
| CD-09 | Gate / QA | Paired before/after screenshots + real iPhone portrait run, representative full encounter, controls/sound/thermal/contrast audit | Each implemented slice; final cross-slice check after CD-08 | Owner KEEP/TUNE/REVERT; mobile evidence logged; rollback or quality reduction when performance or clarity worsens |

### Implementation order
1. **Preserve gameplay priority:** GP-00 phone baseline and GP-01 flight feel remain critical. CD-00/CD-01 can begin as non-disruptive work.
2. **First visible design release:** CD-02 launch + CD-03 minimal HUD in separate reversible implementation PRs, each tested on the running encounter.
3. **Hero shot:** CD-04 one composed clearing, then CD-05 atmosphere and CD-06 models. No blanket forest asset replacement.
4. **Reward and finish:** CD-07 aligns with the latest sound/impact work; CD-08 polish; CD-09 cross-device and 10–15-attempt regression.
5. **Only after G1 fun & G2 device evidence:** further environment variety or larger art scope. Nothing in this approval overrides that gate.

## 5. Gate checklist and evidence, not aesthetic wishful thinking

- **Composition:** actual portrait capture shows recognizable clearing, readable 3 **military-style** options (tank/APC/truck by silhouette), enough lookahead at speed; not only an attractive promo render. Compare all three intact and settled-wreck looks without using real-world tactical markings.
- **Accessibility:** iPhone safe areas, 44 CSS px target goal, bright-sun legibility, orientation handling, reduced motion/flash, focus visibility, screen-reader names for controls, no information conveyed only by color.
- **Responsiveness:** startup, pause/resume, music/audio unlock, impact/restart and option changes tested with real touch. Do not regress existing 0.98s retry semantics.
- **Performance:** record device/browser/build, consistent frame pacing / visible stutters, battery and thermal subjective note; screenshot/device validation required before claiming premium or 60 FPS. Compare quality tier changes.
- **Maintainability:** no unlicensed downloaded assets, bloated textures, new rendering engine or separate redundant game modes; keep Three.js module version consistent and preserve fallback path.
- **A/B discipline:** each PR documents one objective, screenshots/video before and after, automated tests actually run, device checks completed vs pending, and a clear reversible rollback.
- **Go/no-go:** owner approval of art *direction* is recorded here. Successful implementation, visual quality and fun remain **unverified** until tested.

## 6. Source links and deliberate exclusions

- [Live playable prototype](https://statego2.github.io/War-Drone-Sim/) (actual shipped appearance; this specification does not magically change the build)
- [Web-first gameplay plan](27_GAMEPLAY_FOCUS_PLAN.md)
- [Existing art/audio guidelines](12_VISUAL_AUDIO_DIRECTION.md)
- [Proposed Graphics Overhaul PR #66](https://github.com/statego2/War-Drone-Sim/pull/66)
- [Live tracker issue #68](https://github.com/statego2/War-Drone-Sim/issues/68)
- [Technical quality and device testing](06_TESTING_AND_PERFORMANCE.md)

**Explicit exclusions:** realistic military HUD or live-world equipment, targeting systems, authentic weapons/damage training, cinematic violence, huge full-screen particle effects, multi-step front-page onboarding, player accounts, monetization, unnecessary progression and blindly merging the design-only PR #66 into current main.
