# Browser prototype v0.1 — 2026-10-08

This is a reversible web-first experiment in response to the owner's explicit requirement: **the game is played in a browser**, in portrait on a phone. It implements the first fly → find → contact → result → retry loop. This is not a production release or evidence of a native Unity build.

## Stack and scope

- Static HTML, CSS and native Canvas 2D drawing of a **perspective-projected 3D game-space** (x lateral, y altitude, z forward). No installed dependencies, remote assets, network calls, accounts or telemetry.
- Third-person drone and camera, one seeded forest-road corridor, one moving fictional unoccupied vehicle, four rotor silhouettes, road/trees with depth scaling, simple cue, scoring, local best and retry.
- Drag anywhere: relative x yaw/translation and y altitude demand. Keyboard WASD/arrows. Auto-forward arcade motion. The model is intentionally game physics, not real drone dynamics.
- Hit contact, tree collision, and target miss produce distinct results. Result is idempotent and restart creates a clean run. The obstacle shapes are approximation geometry, not full mesh/physics-engine collision.
- No external asset or audio license. A short synthesized outcome cue plays only after user gesture when WebAudio is allowed.

## Local run / test

From repository root, run `python3 -m http.server 8765` and open `http://localhost:8765/`. Static ES modules require a local server rather than `file://`. Run `npm test` for the deterministic model checks. Files can be hosted from repository root on GitHub Pages once Pages is configured.

## Evidence and limitations at this handoff

- `node --check src/game.mjs` and `node --check src/model.mjs` passed on Node 24.19.0.
- Five Node model tests passed, covering reproducible world, frame step consistency, vertical/lateral steering, one-shot hit, and failure outcomes.
- Browser automation was **not** available locally: the Playwright package exists, but Chromium binary download failed in this environment; the cloud browser cannot reach a local loopback server. No claim of verified Safari rendering, touch latency, frame rate, device thermal behavior, or five-person playtest.
- The rendered forest is a custom perspective Canvas renderer, not a polygonal engine scene. Some tree occlusion and contact volumes need tuning from actual phone play. Target is deliberately simple and unoccupied.
- Opening the URL on the owner's iPhone in portrait and completing at least one hit, one tree crash, one miss, pause/resume and retry is the immediate G0/G1 validation task.

## Technical next steps after phone feedback

1. Record iPhone model/iOS/browser and screenshot/video, input feel, rendering and crash/slowdown in `docs/11_PLAYTESTS.md`.
2. Fix visible control/camera/contact defects before adding systems. Prototype is made for fast edits.
3. Decide whether Canvas perspective is visually sufficient for G1; if actual 3D meshes become essential, conduct a measured WebGL renderer spike without replacing this playable baseline first.
4. Keep real-device G0/G1 gate and owner acceptance open until evidence exists. Rebaseline native-only issues T-002/T-003 against the accepted browser delivery channel.
