// Discoverable natural environmental anchor points. These are not enemy
// positions or real navigation references; they create variety within a
// connected fictional browser forest and make exploring feel purposeful.
import {roadCenter} from './flight3d.mjs';
export const LANDMARKS=Object.freeze([
  Object.freeze({id:'fallen-giants',name:'FALLEN GIANTS',kind:'fallen-grove',
    z:285,offset:-105,radius:32,sector:0}),
  Object.freeze({id:'silver-spring',name:'SILVER SPRING',kind:'waterfall',
    z:730,offset:115,radius:37,sector:1}),
  Object.freeze({id:'amber-arch',name:'AMBER ARCH',kind:'stone-arch',
    z:1130,offset:-105,radius:34,sector:2})
]);
export function landmarkPosition(site){
  return {x:roadCenter(site.z)+site.offset,z:site.z};
}
export function landmarkClearance(x,z){
  return LANDMARKS.some(site=>{
    const p=landmarkPosition(site);
    return Math.hypot(x-p.x,z-p.z)<site.radius;
  });
}
export function landmarkAt(x,z,radius=32){
  for(const site of LANDMARKS){
    const p=landmarkPosition(site);
    if(Math.hypot(x-p.x,z-p.z)<radius)return site;
  }
  return null;
}
