# NEXT ACTION — War Drone Sim

**Updated 2026-10-12.** Source of truth: `main`. [Play the portrait build](https://statego2.github.io/War-Drone-Sim/).

## Shipped: first complete forest level

- [PR #85](https://github.com/statego2/War-Drone-Sim/pull/85) merged as `30f0805`. The former three-target greybox is superseded. The level has a continuous forest route through three connected clearings, with 16 fictional empty vehicle props (5/5/6), persistent wrecks, progress HUD, quick checkpoint respawns near the earliest uncleared area, a final level-clear screen, replay, and locally saved best drone count. There is no three-target round reset or finite five-drone life limit.
- One-finger flight, swept contact, impact visual/audio feedback, and fictional military-style tank/carrier/truck silhouettes remain the underlying mechanics and visual direction.
- Local syntax and encounter checks passed; the PR's Node logic/syntax job passed in [run 38261307135](https://github.com/statego2/War-Drone-Sim/actions/runs/38261307135). Both [Pages deployment](https://github.com/statego2/War-Drone-Sim/actions/runs/38262074429) and [Pages build](https://github.com/statego2/War-Drone-Sim/actions/runs/38262072993) succeeded on the merge commit.
- The [main browser run](https://github.com/statego2/War-Drone-Sim/actions/runs/38262074457) passed Node logic and desktop Chromium visual smoke. The cloud browser used in this session has WebGL disabled and opens the legacy Canvas fallback, so this is not a manual visual inspection of the new 3D route. Actual iPhone Safari play, FPS, sound comfort and fun remain unverified.

## Next actions

1. Inspect the deployed 3D portrait build at 390×844 in a WebGL-capable browser, then fix any concrete visual issues.
2. Play the **entire 16-target route** on iPhone portrait: first approach, three clearing transitions, checkpoint spawn, wreck persistence, sector counter, final clear and replay. Also test one-finger climb/brake/reverse, diagonals, dives, ground impact, pause/mute/resume, and app switching.
3. Record concrete observations, then tune pacing, sightlines, target spacing, controls, sound and visual feedback. Treat G1 fun and G2 phone performance as open until owner playtest evidence supports them. The linked [gameplay plan](docs/27_GAMEPLAY_FOCUS_PLAN.md) and [approved creative direction](docs/29_APPROVED_CREATIVE_DIRECTION_V2.md) set priorities.

The owner explicitly requested a **whole playable level**; old three-target notes in historical PRs and documents are superseded. Keep the experience fictional arcade play, without real-world targeting or weapon simulation.
