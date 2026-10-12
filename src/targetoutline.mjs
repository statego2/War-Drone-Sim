// Compact arcade-world readability aid, not target detection or weapon guidance.
// Existing authored fictional props receive soft red silhouette edges only when
// nearby, inside the current game sector, and still intact.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{const t=clamp(x,0,1);return t*t*(3-2*t)};
export function outlineAppearance(target,player,sector,time=0,reducedMotion=false){
  if(target.destroyed||target.sector!==sector)return {visible:false,opacity:0};
  const d=Math.hypot(target.x-player.x,target.y-player.y,target.z-player.z);
  const far=ease((400-d)/135);
  const near=ease((d-8)/20);
  const strength=far*near;
  if(strength<.016)return {visible:false,opacity:0};
  const pulse=reducedMotion?1: .92+.08*Math.sin(time*2.5+target.id*.67);
  return {visible:true,opacity:clamp(strength*pulse*.79,0,.79),distance:d};
}
