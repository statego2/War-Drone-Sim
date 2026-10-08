# Impact feedback V1 — procedural visual pass

## Scope

A separate, reviewable visual-only improvement to the Forest Encounter browser prototype, following player feedback that a single expanding sphere and 14 loose sparks did not make a rewarding arcade vehicle hit.

The new `src/impactfx3d.mjs` module is a reusable pool instantiated once in the 3D scene. On contact it creates a layered warm flash, an expanding horizontal shockwave ring, 30 embers, nine rising smoke lobes, and a restrained FOV kick. Ordinary ground contact gets a deliberately less intense dusty palette; a vehicle impact remains the hero event. The existing persistent burned-out vehicle remains as the aftermath. Nothing uses downloaded image/audio assets or real damage modeling.

## Technical behavior and constraints

- `impactEnvelope(age, kind)` returns finite, bounded, deterministic time envelopes, is unit-tested, and releases the effect within the existing 0.98-second respawn window.
- `createImpactFX(THREE, encounterView)` allocates meshes/materials once, reuses them across drones, and updates them only during impact. The `encounterView` parent already applies floating-origin translation so effects keep world alignment.
- New presentation does not change target collision, drone physics, scoring, respawn cadence, touch gestures, or audio. Sound redesign is handled separately.
- This is a graphics iteration, **not** proof of photorealism or device performance. Pools add up to ~41 small transparent primitives while active; check actual iPhone compositing and framerate before adding more particle counts.
- The shockwave is visual ornament, not a blast radius or physical effect.

## Acceptance checklist

1. Direct contact: visible hot flash, ground shock ring, ember scatter and lingering smoke; scene clears when the next drone arrives.
2. Ground impact: muted dust, no vehicle hit credit and prompt automatic retry.
3. Multiple successive drones: no effect accumulation or persistent flashing, no graphics exceptions.
4. Portrait: flash readable without masking the whole scene; no nausea from the 4.5-degree max transient FOV kick.
5. Safari: verify FPS, overheating, accessibility, pause/resume and audio balance manually.

Local JavaScript syntax parsing and deterministic envelope sampling were exercised while authoring this branch; GitHub Actions and physical iPhone validation are tracked separately. No audio claims.
