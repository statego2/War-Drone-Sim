# Forest Encounter v2 — Moving Props, Guidance, Arcade Scoring

**Implementation experiment — 12 October 2026.** The original 16-target, three-clearing forest route remains intact. This upgrade concentrates on replayable moment-to-moment fun and clarity, not a larger menu or a real-world drone simulation.

## Player-facing changes

- **Six moving empty fictional props**, interspersed with ten stationary props. They move slowly on short deterministic tracks near their original parking spots. The target remains approachable and a miss is recoverable on the next drone.
- **Swept relative collision:** resolve contact against the vehicle movement over the frame, instead of relying only on the vehicle's final position.
- **Target compass:** minimal text arrow and distance to a surviving vehicle in the active clearing. It points behind when the drone overshoots and reselects after a hit. It is an arcade navigation aid, not a real-world tracking or attack tool.
- **Forward checkpoint:** respawn about 110 game units before the next uncleared prop, never on top of it. Three clearings and the final clear screen remain.
- **Arcade score / chain:** hit score combines forward pace, dramatic dive and consecutive successful drones. A miss resets the chain, not the score. The level-complete screen records a local best score alongside fewest drones. No login/telemetry.
- **Visual correction:** all fictional props consistently use the olive/khaki material palette.

## Safeguards and acceptance

1. Keep all 16 props, three sectors, persistent wrecks, and approx. 0.98s respawn.
2. Automatic route pointer must update after all hits; no touch controls overlap or hidden control mode.
3. Pure unit tests cover bounded motion, swept moving collision, checkpoint distance, direction/overshoot and score persistence.
4. WebGL Chromium smoke + real iPhone Safari play must be checked independently. Browser CI is not phone acceptance.
5. Record FPS/smoothness, visual readability, battery heat and impact enjoyment before treating G1/G2 as approved. Motion and compass remain reversible.

**Future, not implemented:** moving-convoy polish, additional art-directed scenery, more level layouts, phone-based playtest telemetry (only with consent), 60fps optimization based on device measurements.
