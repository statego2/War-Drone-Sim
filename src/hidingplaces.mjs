// Pure deterministic placement perturbation for fictional arcade props.
// Vehicles remain inside pre-cleared authored pockets; the first tank never
// changes so new players retain the same approachable learning encounter.
import {hash} from './flight3d.mjs';
export function varyHidingPlace(id,seed=0){
  if(!Number.isSafeInteger(id)||id<0)throw new RangeError('invalid prop ID');
  if(!Number.isFinite(seed)||seed===0||id===0)return {x:0,z:0};
  const n=Math.trunc(seed)|0;
  const sideways=(hash(n+id*97,n^id*251)*2-1)*6.8;
  const lengthwise=(hash(n^id*433,n+id*51)*2-1)*7.8;
  return {x:Math.round(sideways*100)/100,z:Math.round(lengthwise*100)/100};
}
