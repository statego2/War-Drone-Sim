// A lightweight, hysteresis-protected cinematic sense of travel. Re-entering
// a landmark does not play an infinite sound loop at a boundary.
export const AREA_GATES=Object.freeze([520,970]);
export function areaArrival(previous,z,padding=20){
  if(!Number.isInteger(previous)||previous<0||previous>2)
    throw new RangeError('area index 0..2 required');
  if(!Number.isFinite(z))return previous;
  const safe=Math.max(0,Math.min(55,padding));
  if(previous<2 && z>AREA_GATES[previous]+safe)return previous+1;
  if(previous>0 && z<AREA_GATES[previous-1]-safe)return previous-1;
  return previous;
}
