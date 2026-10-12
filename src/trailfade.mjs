// Soft dirt-scarring palette for fictional forest arena paths.
// Blend through grass instead of drawing oversized opaque beige road polygons.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function trailAlpha(side){
  return Math.abs(side)<.001?.70:.025;
}
export function padAlpha(radius){
  const t=clamp(radius,0,1);
  return .58*(1-t*t)+.015;
}
