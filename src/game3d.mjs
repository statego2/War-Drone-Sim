import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { TILE, clamp, hash, roadCenter, groundHeight, makeFlight, advanceFlight } from './flight3d.mjs';

// A floating-origin, streamed polygonal world. No real-drone targeting or hardware integration.
const $ = id => document.getElementById(id);
const canvas = $('scene'), overlay = $('overlay'), primary = $('primary');
const hud = $('hud'), pauseButton = $('pause'), distanceEl = $('distance');
const altitudeEl = $('altitude'), speedEl = $('speed'), hint = $('hint');
const viewButton = $('view-mode'), boostButton = $('boost'), warning = $('warning');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.27;
const mobile = matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.8));
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9eafa8, .00034);
const camera = new THREE.PerspectiveCamera(mobile ? 73 : 70, 1, .15, 6500);
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

const terrainMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.FrontSide });
const roadMat = new THREE.MeshLambertMaterial({ color: 0x4b4b42, roughness: 1 });
const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x82785f });
const stripeMat = new THREE.MeshBasicMaterial({ color: 0xb7aa83 });
const leafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
const barkMat = new THREE.MeshLambertMaterial({ color: 0x42352b });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x929081, flatShading: true });
const treeCone = new THREE.ConeGeometry(1, 1, 7);
const treeTrunk = new THREE.CylinderGeometry(.28, .41, 1, 5);
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
const temp = new THREE.Object3D();
const greenPalette = [0x203e33, 0x294938, 0x31503c, 0x3b563e, 0x435b42, 0x365243];
const tiles = new Map();
let flight = makeFlight(), mode = 'home', view = 'chase', boost = false, last = 0, lastSector = '', frameCount = 0;
let pointer = null;
const keys = new Set();

