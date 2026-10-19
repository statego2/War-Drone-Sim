// Cinematic third-person landscape framing for a portrait arcade flying game.
// The camera is aimed at the forest during search, not mostly empty sky.
// Pure composition only: no effect on aircraft physics or input controls.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function forestChasePitch({height=25,pitch=0,pullback=0}={}){
  const altitude=clamp(height,0,240);
  const searchLook=-.16-.14*clamp(altitude/180,0,1);
  return clamp(searchLook-.67*pitch-.39*clamp(pullback,0,1),-1.04,.39);
}
