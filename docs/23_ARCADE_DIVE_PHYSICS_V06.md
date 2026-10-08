# Open Sky v0.6 — arcade momentum, pitch and steep dive

Date: 2026-10-08. Status: branch experiment; real iPhone tuning pending. This builds on Open Sky v0.5's one-finger steering and automatic follow camera.

## Research summary and sources

- Official PX4 flight mode documentation distinguishes manual tilt from translation: roll/pitch tilt control changes movement, while vehicle position/altitude behaviors depend on mode. Momentum persists unless stabilization actively brakes it:
  https://docs.px4.io/main/en/flight_modes_mc/index
  https://docs.px4.io/main/en/flight_modes_mc/manual_stabilized
- Betaflight describes Acro/Rate as a mode where sticks control angular rate rather than a commanded position, while Angle mode auto-levels:
  https://betaflight.com/docs/wiki/guides/current/Modes

Physics insight: A tilted multirotor's propulsion axis rotates with its body, reducing its upward thrust component. If upward support falls below gravity, the craft accelerates down. Existing velocity and body angle influence subsequent trajectory. A typical quad is not an airplane: propellers make thrust; fixed wings are not required.

## Implemented in this game (NOT an operational drone model)

- `flight3d.mjs`: independent 3D position/velocity values (vx, vy, vz), response lag on pitch and yaw, bounded steep nose-down pitch on large downward touch command, downward gravity acceleration when pitched, lateral inertia in turns, air-like quadratic vertical drag, and assisted climb recovery.
- A full finger-down drag smoothly raises the rendered nose-down pitch to approximately 76 degrees, deliberately avoiding true inverted flight. A small down gesture yields a moderate descent. Releasing returns pitch toward neutral but cannot instantly cancel existing downward momentum.
- `game3d.mjs`: the actual drone mesh pitches with the simulation, chase and FPV cameras tilt to follow the descent, wind audio reacts to 3D motion, HUD reports vertical rise/descent speed and an unobtrusive steep dive indication.
- `index.html`: simplified one-finger instructions and vertical-velocity HUD. No new buttons, combat interactions or missions.
- Automated model and browser checks assert sharper nose-down pitch, gravity-derived descent, delayed recovery and preserved steering.

## Important simplifications and product limits

This is a non-operational, game-feel model. The thrust and damping values are deliberately tuned for visual clarity and one-thumb accessibility, not derived from a specific aircraft's mass, rotor model, thrust curve, calibration, flight controller, or sensor measurements. It MUST NOT be used to train real-world drone operators or predict dive paths. There is no real-world vehicle targeting or weapon-control system.

## Owner acceptance criteria

1. Portrait Safari: fast drag all the way DOWN makes the drone visibly pitch nose-down and enter a fast descent. Do not add an Acro or separate dive button.
2. Let go and feel downward momentum persist briefly; then drag UP and verify that recovery requires time and altitude.
3. Left/right hold still steers the drone and camera automatically. No LOOK or FACE.
4. Verify visual quality, low-altitude behavior, smoothness, speed/vertical-speed HUD, sound and pause.
5. Test high altitude first; tune vertical acceleration, pitch responsiveness and camera tracking from player feedback. Measure actual phone FPS and thermals rather than trusting desktop CI.

## Gameplay remains a separate design decision

The current project is a flight/game-feel prototype, not the final short repeatable skill loop. Do not equate scientific-looking numbers or realistic-looking camera footage with operational flight simulation. Keep cinematic fictional-object contact/retry concept separate until owner approves gameplay.
