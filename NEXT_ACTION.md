# NEXT_ACTION — War Drone Sim

Updated: 2026-10-08. Current work: Open Sky v0.3, under review at PR #60; based on v0.2 PR #59. Do not confuse code delivery with iPhone performance approval.

## User feedback received

User provided iPhone portrait screenshot of v0.2 at approximately 49 m AGL showing genuine 3D but clearly low-poly scene. Explicitly requested direct left/right/up/down movement, dramatic visual upgrade, an interesting believable world, sounds, and deferred gameplay design. This screenshot proves WebGL runs on the user's iPhone, NOT sustained performance.

## Implemented in PR #60

- Replaced yaw steering with screen-relative direct horizontal translation and climb/descent; added unit/browser checks.

- Expanded art with procedural ground/asphalt texture, varied forest pigments, local shadow decals, better body/rotor/gimbal detail, sky clouds, cabin clusters, decorative streams, grass/flowers/rocks, roadside details and a hand-placed lake with terrain basin.

- Original synth motor/wind/birds soundscape behind a user-gesture unlock and explicit mute/pause, no packaged audio dependencies.

- UI labels updated; prior v0.2/free flight and v0.1 Canvas gameplay remain preserved on earlier branch and legacy-canvas.html.

## Critical next actions

1. Confirm GitHub Actions model, syntax and browser WebGL smoke tests green for the final PR head. Investigate failures and preserve relevant failure evidence.

2. Test PR #60 through a pinned preview on the user's physical iPhone: screen-right drag goes right (not yaw), left goes left, up climbs, down descends. Confirm UX with user.

3. Compare actual screenshot with v0.2, inspect cabins and lake at map location, shader/sky/road texture. This is handcrafted prototype art, not photorealistic or certified simulation.

4. Listen to audio after user gesture and test silence on pause/mute/resume. Test Safari interruption / memory / 5-minute FPS and temperature. Browser automation does not prove audio or sustained performance.

5. Avoid adding gameplay systems yet: owner wants gameplay purpose separately designed and reviewed. No physical-world targeting or hardware integrations.

6. After review, merge v0.2 first then rebase/retarget v0.3 on main (or merge as a single reviewed lineage). Do not overwrite main without validation.

## Caveats

The view is still a stylized browser-first environment. Audio synthesis and simple terrain/flight are not military simulation. CDN Three.js needs network; original screenshot and a headless Chromium pass do not prove G1 or G2.
