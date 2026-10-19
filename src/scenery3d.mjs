// Self-contained procedural scenic dressing. No military or real-world data.
import {coverStyle,coverKind,coverColor,COVER_STYLES} from './groundcover.mjs';
import {inMistyWetland,channelPoint,channelWidth,tileHasWetland} from './wetlands.mjs';
import {mistLayout,MIST_STYLES} from './mistbanks.mjs';
export function createScenery(THREE, { TILE, hash, groundHeight, roadCenter, lakeProximity }) {
  const foliage = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const straw = new THREE.MeshLambertMaterial({ color: 0x9b8c5e });
  const water = new THREE.MeshPhongMaterial({ color: 0x4a8490, shininess: 70, transparent: true, opacity: .80, side: THREE.DoubleSide });
  const riverWater=new THREE.MeshPhongMaterial({color:0x79bbb0,emissive:0x143e42,
    shininess:95,transparent:true,opacity:.86,depthWrite:false,side:THREE.DoubleSide});
  const timber = new THREE.MeshLambertMaterial({ color: 0x86674c });
  const stone = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const roof = new THREE.MeshLambertMaterial({ color: 0x4c5854 });
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xb9c7b0 });
  const flower = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const grassGeo = new THREE.PlaneGeometry(1, 1.65);
  grassGeo.translate(0, .82, 0);
  const flowerGeo = new THREE.IcosahedronGeometry(.32, 0);
  const gravelGeo = new THREE.IcosahedronGeometry(1, 0);
  const campGeo = new THREE.CylinderGeometry(.09, .16, 1, 6);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x443c30 });
  const mistCanvas=document.createElement('canvas');
  mistCanvas.width=mistCanvas.height=128;
  const paint=mistCanvas.getContext('2d');
  const radial=paint.createRadialGradient(64,64,4,64,64,63);
  radial.addColorStop(0,'rgba(255,255,255,.60)');
  radial.addColorStop(.30,'rgba(255,255,255,.40)');
  radial.addColorStop(.70,'rgba(255,255,255,.12)');
  radial.addColorStop(1,'rgba(255,255,255,0)');
  paint.fillStyle=radial;paint.fillRect(0,0,128,128);
  const mistTexture=new THREE.CanvasTexture(mistCanvas);
  mistTexture.colorSpace=THREE.SRGBColorSpace;
  const mistGeometry=new THREE.PlaneGeometry(1,1);
  mistGeometry.rotateX(-Math.PI/2);
  const mistMaterial=new THREE.MeshBasicMaterial({
    map:mistTexture,color:0xffffff,transparent:true,
    opacity:.50,depthWrite:false,depthTest:true,side:THREE.DoubleSide
  });

  function mesh(parent, geo, mat, x, y, z, rotation = 0) {
    const out = new THREE.Mesh(geo, mat);
    out.position.set(x,y,z);
    out.rotation.y = rotation;
    out.userData.ownedGeometry = true;
    parent.add(out);
    return out;
  }
  function box(parent, sx, sy, sz, x, y, z, mat) {
    return mesh(parent,new THREE.BoxGeometry(sx,sy,sz),mat,x,y,z);
  }
  function instanced(group, geometry, material, items, builder) {
    if (!items.length) return;
    const result = new THREE.InstancedMesh(geometry,material,items.length);
    result.frustumCulled = true;
    const tmp = new THREE.Object3D();
    items.forEach((item,index)=>{
      tmp.position.set(item.x,item.y,item.z);
      tmp.rotation.set(item.ax||0,item.ry||0,item.az||0);
      tmp.scale.set(item.sx||1,item.sy||1,item.sz||1);
      tmp.updateMatrix();
      result.setMatrixAt(index,tmp.matrix);
      if (item.color!==undefined)result.setColorAt(index,new THREE.Color(item.color));
      if (builder) builder(result,index,item);
    });
    result.instanceMatrix.needsUpdate=true;
    if(result.instanceColor)result.instanceColor.needsUpdate=true;
    group.add(result);
  }
  function decorateGround(group,cx,cz,near) {
    if (!near) return;
    const grasses=[],stones=[],flowers=[],reeds=[];
    // Fixed upper cap per 320-unit tile. All details are GPU instanced and
    // share three tiny geometries regardless of ground-cover density.
    const count=Math.min(190,coverStyle((cz+.5)*TILE).count);
    for(let i=0;i<count;i++) {
      const x=hash(cx*1319+i*79,cz*733+i*13)*TILE;
      const z=hash(cz*377+i*31,cx*541+i*113)*TILE;
      const wx=cx*TILE+x,wz=cz*TILE+z;
      const offset=Math.abs(wx-roadCenter(wz));
      const lake=lakeProximity?lakeProximity(wx,wz):99;
      if(offset<9 || lake<1.10)continue;
      const y=groundHeight(wx,wz);
      const a=hash(cx*73+i,cz*97+i*23);
      const kind=coverKind(wz,i,lake<1.65 || (wz>520&&wz<970));
      const color=coverColor(wz,kind,hash(cx*61+i*7,cz*109+i*29));
      if(kind==='stone')stones.push({x,y:y+.12,z,sx:.4+a*.9,sy:.3+a*.5,sz:.55+a,color});
      else if(kind==='flower'&&offset>17)flowers.push({x,y:y+.35,z,sx:.7+a*.55,sy:.65+a*.6,sz:.8,color});
      else if(kind==='reed')reeds.push({x,y:y+.15,z,ry:a*6.28,sx:.22+a*.24,sy:1.7+a*.95,sz:1,color});
      else grasses.push({x,y:y+.1,z,ry:a*6.28,sx:.42+a*.83,sy:.62+a,sz:1,color});
    }
    instanced(group,grassGeo,foliage,grasses);
    instanced(group,grassGeo,foliage,reeds);
    instanced(group,gravelGeo,stone,stones);
    instanced(group,flowerGeo,flower,flowers);
  }
  function addStream(group,cx,cz) {
    // An ornamental winding creek appears in occasional terrain sectors away from the road.
    if (((cz+9000)%7)!==4) return;
    const centerX=cx*TILE;
    const pts=[],idx=[];
    const rows=22;
    for(let i=0;i<=rows;i++) {
      const x=centerX+i*TILE/rows;
      const z=cz*TILE+TILE*.64+Math.sin(x*.018)*13;
      if(Math.abs(x-roadCenter(z))<35) {
        // Keep the decorative creek off the road to avoid unsupported bridge geometry.
        pts.push(null);continue;
      }
      const tangent=Math.cos(x*.018)*13*.018;
      for(const side of [-1,1]) {
        const xx=x - tangent*side*3.8,zz=z+side*3.8;
        pts.push([xx-cx*TILE,groundHeight(xx,zz)+.22,zz-cz*TILE]);
      }
    }
    // Each pair of consecutive cross-sections forms an independent triangle ribbon.
    const verts=[],indices=[];
    let previous=null;
    for(let i=0;i<=rows;i++) {
      const x=centerX+i*TILE/rows;
      const z=cz*TILE+TILE*.64+Math.sin(x*.018)*13;
      if(Math.abs(x-roadCenter(z))<35){previous=null;continue;}
      const n=verts.length/3;
      for(const side of [-1,1]){
        const xx=x-Math.cos(x*.018)*.88*side, zz=z+side*3.8;
        verts.push(xx-cx*TILE,groundHeight(xx,zz)+.34,zz-cz*TILE);
      }
      if(previous!==null)indices.push(previous,previous+1,n,n,previous+1,n+1);
      previous=n;
    }
    if(!indices.length)return;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    geo.setIndex(indices);geo.computeVertexNormals();
    mesh(group,geo,water,0,0,0);
  }
  // Continuous meander on the forest side, tiled only where it intersects
  // the current x/z tile. This gives the second region a recognizable river
  // instead of a repeating flat green forest with occasional disconnected lines.
  function addWetlandRiver(group,cx,cz){
    if(!tileHasWetland(cz,TILE))return;
    const verts=[],uvs=[],inds=[],steps=96;
    const z0=cz*TILE;
    let previous=null;
    for(let i=0;i<=steps;i++){
      const z=z0+i*TILE/steps;
      if(!inMistyWetland(z)){previous=null;continue;}
      const p=channelPoint(z),half=channelWidth(z);
      if(Math.floor((p.x-half)/TILE)!==cx ||
         Math.floor((p.x+half)/TILE)!==cx){previous=null;continue;}
      const start=verts.length/3;
      for(const side of [-1,1]){
        const x=p.x+side*half;
        verts.push(x-cx*TILE,groundHeight(x,z)+.49,z-z0);
        uvs.push((side+1)*.5,(z-508)/25);
      }
      if(previous!==null)inds.push(previous,start,previous+1,previous+1,start,start+1);
      previous=start;
    }
    if(!inds.length)return;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geo.setIndex(inds);geo.computeVertexNormals();
    mesh(group,geo,riverWater,0,0,0);
  }

  function cabin(group,cx,cz,z,side,kind=0) {
    const wx=roadCenter(z)+side*(48+kind*18);
    if (Math.floor(wx/TILE)!==cx) return;
    const x=wx-cx*TILE, lz=z-cz*TILE,y=groundHeight(wx,z)+.4;
    const g=new THREE.Group();g.position.set(x,y,lz);
    g.rotation.y=.1+Math.sin(z*.018)*.12;
    group.add(g);
    const w=kind?11:9, depth=kind?15:11;
    box(g,w,4.2,depth,0,2.4,0,timber);
    const r1=box(g,w*.76,.55,depth+1,-w*.235,5.1,0,roof);r1.rotation.z=-.52;
    const r2=box(g,w*.76,.55,depth+1,w*.235,5.1,0,roof);r2.rotation.z=.52;
    box(g,1.45,2.5,.16,0,1.6,depth/2+.10,roof);
    for(const s of [-1,1])box(g,1.5,1.35,.18,s*2.7,2.9,depth/2+.12,windowMat);
    const porch=box(g,w+.7,.18,3,0,.35,depth/2+1.9,stone);
    porch.rotation.y=0;
    const chimney=box(g,.9,3,.9,w*.28,6.2,-depth*.2,stone);
    return g;
  }
  function addRoadside(group,cx,cz) {
    const z0=cz*TILE;
    // First discovery point: a tiny hillside lodge visible shortly after takeoff.
    if (cz===0) {
      cabin(group,cx,cz,145,1,1);
      cabin(group,cx,cz,191,1,0);
    }
    if ((cz+9000)%5===1) {
      cabin(group,cx,cz,z0+TILE*.46,1,(cz+9000)%2);
      cabin(group,cx,cz,z0+TILE*.57,1,0);
    }
    if((cz+9000)%3!==0) return;
    // Thin roadside posts give motion parallax, scale and distance cues.
    const posts=[];
    for(let i=1;i<12;i++){
      const z=z0+i*TILE/12;
      for(const side of [-1,1]){
        const x=roadCenter(z)+side*7.6;
        if(Math.floor(x/TILE)!==cx)continue;
        posts.push({x:x-cx*TILE,y:groundHeight(x,z)+.52,z:z-cz*TILE,sx:1,sy:1,sz:1});
      }
    }
    instanced(group,campGeo,poleMat,posts);
  }
  function addLowMist(group,cx,cz,near){
    if(!near)return;
    const list=mistLayout(cx,cz,TILE,hash,groundHeight,roadCenter);
    if(!list.length)return;
    const cloud=new THREE.InstancedMesh(mistGeometry,mistMaterial,list.length);
    const temp=new THREE.Object3D();
    for(let i=0;i<list.length;i++){
      const bank=list[i];
      temp.position.set(bank.x,bank.y,bank.z);
      temp.rotation.set(0,i*1.6+cx*.2+cz*.3,0);
      temp.scale.set(bank.width,bank.length,1);
      temp.updateMatrix();cloud.setMatrixAt(i,temp.matrix);
      cloud.setColorAt(i,new THREE.Color(bank.color).multiplyScalar(bank.opacity/.33));
    }
    cloud.instanceMatrix.needsUpdate=true;cloud.instanceColor.needsUpdate=true;
    cloud.frustumCulled=false;cloud.userData.lowMist=true;
    group.add(cloud);
  }
  function decorateTile(group,cx,cz,near) {
    decorateGround(group,cx,cz,near);
    addLowMist(group,cx,cz,near);
    addRoadside(group,cx,cz);
    if (near){addStream(group,cx,cz);addWetlandRiver(group,cx,cz);}
  }
  return { decorateTile, groundCoverStyles:COVER_STYLES.length, groundMistStyles:MIST_STYLES.length };
}
