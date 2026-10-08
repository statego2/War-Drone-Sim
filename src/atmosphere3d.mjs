// Decorative cloud layers for the fictional open-sky flight world.
export function createClouds(THREE,scene,hash) {
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d');
  for(let i=0;i<10;i++) {
    const cx=58+i*17+Math.sin(i*7.2)*24;
    const cy=67+Math.cos(i*4.33)*16;
    const radius=37+Math.sin(i*5.1)*11;
    const grad=ctx.createRadialGradient(cx,cy,4,cx,cy,radius);
    grad.addColorStop(0,'rgba(255,255,250,.42)');
    grad.addColorStop(.56,'rgba(247,250,247,.25)');
    grad.addColorStop(1,'rgba(236,243,246,0)');
    ctx.fillStyle=grad;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,opacity:.87,depthWrite:false,fog:false});
  const clouds=[];
  const radius=6300;
  for(let i=0;i<27;i++){
    const cloud=new THREE.Sprite(material);
    const x=hash(i,801)*radius-radius/2,z=hash(402,i)*radius-radius/2;
    const y=300+hash(904,i)*300;
    const width=400+hash(i,1903)*680;
    cloud.scale.set(width,width*.36,1);
    cloud.renderOrder=-3;
    scene.add(cloud);
    clouds.push({mesh:cloud,x,z,y});
  }
  const wrap=(value,size)=>((value+size/2)%size+size)%size-size/2;
  function update(x,y,z,time){
    for(const item of clouds){
      const cx=wrap(item.x-x,radius);
      const cz=wrap(item.z-z,radius);
      item.mesh.position.set(cx,item.y+Math.sin(time*.09+item.z)*5,cz);
      item.mesh.material.opacity= y>7000?.3:.82;
    }
  }
  return {update};
}
