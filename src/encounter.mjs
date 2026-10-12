import { groundHeight, roadCenter } from './flight3d.mjs';
import {ARCADE_HIT_VOLUME,sweptPropIntersection} from './contactvolume.mjs';

// Fixed fictional arcade scene. Positions and collision volumes are gameplay art,
// never a representation of a real vehicle or a real-world impact model.
// A compact authored forest level: three different clearings connected by flight.
// All vehicles are fictional, empty props. Positions are game-space composition.
export const LEVEL_SECTORS = Object.freeze([
  { name:'PINE APPROACH', spawnZ:55, targets:[
    [225,-12,'tank'],[264,30,'truck'],[303,-33,'carrier'],[345,26,'tank'],[383,-25,'truck']
  ] },
  { name:'FOREST BEND', spawnZ:475, targets:[
    [615,28,'carrier'],[657,-31,'tank'],[700,33,'truck'],[744,-27,'carrier'],[786,17,'tank']
  ] },
  { name:'FINAL CLEARING', spawnZ:890, targets:[
    [1045,-30,'truck'],[1074,31,'carrier'],[1107,-27,'tank'],
    [1143,36,'truck'],[1174,-32,'carrier'],[1212,17,'tank']
  ] }
]);
export const LEVEL_TARGETS = LEVEL_SECTORS.reduce((sum,sector)=>sum+sector.targets.length,0);
export function clearingRadius(z) {
  return (z>185 && z<415) || (z>575 && z<825) || (z>1005 && z<1250) ? 69 : 15;
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

// Model-shaped arcade volumes: generous along the visible hull and tracks,
// compact above the roof. Intersect the entire relative motion over the
// frame and choose the FIRST contact, not the closest point after impact.
export function resolveContact(encounter, from, to, groundContact = false) {
  let best = null;
  for (const vehicle of encounter.vehicles) {
    if (vehicle.destroyed) continue;
    const start={x:vehicle.previousX??vehicle.x,
      y:vehicle.previousY??vehicle.y,z:vehicle.previousZ??vehicle.z};
    const end={x:vehicle.x,y:vehicle.y,z:vehicle.z};
    const t=sweptPropIntersection(from,to,start,end,ARCADE_HIT_VOLUME[vehicle.kind]);
    if(t!==null&&(!best||t<best.t))best={type:'vehicle',id:vehicle.id,t};
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
