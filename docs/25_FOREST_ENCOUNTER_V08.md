# Forest Encounter v0.8 — playable experiment

This slice turns the 3D open sky flight prototype into a single quick encounter. It implements the first test proposed in the 2026-10-08 gameplay execution plan: three readable fictional vehicles, persistence across drone attempts, and a visible vehicle impact payoff. It is a reviewable experiment, not a device-validated release.

## Changes and evidence

| Area | Behavior | Local evidence |
|---|---|---|
| Flight | Cruise and FAST change actual world velocity; nose-down dive accumulates gravity and can hit terrain | `tests/flight3d.test.mjs` |
| Contact | Segment sweep prevents a fast drone skipping a vehicle, one hit per vehicle, ground retry | `tests/encounter.test.mjs` |
| Loop | Three persistent vehicle states; new drone in 0.98 s; fresh round after third | Model test and renderer integration code |
| Feedback | Flash, spark burst, wreck/smoke and distinct synthesized audio for vehicle vs ground | Awaiting browser and iPhone visual/audio acceptance |

## Device review

Use the Pages URL in portrait. A downward drag is a nose dive. A direct contact should replace the colored vehicle with a dark wreck while the two other vehicles remain. A ground hit restarts the drone without credit. Pause and mute must still work. Check 10–15 drones for disappearing terrain, missed contacts, audio fatigue and frame pacing. A reviewer should verify whether the faster flight gives enough time to spot and choose a target; tune the fixed spawn and speed values if it does not.

The local container disallows a localhost server, so desktop WebGL browser automation was unavailable. No Safari/device test has been performed here.
