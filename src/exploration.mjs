// Pure fictional game exploration: the forest conceals objectives until the
// player actually flies near them and faces the clearing. Never a real sensor.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const DISCOVERY_RANGE=82;
export const CLOSE_DISCOVERY_RANGE=22;
export const DISCOVERY_HINTS=Object.freeze([
  'PINES · SEARCH',
  'RIVER · SEARCH',
  'RIDGE · SEARCH'
]);
export function canDiscover(target,flight,terrainHeight=null){
  if(target.destroyed)return false;
  const dx=target.x-flight.x,dy=target.y-flight.y,dz=target.z-flight.z;
  const horizontal=Math.hypot(dx,dz),distance=Math.hypot(horizontal,dy);
  if(distance>DISCOVERY_RANGE)return false;
  const close=distance<CLOSE_DISCOVERY_RANGE;
  if(!close){
    if(horizontal<.01)return Math.abs(dy)<40;
    const facing=Math.cos(flight.heading||0)*dz/horizontal+
      Math.sin(flight.heading||0)*dx/horizontal;
    if(facing<.14 || dy>40)return false;
  }
  // Optional gentle terrain blocking (sampled game terrain rather than actual
  // object-recognition/raycasting). Never require high-end device sensors.
  if(terrainHeight&&!close){
    for(let i=1;i<=5;i++){
      const t=i/6,x=flight.x+dx*t,z=flight.z+dz*t;
      const lineY=flight.y+dy*t;
      if(terrainHeight(x,z)>lineY-2)return false;
    }
  }
  return true;
}
export function discoverNearby(encounter,flight,terrainHeight=null){
  const spotted=encounter.discovered || (encounter.discovered=new Set());
  const next=[];
  const sector=encounter.vehicles.find(v=>!v.destroyed)?.sector??0;
  for(const v of encounter.vehicles){
    if(v.sector!==sector||v.destroyed||spotted.has(v.id))continue;
    if(canDiscover(v,flight,terrainHeight)){
      spotted.add(v.id);next.push(v.id);
    }
  }
  return next;
}
export function explorationHint(encounter){
  const sector=encounter.vehicles.find(v=>!v.destroyed)?.sector??0;
  const remaining=encounter.vehicles.filter(v=>v.sector===sector&&!v.destroyed);
  const revealed=remaining.filter(v=>encounter.discovered?.has(v.id));
  return {
    sector,
    remaining:remaining.length,
    revealed:revealed.length,
    clue:DISCOVERY_HINTS[sector]||'SEARCH THE FOREST',
    label: revealed.length>0 ? `SPOTTED ${revealed.length} · EXPLORE` :
      (DISCOVERY_HINTS[sector]||'SEARCH THE FOREST')
  };
}
