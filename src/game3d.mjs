import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TILE, clamp, hash, roadCenter, groundHeight, makeFlight, advanceFlight, LAKE, lakeProximity } from './flight3d.mjs';
import { createFlightAudio } from './audio3d.mjs';
import { createScenery } from './scenery3d.mjs';
import { createClouds } from './atmosphere3d.mjs';
import { makeEncounter, resolveContact, applyContact, nextDrone } from './encounter.mjs';
import { createImpactFX, impactEnvelope } from './impactfx3d.mjs';
import { gestureAxes } from './touchflight.mjs';

// A floating-origin, streamed polygonal world. No real-drone targeting or hardware integration.
const $ = id => document.getElementById(id);
const canvas = $('scene'), overlay = $('overlay'), primary = $('primary');
const hud = $('hud'), pauseButton = $('pause'), distanceEl = $('distance');
const altitudeEl = $('altitude'), speedEl = $('speed'), hint = $('hint');
const viewButton = $('view-mode'), muteButton = $('sound-toggle');
const warning = $('warning');
const sound = createFlightAudio();
const scenery = createScenery(THREE, { TILE, hash, groundHeight, roadCenter, lakeProximity });
const mobile = matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.27;
let qualityDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.45 : 1.85);
renderer.setPixelRatio(qualityDpr);
const scene = new THREE.Scene();
const clouds = createClouds(THREE,scene,hash);
scene.fog = new THREE.FogExp2(0xb0beb5, .00032);
const baseFov = mobile ? 73 : 70;
const camera = new THREE.PerspectiveCamera(baseFov, 1, .15, 6500);
const hemi = new THREE.HemisphereLight(0xcde6ee, 0x39432d, 2.1);
scene.add(hemi);
const sunlight = new THREE.DirectionalLight(0xffddaa, 2.6);
sunlight.position.set(-350, 750, -400);
scene.add(sunlight);

// Gradient sky and sun: geometry genuinely surrounds the 3D world.
const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 v; void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'varying vec3 v;void main(){vec3 d=normalize(v);float h=clamp(d.y*1.45+.18,0.0,1.0);vec3 horizon=vec3(.74,.75,.67);vec3 top=vec3(.16,.37,.57);vec3 col=mix(horizon,top,pow(h,.62));float sun=pow(max(dot(d,normalize(vec3(-.45,.60,.62))),0.0),420.0);col+=vec3(1.0,.68,.32)*sun*.95;float warm=pow(1.0-abs(d.y),5.0);col+=vec3(.16,.08,.025)*warm;gl_FragColor=vec4(col,1.0);}'
}));
sky.scale.setScalar(5500);
sky.frustumCulled = false;
sky.renderOrder = -100;
scene.add(sky);

