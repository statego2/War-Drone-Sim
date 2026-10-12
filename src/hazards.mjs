// Forgiving collisions against visually present procedural forest trees.
// This is a fictional arcade obstacle system, not a physical-world obstacle model.
const EPS = 1e-9;
const clamp = (v,min,max) => Math.min(max,Math.max(min,v));

export function treeHazard({x,z,ground,size,radius,id}) {
  return {
    id, x, z,
    bottom: ground + Math.max(.3,size*.12),
    top: ground + size * 1.06,
    // Visually readable: hitbox is narrower than the modeled foliage.
    radius: Math.max(.9, radius * .67)
  };
}

// First intersection between a line segment and the tree's forgiving vertical
// collision volume. A 2D radial sweep + vertical interval handles a fast dive
// through the canopy even when the first horizontal encounter was above it.
export function segmentTreeContact(from,to,tree) {
  const dx=to.x-from.x,dz=to.z-from.z,dy=to.y-from.y;
  const sx=from.x-tree.x,sz=from.z-tree.z;
  const a=dx*dx+dz*dz;
  const b=2*(sx*dx+sz*dz), c=sx*sx+sz*sz-tree.radius*tree.radius;
  let tEnter=0,tExit=1;
  if(a<EPS) {
    if(c>0)return null;
  } else {
    const discriminant=b*b-4*a*c;
    if(discriminant<0)return null;
    const root=Math.sqrt(discriminant);
    tEnter=Math.max(0,(-b-root)/(2*a));
    tExit=Math.min(1,(-b+root)/(2*a));
    if(tEnter>tExit || tExit<0 || tEnter>1)return null;
  }
  // Intersect the radial interval with the vertical interval.
  if(Math.abs(dy)<EPS) {
    if(from.y<tree.bottom || from.y>tree.top)return null;
  } else {
    const y1=(tree.bottom-from.y)/dy,y2=(tree.top-from.y)/dy;
    tEnter=Math.max(tEnter,Math.min(y1,y2));
    tExit=Math.min(tExit,Math.max(y1,y2));
    if(tEnter>tExit)return null;
  }
  if(tEnter>1||tExit<0)return null;
  const t=clamp(tEnter,0,1);
  return {type:'tree',id:tree.id,t,x:from.x+dx*t,y:from.y+dy*t,z:from.z+dz*t};
}

export function resolveTreeContact(from,to,trees) {
  let winner=null;
  for(const tree of trees) {
    // Cheap AABB rejection before the exact quadratic intersection.
    if(Math.max(from.x,to.x)+tree.radius<tree.x ||
       Math.min(from.x,to.x)-tree.radius>tree.x ||
       Math.max(from.z,to.z)+tree.radius<tree.z ||
       Math.min(from.z,to.z)-tree.radius>tree.z ||
       Math.max(from.y,to.y)<tree.bottom ||
       Math.min(from.y,to.y)>tree.top)continue;
    const hit=segmentTreeContact(from,to,tree);
    if(hit && (!winner || hit.t<winner.t))winner=hit;
  }
  return winner;
}

export function chooseContact(vehicle,tree,ground=false) {
  // Respect actual earliest swept contact, avoiding a hit behind a tree.
  if(vehicle?.type==='vehicle' && (!tree || (vehicle.t??1)<=(tree.t??1)))return vehicle;
  if(tree)return tree;
  if(vehicle)return vehicle;
  return ground?{type:'ground'}:null;
}
