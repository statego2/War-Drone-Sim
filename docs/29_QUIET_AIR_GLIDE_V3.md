# Quiet Air-Glide audio — V3 (2026-10-08)

## User feedback
Two successive "softer rotor" attempts remained irritating. The steady synthetic motor tone is a recurrent source of listening fatigue. The user wants a sound that makes the *act of flying* pleasurable, not an accurate drone motor.

## Implementation decision
**Remove the sustained motor sound altogether**. This is not another EQ or gain adjustment. There are now zero oscillators sustaining indefinitely as a rotor. The loop bed is only an unobtrusive, low-passed procedural airy texture.

- **Cruise:** restrained filtered air + an ultra-soft low-middle glide layer, not a mechanical note.
- **Bank/lateral movement:** a third moving-air layer follows actual bank/side-rate. Gives control feedback without beeping at the player.
- **Speed/FAST:** a gentle air swell, naturally louder when moving faster. Existing brief FAST cue remains event-triggered.
- **Nose dive:** a brighter but still filtered, dynamic whoosh whose intensity tracks the fall.
- **Forest:** a tiny ambient background; largely quiet between interactions.
- **Hit/retry/score:** original short, distinct rewarding impact cues remain intact. They are allowed to feel comparatively prominent because constant flight audio has been reduced.
- **Accessibility and performance:** no new samples/assets. Web Audio user gesture, mute/pause/background suspension, shared Canvas fallback and bounded filter/gain automation are retained.

## Acceptance / test
- Automated logic regression asserts there is no `rotorGain` or `rotorHz` in the flight mix, no oscillator created during unlock, and speed/dive/banking change air layers.
- Manual real iPhone Safari listening: fly 5 minutes without hitting anything, check for fatigue or hiss, then test FAST, sideways, diagonals, dive and several full encounter loops. Test with iPhone speaker and headphones at ordinary listening volume. Passing CI is not proof of subjective acoustic comfort.
