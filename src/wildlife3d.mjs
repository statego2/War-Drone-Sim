// A small, non-interactive living-forest layer: soft bird silhouettes swoop
// over authored landscape landmarks. Single instanced GPU draw call, no AI,
// network, physics collisions or real-world mapping.
import {LANDMARKS,landmarkPosition} from './landmarks.mjs';
export const BIRDS_PER_LANDMARK=6;
export const BIRD_COUNT=LANDMARKS.length*BIRDS_PER_LANDMARK;

export function birdPosition(index,time,anchors,reducedMotion=false){
  if(!Number.isInteger(index)||index<0||index>=BIRD_COUNT)throw new RangeError('Invalid bird index');
  const sector=Math.floor(index/BIRDS_PER_LANDMARK),wing=index%BIRDS_PER_LANDMARK;
  const base=anchors[sector];
  const phase=wing*2.39996+sector*1.31;
  const t=reducedMotion?0:time*(.31+wing*.017);
  const orbit=t+phase;
  const radius=24+(wing%3)*8;
  const x=base.x+Math.cos(orbit)*radius;
  const z=base.z+Math.sin(orbit*.87)*radius*.67;
  const y=base.y+Math.sin(t*1.9+phase)*2.7+Math.cos(t+wing*.8)*1.3;
  const yaw=orbit+Math.PI*.5;
  const tilt=reducedMotion?0:Math.sin(time*5.4+phase)*.23;
  return {x,y,z,yaw,tilt,scale:.84+(wing%3)*.12};
}

export function createWildlife(THREE,world,options){
  const {groundHeight,reducedMotion=false}=options;
  const anchors=LANDMARKS.map(site=>{
    const p=landmarkPosition(site);
    return {x:p.x,z:p.z,y:groundHeight(p.x,p.z)+29};
  });
  const vertices=new Float32Array([
    -2.8,.1,0,-.25,-.22,.35,0,.1,0,
    0,.1,0,.25,-.22,.35,2.8,.1,0
  ]);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
  geometry.computeVertexNormals();
  const material=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,depthWrite:false});
  const birds=new THREE.InstancedMesh(geometry,material,BIRD_COUNT);
  birds.frustumCulled=false;
  const palette=[0x263b38,0x3e5155,0x4f5346];
  const dummy=new THREE.Object3D();
  for(let i=0;i<BIRD_COUNT;i++)birds.setColorAt(i,new THREE.Color(palette[Math.floor(i/BIRDS_PER_LANDMARK)]));
  birds.instanceColor.needsUpdate=true;
  world.add(birds);
  function update(time,playerZ){
    for(let i=0;i<BIRD_COUNT;i++){
      const pose=birdPosition(i,time,anchors,reducedMotion);
      dummy.position.set(pose.x,pose.y,pose.z);
      dummy.rotation.set(0,pose.yaw,pose.tilt);
      const visible=Math.abs(playerZ-pose.z)<385;
      const size=visible?pose.scale:.00001;
      dummy.scale.set(size,size,size);
      dummy.updateMatrix();
      birds.setMatrixAt(i,dummy.matrix);
    }
    birds.instanceMatrix.needsUpdate=true;
  }
  update(0,0);
  return {update,count:BIRD_COUNT,dispose(){
    world.remove(birds);geometry.dispose();material.dispose();
  }};
}
