// Browser free-flight model. Entertainment physics; NOT an RC/flight dynamics model.
export const TILE = 320;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export function hash(a, b) {
  let x = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
}
export function noise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), u = smooth(x - ix), v = smooth(z - iz);
  return lerp(lerp(hash(ix, iz), hash(ix + 1, iz), u),
              lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), u), v) * 2 - 1;
}
export function roadCenter(z) {
  return 57 * Math.sin(z * 0.0023) + 24 * Math.sin(z * 0.0061 + 0.7);
}
export const LAKE = Object.freeze({ x: -180, z: 400, rx: 145, rz: 160, level: 8 });
export function lakeProximity(x,z) {
  return Math.hypot((x-LAKE.x)/LAKE.rx,(z-LAKE.z)/LAKE.rz);
}
export function groundHeight(x, z) {
  const d = Math.abs(x - roadCenter(z));
  const foothill = smooth((d - 65) / 590);
  const base = 9 * Math.sin(z * 0.0027) + 7 * Math.sin(x * 0.0037);
  // Reduce high-frequency terrain under and beside the road, preventing buried asphalt.
  const roadBlend = smooth((d - 12) / 46);
  const detail = 4 * noise(x * 0.022, z * 0.022) * roadBlend + 8 * noise(x * 0.007, z * 0.007);
  const mountains = foothill * (65 + 76 * noise(x * 0.0018 + 100, z * 0.0018));
  const raw = base + detail + mountains;
  // A hand-placed scenic lake basin to create an actual geographical landmark.
  const radius = lakeProximity(x,z);
  if (radius >= 1.23) return raw;
  const hollow = smooth((1.23-radius) / .55);
  return lerp(raw, LAKE.level - 5.8, hollow);

}
// Game-feel flight dynamics (not a real autopilot, aircraft model or control law).
// Use smooth attitude, vector velocity, gravity, momentum and drag. The main
// controller remains one-finger: horizontal = bank and strafe with a guided turn,
// vertical = climb/dive; combine both freely for diagonal movements.
export const TURN_RATE = 1.34;
const GRAVITY = 9.81;
const MAX_DIVE_PITCH = 1.45; // ~83°, recoverable cinematic nose-down attitude
const MAX_PULLBACK_PITCH = 1.16; // ~66° nose up, non-inverted arcade reverse
export const shortestAngle = (from,to) => Math.atan2(Math.sin(to-from),Math.cos(to-from));
export function makeFlight() {
  const x=roadCenter(0),z=10;
  return {
    x, y:groundHeight(x,z)+17, z, heading:0, bank:0, pitch:0,
    yawRate:0, sideRate:0, climbRate:0,
    vx:0, vy:0, vz:43, speed:43, throttle:.72,
    distance:0, time:0, groundContact:false
  };
}
export function stepFlight(f,input,dt) {
  if(f.phase && f.phase!=='playing') return f;
  dt=clamp(dt,0,.05);
  if(dt===0)return f;
  const steer=clamp(input.x||0,-1,1);
  const vertical=clamp(input.y||0,-1,1);
  const down=Math.max(0,-vertical),up=Math.max(0,vertical);
  // Full swipe down creates a steep nose-down attitude. Small downward
  // movements remain controllable; no separate "dive" button.
  const desiredPitch=down>0
    ? clamp(.11*down+1.34*Math.pow(down,2.35),0,MAX_DIVE_PITCH)
    : -Math.min(MAX_PULLBACK_PITCH,.24*up+.92*Math.pow(up,3));
  f.pitch=lerp(f.pitch,desiredPitch,1-Math.exp(-7*dt));
  const pullback=smooth((-f.pitch-.49)/.59);
  // Horizontal drag primarily banks and translates; cruise gently turns.
  // HOVER has no commanded yaw so left/right really travels sideways.
  const turnAuthority=Math.min(1,Math.abs(f.throttle)*1.5);
  // Preserve camera-right strafing while backing up: do not let full
  // pullback also spin the craft around and invert diagonal controls.
  f.yawRate=lerp(f.yawRate,-steer*TURN_RATE*.72*turnAuthority*(1-.9*pullback),1-Math.exp(-10*dt));
  f.heading=Math.atan2(Math.sin(f.heading+f.yawRate*dt),Math.cos(f.heading+f.yawRate*dt));
  f.bank=lerp(f.bank,-steer*.38,1-Math.exp(-7*dt));
  f.throttle=clamp(f.throttle,-.6,1);

  // Velocity follows the aircraft's heading with inertia rather than
  // teleporting to a speed/direction every animation frame.
  const fx=Math.sin(f.heading),fz=Math.cos(f.heading);
  const rx=Math.cos(f.heading),rz=-Math.sin(f.heading);
  const along=f.vx*fx+f.vz*fz;
  const across=f.vx*rx+f.vz*rz;
  // Arcade velocity space, NOT a real multirotor flight model:
  // orientation redirects *new* movement, not existing momentum. Full
  // nose-down keeps a glide rather than imposing an artificial air brake.
  const tilt=smooth(Math.max(0,f.pitch)/MAX_DIVE_PITCH);
  // Redirected thrust makes a committed nose-dive accelerate *forward*
  // while gravity accelerates downward. No magic airborne stop or reversal.
  // Drag and speed targets remain arcade-friendly, not rotor specifications.
  const diveDrive=22*Math.max(0,f.throttle)*Math.sin(Math.max(0,f.pitch));
  // Gentle nose-up climbs retain cruise. Committed nose-up gradually points
  // the arcade movement impulse rearward, including in HOVER. Existing
  // velocity must actually bleed off before reversing; there is no snap.
  const rearward=pullback*38*Math.max(.35,Math.abs(f.throttle));
  const forwardTarget=f.throttle*78*(1-pullback)+diveDrive-rearward;
  const forwardAcceleration=clamp((forwardTarget-along)*lerp(2.2,1.15,tilt),-82,65);
  // Independent sideways movement works even in HOVER. Chase camera-right
  // is body -X here; combining axes permits all four diagonals.
  // Extra lateral authority at full pullback keeps reversed diagonals fun
  // rather than letting backward momentum cancel the sideways gesture.
  const lateralAcceleration=-across*lerp(2.7,2.05,tilt)-steer*27*(1+.95*pullback);
  f.vx+=(fx*forwardAcceleration+rx*lateralAcceleration)*dt;
  f.vz+=(fz*forwardAcceleration+rz*lateralAcceleration)*dt;

  // A tilted craft has less upward support. In an aggressive nose-down
  // dive gravity exceeds vertical lift, so falling speed ACCUMULATES.
  // Small/positive vertical gestures get forgiving assisted lift.
  // At very high nose-up attitudes the arcade lift assist compensates
  // for the lost vertical component so climb and dive recovery stay viable.
  const supportedLift=(GRAVITY+up*(19+24*pullback)-down*2.8)*Math.cos(f.pitch);
  const diveAssist=6.3*Math.max(0,f.throttle)*Math.sin(Math.max(0,f.pitch));
  const verticalAcceleration=supportedLift-GRAVITY-diveAssist-.11*f.vy-.006*f.vy*Math.abs(f.vy);
  f.vy+=verticalAcceleration*dt;
  const dx=f.vx*dt,dz=f.vz*dt;
  f.x+=dx;f.z+=dz;f.y+=f.vy*dt;
  f.distance+=Math.hypot(dx,dz);f.time+=dt;
  f.speed=f.vx*fx+f.vz*fz;
  f.climbRate=f.vy;
  const floor=groundHeight(f.x,f.z)+1.4;
  f.groundContact=f.y<=floor;
  if(f.groundContact){
    f.y=floor;
    // Preserve downward impact speed for the game director. The run ends here.
  }
  f.sideRate=f.vx*rx+f.vz*rz;
  f.pullback=pullback;
  return f;
}

export function advanceFlight(f, input, elapsed) {
  let left = clamp(elapsed, 0, 0.25);
  while (left > 0.000001) {
    const dt = Math.min(0.025, left);
    stepFlight(f, input, dt);
    // Stop the fixed substeps at the very first terrain impact. Continuing
    // integration after contact can advance the craft along the ground and
    // make a fast browser frame report a misleading hit location.
    if (f.groundContact) break;
    left -= dt;
  }
  return f;
}