// Micro-detail texture prevents the procedural ground from looking like a uniform
// green plastic surface. Generated locally, no paid/external imagery.
function surfaceTexture(type) {
  const c = document.createElement('canvas'); c.width = c.height = 192;
  const g = c.getContext('2d'), data=g.createImageData(192,192);
  let seed = type === 'grass' ? 729 : 181;
  for(let i=0;i<data.data.length;i+=4) {
    seed = (Math.imul(seed,1664525)+1013904223)>>>0;
    const grain=(seed>>>16)/65535;
    const base=type==='grass'? 218:169;
    const v=Math.floor(base+(grain-.5)*(type==='grass'?32:43));
    data.data[i]=v;
    data.data[i+1]=type==='grass'?Math.min(255,v+8):v;
    data.data[i+2]=type==='grass'?Math.min(255,v+1):v;
    data.data[i+3]=255;
  }
  g.putImageData(data,0,0);
  const texture=new THREE.CanvasTexture(c);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(type==='grass'?6:1, type==='grass'?6:11);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  return texture;
}
const terrainTex = surfaceTexture('grass'), roadTex = surfaceTexture('road');
const terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: terrainTex, side: THREE.FrontSide });
const roadMat = new THREE.MeshLambertMaterial({ color: 0x5d615e, map: roadTex });
const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x82785f });
const stripeMat = new THREE.MeshBasicMaterial({ color: 0xb7aa83 });
const leafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
const barkMat = new THREE.MeshLambertMaterial({ color: 0x42352b });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x929081, flatShading: true });
// Procedural layered conifers: each is an actual irregular 3D mesh, not a sprite or 2D triangle.
function pineGeometry() {
  const vertices = [], indices = [];
  const layers = [
    { base: -.49, tip: .11, radius: .50 },
    { base: -.21, tip: .31, radius: .40 },
    { base: .08, tip: .48, radius: .30 },
    { base: .31, tip: .55, radius: .18 },
    { base: .44, tip: .65, radius: .10 }
  ];
  for (let tier = 0; tier < layers.length; tier++) {
    const { base, tip, radius } = layers[tier], start = vertices.length / 3, slices = 11;
    for (let j = 0; j < slices; j++) {
      const a = j * Math.PI * 2 / slices;
      const uneven = 1 + Math.sin(j * 7.23 + tier * 2.67) * .095;
      vertices.push(Math.cos(a) * radius * uneven, base + Math.sin(j * 4 + tier) * .024, Math.sin(a) * radius * uneven);
    }
    vertices.push(0, tip, 0);
    for (let j = 0; j < slices; j++) {
      indices.push(start + j, start + slices, start + (j + 1) % slices);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
const treeCone = pineGeometry();
const treeTrunk = new THREE.CylinderGeometry(.28, .41, 1, 5);
// Diffuse contact shadows ground objects, using one instanced draw call per tile.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;
const shadowCtx=shadowCanvas.getContext('2d');
const shade=shadowCtx.createRadialGradient(32,32,1,32,32,31);
shade.addColorStop(0,'rgba(0,0,0,.44)');
shade.addColorStop(.48,'rgba(0,0,0,.19)');
shade.addColorStop(1,'rgba(0,0,0,0)');
shadowCtx.fillStyle=shade;shadowCtx.fillRect(0,0,64,64);
const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
const shadowMat=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
const shadowGeo=new THREE.PlaneGeometry(1,1);shadowGeo.rotateX(-Math.PI/2);
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
const broadGeo = new THREE.IcosahedronGeometry(1, 2);
const broadPalette = [0x4d6740, 0x688050, 0x7d8c54, 0x496e42, 0x73845d, 0x42644b];
const temp = new THREE.Object3D();
const greenPalette = [0x213e32, 0x294d36, 0x375740, 0x305238, 0x466344, 0x2c4d3f, 0x4c5e39, 0x335f45];
const tiles = new Map();
let flight = makeFlight(), mode = 'home', view = 'chase', cameraYaw = 0, cameraPitch = .05;
let throttleMode = 'cruise', last = 0, lastSector = '', frameCount = 0, smoothMs = 17;
let encounter = makeEncounter(), impactAge = 0, impactType = '', impactId = -1, roundBannerTime=0;
let pointer = null;
const keys = new Set();

function terrainColor(x, y, z) {
  const n = hash(Math.floor(x / 14), Math.floor(z / 14));
  const slope = Math.abs(groundHeight(x+3,z)-groundHeight(x-3,z)) +
                Math.abs(groundHeight(x,z+3)-groundHeight(x,z-3));
  const distanceToLake = lakeProximity(x,z);
  if (distanceToLake < 1.28) return new THREE.Color(distanceToLake < .9 ? 0x746c53 : 0x8e8065);
  const forest = y > 115 ? [0x7b806f,0x8d896e,0x868f7f] :
                 slope>6 ? [0x64705a,0x676c54,0x716f5d] :
                 [0x4a6540,0x537145,0x62764d,0x516d44,0x6b7445];
  const c = new THREE.Color(forest[Math.floor(n * forest.length)]);
  const tint = (hash(Math.floor(x / 33), Math.floor(z / 33)) - .5) * .14;
  c.offsetHSL(0, 0, tint);
  return c;
}
function terrainGeometry(cx, cz, segments = 24, size = TILE) {
  const positions = [], colors = [], indices = [], uvs = [];
  const baseX = cx * TILE, baseZ = cz * TILE;
  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const px = ix / segments * size, pz = iz / segments * size;
      const x = baseX + px, z = baseZ + pz, y = groundHeight(x, z);
      positions.push(px, y, pz);
      uvs.push(ix / segments,iz / segments);
      const col = terrainColor(x, y, z);
      colors.push(col.r, col.g, col.b);
    }
  }
  for (let iz = 0; iz < segments; iz++) for (let ix = 0; ix < segments; ix++) {
    const a = iz * (segments + 1) + ix, b = a + 1, c = a + segments + 1, d = c + 1;
    // Face winding faces upward for the X-right, Z-forward coordinate system.
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
function ownedMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.ownedGeometry = true;
  return mesh;
}
function makeRoadStrip(cx, cz, halfWidth, offsetY, material, centerOffset = 0, dash = false) {
  const verts = [], inds = [], uvs = [], z0 = cz * TILE;
  const steps = dash ? 48 : 44;
  for (let i = 0; i <= steps; i++) {
    const z = z0 + i * TILE / steps;
    const axis = roadCenter(z), tangent = (roadCenter(z + 1) - roadCenter(z - 1)) / 2;
    const norm = 1 / Math.hypot(1, tangent), ox = norm, oz = -tangent * norm;
    for (const side of [-1, 1]) {
      const x = axis + (centerOffset + side * halfWidth) * ox;
      const zz = z + (centerOffset + side * halfWidth) * oz;
      verts.push(x - cx * TILE, groundHeight(x, zz) + offsetY, zz - cz * TILE);
      uvs.push((side+1)*.5, i / steps);
    }
    if (i === 0) continue;
    const a = 2 * (i - 1);
    if (!dash || (Math.floor(z / 21) % 2 === 0)) inds.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(inds); geometry.computeVertexNormals();
  return ownedMesh(geometry, material);
}
function instanced(geo, mat, count, color = false) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false; // instances span a tile; avoid stale frustum bounds
  if (color) mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  return mesh;
}
function setInstance(mesh, i, x, y, z, sx, sy, sz, rotation = 0, color = null) {
  temp.position.set(x, y, z);
  temp.rotation.set(0, rotation, 0);
  temp.scale.set(sx, sy, sz);
  temp.updateMatrix();
  mesh.setMatrixAt(i, temp.matrix);
  if (color !== null) mesh.setColorAt(i, new THREE.Color(color));
}
function addForest(group, cx, cz, near) {
  const attempts = near ? (mobile ? 300 : 420) : 85, trees = [], broad = [], rocks = [];
  for (let i = 0; i < attempts; i++) {
    const rx = hash(cx * 739 + i * 17, cz * 1909 + 81);
    const rz = hash(cx * 2203 + i * 31, cz * 499 + 12);
    const x = rx * TILE, z = rz * TILE, wx = cx * TILE + x, wz = cz * TILE + z;
    const h = groundHeight(wx, wz);
    if (Math.abs(wx - roadCenter(wz)) < (wz > 185 && wz < 365 ? 31 : 15) || lakeProximity(wx,wz) < 1.12) continue;
    const size = (near ? 10 : 7) + 15 * hash(cx * 299 + i, cz * 41 + i * 61);
    const tree = { x, z, h, size, r: 1.7 + size * .19, color: greenPalette[Math.floor(hash(i + cx * 9, cz * 7 + i) * greenPalette.length)], turn: hash(i, cz * 2 + cx) * Math.PI * 2 };
    if (i % 13 === 0) rocks.push({ x, z, h, s: 1 + hash(i + cx, cz) * 2.3 });
    else if (i % 6 === 0) broad.push(tree);
    else trees.push(tree);
  }
  if (trees.length || broad.length) {
    const combined=trees.concat(broad),shadows=instanced(shadowGeo,shadowMat,combined.length);
    combined.forEach((t,i)=>setInstance(shadows,i,t.x,t.h+.19,t.z,t.r*3.1,1,t.r*3.1));
    shadows.instanceMatrix.needsUpdate=true;
    group.add(shadows);
  }
  if (trees.length) {
    const crown = instanced(treeCone, leafMat, trees.length, true);
    const trunks = instanced(treeTrunk, barkMat, trees.length);
    trees.forEach((t, i) => {
      setInstance(trunks, i, t.x, t.h + t.size * .29, t.z, .65, t.size * .58, .65, t.turn);
      setInstance(crown, i, t.x, t.h + t.size * .68, t.z, t.r * 2.0, t.size, t.r * 2.0, t.turn, t.color);
    });
    trunks.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
    if (crown.instanceColor) crown.instanceColor.needsUpdate = true;
    group.add(crown, trunks);
  }
  if (broad.length) {
    const trunks = instanced(treeTrunk, barkMat, broad.length);
    const leaves = instanced(broadGeo, leafMat, broad.length * 3, true);
    broad.forEach((t, i) => {
      const c = broadPalette[Math.floor(hash(i * 17 + cx, cz * 23) * broadPalette.length)];
      setInstance(trunks, i, t.x, t.h + t.size * .38, t.z, .85, t.size * .75, .85, t.turn);
      // Three offset leaf masses make a visible, rounded, volumetric canopy.
      setInstance(leaves, i * 3, t.x, t.h + t.size * .80, t.z, t.r * 1.05, t.size * .29, t.r * 1.04, t.turn, c);
      setInstance(leaves, i * 3 + 1, t.x + t.r * .34, t.h + t.size * .95, t.z - t.r * .25,
                  t.r * .71, t.size * .27, t.r * .76, t.turn, c);
      setInstance(leaves, i * 3 + 2, t.x - t.r * .41, t.h + t.size * .89, t.z + t.r * .25,
                  t.r * .65, t.size * .29, t.r * .72, t.turn, c);
    });
    trunks.instanceMatrix.needsUpdate = true;
    leaves.instanceMatrix.needsUpdate = true;
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
    group.add(trunks, leaves);
  }
  if (rocks.length) {
    const mesh = instanced(rockGeo, stoneMat, rocks.length);
    rocks.forEach((r, i) => setInstance(mesh, i, r.x, r.h + r.s * .25, r.z, r.s, r.s * .55, r.s * 1.3, i));
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  }
}
function addBox(parent, w, h, d, x, y, z, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
const carPaint = new THREE.MeshStandardMaterial({ color: 0x58676a, roughness: .45, metalness: .22 });
const carGlass = new THREE.MeshStandardMaterial({ color: 0x19343b, roughness: .17, metalness: .3 });
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x17191a, roughness: .94 });
const lampMat = new THREE.MeshBasicMaterial({ color: 0xdfd4a8 });
// Persistent encounter meshes sit in world coordinates; tile streaming never
// disposes a wreck when the player flies out and returns.
const encounterView = new THREE.Group(); scene.add(encounterView);
const targetColors = [0x9b7856, 0x607d76, 0x767e99];
const intactViews = [], wreckViews = [], smokeViews = [];
const smokeGeo = new THREE.IcosahedronGeometry(1, 1);
const impactFX = createImpactFX(THREE, encounterView);
function buildTargets() {
  for (const target of encounter.vehicles) {
    const root = new THREE.Group();
    root.position.set(target.x,target.y-1.8,target.z);
    root.rotation.y = .22 * (target.id-1);
    const paint = new THREE.MeshStandardMaterial({color:targetColors[target.id],roughness:.68,metalness:.15});
    addBox(root,5.8,1.6,10.4,0,1.05,0,paint);
    addBox(root,4.5,1.55,4.1,0,2.45,-.85,carGlass);
    for (const x of [-2.7,2.7]) for (const z of [-3.1,3.1]) {
      const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.6,10),wheelMat);
      wheel.rotation.z=Math.PI/2;wheel.position.set(x,.85,z);root.add(wheel);
    }
    encounterView.add(root);intactViews.push(root);
    const wreck=new THREE.Group();wreck.position.copy(root.position);
    const dark = new THREE.MeshStandardMaterial({color:0x242a29,roughness:.96});
    addBox(wreck,6.1,.85,10.3,0,.55,0,dark);
    const twisted=addBox(wreck,4.9,.58,4.7,.6,1.3,-.6,dark);twisted.rotation.z=.22;
    for(let k=0;k<4;k++){
      const part=addBox(wreck,1.3,.35,1.8,(k%2?1:-1)*(3+k*.8),.3,(k-1.5)*2.7,dark);
      part.rotation.y=k*1.1;
    }
    encounterView.add(wreck);wreckViews.push(wreck);
    const smoke=new THREE.Mesh(smokeGeo,new THREE.MeshBasicMaterial({color:0x444949,transparent:true,opacity:.27,depthWrite:false}));
    smoke.position.set(target.x,target.y+5,target.z);smoke.scale.set(2.8,5,2.8);
    encounterView.add(smoke);smokeViews.push(smoke);
  }
  syncTargets();
}
function syncTargets() {
  encounter.vehicles.forEach((vehicle,i)=>{
    intactViews[i].visible=!vehicle.destroyed;
    wreckViews[i].visible=vehicle.destroyed;
    smokeViews[i].visible=vehicle.destroyed;
  });
}
buildTargets();
function moveEncounter() { encounterView.position.set(-flight.x,0,-flight.z); }
function addScenicVehicle(group, cx, cz) {
  if ((cz + 3000) % 3 !== 1) return;
  const z = cz * TILE + TILE * .58, x = roadCenter(z);
  const car = new THREE.Group();
  addBox(car, 3.5, .95, 6.6, 0, .6, 0, carPaint);
  addBox(car, 3.0, 1.15, 3.5, 0, 1.55, -.4, carGlass);
  for (const side of [-1, 1]) for (const fore of [-2.1, 2.1]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(.64, .64, .38, 10), wheelMat);
    wh.rotation.z = Math.PI / 2; wh.position.set(side * 1.8, .35, fore); car.add(wh);
  }
  for (const x0 of [-1.1, 1.1]) addBox(car, .65, .26, .1, x0, .77, 3.33, lampMat);
  const heading = Math.atan2(roadCenter(z + 3) - roadCenter(z - 3), 6);
  car.position.set(x - cx * TILE, groundHeight(x, z) + .37, z - cz * TILE);
  car.rotation.y = heading;
  group.add(car);
}
const lakeSurfaceMat = new THREE.MeshPhongMaterial({color:0x477f89,emissive:0x132b2c,shininess:95,transparent:true,opacity:.87,depthWrite:false,side:THREE.DoubleSide});
const lakeShoreMat = new THREE.MeshLambertMaterial({color:0xc1ac81,side:THREE.DoubleSide});
function addLake(group,cx,cz) {
  if (cx !== Math.floor(LAKE.x/TILE) || cz !== Math.floor(LAKE.z/TILE)) return;
  const water = ownedMesh(new THREE.CircleGeometry(1,86),lakeSurfaceMat);
  water.rotation.x=-Math.PI/2;
  water.position.set(LAKE.x-cx*TILE,LAKE.level+.045,LAKE.z-cz*TILE);
  water.scale.set(LAKE.rx*.79,LAKE.rz*.78,1);
  group.add(water);
  const perimeter=ownedMesh(new THREE.RingGeometry(1,1.075,86),lakeShoreMat);
  perimeter.rotation.x=-Math.PI/2;
  perimeter.position.set(LAKE.x-cx*TILE,LAKE.level-.17,LAKE.z-cz*TILE);
  perimeter.scale.set(LAKE.rx*.79,LAKE.rz*.78,1);
  group.add(perimeter);
}
function makeTile(cx, cz, near) {
  const group = new THREE.Group();
  const terrain = ownedMesh(terrainGeometry(cx, cz, near ? 32 : 18), terrainMat);
  group.add(terrain);
  // Asphalt/shoulders follow the hills; each ribbon is genuine triangulated geometry.
  const possible = cx === Math.floor(roadCenter((cz + .5) * TILE) / TILE);
  if (possible) {
    group.add(makeRoadStrip(cx, cz, 6.2, .4, shoulderMat));
    group.add(makeRoadStrip(cx, cz, 4.65, .47, roadMat));
    group.add(makeRoadStrip(cx, cz, .105, .50, stripeMat, 0, true));
    group.add(makeRoadStrip(cx, cz, .08, .51, stripeMat, 4.17));
    group.add(makeRoadStrip(cx, cz, .08, .51, stripeMat, -4.17));
    addScenicVehicle(group, cx, cz);
  }
  addForest(group, cx, cz, near);
  scenery.decorateTile(group, cx, cz, near);
  addLake(group, cx, cz);
  scene.add(group);
  return { group, cx, cz, near };
}
function disposeTile(tile) {
  scene.remove(tile.group);
  tile.group.traverse(obj => {
    if (obj.isInstancedMesh) obj.dispose();
    if (obj.userData.ownedGeometry) obj.geometry.dispose();
    // Scenic vehicle geometries are unique to each tile.
    if (obj.isMesh && !obj.isInstancedMesh && !obj.userData.ownedGeometry && obj.parent?.type === 'Group' && obj.parent !== tile.group) obj.geometry.dispose();
  });
}
function rebuildTiles(force = false) {
  const cx = Math.floor(flight.x / TILE), cz = Math.floor(flight.z / TILE);
  // High altitude is represented by far-terrain LOD; don't draw hundreds of tiny forest chunks.
  const radius = 2;
  const sector = cx + ':' + cz + ':' + radius;
  if (sector === lastSector && !force) return;
  lastSector = sector;
  const keep = new Set();
  for (let dz = -radius; dz <= radius; dz++) for (let dx = -radius; dx <= radius; dx++) {
    const tx = cx + dx, tz = cz + dz, id = tx + ':' + tz;
    const near = Math.abs(dx) <= 1 && Math.abs(dz) <= 1;
    keep.add(id);
    let tile = tiles.get(id);
    if (tile && tile.near !== near) { disposeTile(tile); tiles.delete(id); tile = null; }
    if (!tile) { tile = makeTile(tx, tz, near); tiles.set(id, tile); }
  }
  for (const [id, tile] of tiles) if (!keep.has(id)) { disposeTile(tile); tiles.delete(id); }
}
function moveTiles() {
  for (const tile of tiles.values())
    tile.group.position.set(tile.cx * TILE - flight.x, 0, tile.cz * TILE - flight.z);
}

