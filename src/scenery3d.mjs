// Self-contained procedural scenic dressing. No military or real-world data.
export function createScenery(THREE, { TILE, hash, groundHeight, roadCenter, lakeProximity }) {
  const foliage = new THREE.MeshLambertMaterial({ color: 0x5b6b39, side: THREE.DoubleSide });
  const straw = new THREE.MeshLambertMaterial({ color: 0x9b8c5e });
  const water = new THREE.MeshPhongMaterial({ color: 0x4a8490, shininess: 70, transparent: true, opacity: .80, side: THREE.DoubleSide });
  const timber = new THREE.MeshLambertMaterial({ color: 0x86674c });
  const stone = new THREE.MeshLambertMaterial({ color: 0x9f9b88 });
  const roof = new THREE.MeshLambertMaterial({ color: 0x4c5854 });
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xb9c7b0 });
  const flower = new THREE.MeshLambertMaterial({ color: 0xc2ad72, side: THREE.DoubleSide });
  const grassGeo = new THREE.PlaneGeometry(1, 1.65);
  grassGeo.translate(0, .82, 0);
  const flowerGeo = new THREE.IcosahedronGeometry(.32, 0);
  const gravelGeo = new THREE.IcosahedronGeometry(1, 0);
  const campGeo = new THREE.CylinderGeometry(.09, .16, 1, 6);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x443c30 });

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
    result.frustumCulled = false;
    const tmp = new THREE.Object3D();
    items.forEach((item,index)=>{
      tmp.position.set(item.x,item.y,item.z);
      tmp.rotation.set(item.ax||0,item.ry||0,item.az||0);
      tmp.scale.set(item.sx||1,item.sy||1,item.sz||1);
      tmp.updateMatrix();
      result.setMatrixAt(index,tmp.matrix);
      if (builder) builder(result,index,item);
    });
    result.instanceMatrix.needsUpdate=true;
    group.add(result);
  }
  function decorateGround(group,cx,cz,near) {
    if (!near) return;
    const grasses=[],stones=[],flowers=[];
    const count=140;
    for(let i=0;i<count;i++) {
      const x=hash(cx*1319+i*79,cz*733+i*13)*TILE;
      const z=hash(cz*377+i*31,cx*541+i*113)*TILE;
      const wx=cx*TILE+x,wz=cz*TILE+z;
      const offset=Math.abs(wx-roadCenter(wz));
      if(offset<8 || (lakeProximity && lakeProximity(wx,wz) < 1.12)) continue;
      // Broad meadow openings, only scattered foliage around the forest.
      const y=groundHeight(wx,wz);
      const a=hash(cx*73+i,cz*97+i*23);
      if (i%12===0) stones.push({x,y:y+.12,z,sx:.4+a*.9,sy:.3+a*.5,sz:.55+a});
      else if(i%17===0 && offset>17) flowers.push({x,y:y+.35,z,sx:.8,sy:.8,sz:.8});
      else grasses.push({x,y:y+.1,z,ry:a*6.28,sx:.45+a*.8,sy:.6+a,sz:1});
    }
    instanced(group,grassGeo,foliage,grasses);
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
  function decorateTile(group,cx,cz,near) {
    decorateGround(group,cx,cz,near);
    addRoadside(group,cx,cz);
    if (near) addStream(group,cx,cz);
  }
  return { decorateTile };
}