function terrainColor(x, y, z) {
  const n = hash(Math.floor(x / 14), Math.floor(z / 14));
  const forest = y > 105 ? [0x6a705f, 0x7d7967, 0x878474] : [0x354d35, 0x3d5838, 0x465d3b];
  const c = new THREE.Color(forest[Math.floor(n * forest.length)]);
  const tint = (hash(Math.floor(x / 33), Math.floor(z / 33)) - .5) * .14;
  c.offsetHSL(0, 0, tint);
  return c;
}
function terrainGeometry(cx, cz, segments = 24, size = TILE) {
  const positions = [], colors = [], indices = [];
  const baseX = cx * TILE, baseZ = cz * TILE;
  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const px = ix / segments * size, pz = iz / segments * size;
      const x = baseX + px, z = baseZ + pz, y = groundHeight(x, z);
      positions.push(px, y, pz);
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
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
function ownedMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.ownedGeometry = true;
  return mesh;
}
function makeRoadStrip(cx, cz, halfWidth, offsetY, material, centerOffset = 0, dash = false) {
  const verts = [], inds = [], z0 = cz * TILE;
  const steps = dash ? 48 : 44;
  for (let i = 0; i <= steps; i++) {
    const z = z0 + i * TILE / steps;
    const axis = roadCenter(z), tangent = (roadCenter(z + 1) - roadCenter(z - 1)) / 2;
    const norm = 1 / Math.hypot(1, tangent), ox = norm, oz = -tangent * norm;
    for (const side of [-1, 1]) {
      const x = axis + (centerOffset + side * halfWidth) * ox;
      const zz = z + (centerOffset + side * halfWidth) * oz;
      verts.push(x - cx * TILE, groundHeight(x, zz) + offsetY, zz - cz * TILE);
    }
    if (i === 0) continue;
    const a = 2 * (i - 1);
    if (!dash || (Math.floor(z / 21) % 2 === 0)) inds.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
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
  const attempts = near ? (mobile ? 96 : 130) : 44, trees = [], rocks = [];
  for (let i = 0; i < attempts; i++) {
    const rx = hash(cx * 739 + i * 17, cz * 1909 + 81);
    const rz = hash(cx * 2203 + i * 31, cz * 499 + 12);
    const x = rx * TILE, z = rz * TILE, wx = cx * TILE + x, wz = cz * TILE + z;
    const h = groundHeight(wx, wz);
    if (Math.abs(wx - roadCenter(wz)) < 15) continue;
    const size = (near ? 10 : 7) + 15 * hash(cx * 299 + i, cz * 41 + i * 61);
    if (i % 9 === 0) rocks.push({ x, z, h, s: 1 + hash(i + cx, cz) * 2.3 });
    else trees.push({ x, z, h, size, r: 1.7 + size * .19, color: greenPalette[Math.floor(hash(i + cx * 9, cz * 7 + i) * greenPalette.length)], turn: hash(i, cz * 2 + cx) * Math.PI * 2 });
  }
  if (trees.length) {
    const crown = instanced(treeCone, leafMat, trees.length * 2, true);
    const trunks = instanced(treeTrunk, barkMat, trees.length);
    trees.forEach((t, i) => {
      setInstance(trunks, i, t.x, t.h + t.size * .27, t.z, .63, t.size * .54, .63, t.turn);
      setInstance(crown, i * 2, t.x, t.h + t.size * .52, t.z, t.r, t.size * .75, t.r, t.turn, t.color);
      setInstance(crown, i * 2 + 1, t.x, t.h + t.size * .83, t.z, t.r * .7, t.size * .64, t.r * .7, t.turn + .2, t.color);
    });
    trunks.instanceMatrix.needsUpdate = true;
    crown.instanceMatrix.needsUpdate = true;
    if (crown.instanceColor) crown.instanceColor.needsUpdate = true;
    group.add(crown, trunks);
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
function addScenicVehicle(group, cx, cz) {
  if ((cz + 3000) % 3 !== 1) return;
  const z = cz * TILE + TILE * .58, x = roadCenter(z);
  if (Math.floor(x / TILE) !== cx) return;
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
function makeTile(cx, cz, near) {
  const group = new THREE.Group();
  const terrain = ownedMesh(terrainGeometry(cx, cz, near ? 26 : 14), terrainMat);
  group.add(terrain);
  // Asphalt/shoulders follow the hills; each ribbon is genuine triangulated geometry.
  const possible = [cz * TILE, cz * TILE + TILE / 2, (cz + 1) * TILE].some(z => {
    const x = roadCenter(z);
    return x > cx * TILE - 15 && x < (cx + 1) * TILE + 15;
  });
  if (possible) {
    group.add(makeRoadStrip(cx, cz, 6.2, .4, shoulderMat));
    group.add(makeRoadStrip(cx, cz, 4.65, .47, roadMat));
    group.add(makeRoadStrip(cx, cz, .105, .50, stripeMat, 0, true));
    addScenicVehicle(group, cx, cz);
  }
  addForest(group, cx, cz, near);
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
  const radius = flight.y > 900 ? 4 : flight.y > 230 ? 3 : 2;
  const sector = cx + ':' + cz + ':' + radius;
  if (sector === lastSector && !force) return;
  lastSector = sector;
  const keep = new Set();
  for (let dz = -radius; dz <= radius; dz++) for (let dx = -radius; dx <= radius; dx++) {
    const tx = cx + dx, tz = cz + dz, id = tx + ':' + tz;
    const near = Math.abs(dx) <= 2 && Math.abs(dz) <= 2;
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
let farX = NaN, farZ = NaN;
function updateFarLand() {
  const gx = Math.floor(flight.x / (TILE * 2)) * TILE * 2;
  const gz = Math.floor(flight.z / (TILE * 2)) * TILE * 2;
  if (gx !== farX || gz !== farZ) {
    farX = gx; farZ = gz;
    const positions = [], colors = [], indices = [], n = 60, size = 9400;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const x = (i / n - .5) * size, z = (j / n - .5) * size;
      const wx = gx + x, wz = gz + z, h = groundHeight(wx, wz) - 22;
      positions.push(x, h, z);
      const c = terrainColor(wx, h, wz); colors.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i, b = a + 1, c = a + n + 1;
      indices.push(a, c, b, b, c, c + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
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
  pointer.dx = clamp((e.clientX - pointer.x) / 85, -1, 1);
  pointer.dy = clamp((pointer.y - e.clientY) / 95, -1, 1);
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
window.addEventListener('blur', () => { pointer = null; keys.clear(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'flying') setPause(); last = 0; });
function toggleView() {
  view = view === 'chase' ? 'fpv' : 'chase';
  viewButton.textContent = view === 'chase' ? 'FPV' : 'CHASE';
  drone.visible = view === 'chase';
}
viewButton.addEventListener('click', toggleView);
boostButton.addEventListener('click', () => {
  boost = !boost;
  boostButton.textContent = boost ? 'FAST' : 'CRUISE';
  boostButton.setAttribute('aria-pressed', String(boost));
});
function startFlight() {
  flight = makeFlight(); mode = 'flying'; boost = false; view = 'chase'; pointer = null;
  drone.visible = true; boostButton.textContent = 'CRUISE'; viewButton.textContent = 'FPV';
  overlay.className = 'panel hidden'; hud.classList.remove('hidden');
  pauseButton.classList.remove('hidden'); viewButton.classList.remove('hidden'); boostButton.classList.remove('hidden');
  warning.textContent = '';
  lastSector = ''; rebuildTiles(true); moveTiles(); updateFarLand(); last = performance.now();
}
function setPause() {
  if (mode !== 'flying') return;
  mode = 'paused'; pointer = null; keys.clear();
  hud.classList.add('hidden'); pauseButton.classList.add('hidden');
  viewButton.classList.add('hidden'); boostButton.classList.add('hidden');
  overlay.className = 'panel paused';
  overlay.querySelector('.kicker').textContent = 'FREE FLIGHT · PAUSED';
  overlay.querySelector('h1').innerHTML = 'ABOVE<br><em>THE TREES</em>';
  overlay.querySelector('p').textContent = 'Η πτήση σου αποθηκεύεται όσο παραμένει ανοιχτή η σελίδα.';
  primary.innerHTML = 'RESUME FLIGHT <span>↗</span>';
}
pauseButton.addEventListener('click', setPause);
primary.addEventListener('click', () => {
  if (mode === 'paused') {
    mode = 'flying'; overlay.className = 'panel hidden';
    hud.classList.remove('hidden'); pauseButton.classList.remove('hidden');
    viewButton.classList.remove('hidden'); boostButton.classList.remove('hidden');
    last = performance.now();
  } else startFlight();
});
function inputState() {
  const x = (pointer?.dx || 0) + (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  const y = (pointer?.dy || 0) + (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
  return { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
}
const cameraTarget = new THREE.Vector3();
function updateCamera(dt) {
  const dirX = Math.sin(flight.heading), dirZ = Math.cos(flight.heading);
  if (view === 'fpv') {
    cameraTarget.set(0, flight.y + .35, 0);
    camera.position.lerp(cameraTarget, 1 - Math.exp(-8 * dt));
    camera.lookAt(dirX * 50, flight.y + 3 + flight.pitch * 27, dirZ * 50);
  } else {
    cameraTarget.set(-dirX * 13, flight.y + 4.1, -dirZ * 13);
    camera.position.lerp(cameraTarget, 1 - Math.exp(-5 * dt));
    camera.lookAt(dirX * 23, flight.y + 1.7 + flight.pitch * 17, dirZ * 23);
  }
  camera.up.set(Math.sin(flight.bank) * .09, 1, 0).normalize();
  camera.updateProjectionMatrix();
  drone.position.set(0, flight.y, 0);
  drone.rotation.order = 'YXZ';
  drone.rotation.set(-flight.pitch * .9, flight.heading, flight.bank, 'YXZ');
}
function updateHUD() {
  distanceEl.textContent = Math.round(flight.distance).toLocaleString('en-US') + ' M';
  altitudeEl.textContent = Math.round(Math.max(0, flight.y - groundHeight(flight.x, flight.z))) + ' M AGL';
  speedEl.textContent = Math.round(flight.speed * 3.6) + ' KM/H';
  warning.textContent = flight.groundContact ? 'LOW ALTITUDE · CLIMB' : '';
}
function frame(now) {
  const dt = Math.min((now - last) / 1000 || .016, .1); last = now;
  if (mode === 'flying') {
    flight.throttle = boost || keys.has('shift') ? .98 : .54;
    advanceFlight(flight, inputState(), dt);
    rebuildTiles(); moveTiles(); updateFarLand(); updateHUD();
  }
  const height = Math.max(0, flight.y - groundHeight(flight.x, flight.z));
  scene.fog.density = .00034 / (1 + height / 2100);
  camera.far = Math.max(6500, height * 2.5 + 4000);
  sky.scale.setScalar(camera.far * .9);
  updateCamera(dt);
  sky.position.copy(camera.position);
  for (let i = 0; i < rotors.length; i++) rotors[i].rotation.y += dt * (i % 2 ? -43 : 43);
  renderer.render(scene, camera);
  frameCount++;
  requestAnimationFrame(frame);
}
rebuildTiles(true);
moveTiles(); updateFarLand();
camera.position.set(0, flight.y + 6, -19);
updateCamera(.016);
requestAnimationFrame(frame);
