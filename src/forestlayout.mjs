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
    const t=clamp((x-start)*site.side/106,0,1);
    const p=sideTrailPoint(site,t),end=sideTrailPoint(site,1);
    if(Math.hypot(x-p.x,z-p.z)<11 || Math.hypot(x-end.x,z-end.z)<31)return true;
  }
  return false;
}
