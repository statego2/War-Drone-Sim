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
export function groundHeight(x, z) {
  const d = Math.abs(x - roadCenter(z));
  const foothill = smooth((d - 65) / 590);
  const base = 9 * Math.sin(z * 0.0027) + 7 * Math.sin(x * 0.0037);
  // Reduce high-frequency terrain under and beside the road, preventing buried asphalt.
  const roadBlend = smooth((d - 12) / 46);
  const detail = 4 * noise(x * 0.022, z * 0.022) * roadBlend + 8 * noise(x * 0.007, z * 0.007);
  const mountains = foothill * (65 + 76 * noise(x * 0.0018 + 100, z * 0.0018));
  return base + detail + mountains;
}
export function makeFlight() {
  const x = roadCenter(0), z = 10;
  return { x, y: groundHeight(x, z) + 17, z, heading: 0, bank: 0, pitch: 0,
           yawRate: 0, climbRate: 0, speed: 24, throttle: 0.54,
           distance: 0, time: 0, groundContact: false };
}
export function stepFlight(f, input, dt) {
  dt = clamp(dt, 0, 0.05);
  const turn = clamp(input.x || 0, -1, 1), climb = clamp(input.y || 0, -1, 1);
  const targetYaw = turn * 0.92;
  const targetClimb = climb * 23;
  const ease = 1 - Math.exp(-4.8 * dt);
  f.yawRate = lerp(f.yawRate, targetYaw, ease);
  f.climbRate = lerp(f.climbRate, targetClimb, ease);
  f.throttle = clamp(f.throttle, 0, 1);
  f.speed = lerp(f.speed, f.throttle * 47, 1 - Math.exp(-2.5 * dt));
  f.heading += f.yawRate * dt;
  if (Math.abs(f.heading) > Math.PI * 2) f.heading %= Math.PI * 2;
  const dx = Math.sin(f.heading) * f.speed * dt;
  const dz = Math.cos(f.heading) * f.speed * dt;
  f.x += dx; f.z += dz; f.y += f.climbRate * dt;
  f.distance += Math.hypot(dx, dz); f.time += dt;
  const floor = groundHeight(f.x, f.z) + 2.2;
  f.groundContact = f.y < floor;
  if (f.groundContact) { f.y = floor; f.climbRate = Math.max(0, f.climbRate); }
  f.bank = lerp(f.bank, -turn * 0.25, ease);
  f.pitch = lerp(f.pitch, climb * 0.20, ease);
  return f;
}
export function advanceFlight(f, input, elapsed) {
  let left = clamp(elapsed, 0, 0.25);
  while (left > 0.000001) {
    const dt = Math.min(0.025, left);
    stepFlight(f, input, dt);
    left -= dt;
  }
  return f;
}
