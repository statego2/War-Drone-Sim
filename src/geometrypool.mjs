// Shared GPU primitive pool: individual vehicle meshes retain independent transforms,
// while repeated boxes/wheels point at one immutable geometry instead of dozens.
export function createPrimitiveGeometryPool(factory) {
  const boxes=new Map(),cylinders=new Map();
  function get(cache,args,build) {
    if(args.some(v=>!Number.isFinite(v)||v<=0))throw new RangeError('Positive finite geometry dimensions required');
    const key=args.join('/');
    if(!cache.has(key)) {
      const geometry=build(...args);
      geometry.userData ||= {};
      geometry.userData.sharedPrimitive=true;
      cache.set(key,geometry);
    }
    return cache.get(key);
  }
  return {
    box:(w,h,d)=>get(boxes,[w,h,d],factory.box),
    cylinder:(radius,height,segments=9)=>get(cylinders,[radius,height,segments],factory.cylinder),
    get stats(){return {boxes:boxes.size,cylinders:cylinders.size,total:boxes.size+cylinders.size};},
    dispose(){
      for(const geometry of [...boxes.values(),...cylinders.values()])geometry.dispose?.();
      boxes.clear();cylinders.clear();
    }
  };
}
