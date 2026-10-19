// Procedural, airy high-cloud silhouettes that do not swamp a small portrait
// screen with enormous opaque grey discs. All imagery is generated locally.
export const CLOUD_VISUAL=Object.freeze({
  count:16,worldRadius:7400,
  minWidth:250,maxWidth:600,aspect:.25,opacity:.42,
  minAltitude:460,maxAltitude:920
});
export function createClouds(THREE,scene,hash) {
  const canvas=document.createElement('canvas');
  canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d');
  // Wispy connected cloudlets with transparent edges and room for blue sky.
  for(let cluster=0;cluster<4;cluster++){
    for(let layer=0;layer<4;layer++){
      const x=90+cluster*105+(layer-1.5)*15;
      const y=122+Math.sin(cluster*2.6+layer*.9)*17;
      const rx=44+layer*10,ry=32+layer*3;
      ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);
      const gradient=ctx.createRadialGradient(0,0,4,0,0,rx);
      gradient.addColorStop(0,'rgba(255,252,239,.22)');
      gradient.addColorStop(.42,'rgba(252,250,238,.15)');
      gradient.addColorStop(.76,'rgba(240,246,239,.045)');
      gradient.addColorStop(1,'rgba(236,243,246,0)');
      ctx.fillStyle=gradient;
      ctx.beginPath();ctx.arc(0,0,rx,0,2*Math.PI);ctx.fill();
      ctx.restore();
    }
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({
    map:texture,transparent:true,opacity:CLOUD_VISUAL.opacity,
    depthWrite:false,fog:false
  });
  const clouds=[];
  const radius=CLOUD_VISUAL.worldRadius;
  for(let i=0;i<CLOUD_VISUAL.count;i++){
    const cloud=new THREE.Sprite(material);
    const x=hash(i,801)*radius-radius/2,z=hash(402,i)*radius-radius/2;
    const y=CLOUD_VISUAL.minAltitude+hash(904,i)*
      (CLOUD_VISUAL.maxAltitude-CLOUD_VISUAL.minAltitude);
    const width=CLOUD_VISUAL.minWidth+hash(i,1903)*
      (CLOUD_VISUAL.maxWidth-CLOUD_VISUAL.minWidth);
    cloud.scale.set(width,width*CLOUD_VISUAL.aspect,1);
    cloud.renderOrder=-3;scene.add(cloud);
    clouds.push({mesh:cloud,x,z,y});
  }
  const wrap=(value,size)=>((value+size/2)%size+size)%size-size/2;
  function update(x,y,z,time){
    for(const item of clouds){
      const cx=wrap(item.x-x,radius),cz=wrap(item.z-z,radius);
      item.mesh.position.set(cx,item.y+Math.sin(time*.055+item.z)*2.6,cz);
    }
    material.opacity=y>7000?.18:CLOUD_VISUAL.opacity;
  }
  return {update};
}
