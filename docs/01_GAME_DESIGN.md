# Game Design Document (GDD) — War Drone Sim
Version 1.0 / hypothesis-driven design.

## Fantasy and experience
You are flying a small, agile, entirely fictional camera drone over a forest road. Through a canopy gap, a moving vehicle becomes visible. You curve between trunks, dive toward it and collide. The world visibly reacts. Your next run begins almost instantly. **Precision flying is the game; hitting an object is the climactic payoff.**

**No actual-world mission data, military targeting procedures or drone hardware/control integration.** Visual effects are stylized and non-graphic.

## Design pillars
1. **Feel before systems:** touch → drone response and camera feedback with very little perceived lag.
2. **Readability in portrait:** one glance reveals drone trajectory, obstacles, vehicle, and next action.
3. **Deliberate mastery:** high ceiling from curves, timing, altitude and momentum; not complex UI.
4. **Fairness:** obvious collision silhouettes and recovery windows, no surprise invisible colliders.
5. **Spectacle that earns itself:** brief tactile impact/cinematic beat; camera never sacrifices control unnecessarily.

## Moment-to-moment loop
1. Open (single primary "FLY" action).
2. Spawn mid-air at low challenge, readable opening 2 s.
3. Fly through forested flight corridor / gaps, optionally gather directional indication.
4. A moving game vehicle is revealed naturally through gap + readable marker when appropriate.
5. Player lines up trajectory, chooses final approach, contacts vehicle.
6. One quick, visually coherent outcome: contact counted / obstacle collision / missed target / run exhausted.
7. Display score + a one-tap retry with no extra screens; previous best persisted locally.

**Initial run format proposals:** A) 1 target per 20–60 s, B) short gauntlet with 2–3 targets and 1–2 minutes. Prototype A first to make feedback and timing fast. No campaign until B improves repeat play.

## Control study: two reversible prototypes
**Control A: drag-to-steer (recommended first experiment)**
- Forward movement driven automatically or by progressive speed profile.
- One-finger drag relative to anchor controls pitch/yaw intent; horizontal drag = turn, vertical drag = climb/dive, optional inverted Y.
- Bank and camera lean are assisted visual consequences, not separate input.
- Optional hold area (thumb anywhere) for speed/boost after exploration.
- Designed for one-handed portrait, fallback left-hand/mirrored safe zones.
- Advantage low friction; risk limited authentic FPV feeling.

**Control B: virtual thumb stick + dedicated dive/boost**
- Bottom thumb stick on left/right; stick X = yaw and stick Y = vertical flight demand, constant forward speed.
- Separate contextual dive button or second touch as unlock only if viable.
- Advantage explicit control; risk excessive UI and thumb occlusion.

**Do NOT start with 4-axis RC Acro mode.** If desired later, advanced mode is optional, isolated from default progression.

### Tunable flight model (game-space units, provisional)
- Velocity integration over physics timestep. Parameterized baseSpeed, minSpeed, maxSpeed, turnRate, pitchRate, climbRate, damping, bankVisualAngle, assistStrength, collisionGrace.
- Start units in engine world units; **no claim of true aerodynamic or real FPV mapping**.
- Movement modes: FREE, APPROACH_ASSIST (soft damping), HIT_STUN/RESULT, RESPAWN.
- Smoothing should preserve fast input response (< developer-tuned comfort threshold determined by device playtests), no floaty latency.
- Assist keeps craft within generous navigable envelope only if exposed and fair, not hidden autopilot target guidance.

## Player camera
- Primary third-person close chase, slight vertical offset, wide but legible FOV (provisional 60–75° vertical). Alternative FPV camera as post-G1 trial, not default.
- Spring-damped follow using late update after motion; smooth roll follows craft bank at *reduced gain*. Damp roll and vertical chase separately to avoid nausea.
- Forward predictive look target, proximity compensation near trees, occlusion checking between camera and drone, clipped geometry avoidance.
- Phone safe areas: critical UI not behind notch/home indicator; vehicle readable above thumb interaction band.
- Portrait imposes a narrow horizontal field of view: routes and target reveals must be designed accordingly.

