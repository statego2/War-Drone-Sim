import { groundHeight, roadCenter } from './flight3d.mjs';

// Fixed fictional arcade scene. Positions and collision volumes are gameplay art,
// never a representation of a real vehicle or a real-world impact model.
const Z = [235, 277, 319];
export function makeEncounter() {
  return { drones: 1, hits: 0, round: 1, vehicles: Z.map((z, id) => {
    const x = roadCenter(z) + [-8, 0, 8][id];
    return { id, x, z, y: groundHeight(x, z) + 2.2, destroyed: false };
  }) };
}

// Minimum distance from a swept flight segment to each deliberately generous
// spherical silhouette. Checking the segment prevents skipping hits at speed.
export function resolveContact(encounter, from, to, groundContact = false) {
  let best = null;
  for (const vehicle of encounter.vehicles) {
    if (vehicle.destroyed) continue;
    const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
    const length2 = dx*dx + dy*dy + dz*dz;
    const t = length2 ? Math.max(0, Math.min(1,
      ((vehicle.x-from.x)*dx + (vehicle.y-from.y)*dy + (vehicle.z-from.z)*dz)/length2)) : 0;
    const px = from.x + t*dx - vehicle.x;
    const py = from.y + t*dy - vehicle.y;
    const pz = from.z + t*dz - vehicle.z;
    const distance2 = px*px + py*py + pz*pz;
    if (distance2 < 7.8*7.8 && (!best || t < best.t)) best = { type:'vehicle', id:vehicle.id, t };
  }
  // Vehicle contact wins the same-frame tie at the road surface.
  return best || (groundContact ? { type:'ground' } : null);
}
export function applyContact(encounter, contact) {
  if (contact?.type !== 'vehicle') return false;
  const vehicle = encounter.vehicles[contact.id];
  if (!vehicle || vehicle.destroyed) return false;
  vehicle.destroyed = true;
  encounter.hits++;
  return true;
}
export function nextDrone(encounter) {
  if (encounter.hits === encounter.vehicles.length) {
    const fresh = makeEncounter();
    fresh.round = encounter.round + 1;
    return fresh;
  }
  encounter.drones++;
  return encounter;
}
