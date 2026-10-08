# Visual, UI, Cinematography and Audio Art Direction
**Status:** Visual identity APPROVED 2026-10-08; the details below remain production guidance, not proof of imported assets or validated sound. **Primary approved visual specification:** [Creative Direction 2.0](29_APPROVED_CREATIVE_DIRECTION_V2.md). **Gameplay priority:** [GP Plan](27_GAMEPLAY_FOCUS_PLAN.md).

## Owner-approved visual decision — summary

- **Premium Cinematic Arcade:** 70% golden-hour cinematic woodland, 20% premium tactical-minimalist UI, 10% stylized arcade impact (conceptual proportions, not shader math).
- Identity: **Beauty in flight. Precision in motion. Spectacle in impact.**
- Palette: Deep Forest #172B27, Moss #526D57, Soft Ivory #F1EEE3, Golden Hour #E4BB82, Ember #FA874E.
- **Home:** full-screen live forest, custom typographic hierarchy, one **FLY** CTA, one-line optional flavor; move long explanation/version into About/debug; seamless transition to input-ready flight.
- **Flight:** 3 discrete progress marks, optional subtle speed, telemetry secondary, no clutter or fake targeting reticle; do not bury FAST if needed for controls.
- **World:** one designed forest reveal and clearing before broad foliage work; cohesive graphite drone and 3 distinct fictional vehicle silhouettes.
- **Impact/flow:** reuse and choreograph existing sound/VFX, success vs ground miss, no forced pause beyond approx. one-second next drone.
- **Pause/finish:** calm translucent live-scene overlay, one dominant RESUME, non-modal completion reward, consistent transitions and accessibility.
- Implementation order, owners, gate/evidence, rollback and exclusivity are defined in **CD-00…CD-09** in the approved spec. The open graphics PR #66 is a technical annex, **not** another direction.

## Mood
Forest at golden-hour/dappled sunlight, aerial speed, close-call vegetation, and sudden short reward at impact. The world feels substantial but **calm, readable and beautiful**. Avoid a maximalist tactical HUD or battlefield realism. The core look should read as a **premium stylized arcade game**, not a simulation dashboard.

## Visual hierarchy in a narrow portrait
1. **Readability:** vehicle silhouette against road gap (largest focal contrast).
2. **Navigation:** near trees and road curvature communicate speed / possible routes.
3. **Character:** small visually recognizable drone in lower-middle, not obscuring obstacle view.
4. **HUD:** only score / best and contextual action, low visual weight.
5. **Atmosphere:** layered trees, fog gradient, distant canopy, light bloom only if cheap.

## Reference visual rules
- Start with low-poly faceted tree shapes, simplified bark, opaque chunky foliage and limited palette.
- Avoid alpha-card forest at huge overdraw; leave visibility corridors near targets.
- Roads should not be photo-texture stretches; use few coherent readable material families.
- Ground/sky/vehicle contrast must survive 30% display brightness and sunlight test.
- Motion cues: parallax trunk spacing, bank animation, audio wind pitch and controlled camera acceleration.
- Use height differences, 1–2 clearing reveals, not random dense forest sprawl.

## Production shots (portrait storyboard)
**Shot A — Landing/home:** live 3D forest with hovering drone or gentle camera drift. Single large "FLY" command; no score clutter until playing. Score may display in compact after-game context.

**Shot B — Fly:** player drone lower third, canopy gap upper center, trees frame forward path; 0–2 HUD numeric elements. Tutorials via 1 short ephemeral hint.

**Shot C — Reveal:** visual gap and vehicle motion become obvious; quiet sonic cue and subtle contrast adjustment. No digital lock-on interface.

**Shot D — Impact:** brief camera shake and time dilation, stylized pulse/sparks/dust and short audio hit; very short, not gory.

**Shot E — Result:** translucent overlay over beautiful continuing forest movement (or slowed camera) showing score, best, one clear RETRY. World still feels alive; don't force a loading screen.

## Particle/VFX budget
- Pool contact effects. Target VFX duration 0.25–0.8 s, tune in game.
- Primary readable burst + minimal small secondary debris + dust puff; avoid giant screen-covering orange effects.
- Single impact event, no nested duplicate explosions. Use camera shake proportional to event; reduced-motion preference must control it.
- Colors distinguish hit success from tree crash without requiring green/red distinction.

## Sonic palette
- Base bed: subtle propeller/wind/forest ambience; avoid repetitive high harsh static buzz.
- Flight: low-mid rotor tone controlled by *game speed*, soft air movement to signal input, no engineering/aerodynamics simulation.
- Target reveal: brief harmonic cue or light pulse, not a continuous alarm or military warning system.
- Contact: transient low thump + layered short gritty hiss/impact + brief airy tail; avoid hard clipping and extreme bass on phone.
- Score/retry: minimal, clean, consistent motif.
- Music: optional evolving minimal synth / cinematic texture; it should support focus, not dominate control.
- Volume settings: master/music/effects or simplified two-channel, mute at start based on phone settings, background audio stop, haptic off.

## Content production checkpoints
- **Art 0:** greyboxes and flat colors in G1; no pack purchase.
- **Art 1:** curated cohesive CC0 forest/vehicle samples and one palette.
- **Art 2:** representative route polished, screenshot owner approval; actual phone profiler.
- **Art 3:** icon, loading and result polish; variant content only after G2.

## Asset-flip prevention
Create original scene composition, bespoke camera behavior, recognizable UI treatment, unique flight tuning, authored payoff sound and special effects. Combining unrelated stock packages with default demo UI is **not** sufficient art direction.

## Sign-off questions
Does target read instantly? Is forest beautiful at speed? Can player understand motion from silhouette? Is impact spectacular but brief? Does death/result preserve the world? Can user replay without browsing menus? Are visuals coherent on low graphics tier?
