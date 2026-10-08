# Forest Encounter v0.9 — steep dive control

Owner playtest: v0.8 kept flying forward while the drone pointed steeply down. The desired control is a near-vertical drop after committing to a full downward drag, while partial downward input still travels forward.

The arcade flight model now blends horizontal cruise authority out as pitch passes about 0.72 radians and progressively brakes existing horizontal motion. The strongest braking is reached near 1.24 radians; vertical gravity/lift loss remains active. Releasing the drag levels the drone and forward cruise returns. This rule is a gameplay choice, not a physical model of a real multicopter.

`tests/flight3d.test.mjs` checks full versus partial dive, FAST braking, downward velocity, recoverability and frame step consistency. The phone playtest should decide whether the braking starts too early, whether the drop is fast enough, and whether the camera gives sufficient sense of height and proximity. Explosion visuals/audio remain for the next separate pass.
