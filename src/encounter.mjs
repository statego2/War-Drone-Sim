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
  return { drones:1, hits:0, round:1, clock:0, vehicles:LEVEL_SECTORS.flatMap((sector,sectorIndex)=>
    sector.targets.map(([z,offset,kind])=>{
      const x=roadCenter(z)+offset;
      const targetId=id++;
      return { id:targetId, sector:sectorIndex, kind, x, z,
        homeX:x, homeZ:z, offset, moving:[1,4,6,9,11,14].includes(targetId),
        previousX:x, previousY:groundHeight(x,z)+2.2, previousZ:z,
        y:groundHeight(x,z)+2.2, destroyed:false };
    })
  ) };
}
// Authored motion is deliberately slow and bounded; all props are unmanned fictional
// game objects. Motion is deterministic, and destroyed wrecks stop immediately.
export function updateEncounter(encounter, dt) {
  encounter.clock += Math.max(0, Math.min(Number.isFinite(dt) ? dt : 0, .1));
  for (const vehicle of encounter.vehicles) {
    vehicle.previousX=vehicle.x;
    vehicle.previousY=vehicle.y;
    vehicle.previousZ=vehicle.z;
    if (!vehicle.moving || vehicle.destroyed) continue;
    const time=encounter.clock;
    const speed=.40+vehicle.id*.02;
    vehicle.z=vehicle.homeZ+10*Math.sin(time*speed);
    vehicle.x=roadCenter(vehicle.z)+vehicle.offset+
      3.5*Math.sin(time*(speed+.17));
    vehicle.y=groundHeight(vehicle.x,vehicle.z)+2.2;
  }
  return encounter;
}

export function spawnForNextTarget(encounter) {
  const sector=activeSectorIndex(encounter);
  const live=encounter.vehicles.find(v=>v.sector===sector&&!v.destroyed);
  const z=Math.max(LEVEL_SECTORS[sector].spawnZ, (live?.z ?? LEVEL_SECTORS[sector].spawnZ+110)-110);
  const x=roadCenter(z);
  return { x, y:groundHeight(x,z)+32, z, sector };
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
    // Use the moving target's own segment as well as the drone segment.
    // Relative sweep catches crossing paths even when the drone itself hardly moves.
    const startX=from.x-(vehicle.previousX??vehicle.x);
    const startY=from.y-(vehicle.previousY??vehicle.y);
    const startZ=from.z-(vehicle.previousZ??vehicle.z);
    const dx=to.x-vehicle.x-startX;
    const dy=to.y-vehicle.y-startY;
    const dz=to.z-vehicle.z-startZ;
    const length2=dx*dx+dy*dy+dz*dz;
    const t=length2?Math.max(0,Math.min(1,
      -(startX*dx+startY*dy+startZ*dz)/length2)):0;
    const px=startX+t*dx,py=startY+t*dy,pz=startZ+t*dz;
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
