import { groundHeight, roadCenter } from './flight3d.mjs';

// Fixed fictional arcade scene. Positions and collision volumes are gameplay art,
// never a representation of a real vehicle or a real-world impact model.
// A compact authored forest level: three different clearings connected by flight.
// All vehicles are fictional, empty props. Positions are game-space composition.
export const LEVEL_SECTORS = Object.freeze([
  { name:'PINE APPROACH', spawnZ:55, targets:[
    [225,-12,'tank'],[264,11,'truck'],[303,-7,'carrier'],[345,14,'tank'],[383,0,'truck']
  ] },
  { name:'FOREST BEND', spawnZ:475, targets:[
    [615,14,'carrier'],[657,-15,'tank'],[700,8,'truck'],[744,-12,'carrier'],[786,13,'tank']
  ] },
  { name:'FINAL CLEARING', spawnZ:890, targets:[
    [1045,-17,'truck'],[1074,14,'carrier'],[1107,-14,'tank'],
    [1143,16,'truck'],[1174,-12,'carrier'],[1212,14,'tank']
  ] }
]);
export const LEVEL_TARGETS = LEVEL_SECTORS.reduce((sum,sector)=>sum+sector.targets.length,0);
export function clearingRadius(z) {
  return (z>185 && z<415) || (z>575 && z<825) || (z>1005 && z<1250) ? 38 : 15;
}
export function makeEncounter() {
  let id=0;
  return { drones:1, hits:0, round:1, vehicles:LEVEL_SECTORS.flatMap((sector,sectorIndex)=>
    sector.targets.map(([z,offset,kind])=>{
      const x=roadCenter(z)+offset;
      return { id:id++, sector:sectorIndex, kind, x, z,
        y:groundHeight(x,z)+2.2, destroyed:false };
    })
  ) };
}
export function activeSectorIndex(encounter) {
  const remaining=encounter.vehicles.find(v=>!v.destroyed);
  return remaining ? remaining.sector : LEVEL_SECTORS.length-1;
}
export function sectorProgress(encounter,index=activeSectorIndex(encounter)) {
  const vehicles=encounter.vehicles.filter(v=>v.sector===index);
  return { hits:vehicles.filter(v=>v.destroyed).length, total:vehicles.length };
}
export function levelComplete(encounter) {
  return encounter.hits===encounter.vehicles.length;
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
  encounter.drones++;
  return encounter;
}
