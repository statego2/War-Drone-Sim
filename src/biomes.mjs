// Three highly distinct but smoothly blended authored landscape identities.
// Pure color/region data, unrelated to real-world cartography or flight systems.
export const BIOMES=Object.freeze([
  Object.freeze({id:'pine',name:'PINE SHADOWS',hint:'DEEP GREENWOOD',
    terrain:Object.freeze([0x344b37,0x456443,0x52634c,0x43553c]),
    evergreen:Object.freeze([0x173e31,0x22483a,0x35583c,0x41664d,0x2c543b]),
    deciduous:Object.freeze([0x486d49,0x5a754c,0x728153]),
    horizon:0x879f96,zenith:0x274f62,fog:0x789186,
    hemi:0xc0ddd4,sun:0xffdfb8,fogFactor:1.28,sunIntensity:2.15}),
  Object.freeze({id:'valley',name:'MISTY RIVER',hint:'WETLANDS & WOODLAND',
    terrain:Object.freeze([0x546c50,0x677a57,0x465f53,0x7a8163]),
    evergreen:Object.freeze([0x285b4b,0x347367,0x40695d,0x476c4d]),
    deciduous:Object.freeze([0x71965d,0x889f6a,0x547b65,0x91a276]),
    horizon:0x9cbab8,zenith:0x497a93,fog:0x8cb4ad,
    hemi:0xd7ebe5,sun:0xffe8c6,fogFactor:1.7,sunIntensity:2.50}),
  Object.freeze({id:'ridge',name:'AMBER HIGHLANDS',hint:'ROCKS & GOLDEN PINES',
    terrain:Object.freeze([0x78715a,0x716d59,0x887d66,0x626c53]),
    evergreen:Object.freeze([0x35503c,0x58664b,0x4c5540]),
    deciduous:Object.freeze([0xa27f4c,0xaf8a4c,0x956a3f,0xb49a64]),
    horizon:0xc4ae8e,zenith:0x5d7284,fog:0xb5a48f,
    hemi:0xd6d7cc,sun:0xffd09a,fogFactor:.85,sunIntensity:2.85})
]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=v=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export function biomeIndex(z){
  return z<520?0:z<970?1:2;
}
export function biomeBlend(z){
  if(z>=470&&z<570)return {from:0,to:1,t:smooth((z-470)/100)};
  if(z>=920&&z<1020)return {from:1,to:2,t:smooth((z-920)/100)};
  const i=biomeIndex(z);
  return {from:i,to:i,t:0};
}
export function biomePalette(z){
  return BIOMES[biomeIndex(z)];
}
export function biomeFoliage(z,seed,broad=false){
  const p=biomePalette(z),colors=broad?p.deciduous:p.evergreen;
  return colors[Math.min(colors.length-1,Math.floor(clamp(seed,0,.999999)*colors.length))];
}
export function biomeVegetation(z){
  const i=biomeIndex(z);
  return i===0?{density:1.0,deciduousEvery:9,rocksEvery:17}:
    i===1?{density:.76,deciduousEvery:3,rocksEvery:19}:
    {density:.83,deciduousEvery:4,rocksEvery:7};
}