// Distant simplified land ensures high-altitude views do not end at a square forest edge.
const farLand = new THREE.Mesh(new THREE.BufferGeometry(), terrainMat);
scene.add(farLand);
let farX = NaN, farZ = NaN, farScale = NaN;
function updateFarLand() {
  const gx = Math.floor(flight.x / (TILE * 2)) * TILE * 2;
  const gz = Math.floor(flight.z / (TILE * 2)) * TILE * 2;
  const aboveGround = Math.max(0, flight.y - groundHeight(flight.x, flight.z));
  const size = Math.max(9400, Math.min(1200000, aboveGround * 6.5));
  // Regenerate only when the player moves a whole sector or the high-altitude LOD changes.
  const nextScale = Math.ceil(size / 1200) * 1200;
  if (gx !== farX || gz !== farZ || nextScale !== farScale) {
    farX = gx; farZ = gz; farScale = nextScale;
    const positions = [], colors = [], indices = [], uvs = [], n = 60;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const x = (i / n - .5) * nextScale, z = (j / n - .5) * nextScale;
      const wx = gx + x, wz = gz + z, h = groundHeight(wx, wz) - 22;
      positions.push(x, h, z);uvs.push(i/n,j/n);
      const c = terrainColor(wx, h, wz); colors.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i, b = a + 1, c = a + n + 1;
      indices.push(a, c, b, b, c, c + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    farLand.geometry.dispose(); farLand.geometry = geometry;
  }
  farLand.position.set(farX - flight.x, 0, farZ - flight.z);
}

// Detailed quadcopter visible in chase view; visual only, with stylized rotor motion.
const drone = new THREE.Group();
scene.add(drone);
const frameMat = new THREE.MeshStandardMaterial({ color: 0x212a2a, metalness: .48, roughness: .5 });
const shellMat = new THREE.MeshStandardMaterial({ color: 0xd5d8cf, metalness: .28, roughness: .45 });
const rotorMat = new THREE.MeshBasicMaterial({ color: 0x263c3c, transparent: true, opacity: .64, side: THREE.DoubleSide, depthWrite: false });
const rotors = [];
addBox(drone, 1.42, .4, 2.15, 0, 0, 0, shellMat);
addBox(drone, .9, .15, 1.25, 0, .26, -.1, frameMat);
const upperShell = new THREE.Mesh(new THREE.CapsuleGeometry(.51,1.35,4,12),shellMat);
upperShell.rotation.x=Math.PI/2;upperShell.position.set(0,.14,.08);drone.add(upperShell);
const avionics = new THREE.Mesh(new THREE.BoxGeometry(.62,.13,.83),frameMat);
avionics.position.set(0,.64,-.15);drone.add(avionics);
for (const x of [-1.55, 1.55]) for (const z of [-1.25, 1.25]) {
  const length = Math.hypot(x, z);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(.09, .11, length, 7), frameMat);
  arm.position.set(x / 2, 0, z / 2);
  arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, 0, z).normalize());
  drone.add(arm);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.3, .32, .22, 10), frameMat);
  hub.position.set(x, .08, z); drone.add(hub);
  const rotor = new THREE.Group();
  const bladeA = addBox(rotor, 1.95, .025, .13, 0, 0, 0, rotorMat);
  const bladeB = addBox(rotor, .13, .025, 1.95, 0, 0, 0, rotorMat);
  rotor.position.set(x, .25, z);
  drone.add(rotor); rotors.push(rotor);
}
const lens = new THREE.Mesh(new THREE.SphereGeometry(.23, 10, 8), new THREE.MeshStandardMaterial({ color: 0x121a1a, metalness: .5, roughness: .17 }));
lens.position.set(0, -.15, 1.07); drone.add(lens);
const cameraGimbal=new THREE.Mesh(new THREE.CylinderGeometry(.27,.33,.3,14),frameMat);
cameraGimbal.rotation.x=Math.PI/2;cameraGimbal.position.set(0,-.46,1.01);drone.add(cameraGimbal);
const statusGreen=new THREE.MeshBasicMaterial({color:0x78f6aa}),statusRed=new THREE.MeshBasicMaterial({color:0xff7660});
for(const side of [-1,1]){
  const skid=addBox(drone,.075,.075,2.15,side*.63,-.45,0,frameMat);
  addBox(drone,.08,.52,.08,side*.63,-.26,.62,frameMat);
  addBox(drone,.08,.52,.08,side*.63,-.26,-.64,frameMat);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),side<0?statusRed:statusGreen);
  led.position.set(side*1.55,.18,1.25);drone.add(led);
}
drone.scale.setScalar(.74);

