# Audio Director v1 — War Drone Sim
**Date:** 2026-10-08. **Scope:** browser sound-effects implementation on `feat/procedural-audio-director-v1`. **Validation:** pending real iPhone Safari listening test.

## Creative direction
An expressive, premium **fictional arcade** soundscape. Forest tranquillity contrasts with the electric whir of forward motion and a memorable but short hit consequence. The system is **not** a realistic drone recording or real-world impact signature. The sound should be rewarding while staying comfortable in repeat encounters.

## Audio architecture
- Pure Web Audio API procedural synthesis in `src/audio3d.mjs`. Zero external audio packages, sample downloads, microphone capture, or network calls.
- Event-driven control from `src/game3d.mjs`: start/resume, throttle mode, chase/FPV camera, velocity, altitude, dive rate, impact result, next drone, pause, mute, visibility.
- Reused looping motors / filtered broadband airflow / muted forest ambience. Loop buffers generated **once** per AudioContext; no per-frame buffers.
- `deriveFlightMix(speed, height, options)` is deterministic and testable independently from a browser.
- Effects have transient, mid-frequency body, bass/body, debris and decaying air, followed by a gentle reward motif for successful vehicle hits.
- Different ground impact, start, respawn, mode and camera feedback. Forest birds sparse and soft.
- Automatic leveling: per-layer gain, shared buses (flight, environment, one-shots), master headroom, 48 Hz high-pass to remove sub-bass waste, DynamicsCompressor as peak protection.
- Lifecycle: audio context instantiated only upon tap; automated parameter smoothing; no sounds while muted; suspend in background; independent SFX remain audible after motor ducks on contact; dispose closes created context.
- Performance: one background context, two short noise buffers, reusable oscillators, one-shot node cleanup, effect voice cap, sound parameter updates capped around 26Hz.

## Listening / QA script
On real **iPhone Safari in portrait**:
1. On landing screen no unintended autoplay. Tap BEGIN and listen for clean rising start cue and continuous rotor/wind, without Safari blocking audio.
2. Switch CRUISE / FAST / HOVER: rotor speed, amplitude and air volume must respond smoothly; transitions should not pop.
3. Hold full downward swipe: hear a distinct rush become more intense as vertical fall builds; do not conceal movement cues.
4. Fly close to the ground: wind should brighten subtly; forest bed should stay understated.
5. Impact one fictional empty vehicle: immediate short punch, layered burst, loose metal and subtle upward reward signature. Wreck and next spawn remain synchronized; no clipping.
6. Hit terrain instead: clearly shorter, less celebratory failure signal.
7. Loop at least 20 attempts with phone speaker **and** headphones: fatigue, hiss, tonal harshness, bass masking and master loudness must be judged by ear.
8. Toggle SOUND ON/MUTED mid-flight and during a sequence. Pause and switch applications; returning should not double or permanently disable audio.
9. Compare quiet volume and normal volume, fast repeated impacts, sound interruption, older iOS Safari availability and FPS stability.
10. Audio off/unsupported should not block controls, gameplay, visuals, or retries.

## Deferred tuning
- Ear-led EQ/loudness tests on devices; real sound cannot be validated by inspecting source code.
- Optional accessibility: separate master/effects/environment sliders; lower-intensity mode if listening tests indicate fatigue.
- Dynamic music score is an independent art decision. Do not add continuous soundtrack until mixed against flight SFX.
- No claimed real-device FPS or professional mastered loudness measurement at this stage.
