// Forgiving, model-shaped contact volumes for a fictional arcade game.
// Pure relative swept intersection: works when either the drone or the visual
// prop moves quickly between rendered frames, without frame-rate artifacts.
// These are intentionally NOT physical vehicle specifications.
export const ARCADE_HIT_VOLUME=Object.freeze({
  tank:Object.freeze({x:8.1,y:6.0,z:11.8}),
  carrier:Object.freeze({x:9.2,y:6.4,z:12.5}),
  truck:Object.freeze({x:9.0,y:6.5,z:13.6})
});

export function sweptPropIntersection(from,to,start,end,volume){
  if(!volume || ![volume.x,volume.y,volume.z].every(v=>Number.isFinite(v)&&v>0))
    throw new RangeError('Arcade contact volume must have positive finite axes');
  const initial={
    x:(from.x-start.x)/volume.x,
    y:(from.y-start.y)/volume.y,
    z:(from.z-start.z)/volume.z
  };
  const delta={
    x:(to.x-end.x)/volume.x-initial.x,
    y:(to.y-end.y)/volume.y-initial.y,
    z:(to.z-end.z)/volume.z-initial.z
  };
  const c=initial.x**2+initial.y**2+initial.z**2-1;
  if(c<=0)return 0; // already inside forgiving silhouette at frame start
  const a=delta.x**2+delta.y**2+delta.z**2;
  if(a<1e-12)return null;
  const b=2*(initial.x*delta.x+initial.y*delta.y+initial.z*delta.z);
  if(b>=0)return null; // moving away from contact
  const discriminant=b*b-4*a*c;
  if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/(2*a);
  return Number.isFinite(t)&&t>=0&&t<=1?t:null;
}