// Controls: relative finger drag = turn + climb. No military flight-control mappings.
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = Math.max(.1, w / Math.max(1, h));
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
canvas.addEventListener('pointerdown', e => {
  if (mode !== 'flying' || pointer) return;
  pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
  canvas.setPointerCapture(e.pointerId);
  hint.style.opacity = '0';
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerId !== pointer?.id) return;
  // Short-thumb-travel two-axis input: side + climb/brake/reverse/dive.
  const axes=gestureAxes(pointer.x,pointer.y,e.clientX,e.clientY);
  pointer.dx=axes.x; pointer.dy=axes.y;
});
function release(e) { if (pointer?.id === e.pointerId) pointer = null; }
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  keys.add(k);
  if (k === 'c' && !e.repeat) toggleView();
  if (k === ' ' && !e.repeat && mode === 'flying') setPause();
});
window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => { pointer = null; keys.clear(); if(mode === 'flying') setPause(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (mode === 'flying') setPause();
    sound.suspendOnHidden();
  }
  last = 0;
});
function toggleView() {
  view = view === 'chase' ? 'fpv' : 'chase';
  viewButton.textContent = view === 'chase' ? 'FPV' : 'CHASE';
  drone.visible = view === 'chase';
  sound.cue('view');
}
viewButton.addEventListener('click', toggleView);
muteButton.addEventListener('click', () => {
  const value = !sound.enabled;
  sound.setEnabled(value);
  muteButton.textContent = value ? 'SOUND ON' : 'MUTED';
  muteButton.setAttribute('aria-pressed', String(value));
  if (value) sound.unlock();
});
function startFlight() {
  sound.unlock().then(() => sound.cue('start')); sound.setActive(true);
  encounter = makeEncounter(); syncTargets();
  spawnDrone(); mode = 'flying'; view = 'chase'; pointer = null;
  cameraYaw = flight.heading; cameraPitch=.05; throttleMode='cruise';
  drone.visible = true; viewButton.textContent = 'FPV';
  hint.textContent = 'Πάνω: ανέβα / φρένα / πίσω · κάτω: βουτιά · πλάγια: κατεύθυνση';
  overlay.className = 'panel hidden'; hud.classList.remove('hidden');
  pauseButton.classList.remove('hidden'); viewButton.classList.remove('hidden');
  warning.textContent = '';
  muteButton.classList.remove('hidden');
   lastSector = ''; rebuildTiles(true); moveTiles(); updateFarLand(); last = performance.now();
}
function spawnDrone() {
  flight = makeFlight();
  flight.z = 55 + ((encounter.drones-1)%3)*17;
  flight.x = roadCenter(flight.z);
  flight.y = groundHeight(flight.x,flight.z) + 32 + ((encounter.drones-1)%2)*5;
  flight.heading = .10;
  flight.vx = Math.sin(flight.heading)*43;flight.vz = Math.cos(flight.heading)*43;
  flight.vy = 0;flight.throttle = .72;
  pointer = null;keys.clear();cameraYaw = flight.heading;cameraPitch = .05;
  camera.position.set(0,flight.y+5,-16);
  impactAge=0;impactType='';impactFX.clear();drone.visible=view==='chase';
  sound.setActive(true);
  if (encounter.drones > 1 || encounter.round > 1) sound.cue('respawn');
}
function endFlight(contact) {
  if(mode!=='flying')return;
  mode='impact';pointer=null;keys.clear();impactAge=0;
  impactType=contact.type;impactId=contact.id??-1;
  if(contact.type==='vehicle') {applyContact(encounter,contact);syncTargets();}
  if(contact.type==='vehicle') {
    const target=encounter.vehicles[contact.id];
    impactFX.start('vehicle',{ x:target.x, y:target.y-2.2, z:target.z });
  } else {
    impactFX.start('ground',{ x:flight.x, y:groundHeight(flight.x,flight.z), z:flight.z });
  }
  sound.setActive(false);
  sound.impact(contact.type==='vehicle', {
    chain: encounter.hits,
    finale: contact.type==='vehicle' && encounter.hits===encounter.vehicles.length
  });
  warning.textContent=contact.type==='vehicle' ? 'DIRECT HIT' : 'GROUND IMPACT';
  drone.visible=false;
}
function setPause() {
  if (mode !== 'flying') return;
  mode = 'paused'; pointer = null; keys.clear(); sound.setActive(false);
  hud.classList.add('hidden'); pauseButton.classList.add('hidden');
  viewButton.classList.add('hidden'); muteButton.classList.add('hidden');
   overlay.className = 'panel paused';
  overlay.querySelector('.kicker').textContent = 'ENCOUNTER · PAUSED';
  overlay.querySelector('h1').innerHTML = 'ABOVE<br><em>THE TREES</em>';
  overlay.querySelector('p').textContent = `${encounter.hits}/3 οχήματα · drone ${encounter.drones}.`;
  primary.innerHTML = 'RESUME FLIGHT <span>↗</span>';
}
pauseButton.addEventListener('click', setPause);
primary.addEventListener('click', () => {
  if (mode === 'paused') {
    mode = 'flying'; overlay.className = 'panel hidden'; sound.unlock().then(() => sound.cue('start')); sound.setActive(true);
    hud.classList.remove('hidden'); pauseButton.classList.remove('hidden');
    viewButton.classList.remove('hidden'); muteButton.classList.remove('hidden');
     last = performance.now();
  } else startFlight();
});
function inputState() {
  const x = (pointer?.dx || 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  const y = (pointer?.dy || 0) + (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
  return { x: clamp(x,-1,1), y: clamp(y,-1,1) };
}
const cameraTarget = new THREE.Vector3();
function updateCamera(dt) {
  // A single chase camera follows aircraft heading automatically, with a
  // small smoothing lag so turns feel physical instead of snapping.
  // Avoid linear interpolation across the -PI/+PI angle discontinuity.
  const yawDifference = Math.atan2(Math.sin(flight.heading-cameraYaw),Math.cos(flight.heading-cameraYaw));
  // Stable cinematic damping makes the environment easier to read.
  cameraYaw += yawDifference*(1-Math.exp(-4.4*dt));
  // Camera follows the actual nose-down attitude: steep pitch shows terrain
  // rushing up, rather than staying level while the model dives.
  cameraPitch += (clamp(.035-flight.pitch*.67-.42*(flight.pullback||0),-.93,.43)-cameraPitch)*(1-Math.exp(-4.1*dt));
  const dirX = Math.sin(cameraYaw), dirZ = Math.cos(cameraYaw);
  const lookX=dirX*Math.cos(cameraPitch), lookZ=dirZ*Math.cos(cameraPitch);
  const lookY=Math.sin(cameraPitch);
  const smoothing=1-Math.exp(-8*dt);
  if (view === 'fpv') {
    cameraTarget.set(0, flight.y+.42, 0);
    camera.position.lerp(cameraTarget,smoothing);
    camera.up.set(0,1,0);
    camera.lookAt(lookX*60, flight.y+lookY*60,lookZ*60);
  } else {
    cameraTarget.set(-lookX*15,flight.y+4.4-lookY*9,-lookZ*15);
    camera.position.lerp(cameraTarget,1-Math.exp(-6*dt));
    camera.up.set(0,1,0);
    camera.lookAt(lookX*28,flight.y+1.9+lookY*26,lookZ*28);
  }
  drone.position.set(0,flight.y,0);
  drone.rotation.order='YXZ';
  // Positive pitch rotates the +Z-facing drone nose DOWN in Three.js.
  drone.rotation.set(flight.pitch,flight.heading,flight.bank,'YXZ');
}

function updateHUD() {
  distanceEl.textContent = `${encounter.hits}/3 VEHICLES · DRONE ${encounter.drones}`;
  altitudeEl.textContent = Math.round(Math.max(0, flight.y - groundHeight(flight.x, flight.z))) + ' M AGL';
  const totalSpeed=Math.hypot(flight.vx,flight.vy,flight.vz);
  speedEl.textContent = (flight.speed < -5 ? '↶ ' : '') + Math.round(totalSpeed*3.6) + ' KM/H';
  const rate=$('vertical-rate');
  if (rate) {
    const rising=flight.vy>=0;
    rate.textContent=(rising?'↑ ':'↓ ')+Math.abs(flight.vy).toFixed(1)+' M/S';
  }
  if(mode==='flying') warning.textContent=roundBannerTime>0 ? `ENCOUNTER ${encounter.round} · AGAIN` :
    flight.pitch>.95 && flight.vy<-4 ? 'STEEP DIVE' : '';
}
function frame(now) {
  const dt = Math.min((now - last) / 1000 || .016, .1); last = now;
  if (mode === 'flying') {
    roundBannerTime=Math.max(0,roundBannerTime-dt);
    // CRUISE/FAST/HOVER/REVERSE no longer require a mode button. The
    // player's one-finger vertical gesture controls requested motion.
    const command=inputState();
    flight.throttle=.72;
    throttleMode=command.y<-.75?'fast':'gesture';
    const previous={x:flight.x,y:flight.y,z:flight.z};
    advanceFlight(flight, command, dt);
    const contact=resolveContact(encounter,previous,flight,flight.groundContact);
    if(contact)endFlight(contact);
    rebuildTiles(); moveTiles(); updateFarLand(); updateHUD();
    sound.update(Math.hypot(flight.vx,flight.vy,flight.vz),Math.max(0,flight.y-groundHeight(flight.x,flight.z)),dt,true,{
      verticalSpeed: flight.vy, throttle: flight.throttle, throttleMode,
      bank: flight.bank, sideRate: flight.sideRate
    });
  } else if (mode === 'impact') {
    impactAge+=dt;
    impactFX.update(impactAge);
    if(impactAge>.98){
      const completed=encounter.hits===3;
      encounter=nextDrone(encounter);syncTargets();
      spawnDrone();mode='flying';
      roundBannerTime=completed?1.7:0;
      warning.textContent=completed?`ENCOUNTER ${encounter.round} · AGAIN` : '';
      lastSector='';rebuildTiles(true);moveTiles();updateFarLand();updateHUD();
    }
  }
  const height = Math.max(0, flight.y - groundHeight(flight.x, flight.z));
  clouds.update(flight.x,flight.y,flight.z,now/1000);
  scene.fog.density = .00034 / (1 + height / 2100);
  const nextFar = Math.max(6500, Math.min(1600000, height * 3.4 + 4000));
  if (Math.abs(camera.far - nextFar) > 10) {
    camera.far = nextFar;
    camera.updateProjectionMatrix();
  }
  sky.scale.setScalar(camera.far * .93);
  updateCamera(dt);
  // Speed conveys energy through the lens rather than altering aircraft physics.
  const visualSpeed = Math.hypot(flight.vx,flight.vy,flight.vz);
  const impactFov = mode === 'impact' ? impactEnvelope(impactAge, impactType).cameraKick : 0;
  const targetFov = baseFov + clamp((visualSpeed - 16) / 90,0,1) * 8 + impactFov;
  const nextFov = camera.fov + (targetFov-camera.fov)*(1-Math.exp(-2.1*dt));
  if (Math.abs(nextFov-camera.fov)>.02) {
    camera.fov=nextFov;
    camera.updateProjectionMatrix();
  }
  sky.position.copy(camera.position);
  moveEncounter();
  smokeViews.forEach((smoke,i)=>{ if(smoke.visible){smoke.position.y=encounter.vehicles[i].y+5+Math.sin(now*.0006+i)*1.2;smoke.rotation.y+=dt*.17;} });
  for (let i = 0; i < rotors.length; i++) rotors[i].rotation.y += dt * (i % 2 ? -43 : 43);
  renderer.render(scene, camera);
  smoothMs = smoothMs * .98 + Math.min(dt * 1000, 50) * .02;
  frameCount++;
  // Very small adaptive-resolution feedback loop, deliberately gated to avoid thrashing.
  if (mode === 'flying' && frameCount % 180 === 0) {
    const maxDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2);
    const wanted = smoothMs > 29 ? Math.max(1, qualityDpr - .16)
                 : smoothMs < 17.7 ? Math.min(maxDpr, qualityDpr + .08) : qualityDpr;
    if (Math.abs(wanted - qualityDpr) > .01) {
      qualityDpr = wanted;
      renderer.setPixelRatio(qualityDpr);
      resize();
    }
  }
  requestAnimationFrame(frame);
}
rebuildTiles(true);
moveTiles(); moveEncounter(); updateFarLand();
camera.position.set(0, flight.y + 6, -19);
updateCamera(.016);
// Diagnostic-only state for automated interaction tests; no browser location or telemetry.
window.__openSkySnapshot = () => ({
  x: flight.x, y: flight.y, z: flight.z, heading: flight.heading,
  cameraYaw, cameraPitch, throttleMode, speed:flight.speed,
  vx:flight.vx,vy:flight.vy,vz:flight.vz,pitch:flight.pitch,bank:flight.bank,sideRate:flight.sideRate,pullback:flight.pullback||0,
  ground: groundHeight(flight.x, flight.z), mode, audioEnabled: sound.enabled
  , hits:encounter.hits, drones:encounter.drones, vehicles:encounter.vehicles.map(v=>v.destroyed)
});
document.documentElement.dataset.openSkyReady = 'true';
requestAnimationFrame(frame);
