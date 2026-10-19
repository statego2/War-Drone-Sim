import { groundHeight, roadCenter } from './flight3d.mjs';
import {ARCADE_HIT_VOLUME,sweptPropIntersection} from './contactvolume.mjs';

// Fixed fictional arcade scene. Positions and collision volumes are gameplay art,
// never a representation of a real vehicle or a real-world impact model.
// A compact authored forest level: three different clearings connected by flight.
// All vehicles are fictional, empty props. Positions are game-space composition.
export const LEVEL_SECTORS = Object.freeze([
  { name:'PINE APPROACH', spawnZ:55, targets:[
    [225,-12,'tank'],[264,47,'truck'],[303,-49,'carrier'],[345,45,'tank'],[383,-46,'truck']
  ] },
  { name:'FOREST BEND', spawnZ:475, targets:[
    [615,45,'carrier'],[657,-47,'tank'],[700,48,'truck'],[744,-44,'carrier'],[786,36,'tank']
  ] },
  { name:'FINAL CLEARING', spawnZ:890, targets:[
    [1045,-47,'truck'],[1074,46,'carrier'],[1107,-44,'tank'],
    [1143,47,'truck'],[1174,-49,'carrier'],[1212,36,'tank']
  ] }
]);
export const LEVEL_TARGETS = LEVEL_SECTORS.reduce((sum,sector)=>sum+sector.targets.length,0);
// Open only narrow approach lanes and pocket-sized cover gaps rather than a
// 69-meter empty meadow visible from the main road. The first easy target stays
// just off the road; later ones are surrounded by a searchable tree line.
export function objectiveApproachClearance(x,z){
  for(const section of LEVEL_SECTORS)for(const [targetZ,offset] of section.targets){
    if(Math.abs(z-targetZ)>57)continue;
    const homeX=roadCenter(targetZ)+offset;
    if(Math.hypot(x-homeX,z-targetZ)<19)return true;
    const startZ=targetZ-36,startX=roadCenter(startZ)+Math.sign(offset)*7;
    const dx=homeX-startX,dz=targetZ-startZ;
    const t=Math.max(0,Math.min(1,((x-startX)*dx+(z-startZ)*dz)/(dx*dx+dz*dz)));
    if(Math.hypot(x-(startX+dx*t),z-(startZ+dz*t))<8.5)return true;
  }
  return false;
}
export function forestRoadGap(z){return clearingRadius(z)>15?19:15;}
export function clearingRadius(z) {
  return (z>185 && z<415) || (z>575 && z<825) || (z>1005 && z<1250) ? 69 : 15;
}
export function makeEncounter() {
  let id=0;
  return { drones:1, hits:0, round:1, clock:0, discovered:new Set(), vehicles:LEVEL_SECTORS.flatMap((sector,sectorIndex)=>
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

export function spawnForNextTarget(encounter,preferredSector=null) {
  const valid=Number.isInteger(preferredSector)&&preferredSector>=0&&preferredSector<LEVEL_SECTORS.length;
  const hasLocal=valid&&encounter.vehicles.some(v=>v.sector===preferredSector&&!v.destroyed);
  const sector=hasLocal?preferredSector:activeSectorIndex(encounter);
  const live=encounter.vehicles.find(v=>v.sector===sector&&!v.destroyed);
  const z=Math.max(LEVEL_SECTORS[sector].spawnZ, (live?.z ?? LEVEL_SECTORS[sector].spawnZ+110)-110);
  const x=roadCenter(z);
  return { x, y:groundHeight(x,z)+28, z, sector };
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
