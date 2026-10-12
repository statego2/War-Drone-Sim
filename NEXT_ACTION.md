# NEXT ACTION — War Drone Sim

**Updated 2026-10-12.** Source of truth: `main`. [Play the portrait build](https://statego2.github.io/War-Drone-Sim/).

## Shipped: first complete forest level

- [PR #85](https://github.com/statego2/War-Drone-Sim/pull/85) merged as `30f0805`. The former three-target greybox is superseded. The level has a continuous forest route through three connected clearings, with 16 fictional empty vehicle props (5/5/6), persistent wrecks, progress HUD, quick checkpoint respawns near the earliest uncleared area, a final level-clear screen, replay, and locally saved best drone count. There is no three-target round reset or finite five-drone life limit.
- One-finger flight, swept contact, impact visual/audio feedback, and fictional military-style tank/carrier/truck silhouettes remain the underlying mechanics and visual direction.
- Local syntax and encounter checks passed; the PR's Node logic/syntax job passed in [run 38261307135](https://github.com/statego2/War-Drone-Sim/actions/runs/38261307135). Both [Pages deployment](https://github.com/statego2/War-Drone-Sim/actions/runs/38262074429) and [Pages build](https://github.com/statego2/War-Drone-Sim/actions/runs/38262072993) succeeded on the merge commit.
- The [main browser run](https://github.com/statego2/War-Drone-Sim/actions/runs/38262074457) passed Node logic and desktop Chromium visual smoke. The cloud browser used in this session has WebGL disabled and opens the legacy Canvas fallback, so this is not a manual visual inspection of the new 3D route. Actual iPhone Safari play, FPS, sound comfort and fun remain unverified.

## Forest Engagement v2 — implementation and CI verified on PR #86

- [PR #86](https://github.com/statego2/War-Drone-Sim/pull/86) adds six gently moving empty fictional vehicle props without changing the 16-target, 3-sector level, moving-object swept contacts, adaptive checkpoint respawns, a simple directional HUD cue, arcade dive/pace/combo points, and locally stored best score. The out-of-range military prop paint indexing is fixed. Wreck meshes stay at the actual impact location.
- The [latest PR check](https://github.com/statego2/War-Drone-Sim/actions/runs/38278169100) passed **Node logic/unit tests and desktop Chromium portrait smoke**. A previous intermediate commit exposed an overly specific overshoot test; the test was corrected to model overshooting *all* remaining clearing targets. Final run passed both jobs.
- This is **implementation and desktop regression evidence**, not verification of real iPhone feel, sustained phone FPS or audio comfort. Never conflate PR code with shipped Pages until merge/deploy finishes.

## Forest hazards v3 — PR #87

- [PR #87](https://github.com/statego2/War-Drone-Sim/pull/87) **merged as 4e1adffd** with forgiving swept tree contacts from actually drawn local trees, deterministic hazard arbitration, a dedicated collision warning, full 16-hit scripted playthrough, and unit/browser regression tests. The final PR SHA `6489e520` passed Node logic and portrait Chromium browser smoke ([CI run 38279196320](https://github.com/statego2/War-Drone-Sim/actions/runs/38279196320)).
- Real-phone fairness, frame pacing, visual readability and feel remain unverified. See [hazard technical notes](docs/33_FOREST_HAZARDS_V3.md).

## Next actions

1. PR #86 merged as abb0c149 with successful Pages/main CI. PR #87 merged as 4e1adffd; verify its GitHub Pages deployment and main CI, then inspect the 3D portrait build at 390×844 with WebGL. Check tree-contact fairness, moving props, wreck placement and navigation.
2. Play the **entire 16-target route** on iPhone portrait, including a moving target and a missed/overshot target: first approach, three clearing transitions, checkpoint spawn, wreck persistence, sector counter, final clear and replay. Also test one-finger climb/brake/reverse, diagonals, dives, ground impact, pause/mute/resume, and app switching.
3. Record concrete observations, then tune pacing, sightlines, target spacing, controls, sound and visual feedback. Treat G1 fun and G2 phone performance as open until owner playtest evidence supports them. The linked [gameplay plan](docs/27_GAMEPLAY_FOCUS_PLAN.md) and [approved creative direction](docs/29_APPROVED_CREATIVE_DIRECTION_V2.md) set priorities.

The owner explicitly requested a **whole playable level**; old three-target notes in historical PRs and documents are superseded. Keep the experience fictional arcade play, without real-world targeting or weapon simulation.
