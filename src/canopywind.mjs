// Fine seasonal forest canopy motion. A shared shader uniform nudges small
// procedural crowns only; the arcade collision geometry remains stable.
import {biomeBlend} from './biomes.mjs';
const STRENGTH=Object.freeze([.022,.012,.034]);
export function canopyWindStrength(z,reducedMotion=false){
  if(reducedMotion)return 0;
  const {from,to,t}=biomeBlend(Number.isFinite(z)?z:0);
  return STRENGTH[from]+(STRENGTH[to]-STRENGTH[from])*t;
}
export function canopyWindPhase(seconds){
  return Math.max(0,Math.min(1e7,Number.isFinite(seconds)?seconds:0));
}