## Targets / world design
- A single simple, moving, **fictional unoccupied vehicle** traverses a short forest road or clearing.
- Vehicles are abstract game targets: variants differ in silhouette, speed and score value; no personnel/real models/names.
- No adversarial response or tactical behavior needed. Procedural illusion via spawn seeds and routes, but first level handcrafted for camera angles, trees, readable sightlines.
- Forest design uses near/medium/far layers and controlled gaps: obstacles matter, trees do not completely obscure the relevant action.
- Collision channels: tree/terrain (failure or bounce), vehicle (success), scenery (ignore/decor), boundary (soft turn/recovery).
- Temporary markers must avoid "lock-on target" aesthetic; use in-world visibility / gentle contrast or stylized objective arrows for game UX.

## Reward and feedback
- **Pre-contact:** wind/rotor pitch intensifies; subtly tighter camera and sound cue upon visible proximity.
- **At contact:** immediately freeze/flicker/directional feedback, stylized VFX and non-graphic debris (pool), short haptic/sound cue, hit registered **once**.
- **After contact:** 0.4–0.8 s cinema beat candidate; result overlay translucent enough to retain pretty forest; retry accessible ≤3 s.
- Scoring: base hit + optional speed/presence/clean approach bonuses with **clear, nonpunitive explanations**. Avoid accuracy or hit-tracking metrics linked to real-world target training; score abstract timing/style only.
- Distinguish obstacle crash vs target success visually and audibly.
- Improve mastery via obstacles, target movement and sightlines, never artificial input delay.

## Proposed encounter pacing
| Time | Intent |
|---|---|
| 0–2 s | quick orientation, control |
| 2–8 s | satisfying flight near trees |
| 8–20 s | first target cue and approach |
| 20–45 s | outcome / momentary chase if missed |
| final | result + instant restart |

These are **tuning hypotheses**, not factual player behavior.

## UI wireframe (functional, not visual art)
```
┌─────────────────┐
│   BEST     SCORE│  // safe-area aware, low contrast
│                 │
│    forest /     │
│   target reveal │
│                 │
│     ● drone     │
│                 │
│                 │
│        [controls]│ // adaptable zones; minimal labels
│                 │
│   [pause]       │
└─────────────────┘
```
HUD goals: at most 2 persistent numbers, no oversized radar, weapon HUD, compass heading, or engineering data. Dynamic tutorial overlay only on first run. Death/result overlay shows the world continuing underneath.

## Challenge ladder
- **Level 0:** open corridor, oversized fixed practice target, no moving traffic. Confirms controls.
- **Level 1:** one moving target on straight visible road.
- **Level 2:** gently curved road and sparse obstacles.
- **Level 3:** denser vertical/tree navigation with choice of entry path.
- **Level 4:** faster lateral motion and restricted canopy windows.
Launch MVP should contain level 1, not all levels; escalation requires demonstrated fun. Every level remains navigable on touch, not reliant on twitch controls inaccessible to ordinary users.

## Accessibility and comfort
- Left/right hand swap, invert vertical, reduced camera shake, vibration off, avoid unavoidable flashing, high-contrast target option, colorblind-independent silhouettes, larger button zones.
- Adjustable motion/tilt speed after tutorial; pause/resume determinism and muted in background.
- Controls tested in sunlight, at native device resolution, with hands partly blocking bottom third.

## Anti-goals / avoid overdesign
- "Near miss" achievements are not a mandatory feature; test whether they reward core flight before adding.
- No massive quest list, tech tree, inventory, dialogue or 20 names / distracting UI.
- No replay editor, multiplayer, "drone shooting", damage simulator or endless score widgets in MVP.
- If cinematics slow retry, shorten them.
- Use a simple, stylistically coherent world rather than throwing multiple marketplace packs together.

## Prototype study
Construct flight model A and B using same world, target, camera, and tuning environment; alternate which new testers see first. Questionnaire: comprehension, perceived responsiveness, dizziness, obstacle fairness, enjoyment, wanting to retry, legibility. Record per-issue data in docs/11.

## Acceptance examples
- Fresh player notices target silhouette quickly during normal flight; no explanation of symbols required.
- Player can deliberately curve around tree and descend into contact after 2–3 retries.
- Trees visibly collide when overlapping; no "ghost" surprise.
- Hit VFX and score fire only once even if multiple physics contacts.
- Retry starts from known reproducible seed and clears all state.
