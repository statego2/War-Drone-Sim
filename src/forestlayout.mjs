// Three compact decorative forest side-clearings (fictional arcade scenery).
// Tracks and supply staging areas are environmental art, not new objectives.
import {roadCenter} from './flight3d.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const FOREST_SITES=Object.freeze([
  Object.freeze({id:'pine-camp',z:315,side:1}),
  Object.freeze({id:'bend-depot',z:711,side:-1}),
  Object.freeze({id:'final-camp',z:1127,side:1})
]);
export function sideTrailPoint(site,t) {
  t=clamp(t,0,1);
  return {x:roadCenter(site.z)+site.side*(6+100*t+9*Math.sin(Math.PI*t)),
    z:site.z+45*t};
}
export function scenicTrailClearance(x,z) {
  for(const site of FOREST_SITES){
    if(Math.abs(z-site.z)>94)continue;
    const start=roadCenter(site.z);
    if(Math.abs(x-start)>170)continue;
    const end=sideTrailPoint(site,1);
    if(Math.hypot(x-end.x,z-end.z)<31)return true;
    // Measure distance to the actual curved trail, not an approximate inverse
    // mapping of its X coordinate; that approximation left trees on the bend.
    let previous=sideTrailPoint(site,0);
    for(let i=1;i<=12;i++){
      const current=sideTrailPoint(site,i/12);
      const dx=current.x-previous.x,dz=current.z-previous.z;
      const projection=clamp(((x-previous.x)*dx+(z-previous.z)*dz)/
        (dx*dx+dz*dz),0,1);
      if(Math.hypot(x-(previous.x+projection*dx),z-(previous.z+projection*dz))<11)
        return true;
      previous=current;
    }
  }
  return false;
}
