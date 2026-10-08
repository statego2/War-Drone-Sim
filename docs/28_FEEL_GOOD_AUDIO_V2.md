# Feel-Good Audio v2 — Sonic UX redesign (2026-10-08)

## User acceptance goal
Make the **whole game** pleasant, responsive and rewarding to listen to, rather than pursuing the sound of an actual drone or literal explosives. The owner specifically disliked the prototype's mechanical buzzing and unpleasant explosions. The target is a warm, game-like, repeatable experience with a clear connection between flight skill and sound.

## New musical/audio hierarchy
1. **Cruise / hover — comfort foundation.** Quiet, rounded sine/triangle harmonics from approximately 89–125 Hz, heavily low-pass filtered. Subtle warm/noisy air sits below the motor. No abrasive sawtooth rotor or persistent shrill whistle.
2. **FAST — energy without irritation.** More fluid wind and a small upward audio shimmer when changing mode, not a siren.
3. **Dive — build anticipation.** Velocity-driven low-mid rushing air that intensifies as descent develops. No constant extra beep, and no false impact cue.
4. **Vehicle hit — distinct success.** Three stages of a soft low-mid impact (round thump, warm crack and short tail) plus a clear positive melodic acknowledgement.
5. **Consecutive vehicles — completion arc.** First vehicle yields two melodic notes; second yields three; completing all three yields a four-note resolution with a gentle warm bloom. The payoff is distinguished by **musical structure**, not more clipping/harshness.
6. **Ground/tree hit — understated failure.** A compact warm 'oof' with no celebratory motif. Immediate retry cue encourages continuing without false success signals.
7. **Canvas fallback — same sonic identity.** Shared sound engine means no separate harsh legacy oscillator.

## Implementation
- `src/audio3d.mjs`: bounded pure `deriveFlightMix()` and `deriveImpactMix()`; gentle synthesis, smoother gain ramps, soft filtered noise, reduced master, controlled dynamics. Existing Web Audio/gesture-unlock/mute/visibility behavior retained.
- `src/game3d.mjs`: passes live `encounter.hits` / final vehicle result to the sound director; flight mode sent to UI sound director.
- `tests/audio3d.test.mjs`: checks warm acoustic envelope targets, dynamic dive, safe finite parameters, game reward structure, and mocked browser audio lifecycle.
- No new downloadable assets, no soundtrack layered over SFX, and no physical attack simulation.

## Listening acceptance on real devices (not yet established)
On **iPhone speakers and headphones**: after 15–20 full runs, assess whether rotor stays pleasant, dive rush signals increasing intensity, vehicle hit sounds delicious rather than noisy, completion feels more rewarding than one hit, respawns are light, and the ambience never covers movement.
Test quiet/normal volume, FAST and hover, iOS audio unlock, mute/unmute, app switching, pause and repeat attempts. Confirm no fatigue or clipping. Code/CI checks are necessary but **cannot substitute for listening**.

## If feedback remains negative
Prioritize iterative tuning of hit transient vs tonal reward vs tail (three gain groups), then engine/wind relative level. Consider professionally authored short recordings later if synthesis still sounds generic. Avoid adding a loud endless score just to conceal unsatisfying gameplay SFX.
