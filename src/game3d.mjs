import * as THREE from '../vendor/three.module.min.js';
import { TILE, clamp, hash, roadCenter, groundHeight, makeFlight, advanceFlight, LAKE, lakeProximity } from './flight3d.mjs';
import { createFlightAudio } from './audio3d.mjs';
import { createScenery } from './scenery3d.mjs';
import { createClouds } from './atmosphere3d.mjs';
import { makeEncounter, updateEncounter, spawnForNextTarget, resolveContact, applyContact, nextDrone, LEVEL_SECTORS, LEVEL_TARGETS, clearingRadius, forestRoadGap, objectiveApproachClearance, activeSectorIndex, sectorProgress, levelComplete } from './encounter.mjs';
import {battlefieldLayout} from './battlefieldlayout.mjs';
import {trailAlpha,padAlpha} from './trailfade.mjs';
import {slopedHullSpec} from './vehiclemesh.mjs';
import { makeScorecard, registerResult, registerExploration, guidanceFor } from './arcadeflow.mjs';
import { createImpactFX, impactEnvelope } from './impactfx3d.mjs';
import { gestureAxes } from './touchflight.mjs';
import { treeHazard, resolveTreeContact, chooseContact } from './hazards.mjs';
import { beaconAppearance } from './targetreadability.mjs';
import { outlineAppearance } from './targetoutline.mjs';
import { FOREST_SITES, sideTrailPoint, scenicTrailClearance } from './forestlayout.mjs';
import { createPrimitiveGeometryPool } from './geometrypool.mjs';
import { createRenderBudget } from './renderbudget.mjs';
import { pauseFlightState, resumeFlightState } from './flightlifecycle.mjs';
import { redeployWithPenalty } from './recovery.mjs';
import {makeSkimState,stepSkim} from './skimming.mjs';
import {discoverNearby,explorationHint} from './exploration.mjs';
import {BIOMES,biomeIndex,biomeBlend,biomePalette,biomeFoliage,biomeVegetation} from './biomes.mjs';
import {LANDMARKS,landmarkPosition,landmarkClearance} from './landmarks.mjs';
import {canopyWindStrength,canopyWindPhase} from './canopywind.mjs';
import {forestChasePitch} from './cameracomposition.mjs';
import {channelClearance,STREAM_START,STREAM_END} from './wetlands.mjs';
import {createWildlife} from './wildlife3d.mjs';
import {RIVER,riverCrossing,riverStrip} from './riverlandscape.mjs';
import {areaArrival} from './areaarrival.mjs';

