// A shallow, stylized river crossing in the middle forest biome. This is
// visual exploration scenery, not navigable water physics or real cartography.
import {roadCenter} from './flight3d.mjs';
export const RIVER=Object.freeze({z:770,length:560,width:9,samples:94});
export function riverPoint(t){
  const normalized=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
  const x=roadCenter(RIVER.z)+(normalized-.5)*RIVER.length;
  const z=RIVER.z+Math.sin((x-roadCenter(RIVER.z))*.019)*13+
    Math.sin(x*.007)*4;
  return {x,z};
}
export function riverCrossing(){
  const x=roadCenter(RIVER.z);
  // Since the stream curves slowly, crossing stays within bridge span.
  return {x,z:riverPoint(.5).z,span:37};
}
export function riverStrip(terrainHeight){
  const positions=[],alphas=[],indices=[];
  const offsets=[-1.45,-1.02,-.52,0,.52,1.02,1.45];
  for(let i=0;i<=RIVER.samples;i++){
    const t=i/RIVER.samples,p=riverPoint(t);
    const before=riverPoint(Math.max(0,t-.001));
    const after=riverPoint(Math.min(1,t+.001));
    const dx=after.x-before.x,dz=after.z-before.z;
    const length=Math.hypot(dx,dz)||1;
    const nx=-dz/length,nz=dx/length;
    for(let band=0;band<offsets.length;band++){
      const offset=offsets[band],x=p.x+nx*offset*RIVER.width,z=p.z+nz*offset*RIVER.width;
      positions.push(x,terrainHeight(x,z)+.62,z);
      const fade=band===0||band===6?0:band===1||band===5?.22:band===2||band===4?.72:.90;
      alphas.push(fade);
    }
    if(i>0)for(let band=0;band<offsets.length-1;band++){
      const a=(i-1)*offsets.length+band,b=i*offsets.length+band;
      indices.push(a,b,a+1,a+1,b,b+1);
    }
  }
  return {positions,alphas,indices};
}
