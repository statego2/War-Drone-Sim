# NEXT ACTION — War Drone Sim browser prototype

**Updated 2026-10-08.** Source of truth: `main`. Hosted portrait build: https://statego2.github.io/War-Drone-Sim/

## Landed in main

- Browser WebGL Forest Encounter: one-finger steering, three fictional empty vehicles, swept contact, visible wreck states, automatic next drone (~0.98 s), next round once all three have been hit.
- Faster actual cruise / FAST travel; gravity-driven dive. Follow-up commits `4af39cb` and `90b364f` transition a fully committed near-vertical dive away from horizontal travel while allowing shallow downward travel and recovery. Tests cover this behavior.
- Procedural audio director: merged as `e9ada33`. Dynamic rotor/wind/altitude mix and synthesized distinct ground/vehicle contacts, with unit tests. See `docs/26_AUDIO_DIRECTOR_V1.md`.
- Procedural visual impact pool: merged as `03cd218` via PR #71. Layered flash, planar shock ring, reusable embers and smoke, softer ground-impact treatment, mild FOV pulse, and deterministic envelope tests. See `docs/27_IMPACT_FEEDBACK_V1.md`.
- All effects are fictional arcade feedback, not operational hardware/damage simulation.

## Evidence and remaining validation

- The pre-merge impact-VFX implementation branch's GitHub Actions run `37826960086` passed both logic and desktop Chromium visual smoke. Main's post-merge checks are tracked in GitHub Actions; do not mark them green until completed.
- GitHub Pages deployment workflow `37827156003` reported success for merge commit `03cd218`. No actual iPhone Safari visual/audio/fps/haptics test has been performed in this session; do not claim professional sound mastering, 60fps, or player fun has been established.
- Existing open PR #67 proposes an alternative stronger dive brake, but overlaps with already-merged changes. Compare its FAST behavior and short-travel acceptance test rather than merging or discarding it blindly. A note is on that PR.
- The graphics overhaul design PR #66 is separate and does not by itself establish that the runtime visuals are implemented.

## Next unblocked game-feel work

1. On iPhone portrait, compare shallow vs full dive including FAST, camera clarity, and how far the craft continues horizontally. Specifically confirm the owner-requested near-vertical stop.
2. Play ten consecutive vehicle and ground impacts. Check that shockwave/embers/smoke and newly merged audio blend cleanly, reset every drone, and do not cause fatigue or frame spikes.
3. Check three-target identification, first-approach timing, steering precision, pause/mute/resume and app switching. Document any reproducible failures in GitHub issues.
4. Tune spawn, speed and feedback from phone evidence *before* adding more persistent systems. G1 fun and G2 phone performance remain unverified.

No real-world targeting, vehicle damage calculations, live drone protocols or physical combat simulation belongs in this prototype.
