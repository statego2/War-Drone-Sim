// Reusable low-poly fictional vehicle hull. Pure vertices / triangles for tests.
export function slopedHullSpec(width,height,depth,topWidthRatio=.84,topDepthRatio=.82){
  if([width,height,depth].some(v=>!Number.isFinite(v)||v<=0)||
    ![topWidthRatio,topDepthRatio].every(v=>Number.isFinite(v)&&v>.45&&v<=1))
    throw new RangeError('Invalid arcade hull dimensions');
  const w=width/2,d=depth/2,tw=w*topWidthRatio,td=d*topDepthRatio;
  const positions=[
    -w,0,-d, w,0,-d, w,0,d, -w,0,d,
    -tw,height,-td, tw,height,-td, tw,height,td, -tw,height,td
  ];
  const quads=[
    [0,1,2,3], [4,7,6,5], [3,2,6,7],
    [0,4,5,1], [0,3,7,4], [1,5,6,2]
  ];
  const indices=[];
  for(const [a,b,c,d] of quads)indices.push(a,b,c,a,c,d);
  return {positions,indices};
}
