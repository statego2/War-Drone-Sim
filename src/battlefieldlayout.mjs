// Authored visual layout for three fictional arcade forest encounter clearings.
// Declarative site geometry only: this does not modify vehicle collisions,
// navigation, flight input or any real-world operational system.
import { LEVEL_SECTORS } from './encounter.mjs';
import {roadCenter} from './flight3d.mjs';

const round=(x)=>Math.round(x*1000)/1000;

export function battlefieldLayout(){
  const trails=[],pads=[];
  for(let sector=0;sector<LEVEL_SECTORS.length;sector++){
    const targets=LEVEL_SECTORS[sector].targets;
    const first=targets[0][0], last=targets[targets.length-1][0];
    const mid=(first+last)*.5;
    for(const side of [-1,1]){
      // Roads curve around a wider pocket before returning to the main route.
      // Their ends meet the existing road; the central sections reveal lateral
      // traversable space instead of a single endless forest corridor.
      const path=[
        [first-45,0],
        [first-8,side*23],
        [mid-25,side*37],
        [mid+25,side*42],
        [last+15,side*28],
        [last+48,0]
      ].map(([z,offset])=>({x:round(roadCenter(z)+offset),z:round(z)}));
      trails.push({id:sector+':'+side,sector,side,width:2.45,path});
      pads.push({id:'hub-'+sector+'-'+side,sector,
        x:round(roadCenter(mid+side*15)+side*34),z:round(mid+side*15),
        rx:11,rz:15,style:'hub'});
    }
    for(let i=0;i<targets.length;i++){
      const [z,offset,kind]=targets[i];
      pads.push({id:'vehicle-'+sector+'-'+i,sector,
        x:round(roadCenter(z)+offset),z,rx:10+(i%2)*1.1,
        rz:12+(i%3)*1.4,style:kind});
    }
  }
  return {trails,pads};
}