// A floating-origin, streamed polygonal world. No real-drone targeting or hardware integration.
const $ = id => document.getElementById(id);
const canvas = $('scene'), overlay = $('overlay'), primary = $('primary');
const hud = $('hud'), pauseButton = $('pause'), distanceEl = $('distance');
const altitudeEl = $('altitude'), speedEl = $('speed'), hint = $('hint');
const viewButton = $('view-mode'), muteButton = $('sound-toggle');
const warning = $('warning');
const redeployButton=$('redeploy'),restartButton=$('restart-level');
let restartArmed=false;
let skimState=makeSkimState();
const playthroughSeed=Math.floor(Math.random()*0x7fffffff)||4023;
let playthroughNumber=0;
let lastCheckpointSector=0;
let lastArrivalArea=0;
const visitedAreas=new Set([0]);
const visitedGROVES=new Set();
const sound = createFlightAudio();
const scenery = createScenery(THREE, { TILE, hash, groundHeight, roadCenter, lakeProximity });
const mobile = matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.27;
const budget=createRenderBudget({
  initialDpr:Math.min(window.devicePixelRatio||1,mobile?1.45:1.85),
  maxDpr:Math.min(window.devicePixelRatio||1,mobile?1.6:2),
  minDpr:.85
});
renderer.setPixelRatio(budget.dpr);
const scene = new THREE.Scene();
const clouds = createClouds(THREE,scene,hash);
scene.fog = new THREE.FogExp2(BIOMES[0].fog, .00032);
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
  uniforms:{
    uHorizon:{value:new THREE.Color(BIOMES[0].horizon).convertLinearToSRGB()},
    uZenith:{value:new THREE.Color(BIOMES[0].zenith).convertLinearToSRGB()},
    uSunTint:{value:new THREE.Color(BIOMES[0].sun).convertLinearToSRGB()}
  },
  vertexShader: 'varying vec3 v; void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'varying vec3 v;uniform vec3 uHorizon;uniform vec3 uZenith;uniform vec3 uSunTint;void main(){vec3 d=normalize(v);float h=clamp(d.y*1.45+.18,0.0,1.0);vec3 col=mix(uHorizon,uZenith,pow(h,.65));float sun=pow(max(dot(d,normalize(vec3(-.45,.60,.62))),0.0),350.0);col+=uSunTint*sun*.67;float warm=pow(1.0-abs(d.y),5.0);col+=uSunTint*warm*.07;gl_FragColor=vec4(col,1.0);}'
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
const dirtTrailMat = new THREE.MeshLambertMaterial({color:0x756448,map:roadTex,polygonOffset:true,polygonOffsetFactor:-1});
const stripeMat = new THREE.MeshBasicMaterial({ color: 0xb7aa83 });
const leafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
// Live micro-wind is GPU-only and reuses the existing instanced forest crowns.
// Bark/trunks and all gameplay obstacles remain stationary. Moving the tip by
// a few decimeters makes the forest feel alive without extra mesh draws.
const canopyWind={time:{value:0},strength:{value:0}};
let canopyShaderReady=false;
leafMat.onBeforeCompile=shader=>{
  shader.uniforms.uForestTime=canopyWind.time;
  shader.uniforms.uForestStrength=canopyWind.strength;
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
    '#include <common>\nuniform float uForestTime;\nuniform float uForestStrength;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`
#include <begin_vertex>
#ifdef USE_INSTANCING
  float crownPhase=instanceMatrix[3].x*.041+instanceMatrix[3].z*.025;
#else
  float crownPhase=0.0;
#endif
  float upperCrown=max(0.0,position.y+.45);
  transformed.x+=upperCrown*uForestStrength*
    sin(uForestTime*.68+crownPhase+position.y*4.2);
  transformed.z+=upperCrown*uForestStrength*.60*
    sin(uForestTime*.53+crownPhase*1.71+position.y*2.8);
`);
  canopyShaderReady=true;
};
const barkMat = new THREE.MeshLambertMaterial({ color: 0x42352b });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x929081, flatShading: true });
const dirtTrackMat = new THREE.MeshLambertMaterial({
  color:0x59563f,side:THREE.DoubleSide,transparent:true,opacity:.77,depthWrite:false
});
const campPadMat = new THREE.MeshLambertMaterial({
  color:0x535d46,side:THREE.DoubleSide,transparent:true,opacity:.80,depthWrite:false
});
const tentMat = new THREE.MeshLambertMaterial({ color:0x5d6751, flatShading:true });
const cargoMat = new THREE.MeshLambertMaterial({ color:0x7d745a });
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
const biomeColors=BIOMES.map(b=>({
  horizon:new THREE.Color(b.horizon).convertLinearToSRGB(),
  zenith:new THREE.Color(b.zenith).convertLinearToSRGB(),
  skySun:new THREE.Color(b.sun).convertLinearToSRGB(),
  sun:new THREE.Color(b.sun),fog:new THREE.Color(b.fog),hemi:new THREE.Color(b.hemi)
}));
const terrainColors=BIOMES.map(b=>b.terrain);
const tiles = new Map();
let flight = makeFlight(), mode = 'home', view = 'chase', cameraYaw = 0, cameraPitch = .05;
let throttleMode = 'cruise', last = 0, lastSector = '';
let qaFrozen=false;
let resumeMode='flying',graphicsReady=true,contextCopy=null;
let encounter = makeEncounter(), scorecard = makeScorecard(), lastAward = null,
    impactAge = 0, impactType = '', impactId = -1, roundBannerTime=0, roundBannerText='', advancedSector=false;
let lastSightCheck=-Infinity;
let pointer = null;
const keys = new Set();

function terrainColor(x, y, z) {
  const n = hash(Math.floor(x / 14), Math.floor(z / 14));
  const slope = Math.abs(groundHeight(x+3,z)-groundHeight(x-3,z)) +
                Math.abs(groundHeight(x,z+3)-groundHeight(x,z-3));
  const distanceToLake = lakeProximity(x,z);
  if (distanceToLake < 1.28) return new THREE.Color(distanceToLake < .9 ? 0x746c53 : 0x8e8065);
  const palette=terrainColors[biomeIndex(z)];
  const rough=y>115||slope>6;
  const forest=rough?[0x777d6b,0x858271,0x6a756c]:palette;
  const c=new THREE.Color(forest[Math.floor(n*forest.length)]);
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
// Short off-road dirt approaches connect the road to wide vehicle clearings.
 // Curved, terrain-following ribbons turn each sector into an arena rather
 // than a straight line of cars. They are decorations, not a forced path.
function makeClearingTrail(group,cx,cz,target) {
  if(Math.abs(target.offset)<21 || Math.floor(target.z/TILE)!==cz ||
     Math.floor(target.x/TILE)!==cx)return;
  const startZ=target.z-37;
  const startX=roadCenter(startZ)+Math.sign(target.offset)*7.1;
  const endX=target.homeX,endZ=target.homeZ;
  const vertices=[],indices=[],segments=14;
  for(let j=0;j<=segments;j++){
    const t=j/segments,e=t*t*(3-2*t);
    const centerX=startX+(endX-startX)*e;
    const centerZ=startZ+(endZ-startZ)*t;
    const derivativeX=(endX-startX)*6*t*(1-t)/segments;
    const derivativeZ=(endZ-startZ)/segments;
    const inv=1/Math.hypot(derivativeX,derivativeZ);
    const nx=derivativeZ*inv,nz=-derivativeX*inv;
    const width=2.6*(.85+.15*Math.sin(Math.PI*t));
    for(const side of [-1,1]){
      const wx=centerX+nx*width*side,wz=centerZ+nz*width*side;
      vertices.push(wx-cx*TILE,groundHeight(wx,wz)+.52,wz-cz*TILE);
    }
    if(j){const a=(j-1)*2,b=a+1,c=j*2,d=c+1;
      indices.push(a,c,b,b,c,d);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  group.add(ownedMesh(geometry,dirtTrailMat));
}
function instanced(geo, mat, count, color = false) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = true; // Three computes a local bounding sphere after instance placement
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
  const b=biomeVegetation((cz+.5)*TILE);
  const attempts=Math.round((near?(mobile?245:350):75)*b.density),trees=[],broad=[],rocks=[];
  for (let i = 0; i < attempts; i++) {
    const rx = hash(cx * 739 + i * 17, cz * 1909 + 81);
    const rz = hash(cx * 2203 + i * 31, cz * 499 + 12);
    const x = rx * TILE, z = rz * TILE, wx = cx * TILE + x, wz = cz * TILE + z;
    const h = groundHeight(wx, wz);
    if (Math.abs(wx - roadCenter(wz)) < forestRoadGap(wz) ||
        objectiveApproachClearance(wx,wz) || landmarkClearance(wx,wz) || channelClearance(wx,wz) ||
        scenicTrailClearance(wx,wz) || lakeProximity(wx,wz) < 1.12) continue;
    const size = (near ? 10 : 7) + 15 * hash(cx * 299 + i, cz * 41 + i * 61);
    const tree = { x, z, h, size, r: 1.7 + size * .19,
      color:biomeFoliage(wz,hash(i+cx*9,cz*7+i)),
      turn:hash(i,cz*2+cx)*Math.PI*2 };
    if(i%b.rocksEvery===0)rocks.push({x,z,h,s:1+hash(i+cx,cz)*2.3});
    else if(i%b.deciduousEvery===0) broad.push(tree);
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
      const c=biomeFoliage(cz*TILE+t.z,hash(i*17+cx,cz*23),true);
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
    rocks.forEach((r, i) => setInstance(mesh, i, r.x, r.h + r.s * .25, r.z, r.s, r.s * 1.3, i));
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  }
  // Colliders come directly from actually rendered near trees. No invisible
  // obstacle fields and no raycasting against thousands of foliage triangles.
  return near ? trees.concat(broad).map((t,i)=>treeHazard({
    id:cx+':'+cz+':'+i, x:cx*TILE+t.x,z:cz*TILE+t.z,
    ground:t.h,size:t.size,radius:t.r
  })) : [];
}
const primitives=createPrimitiveGeometryPool({
  box:(w,h,d)=>new THREE.BoxGeometry(w,h,d),
  cylinder:(radius,height,segments)=>new THREE.CylinderGeometry(radius,radius,height,segments)
});
function addBox(parent, w, h, d, x, y, z, mat) {
  const mesh = new THREE.Mesh(primitives.box(w,h,d), mat);
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
const wildlife=createWildlife(THREE,encounterView,{groundHeight,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
// Permanent authored forest hubs: their terrain ribbons stay aligned with
// target wrecks across airborne respawns and streamed scenery tile changes.
const battlefieldView=new THREE.Group();
encounterView.add(battlefieldView);
// A broad meandering stream and simple stone bridge physically distinguish
// the middle forest landscape from the pine approach and amber ridge.
const riverView=new THREE.Group();encounterView.add(riverView);
const stream=riverStrip(groundHeight);
const streamGeometry=new THREE.BufferGeometry();
streamGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stream.positions,3));
const streamColors=[];
for(let i=0;i<stream.alphas.length;i++){
  const n=i%7,foam=n===2||n===4;
  streamColors.push(foam?.57:.36,foam?.85:.68,foam?.85:.78,stream.alphas[i]);
}
streamGeometry.setAttribute('color',new THREE.Float32BufferAttribute(streamColors,4));
streamGeometry.setIndex(stream.indices);streamGeometry.computeVertexNormals();
const streamMaterial=new THREE.MeshPhongMaterial({
  color:0xffffff,vertexColors:true,side:THREE.DoubleSide,transparent:true,
  depthWrite:false,shininess:85
});
const riverMesh=new THREE.Mesh(streamGeometry,streamMaterial);
riverMesh.userData.scenicFeature='valley-river';
riverView.add(riverMesh);
const crossing=riverCrossing(),bridge=new THREE.Group();
bridge.position.set(crossing.x,groundHeight(crossing.x,crossing.z)+.85,crossing.z);
bridge.userData.scenicFeature='stone-bridge';
const bridgeStone=new THREE.MeshLambertMaterial({color:0x8c8877});
const bridgeRail=new THREE.MeshLambertMaterial({color:0x6e736c});
function addBridgePart(sx,sy,sz,x,y,z,material){
  const mesh=new THREE.Mesh(primitives.box(sx,sy,sz),material);
  mesh.position.set(x,y,z);bridge.add(mesh);
}
addBridgePart(13,.48,crossing.span,0,0,0,bridgeStone);
for(const side of [-1,1]){
  addBridgePart(.75,.85,crossing.span,side*6.1,.62,0,bridgeRail);
  for(const z of [-13,0,13])addBridgePart(1.3,1.35,1.6,side*6.1,.85,z,bridgeStone);
}
riverView.add(bridge);
const battlefield=battlefieldLayout();
const trailMaterial=new THREE.MeshLambertMaterial({
  color:0x696449,vertexColors:true,transparent:true,depthWrite:false,
  side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2
});
const hubMaterial=new THREE.MeshLambertMaterial({
  color:0x62654a,vertexColors:true,transparent:true,depthWrite:false,
  side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2
});
const stagingMaterial=new THREE.MeshLambertMaterial({
  color:0x736c4e,vertexColors:true,transparent:true,depthWrite:false,
  side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2
});
// Ground-following ribbons with stable width and a gentle lateral bend.
function makeTrackGeometry(points,halfWidth=2.3){
  const positions=[],colors=[],indices=[],stepsPerSection=12;
  const path=[];
  for(let j=0;j<points.length-1;j++){
    const a=points[j],b=points[j+1];
    for(let k=0;k<stepsPerSection;k++){
      const t=k/stepsPerSection,smooth=t*t*(3-2*t);
      path.push({x:a.x+(b.x-a.x)*smooth,z:a.z+(b.z-a.z)*t});
    }
  }
  path.push(points.at(-1));
  for(let i=0;i<path.length;i++){
    const p=path[i],prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)];
    const dx=next.x-prev.x,dz=next.z-prev.z;
    const length=Math.hypot(dx,dz)||1,nx=dz/length,nz=-dx/length;
    const variance=1+.065*Math.sin(i*1.7);
    // Three lanes: transparent verge, partly visible tread, transparent verge.
    for(const side of [-1,0,1]){
      const x=p.x+side*halfWidth*nx*variance,z=p.z+side*halfWidth*nz*variance;
      positions.push(x,groundHeight(x,z)+.58,z);
      colors.push(1,1,1,trailAlpha(side));
    }
    if(i>0){
      for(let lane=0;lane<2;lane++){
        const a=(i-1)*3+lane,b=i*3+lane;
        indices.push(a,b,a+1,a+1,b,b+1);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();return geometry;
}
function makePadGeometry(pad){
  const positions=[],colors=[],indices=[],segments=28;
  const y=groundHeight(pad.x,pad.z)+.6;
  positions.push(pad.x,y,pad.z);
  colors.push(1,1,1,padAlpha(0));
  for(let j=0;j<=segments;j++){
    const angle=j/segments*Math.PI*2;
    const rough=1+.075*Math.sin(j*3.8+pad.z*.018);
    const x=pad.x+Math.cos(angle)*pad.rx*rough;
    const z=pad.z+Math.sin(angle)*pad.rz*rough;
    positions.push(x,groundHeight(x,z)+.61,z);
    colors.push(1,1,1,padAlpha(1));
    if(j>0)indices.push(0,j+1,j);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
  geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
for(const trail of battlefield.trails)battlefieldView.add(
  new THREE.Mesh(makeTrackGeometry(trail.path,trail.width),trailMaterial)
);
for(const pad of battlefield.pads)battlefieldView.add(
  new THREE.Mesh(makePadGeometry(pad),pad.style==='hub'?hubMaterial:stagingMaterial)
);

// Three distinctive fictional, unoccupied arcade props. The collision
// volumes and encounter positions remain owned by encounter.mjs.
const targetKinds = ['tank', 'carrier', 'truck'];
const targetPaint = [0x586247, 0x657255, 0x77755b].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: .91, metalness: .035 }));
const targetTrim = new THREE.MeshStandardMaterial({ color: 0x343d32, roughness: .97 });
const targetRoof = new THREE.MeshStandardMaterial({ color: 0x85836a, roughness: .96 });
const armourMeshes=new Map();
function addArmouredHull(parent,w,h,d,x,bottomY,z,material,topW,topD,detail){
  const key=[w,h,d,topW,topD].join('/');
  let geometry=armourMeshes.get(key);
  if(!geometry){
    const spec=slopedHullSpec(w,h,d,topW,topD);
    const indexed=new THREE.BufferGeometry();
    indexed.setAttribute('position',new THREE.Float32BufferAttribute(spec.positions,3));
    indexed.setIndex(spec.indices);
    geometry=indexed.toNonIndexed();
    geometry.computeVertexNormals();
    geometry.userData.sharedPrimitive=true;
    indexed.dispose();
    armourMeshes.set(key,geometry);
  }
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,bottomY,z);
  mesh.userData.visualDetail=detail;
  parent.add(mesh);
  return mesh;
}
const targetDarkGlass=new THREE.MeshStandardMaterial({color:0x263b39,roughness:.24,metalness:.16});
const targetSteel=new THREE.MeshStandardMaterial({color:0x51584c,roughness:.87,metalness:.16});
const wreckPaint = new THREE.MeshStandardMaterial({ color: 0x30352e, roughness: 1 });
const wreckTrim = new THREE.MeshStandardMaterial({ color: 0x49483d, roughness: 1 });
const intactViews = [], wreckViews = [], smokeViews = [], beaconViews = [], outlineViews = [];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
// A single, reusable soft RED silhouette ring, drawn procedurally so there
// are no network assets or mesh-heavy edge duplicates. It remains behind
// trees/terrain (depth-tested) and is drawn ONLY for surviving vehicles in
// the current forest clearing. Its empty center leaves the model visible.
const beaconCanvas=document.createElement('canvas');
beaconCanvas.width=beaconCanvas.height=128;
const beaconCtx=beaconCanvas.getContext('2d');
const rim=beaconCtx.createImageData(128,128);
for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const u=(x-63.5)/61, v=(y-63.5)/57;
  const radial=Math.hypot(u,v);
  const core=Math.exp(-Math.pow((radial-.84)/.09,2));
  const bloom=Math.exp(-Math.pow((radial-.84)/.18,2));
  const alpha=Math.max(0,Math.min(255,255*(core*.78+bloom*.28)));
  const i=(y*128+x)*4;
  rim.data[i]=255;rim.data[i+1]=54;rim.data[i+2]=44;rim.data[i+3]=Math.round(alpha);
}
beaconCtx.putImageData(rim,0,0);
const beaconTexture=new THREE.CanvasTexture(beaconCanvas);
beaconTexture.colorSpace=THREE.SRGBColorSpace;
const smokeGeo = new THREE.IcosahedronGeometry(1, 1);
const impactFX = createImpactFX(THREE, encounterView);
function wheel(parent, x, z, radius, y = .9) {
  const mesh = new THREE.Mesh(primitives.cylinder(radius,.55,9), targetTrim);
  mesh.rotation.z = Math.PI / 2;
  mesh.position.set(x, y, z);
  parent.add(mesh);
}
function tankShape(root, paint) {
  // Low tracked hull + broad, short turret: legible from the chase camera.
  addArmouredHull(root,5.1,1.45,8.9,0,.415,0,paint,.83,.77,'tank-sloped-hull');
  for (const x of [-2.55, 2.55]) {
    addBox(root, 1.15, 1.45, 9.3, x, .88, 0, targetTrim);
    for (const z of [-3.25, -1.6, 0, 1.6, 3.25]) wheel(root, x + Math.sign(x) * .49, z, .54, .77);
  }
  addBox(root, 4.25, .72, 4.2, 0, 2.23, -.65, paint);
  addBox(root, 3.1, .35, 2.85, 0, 2.74, -.6, targetRoof);
  // Readable low-poly barrel, rear vent and hatch make the silhouette a
  // recognizable fictional tank instead of a featureless rectangular block.
  const cannon=addBox(root,.52,.46,4.7,0,2.38,3.08,targetTrim);
  cannon.userData.visualDetail='tank-cannon';
  addBox(root,.68,.55,.45,0,2.38,5.55,targetSteel);
  addBox(root, 1.15, .13, 1.0, -1.08, 2.96, -.88, targetTrim);
  addBox(root, 1.55, .12, 1.15, .87, 2.99, -1.25, targetTrim);
}
function carrierShape(root, paint) {
  addArmouredHull(root,6.05,2.55,9.7,0,.445,0,paint,.88,.80,'carrier-sloped-hull');
  addBox(root, 5.0, .6, 7.2, 0, 3.3, -.3, targetRoof);
  addBox(root, 5.2, .9, 2.4, 0, 2.95, 3.1, paint);
  for (const x of [-3.03, 3.03])
    for (const z of [-3.3, 0, 3.3]) wheel(root, x, z, 1.02, 1.05);
  addBox(root, 4.5, .16, .3, 0, 2.22, 4.94, targetTrim);
  addBox(root, 1.4, .65, 1.4, 0, 3.9, -.5, targetTrim);
  addBox(root, .35, .35, 2.4, 0, 3.9, 1.1, targetRoof);
  const visor=addBox(root,4.55,.73,.16,0,3.05,4.35,targetDarkGlass);
  visor.userData.visualDetail='carrier-visor';
  for(const x of [-2.3,2.3]){
    addBox(root,.58,.28,.2,x,1.72,4.91,lampMat);
    addBox(root,.64,.47,2.4,x,3.45,-1.55,targetSteel);
  }
}
function truckShape(root, paint) {
  // Separate boxy cab and elevated cargo bed make its long silhouette obvious.
  addBox(root, 5.45, .75, 11.1, 0, 1.35, 0, targetTrim);
  addArmouredHull(root,5.8,2.55,6.0,0,1.555,-2.05,paint,.91,.88,'truck-sloped-cargo');
  addBox(root, 5.95, .28, 6.35, 0, 4.25, -2.05, targetRoof);
  addBox(root, 5.25, 2.25, 3.1, 0, 2.73, 3.8, paint);
  addBox(root, 4.0, .75, .18, 0, 3.27, 5.38, targetTrim);
  addBox(root, 1.7, .45, .18, -1.6, 2.4, 5.48, lampMat);
  addBox(root, 1.7, .45, .18, 1.6, 2.4, 5.48, lampMat);
  addBox(root, 4.6, .22, .3, 0, 4.28, -.8, targetTrim);
  for (const x of [-2.87, 2.87])
    for (const z of [-3.65, -.95, 4.3]) wheel(root, x, z, .89, .94);
  for(const x of [-1.4,1.4]){
    const glass=addBox(root,2.05,.98,.14,x,3.28,5.39,targetDarkGlass);
    glass.userData.visualDetail='truck-windshield';
  }
  for(let i=0;i<4;i++)addBox(root,3.8,.07,.14,0,1.93+i*.16,5.57,targetTrim);
  for(const z of [-3.95,-1.6,.8])addBox(root,5.7,.25,.42,0,4.37,z,targetRoof);
}
function wreckShape(root, kind) {
  if (kind === 'tank') {
    addBox(root, 6.6, .64, 9.4, 0, .46, 0, wreckPaint);
    const turret = addBox(root, 3.8, .63, 3.8, .75, 1.19, -.7, wreckTrim);
    turret.rotation.y = .31; turret.rotation.z = -.12;
    for (const x of [-2.6, 2.6]) addBox(root, 1.05, .55, 8.5, x, .3, 0, targetTrim);
  } else if (kind === 'carrier') {
    addBox(root, 6.3, .8, 9.3, 0, .52, 0, wreckPaint);
    const roof = addBox(root, 5.1, .51, 6.6, .6, 1.11, -.45, wreckTrim);
    roof.rotation.z = -.18; roof.rotation.y = .14;
    for (const x of [-2.9, 2.9]) for (const z of [-3.0, 2.9]) wheel(root, x, z, .53, .42);
  } else {
    addBox(root, 5.7, .48, 10.9, 0, .47, 0, wreckPaint);
    const cargo = addBox(root, 5.7, 1.1, 5.4, -.6, 1.0, -2, wreckTrim);
    cargo.rotation.z = .22;
    const cab = addBox(root, 4.8, 1.2, 2.8, .6, .89, 3.7, wreckPaint);
    cab.rotation.y = -.23;
    for (const x of [-2.65, 2.65]) for (const z of [-3.3, 4.1]) wheel(root, x, z, .48, .4);
  }
}
function buildTargets() {
  for (const target of encounter.vehicles) {
    const kind = target.kind;
    const root = new THREE.Group();
    root.position.set(target.x, target.y - 1.8, target.z);
    root.rotation.y = .22 * (target.id - 1);
    if (kind === 'tank') tankShape(root, targetPaint[target.id % targetPaint.length]);
    else if (kind === 'carrier') carrierShape(root, targetPaint[target.id % targetPaint.length]);
    else truckShape(root, targetPaint[target.id % targetPaint.length]);
    // Thin surface-following red edges accent the hull and major volumes.
    // Highlight actual model parts rather than enclosing the whole vehicle
    // in a distracting box or hiding it behind a giant HUD reticle.
    const edges=new THREE.Group();
    const edgeMaterial=new THREE.LineBasicMaterial({
      color:0xff484e,transparent:true,opacity:0,depthTest:true,depthWrite:false
    });
    const largeParts=root.children.filter(part=>part.isMesh && part.geometry.type==='BoxGeometry'
      && part.geometry.parameters.width>2.8).slice(0,3);
    for(const part of largeParts){
      const line=new THREE.LineSegments(new THREE.EdgesGeometry(part.geometry,28),edgeMaterial);
      line.position.copy(part.position);
      line.rotation.copy(part.rotation);
      line.scale.copy(part.scale).multiplyScalar(1.035);
      edges.add(line);
    }
    edges.visible=false;
    root.add(edges);
    outlineViews.push({group:edges,material:edgeMaterial});
    encounterView.add(root);
    intactViews.push(root);
    const wreck = new THREE.Group();
    wreck.position.copy(root.position);
    wreck.rotation.y = root.rotation.y;
    wreckShape(wreck, kind);
    encounterView.add(wreck);
    wreckViews.push(wreck);
    const smoke = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({
      color: 0x444949, transparent: true, opacity: .27, depthWrite: false
    }));
    smoke.position.set(target.x, target.y + 5, target.z);
    smoke.scale.set(2.8, 5, 2.8);
    encounterView.add(smoke);
    smokeViews.push(smoke);
    const beacon=new THREE.Sprite(new THREE.SpriteMaterial({
      map:beaconTexture, color:0xffffff, transparent:true, opacity:0,
      depthWrite:false, depthTest:true, blending:THREE.NormalBlending
    }));
    beacon.position.set(target.x,target.y+2.0,target.z);
    beacon.scale.set(17,14,1);
    beacon.visible=false;
    encounterView.add(beacon);
    beaconViews.push(beacon);
  }
  syncTargets();
}
function syncTargets() {
  encounter.vehicles.forEach((vehicle,i)=>{
    // Reset visual transforms as well as pure state on each newly varied run.
    // Otherwise collisions would be at new locations but props at old places.
    intactViews[i].position.set(vehicle.x,vehicle.y-1.8,vehicle.z);
    intactViews[i].visible=!vehicle.destroyed;
    wreckViews[i].visible=vehicle.destroyed;
    smokeViews[i].visible=vehicle.destroyed;
    beaconViews[i].visible=false;
    outlineViews[i].group.visible=false;
    if (vehicle.destroyed) {
      // Freeze a moving target's wreck at the actual contact location.
      wreckViews[i].position.set(vehicle.x,vehicle.y-1.8,vehicle.z);
      wreckViews[i].rotation.y=intactViews[i].rotation.y;
      smokeViews[i].position.set(vehicle.x,vehicle.y+5,vehicle.z);
    }
  });
  const sector=activeSectorIndex(encounter);
  const local=encounter.vehicles.filter(v=>v.sector===sector);
  const progress=$('progress');
  Array.from(progress.children).forEach((pip,i)=>{
    pip.classList.toggle('hidden',i>=local.length);
    pip.classList.toggle('complete',!!local[i]?.destroyed);
  });
  progress.setAttribute('aria-label',
    `${sectorProgress(encounter,sector).hits} από ${local.length} οχήματα στην περιοχή ${sector+1}`);
}
buildTargets();
function moveEncounter() {
  encounterView.position.set(-flight.x,0,-flight.z);
  const sector=biomeIndex(flight.z);
  for(const target of encounter.vehicles){
    const outline=outlineViews[target.id];
    const outlineState=outlineAppearance(target,flight,sector,encounter.clock,reduceMotion);
    outline.group.visible=encounter.discovered.has(target.id)&&outlineState.visible&&mode==='flying';
    if(outline.group.visible)outline.material.opacity=outlineState.opacity;
    const beacon=beaconViews[target.id];
    const state=beaconAppearance(target,flight,sector,encounter.clock,reduceMotion);
    beacon.visible=encounter.discovered.has(target.id)&&state.visible&&mode==='flying';
    if(!beacon.visible)continue;
    beacon.position.set(target.x,target.y+2,target.z);
    beacon.scale.set(state.size,state.size*.78,1);
    beacon.material.opacity=state.opacity;
  }
  // Keep moving intact meshes and hit feedback aligned with their pure game state.
  for (const target of encounter.vehicles) {
    if (target.destroyed || !target.moving) continue;
    const visual=intactViews[target.id];
    visual.position.set(target.x,target.y-1.8,target.z);
    visual.rotation.y=.22*(target.id-1)+.12*Math.sin(encounter.clock*.8+target.id);
  }
}
function addScenicVehicle(group, cx, cz) {
  if ((cz + 3000) % 3 !== 1 || cz * TILE < 1500) return;
  const z = cz * TILE + TILE * .58, x = roadCenter(z);
  const car = new THREE.Group();
  addBox(car, 3.5, .95, 6.6, 0, .6, 0, carPaint);
  addBox(car, 3.0, 1.15, 3.5, 0, 1.55, -.4, carGlass);
  for (const side of [-1, 1]) for (const fore of [-2.1, 2.1]) {
    const wh = new THREE.Mesh(primitives.cylinder(.64,.38,10), wheelMat);
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
// Distinct readable areas beyond the main strip make the forest feel like a
// small playable location, not one generated road. Environmental props have no
// collision or score effect and live only in authored wooded pockets.
function addForestSideTrail(group,cx,cz,site) {
  const baseZ=cz*TILE;
  const verts=[],triangles=[],width=2.6,steps=28;
  for(let i=0;i<=steps;i++){
    const t=i/steps,p=sideTrailPoint(site,t);
    const before=sideTrailPoint(site,Math.max(0,t-.002));
    const after=sideTrailPoint(site,Math.min(1,t+.002));
    const dx=after.x-before.x,dz=after.z-before.z;
    const length=Math.hypot(dx,dz)||1,nx=dz/length,nz=-dx/length;
    for(const side of [-1,1]){
      const x=p.x+side*width*nx,z=p.z+side*width*nz;
      verts.push(x-cx*TILE,groundHeight(x,z)+.42,z-baseZ);
    }
    if(i>0){const k=(i-1)*2;triangles.push(k,k+2,k+1,k+1,k+2,k+3);}
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setIndex(triangles);geo.computeVertexNormals();
  group.add(ownedMesh(geo,dirtTrackMat));

  const endpoint=sideTrailPoint(site,1),y=groundHeight(endpoint.x,endpoint.z);
  const pad=ownedMesh(new THREE.CircleGeometry(14,24),campPadMat);
  pad.rotation.x=-Math.PI/2;
  pad.position.set(endpoint.x-cx*TILE,y+.33,endpoint.z-baseZ);
  group.add(pad);
  // A simple triangular canvas-tent and supply crates provide deliberate
  // visual variation off the road without introducing another game mode.
  const tent=ownedMesh(new THREE.ConeGeometry(9,9,4),tentMat);
  tent.rotation.y=Math.PI/4;
  tent.position.set(endpoint.x-cx*TILE-8,y+4.5,endpoint.z-baseZ+4);
  group.add(tent);
  const supply=new THREE.Group();
  supply.position.set(endpoint.x-cx*TILE+9,y+.5,endpoint.z-baseZ-6);
  for(let i=0;i<4;i++){
    const crate=addBox(supply,3.4,1.8,2.8,i%2?1.9:-1.9,1+(i>1?1.75:0),i%2?1.1:-1.1,cargoMat);
    crate.rotation.y=(i%2?-.2:.19);
  }
  group.add(supply);
}

// Three reusable scenic landmark compositions make the areas visibly distinct.
// Each landmark is built only while its streamed tile is near the player.
const springMat=new THREE.MeshPhongMaterial({color:0x67aaa4,transparent:true,
  opacity:.82,shininess:95,side:THREE.DoubleSide,depthWrite:false});
const pineFallenMat=new THREE.MeshLambertMaterial({color:0x5d4935,flatShading:true});
const ridgeRockMat=new THREE.MeshLambertMaterial({color:0xa39171,flatShading:true});
const lichenMat=new THREE.MeshLambertMaterial({color:0x7d8c66,flatShading:true});
const rockyPoolMat=new THREE.MeshLambertMaterial({color:0x6e7a72});
function makeNaturalLandmark(group,cx,cz,site){
  const p=landmarkPosition(site);
  if(cx!==Math.floor(p.x/TILE)||cz!==Math.floor(p.z/TILE))return;
  const y=groundHeight(p.x,p.z);
  const root=new THREE.Group();
  root.position.set(p.x-cx*TILE,y+.22,p.z-cz*TILE);
  root.userData.landmarkId=site.id;
  group.add(root);
  const rock=(x,z,scale,material=ridgeRockMat)=>{
    const item=ownedMesh(new THREE.DodecahedronGeometry(1,0),material);
    item.position.set(x,scale*.8,z);
    item.scale.set(scale*1.1,scale*.86,scale*1.2);
    item.rotation.set(.1,.33,.12);
    root.add(item);return item;
  };
  if(site.kind==='fallen-grove'){
    // Fallen trunks, moss and small stump clusters distinguish the first area.
    for(let i=0;i<4;i++){
      const stem=ownedMesh(new THREE.CylinderGeometry(1.2,1.7,26,7),pineFallenMat);
      stem.position.set(-13+i*8,1.4,Math.sin(i*2.2)*9);
      stem.rotation.z=Math.PI/2+.12*i;
      stem.rotation.y=i*.27;
      root.add(stem);
      for(let j=0;j<2;j++)rock(-12+i*8+j*3,12-i*5+j*3,1.8,lichenMat);
    }
  }else if(site.kind==='waterfall'){
    // A pale spring pool with stony banks and low mist-like falls; never
    // cross the main asphalt and stay purely environmental.
    const pool=ownedMesh(new THREE.CircleGeometry(1,36),springMat);
    pool.rotation.x=-Math.PI/2;pool.scale.set(20,13,1);
    pool.position.y=.65;root.add(pool);
    for(let i=0;i<11;i++){
      const a=i*Math.PI*2/11;
      rock(Math.cos(a)*20,Math.sin(a)*14,2.0+i%3*.6,rockyPoolMat);
    }
    for(let i=0;i<3;i++){
      const drop=ownedMesh(new THREE.PlaneGeometry(3.2,10),springMat);
      drop.position.set(-6+i*5,5,-9);
      drop.rotation.y=(i-1)*.08;
      root.add(drop);
    }
  }else{
    // Amber arch and scattered lichen boulders define the elevated ridge.
    for(const side of [-1,1]){
      for(let h=0;h<3;h++){
        const piece=rock(side*8+(h%2)*.5,0,3.8+(h%2)*.3);
        piece.position.y=3+h*5;
      }
    }
    const lintel=ownedMesh(new THREE.DodecahedronGeometry(1,0),ridgeRockMat);
    lintel.position.set(0,17,0);lintel.scale.set(11,3.2,4);
    root.add(lintel);
    for(let i=0;i<8;i++)rock(Math.sin(i*1.7)*24,Math.cos(i*2.4)*20,2+i%3);
  }
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
  const hazards=addForest(group, cx, cz, near);
  if(near)for(const vehicle of encounter.vehicles)makeClearingTrail(group,cx,cz,vehicle);
  if(near)for(const site of FOREST_SITES){
    const origin=sideTrailPoint(site,0);
    if(cx===Math.floor(origin.x/TILE)&&cz===Math.floor(origin.z/TILE))
      addForestSideTrail(group,cx,cz,site);
  }
  scenery.decorateTile(group, cx, cz, near);
  if(near)for(const landmark of LANDMARKS)makeNaturalLandmark(group,cx,cz,landmark);
  addLake(group, cx, cz);
  scene.add(group);
  return { group, cx, cz, near, hazards };
}
function disposeTile(tile) {
  scene.remove(tile.group);
  tile.group.traverse(obj => {
    if (obj.isInstancedMesh) obj.dispose();
    if (obj.userData.ownedGeometry) obj.geometry.dispose();
    // Scenic vehicle geometries are unique to each tile.
    if (obj.isMesh && !obj.isInstancedMesh && !obj.userData.ownedGeometry &&
        !obj.geometry.userData?.sharedPrimitive && obj.parent?.type === 'Group' &&
        obj.parent !== tile.group) obj.geometry.dispose();
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
function forestContact(from,to) {
  // Only read streamed tiles intersecting the swept player path: normally 1-4
  // near tiles rather than iterating over the entire surrounding forest.
  const pad=8;
  const x0=Math.floor((Math.min(from.x,to.x)-pad)/TILE);
  const x1=Math.floor((Math.max(from.x,to.x)+pad)/TILE);
  const z0=Math.floor((Math.min(from.z,to.z)-pad)/TILE);
  const z1=Math.floor((Math.max(from.z,to.z)+pad)/TILE);
  let first=null;
  for(let cz=z0;cz<=z1;cz++)for(let cx=x0;cx<=x1;cx++){
    const tile=tiles.get(cx+':'+cz);
    if(!tile?.near)continue;
    const hit=resolveTreeContact(from,to,tile.hazards);
    if(hit&&(!first||hit.t<first.t))first=hit;
  }
  return first;
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
window.addEventListener('blur', () => {
  pointer=null;keys.clear();
  if(mode==='flying'||mode==='impact')setPause();
  budget.reset();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (mode === 'flying'||mode==='impact') setPause();
    sound.suspendOnHidden();
  }
  last = 0;
  budget.reset();
});
// Three.js restores GPU resources automatically. Our state machine keeps the
// game safely paused until an actual restored-context event and user tap.
canvas.addEventListener('webglcontextlost',event=>{
  event.preventDefault();
  graphicsReady=false;
  if(mode==='flying'||mode==='impact')setPause();
  contextCopy=overlay.querySelector('p')?.textContent||'';
  if(overlay.querySelector('p'))overlay.querySelector('p').textContent=
    'Η σύνδεση με τα γραφικά διακόπηκε. Η πτήση κρατήθηκε σε παύση.';
  primary.disabled=true;
  sound.setActive(false);
  budget.reset();
});
canvas.addEventListener('webglcontextrestored',()=>{
  graphicsReady=true;
  primary.disabled=false;
  if(contextCopy!==null && overlay.querySelector('p'))
    overlay.querySelector('p').textContent=contextCopy;
  contextCopy=null;
  renderer.setPixelRatio(budget.dpr);
  resize();
  last=performance.now();
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
  skimState=makeSkimState();
  encounter = makeEncounter(playthroughSeed+(++playthroughNumber)*193); scorecard = makeScorecard(); lastAward=null;
  lastSightCheck=-Infinity;
  lastCheckpointSector=0;lastArrivalArea=0;
  visitedAreas.clear();visitedAreas.add(0);visitedGROVES.clear();
  syncTargets(); roundBannerTime=0; roundBannerText='';
  spawnDrone(); mode = 'flying'; view = 'chase'; pointer = null;
  cameraYaw = flight.heading; cameraPitch=.05; throttleMode='cruise';
  drone.visible = true; viewButton.textContent = 'FPV';
  hint.textContent = 'Πάνω: ανέβα / φρένα / πίσω · κάτω: βουτιά · πλάγια: κατεύθυνση';
  hint.style.opacity='1';
  overlay.className = 'panel hidden'; hud.classList.remove('hidden');
  pauseButton.classList.remove('hidden'); viewButton.classList.remove('hidden');
  warning.textContent = '';
  muteButton.classList.remove('hidden');
   lastSector = ''; rebuildTiles(true); moveTiles(); updateFarLand(); last = performance.now();
}
function spawnDrone() {
  skimState=makeSkimState();
  flight = makeFlight();
  const checkpoint=spawnForNextTarget(encounter,lastCheckpointSector);
  flight.z=checkpoint.z;
  flight.x=checkpoint.x;
  flight.y=checkpoint.y+((encounter.drones-1)%2)*5;
  lastArrivalArea=biomeIndex(flight.z);
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
  lastCheckpointSector=contact.type==='vehicle'?encounter.vehicles[contact.id].sector:biomeIndex(flight.z);
  impactType=contact.type;impactId=contact.id??-1;
  if(contact.type==='vehicle') {
    const previousSector=activeSectorIndex(encounter);
    encounter.discovered.add(contact.id);
    applyContact(encounter,contact);syncTargets();
    advancedSector=activeSectorIndex(encounter)>previousSector;
  } else advancedSector=false;
  if(contact.type==='vehicle') {
    const target=encounter.vehicles[contact.id];
    impactFX.start('vehicle',{ x:target.x, y:target.y-2.2, z:target.z });
  } else {
    impactFX.start('ground',contact.type==='tree'
      ? { x:contact.x, y:contact.y, z:contact.z }
      : { x:flight.x, y:groundHeight(flight.x,flight.z), z:flight.z });
  }
  lastAward=registerResult(scorecard,contact.type==='vehicle',flight);
  sound.setActive(false);
  sound.impact(contact.type==='vehicle', {
    chain: contact.type==='vehicle' ? sectorProgress(encounter,encounter.vehicles[contact.id].sector).hits : 0,
    finale: contact.type==='vehicle' && (advancedSector || levelComplete(encounter))
  });
  warning.textContent=(contact.type==='tree'?'TREE COLLISION':lastAward.label) +
    (lastAward.points ? '  +' + lastAward.points : '');
  drone.visible=false;
}
function showLevelComplete() {
  mode='complete'; pointer=null; keys.clear(); sound.setActive(false);
  hud.classList.add('hidden'); pauseButton.classList.add('hidden');
  viewButton.classList.add('hidden'); muteButton.classList.add('hidden');
  let best=null,bestScore=scorecard.points;
  try {
    const saved=Number(localStorage.getItem('warDroneBestLevel'));
    best=saved>=LEVEL_TARGETS?saved:null;
    if(best===null || encounter.drones<best) {
      best=encounter.drones;
      localStorage.setItem('warDroneBestLevel',String(best));
    }
    const savedScore=Number(localStorage.getItem('warDroneBestScore'));
    bestScore=Math.max(scorecard.points,Number.isFinite(savedScore)?savedScore:0);
    localStorage.setItem('warDroneBestScore',String(bestScore));
  } catch { best=encounter.drones; }
  overlay.className='panel result';
  overlay.querySelector('.kicker').textContent='FOREST LEVEL · COMPLETE';
  overlay.querySelector('h1').innerHTML='LEVEL<br><em>CLEAR</em>';
  overlay.querySelector('p').textContent=
    `${LEVEL_TARGETS}/${LEVEL_TARGETS} οχήματα · ${scorecard.points.toLocaleString('en-US')} PTS (BEST ${bestScore.toLocaleString('en-US')}) · ${encounter.drones} drones (BEST ${best}) · ${scorecard.diveHits} DIVE HITS. Πέτα ξανά για καλύτερη διαδρομή.`;
  primary.innerHTML='PLAY AGAIN <span>↗</span>';
}
function setPause() {
  const next=pauseFlightState(mode);
  if(!next)return;
  resumeMode=next.resumeMode;
  mode=next.mode;pointer=null;keys.clear();sound.setActive(false);budget.reset();
  hud.classList.add('hidden'); pauseButton.classList.add('hidden');
  viewButton.classList.add('hidden'); muteButton.classList.add('hidden');
   overlay.className = 'panel paused';
  overlay.querySelector('.kicker').textContent = 'ENCOUNTER · PAUSED';
  overlay.querySelector('h1').innerHTML = 'ABOVE<br><em>THE TREES</em>';
  overlay.querySelector('p').textContent = `${encounter.hits}/${LEVEL_TARGETS} οχήματα · drone ${encounter.drones} · περιοχή ${activeSectorIndex(encounter)+1}/${LEVEL_SECTORS.length}.`;
  primary.innerHTML = 'RESUME FLIGHT <span>↗</span>';
  restartArmed=false;restartButton.textContent='RESTART LEVEL';
  redeployButton.disabled=levelComplete(encounter);
}
pauseButton.addEventListener('click', setPause);
redeployButton.addEventListener('click',()=>{
  if(mode!=='paused'||!graphicsReady)return;
  const result=redeployWithPenalty(encounter,scorecard);
  if(!result.ok)return;
  spawnDrone();mode='flying';resumeMode='flying';
  overlay.className='panel hidden';
  hud.classList.remove('hidden');pauseButton.classList.remove('hidden');
  viewButton.classList.remove('hidden');muteButton.classList.remove('hidden');
  warning.textContent='NEW DRONE';
  roundBannerTime=1.4;roundBannerText='REDEPLOYED · DRONE '+encounter.drones;
  lastSector='';rebuildTiles(true);moveTiles();updateFarLand();updateHUD();
  sound.unlock();budget.reset();last=performance.now();
});
restartButton.addEventListener('click',()=>{
  if(mode!=='paused'||!graphicsReady)return;
  if(!restartArmed){
    restartArmed=true;
    restartButton.textContent='CONFIRM RESTART';
    return;
  }
  restartArmed=false;restartButton.textContent='RESTART LEVEL';
  startFlight();
});
primary.addEventListener('click', () => {
  if(!graphicsReady)return;
  if(mode==='paused'){
    const next=resumeFlightState(mode,resumeMode,graphicsReady);
    if(!next)return;
    mode=next.mode;overlay.className='panel hidden';
    if(mode==='flying')sound.unlock().then(()=>sound.cue('start'));
    sound.setActive(mode==='flying');
    hud.classList.remove('hidden');pauseButton.classList.remove('hidden');
    viewButton.classList.remove('hidden');muteButton.classList.remove('hidden');
    budget.reset();last=performance.now();
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
  const desiredPitch=view==='chase'
    ? forestChasePitch({
        height:Math.max(0,flight.y-groundHeight(flight.x,flight.z)),
        pitch:flight.pitch,pullback:flight.pullback||0
      })
    : clamp(.035-flight.pitch*.67-.42*(flight.pullback||0),-.93,.43);
  cameraPitch+=(desiredPitch-cameraPitch)*(1-Math.exp(-4.1*dt));
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
  distanceEl.textContent = `${encounter.hits}/${LEVEL_TARGETS} · DRONE ${encounter.drones}`;
  const scoreEl=$('arcade-score');
  if(scoreEl) scoreEl.textContent=`${scorecard.points.toLocaleString('en-US')} PTS`+
    (scorecard.combo>=2?` · ×${scorecard.combo} COMBO`:'');
  const compass=$('target-compass');
  if(compass) {
    const guide=guidanceFor(encounter,flight,encounter.discovered,biomeIndex(flight.z));
    const search=explorationHint(encounter,flight);
    compass.textContent=guide?`${guide.arrow} ${guide.kind} · ${guide.distance} M`:
      search.signal?.label||search.clue;
    compass.dataset.direction=guide?.direction||'SEARCH';
    compass.setAttribute('aria-label',guide?'Προσεγγίζεις όχημα':'Αναζήτησε οχήματα μέσα στο δάσος');
  }
  const physicalArea=biomeIndex(flight.z);
  $('round-label').textContent = `AREA ${physicalArea+1}/${LEVEL_SECTORS.length}`;
  const here=encounter.vehicles.filter(v=>v.sector===physicalArea);
  const progress=$('progress');
  Array.from(progress.children).forEach((pip,i)=>{
    pip.classList.toggle('hidden',i>=here.length);
    pip.classList.toggle('complete',!!here[i]?.destroyed);
  });
  progress.setAttribute('aria-label',
    `${here.filter(v=>v.destroyed).length} από ${here.length} οχήματα στην περιοχή ${physicalArea+1}`);
  altitudeEl.textContent = Math.round(Math.max(0, flight.y - groundHeight(flight.x, flight.z))) + ' M AGL';
  const totalSpeed=Math.hypot(flight.vx,flight.vy,flight.vz);
  speedEl.textContent = (flight.speed < -5 ? '↶ ' : '') + Math.round(totalSpeed*3.6) + ' KM/H';
  const rate=$('vertical-rate');
  if (rate) {
    const rising=flight.vy>=0;
    rate.textContent=(rising?'↑ ':'↓ ')+Math.abs(flight.vy).toFixed(1)+' M/S';
  }
  if(mode==='flying') warning.textContent=roundBannerTime>0 ? roundBannerText :
    flight.pitch>.95 && flight.vy<-4 ? 'STEEP DIVE' : '';
}
function frame(now) {
  if(!graphicsReady){
    last=now;
    requestAnimationFrame(frame);
    return;
  }
  const dt = Math.min((now - last) / 1000 || .016, .1); last = now;
  if (mode === 'flying'&&!qaFrozen) {
    roundBannerTime=Math.max(0,roundBannerTime-dt);
    // CRUISE/FAST/HOVER/REVERSE no longer require a mode button. The
    // player's one-finger vertical gesture controls requested motion.
    const command=inputState();
    flight.throttle=.72;
    throttleMode=command.y<-.75?'fast':'gesture';
    const previous={x:flight.x,y:flight.y,z:flight.z};
    advanceFlight(flight, command, dt);
    updateEncounter(encounter,dt);
    const skim=stepSkim(skimState,{
      height:Math.max(0,flight.y-groundHeight(flight.x,flight.z)),
      speed:Math.hypot(flight.vx,flight.vz),
      dx:flight.x-previous.x,dz:flight.z-previous.z,
      gesture:Math.abs(command.x)+Math.abs(command.y)
    },dt);
    if(skim){
      scorecard.points+=skim.points;
      scorecard.skimPoints=(scorecard.skimPoints||0)+skim.points;
      roundBannerText=skim.label+' · +'+skim.points;
      roundBannerTime=1.15;
      sound.cue('skim');
    }
    const nextArrival=areaArrival(lastArrivalArea,flight.z);
    if(nextArrival!==lastArrivalArea){
      lastArrivalArea=nextArrival;
      if(!visitedAreas.has(nextArrival)){
        visitedAreas.add(nextArrival);
        roundBannerTime=2.65;
        roundBannerText=BIOMES[nextArrival].name+' · DISCOVERED';
        sound.cue('landmark');
      }
    }
    // Cap tree-occlusion discovery checks at roughly eight per second. This
    // lets a player actually search behind canopies without a mobile CPU tax
    // on all sixty rendered frames. The close approach always catches up.
    if(encounter.clock-lastSightCheck>=.12){
      lastSightCheck=encounter.clock;
      const found=discoverNearby(encounter,flight,groundHeight,
        (eye,object)=>Boolean(forestContact(eye,object)));
      if(found.length){
        const reward=registerExploration(scorecard,'vehicle',found.length);
        roundBannerTime=1.8;
        roundBannerText=`${reward.label} · +${reward.points}`;
        sound.cue('spot');
      }
    }
    // Optional exploration challenge: investigate natural off-road camp sites.
    // These are scenery discoveries, not military targeting markers or tools.
    for(const site of FOREST_SITES){
      if(visitedGROVES.has(site.id))continue;
      const end=sideTrailPoint(site,1);
      if(Math.hypot(flight.x-end.x,flight.z-end.z)>32)continue;
      visitedGROVES.add(site.id);
      const reward=registerExploration(scorecard,'landmark',1);
      roundBannerTime=2.0;
      roundBannerText=`${reward.label} · +${reward.points}`;
      sound.cue('landmark');
    }
    const vehicleContact=resolveContact(encounter,previous,flight,flight.groundContact);
    const treeContact=forestContact(previous,flight);
    const contact=chooseContact(vehicleContact,treeContact,flight.groundContact);
    if(contact)endFlight(contact);
    rebuildTiles(); moveTiles(); updateFarLand(); updateHUD();
    sound.update(Math.hypot(flight.vx,flight.vy,flight.vz),Math.max(0,flight.y-groundHeight(flight.x,flight.z)),dt,true,{
      verticalSpeed: flight.vy, throttle: flight.throttle, throttleMode,
      bank: flight.bank, sideRate: flight.sideRate,biomeZ:flight.z,worldX:flight.x
    });
  } else if (mode === 'impact') {
    impactAge+=dt;
    impactFX.update(impactAge);
    if(impactAge>.98){
      if(levelComplete(encounter)) {
        showLevelComplete();
      } else {
        nextDrone(encounter);
        spawnDrone();mode='flying';
        roundBannerTime=advancedSector?2.3:0;
        roundBannerText=advancedSector?
          `SECTOR ${activeSectorIndex(encounter)+1} · ${LEVEL_SECTORS[activeSectorIndex(encounter)].name}`:'';
        lastSector='';rebuildTiles(true);moveTiles();updateFarLand();updateHUD();
      }
    }
  }
  const height = Math.max(0, flight.y - groundHeight(flight.x, flight.z));
  clouds.update(flight.x,flight.y,flight.z,now/1000);
  // Three biomes blend light, sky, fog and vegetation progressively while
  // crossing valleys, not as abrupt preset changes at a loading screen.
  const biomeTransition=biomeBlend(flight.z);
  const A=biomeColors[biomeTransition.from],B=biomeColors[biomeTransition.to];
  const t=biomeTransition.t;
  sky.material.uniforms.uHorizon.value.copy(A.horizon).lerp(B.horizon,t);
  sky.material.uniforms.uZenith.value.copy(A.zenith).lerp(B.zenith,t);
  sky.material.uniforms.uSunTint.value.copy(A.skySun).lerp(B.skySun,t);
  scene.fog.color.copy(A.fog).lerp(B.fog,t);
  hemi.color.copy(A.hemi).lerp(B.hemi,t);
  sunlight.color.copy(A.sun).lerp(B.sun,t);
  sunlight.intensity=BIOMES[biomeTransition.from].sunIntensity+
    (BIOMES[biomeTransition.to].sunIntensity-BIOMES[biomeTransition.from].sunIntensity)*t;
  const mist=BIOMES[biomeTransition.from].fogFactor+
    (BIOMES[biomeTransition.to].fogFactor-BIOMES[biomeTransition.from].fogFactor)*t;
  scene.fog.density=.00034*mist/(1+height/2100);
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
  wildlife.update(encounter.clock,flight.z);
  canopyWind.time.value=canopyWindPhase(encounter.clock);
  canopyWind.strength.value=canopyWindStrength(flight.z,reduceMotion);
  smokeViews.forEach((smoke,i)=>{ if(smoke.visible){smoke.position.y=encounter.vehicles[i].y+5+Math.sin(now*.0006+i)*1.2;smoke.rotation.y+=dt*.17;} });
  for (let i = 0; i < rotors.length; i++) rotors[i].rotation.y += dt * (i % 2 ? -43 : 43);
  renderer.render(scene, camera);
  const nextDpr=budget.sample(dt*1000,mode==='flying');
  if(nextDpr!==null){
    renderer.setPixelRatio(nextDpr);
    resize();
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
  cameraYaw, cameraPitch, throttleMode, gesture: inputState(), speed:flight.speed,
  vx:flight.vx,vy:flight.vy,vz:flight.vz,pitch:flight.pitch,bank:flight.bank,sideRate:flight.sideRate,pullback:flight.pullback||0,brakeIntent:flight.brakeIntent||0,reverseIntent:flight.reverseIntent||0,
  ground: groundHeight(flight.x, flight.z), mode, audioEnabled: sound.enabled
  , hits:encounter.hits, drones:encounter.drones, sector:activeSectorIndex(encounter),
  seed:encounter.variationSeed,total:LEVEL_TARGETS, vehicles:encounter.vehicles.map(v=>v.destroyed),
  hiddenPositions:encounter.vehicles.map(v=>[v.homeX,v.homeZ]),
  displacedModels:encounter.vehicles.filter(v=>{
    const art=intactViews[v.id];
    if(!art||v.destroyed)return false;
    return Math.hypot(art.position.x-v.x,art.position.z-v.z)>.25;
  }).length,
  points:scorecard.points, combo:scorecard.combo, misses:scorecard.misses,
  moving:encounter.vehicles.filter(v=>v.moving&&!v.destroyed).length,
  target:guidanceFor(encounter,flight,encounter.discovered,biomeIndex(flight.z)),
  exploration:explorationHint(encounter,flight),
  discovered:[...encounter.discovered], spawn:spawnForNextTarget(encounter), lastAward,
  nearbyTrees:tiles.get(Math.floor(flight.x/TILE)+':'+Math.floor(flight.z/TILE))?.hazards.length||0,
  battlefieldPaths:battlefield.trails.length,stagingPads:battlefield.pads.length,
  softSoilBlend:trailMaterial.transparent&&trailMaterial.vertexColors&&stagingMaterial.vertexColors,
  beacons:beaconViews.filter(b=>b.visible).length,
  tankCannons:intactViews.flatMap(v=>v.children).filter(m=>m.userData?.visualDetail==='tank-cannon').length,
  carrierVisors:intactViews.flatMap(v=>v.children).filter(m=>m.userData?.visualDetail==='carrier-visor').length,
  truckWindows:intactViews.flatMap(v=>v.children).filter(m=>m.userData?.visualDetail==='truck-windshield').length,
  redOutlines:outlineViews.filter(o=>o.group.visible).length,
  scenicSites:FOREST_SITES.length,landmarksAuthored:LANDMARKS.length,
  visitedBiomes:[...visitedAreas],
  mistTypes:scenery.groundMistStyles,
  canopyWindReady:canopyShaderReady,canopyWindStrength:canopyWind.strength.value,
  riverStretch:STREAM_END-STREAM_START,
  livingForestBirds:wildlife.count,
  riverPoints:RIVER.samples+1,riverBridge:riverView.children.some(m=>m.userData.scenicFeature==='stone-bridge'),
  physicalArea:biomeIndex(flight.z),checkpointArea:lastCheckpointSector,
  grovesVisited:visitedGROVES.size,
  discoveryPoints:scorecard.scoutingPoints,skimPoints:scorecard.skimPoints||0,
  biome:biomePalette(flight.z).id,
  landscapeNames:BIOMES.map(b=>b.name),skyHorizon:sky.material.uniforms.uHorizon.value.getHex(),
  dpr:budget.dpr,graphicsReady,resumeMode,renderCalls:renderer.info.render.calls,
  geometries:renderer.info.memory.geometries,primitiveGeometries:primitives.stats.total,
  slopedHullGeometries:armourMeshes.size,
  tankSlopedHulls:intactViews.filter(group=>group.children.some(m=>m.userData.visualDetail==='tank-sloped-hull')).length,
  carrierSlopedHulls:intactViews.filter(group=>group.children.some(m=>m.userData.visualDetail==='carrier-sloped-hull')).length,
  truckSlopedCargos:intactViews.filter(group=>group.children.some(m=>m.userData.visualDetail==='truck-sloped-cargo')).length,
  framePacing:budget.stats
});
// Local-only visual QA: no debug cheats or repositioning on public GitHub Pages.
if(location.hostname==='127.0.0.1'){
  window.__forestVisualQA=(index)=>{
    if(!Number.isInteger(index)||index<0||index>=LEVEL_SECTORS.length)
      throw new RangeError('Invalid QA landscape');
    qaFrozen=true;
    const z=[325,735,1120][index];
    const x=roadCenter(z);
    flight.x=x;flight.z=z;flight.y=groundHeight(x,z)+74;
    flight.heading=0;flight.pitch=0;flight.bank=0;
    flight.vx=flight.vy=flight.vz=0;
    camera.position.set(0,flight.y+8,-23);
    cameraYaw=0;cameraPitch=forestChasePitch({height:74,pitch:0});
    lastSector='';rebuildTiles(true);moveTiles();updateFarLand();updateHUD();
    return {region:BIOMES[index].id,position:z};
  };
}
document.documentElement.dataset.openSkyReady = 'true';
requestAnimationFrame(frame);
