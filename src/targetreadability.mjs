// Readable, restrained in-world glints for fictional arcade level objectives.
// No targeting system: purely a visual indication that an unbroken prop exists.
const clamp = (x,lo,hi) => Math.max(lo,Math.min(hi,x));
const smoothstep = x => { const t=clamp(x,0,1);return t*t*(3-2*t); };
export function beaconAppearance(target,player,sector,time=0,reducedMotion=false) {
  if(target.destroyed || target.sector !== sector)return {visible:false,opacity:0,size:0};
  const dx=target.x-player.x,dy=target.y-player.y,dz=target.z-player.z;
  const distance=Math.hypot(dx,dy,dz);
  const far=smoothstep((350-distance)/115);
  const near=smoothstep((distance-8)/30);
  const visible=far*near > .012;
  if(!visible)return {visible:false,opacity:0,size:0};
  // Keep the effect below vehicle / terrain readability. Never a neon lock-on.
  const pulse=reducedMotion?1:(.93+.07*Math.sin(time*2.2+target.id*.83));
  return {visible:true,opacity:clamp(.52*far*near*pulse,0,.52),
    size:5.6+2.1*far, distance};
}
