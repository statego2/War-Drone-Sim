// Pure placement of low, painterly fog wisps in a fictional forest world.
// No sensors or real geodata. Kept cheap for portrait mobile WebGL.
import {biomeIndex} from './biomes.mjs';

export const MIST_STYLES=Object.freeze([
  Object.freeze({name:'pine-dapple',count:1,alpha:.20,color:0xc9d3bf}),
  Object.freeze({name:'river-mist',count:5,alpha:.33,color:0xcde6df}),
  Object.freeze({name:'ridge-dust',count:1,alpha:.14,color:0xe4ceaa})
]);
export function mistLayout(cx,cz,size,hash,groundHeight,roadCenter){
  const zCenter=(cz+.5)*size;
  const biome=MIST_STYLES[biomeIndex(zCenter)];
  const wisps=[];
  for(let i=0;i<biome.count;i++){
    const x=(.16+.68*hash(cx*19+i*17,cz*27+i*7))*size;
    const z=(.12+.76*hash(cx*37+i*11,cz*13+i*43))*size;
    const wx=cx*size+x,wz=cz*size+z;
    if(Math.abs(wx-roadCenter(wz))<24)continue;
    const y=groundHeight(wx,wz)+2.2+hash(cx*17+i,cz*19+i)*3.5;
    const width=35+hash(cx*7+i*13,cz*29+i)*30;
    const length=25+hash(cx*71+i*5,cz*11+i*3)*26;
    wisps.push({x,y,z,width,length,color:biome.color,
      opacity:biome.alpha*(.66+.34*hash(cx*31+i,cz*53+i))});
  }
  return wisps;
}
