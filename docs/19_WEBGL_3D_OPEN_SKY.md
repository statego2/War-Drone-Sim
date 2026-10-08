# Open Sky v0.2 — polygonal WebGL forest-flight prototype

**Date:** 2026-10-08  
**Status:** Code authored on `feat/webgl-open-world-flight-v0-2`; real browser and device evidence pending.  
**Decision trigger:** Owner rejected v0.1's flat road/tree silhouettes, requested genuine 3D world depth and unrestricted ascent.

## What changed

The default browser entry is now `index.html` → `src/game3d.mjs` (Three.js r180 WebGL), with `src/flight3d.mjs` for deterministic game-space flight/height queries. `legacy-canvas.html` preserves the v0.1 impact/retry prototype and serves as automatic fallback if WebGL or CDN import fails. No real-world vehicle targeting or drone-control integration exists.

- **3D camera:** 70–73° perspective, physically geometric quadcopter silhouette, smoothed chase/FPV positions, animated rotors.
- **3D environment:** triangulated continuous hilly ground with vertex colors; layered procedurally generated pine meshes, irregular deciduous crowns, trunks and rocks; winding asphalt ribbon, gravel shoulders and center dashes; small fictional unoccupied static roadside vehicles.
- **Space / LOD:** reproducible x/z tile generation (320 units), 5×5 surrounding chunks, 3×3 dense foliage / outer sparse; InstancedMesh reduces draw calls; distant coarse-landscape grid; player-centered floating origin mitigates world-position jitter; far plane/fog/landscape extent adapt to altitude.
- **Flight:** touch drag for yaw and climb, auto-forward cruise, optional higher cruise speed, WASD, FPV/chase, pause/resume. No run timer or artificial 12 m ceiling. A terrain floor prevents sinking below ground. Altitude HUD is above-ground-level (AGL); numeric positions are illustrative game units, not survey data.
- **UI:** portrait safe-area overlay, altitude/speed/distance, simple launch, pause, camera and cruise toggle.
- **Fallback:** old Canvas experience preserved if Three.js or WebGL cannot load.

## Technology, dependencies, and licenses

`game3d.mjs` currently imports `three@0.180.0` from jsDelivr's ESM CDN. This new external dependency needs network access on first visit; `legacy-canvas.html` remains self-contained. Three.js has the permissive MIT license (verify dependency manifest during release/licensing review). Procedural scene geometry and textures are project-authored; no marketplace asset files or military system interfaces added.

## Validation checklist

Automated checks via `npm test` and `node --check src/game3d.mjs src/flight3d.mjs` in GitHub Actions once the PR workflow executes. Proposed **manual iPhone Safari test**:

1. Confirm WebGL loads in portrait and the intro displays an actual 3D forest; verify no WebGL errors in the browser console.
2. Observe trees, road curves, terrain parallax, near/far scale and camera occlusion while turning.
3. Hold an upward touch drag for at least 60 seconds, confirm altitude rises without mission timeout; descend toward terrain, observe floor collision.
4. Toggle FPV / chase, normal / fast, pause/resume, background/foreground and repeat entry.
5. Run on a midrange phone and a recent iPhone: log smoothness, startup latency, visual pop, loading errors, thermal/battery feel, memory pressure and touch latency.
6. Test CDN-blocked/WebGL-unavailable flow redirects to `legacy-canvas.html`.

## Known shortcomings / next art-pass priorities

- The environment is a **real 3D game scene**, but still procedural mid/low-poly placeholder art; it does not have GTA V assets, photogrammetry, dynamic shadow maps, real vehicle physics or military-grade fidelity. Avoid claiming otherwise.
- No measured phone frame rate, WebGL Safari compatibility, GPU memory, thermals, startup time or real gameplay test yet. Fog and chunk density need device optimization.
- Roads follow sampled terrain; no road-engineering grade smoothing, junctions, bridges or lane-signage network.
- Clouds, broad biome variation, riverbeds, roadside detail and improved material textures remain future graphical polish candidates, contingent on real-device testing.
- CDN reliance requires an offline/self-hosting decision and pinned integrity policy later.
- Old impact loop remains on the legacy page. This branch intentionally experiments with **free exploration**; reintroducing fantasy challenges requires a separate explicit gameplay decision. No military training system or real-world weapon/target integration.

## Owner acceptance gate

G1/G2 **OPEN**. After automated CI, gather an actual screenshot/video on the owner's phone, compare new 3D depth with rejected flat v0.1 visuals and tune **camera / forest silhouettes / road appearance** first. Preserve reversibility by merging only after review.
