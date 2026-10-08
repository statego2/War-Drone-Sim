# NEXT_ACTION — War Drone Sim

**Updated:** 2026-10-08. **Stage:** browser G0/G1 experimental playable implementation, device gate open. **Primary channel:** portrait mobile browser per owner. **Prototype:** root `index.html` with Canvas perspective renderer and JavaScript model.

## Completed in browser prototype v0.1

- One-screen start → fly → fictional moving vehicle / tree / miss → result → retry.
- Seeded forest corridor, road, perspective camera, relative touch drag and keyboard, auto-forward arcade flight, local best score and brief synth cue.
- Five model tests and JS syntax checks passed locally on Node 24.19.0; CI workflow added.
- See `docs/18_BROWSER_PROTOTYPE.md` for commands, design tradeoffs and precise limitations.

## Immediate next action

1. Configure and verify GitHub Pages if not already enabled; open the deployed URL in a browser.
2. **Real iPhone portrait test (T-002 re-scoped):** complete hit, tree collision, miss, pause/resume and retry; record iPhone/iOS/browser, screenshot, control latency, rendering and FPS feel in `docs/11_PLAYTESTS.md`. No physical device test has happened in this session.
3. Fix any observed input/visual/contact faults. Then ask 5 first players to try it (T-018) before claiming G1 acceptance.
4. Rebaseline native Unity-specific G0 tasks and the 330h schedule for the browser-first decision; do not close those tasks as completed by a Canvas implementation.

## Known validation limits

Browser automation here was blocked because headless Chromium was not installed and its download failed. The cloud browser could not reach localhost. Tests confirm model logic only, not actual Safari render, controls, FPS or fun. No paid assets, backend, real-world control or weapon integration were added.

## Product gates

The user chose link-playable browser; full polygonal 3D renderer vs current software perspective remains an open product/technical call after seeing this slice. G0/G1 owner acceptance and real-phone evidence remain open. Do not interpret merged code or CI as a successful device test.
