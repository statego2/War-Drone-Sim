// Small, reproducible ground-level world dressing. Data and picking logic
// stay pure so WebGL and browser availability never affect artistic placement.
import {biomeIndex} from './biomes.mjs';
export const COVER_STYLES=Object.freeze([
  Object.freeze({name:'pine-understory',count:146,rockEvery:23,bloomEvery:47,reedEvery:0,
    grasses:Object.freeze([0x536b43,0x708057,0x466b4c,0x87916b]),
    rocks:Object.freeze([0x7b8076,0x8f9182]),blooms:Object.freeze([0xb9b27e,0xddd1a5])}),
  Object.freeze({name:'river-meadows',count:174,rockEvery:29,bloomEvery:13,reedEvery:9,
    grasses:Object.freeze([0x648763,0x82a079,0x598c79,0xa5aa72]),
    rocks:Object.freeze([0x8b9990,0x929785]),blooms:Object.freeze([0xd4c2d4,0xf1d9a2,0xbfd6cc])}),
  Object.freeze({name:'amber-heather',count:152,rockEvery:7,bloomEvery:12,reedEvery:0,
    grasses:Object.freeze([0x867951,0xb09a69,0x827958,0x9d8663]),
    rocks:Object.freeze([0x9d9382,0x7e8179,0xc0af8d]),blooms:Object.freeze([0xcb9869,0xd6b46c,0xaf826b])})
]);
export function coverStyle(z){return COVER_STYLES[biomeIndex(z)];}
export function coverKind(z,index,wet=false){
  const p=coverStyle(z);
  if(index%p.rockEvery===0)return 'stone';
  if(p.reedEvery && wet && index%p.reedEvery===0)return 'reed';
  if(index%p.bloomEvery===0)return 'flower';
  return 'grass';
}
export function coverColor(z,kind,seed){
  const p=coverStyle(z);
  const colors=kind==='stone'?p.rocks:kind==='flower'?p.blooms:p.grasses;
  const index=Math.min(colors.length-1,Math.max(0,Math.floor(seed*colors.length)));
  return colors[index];
}
