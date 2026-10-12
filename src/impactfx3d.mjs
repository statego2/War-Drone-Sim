// Bounded, reusable arcade impact feedback. Fictional encounter effects only.
// A small procedural pool avoids textures, asset downloads and per-hit geometry allocation.
const clamp01 = v => Math.max(0, Math.min(1, v));
// Art-directed reward palette, independent of WebGL so it can be tested.
export function impactPalette(kind='vehicle'){
  return kind==='vehicle'?
    {core:0xfff3c4,outer:0xff8d36,shock:0xffc46c,smoke:0x4a4841}:
    {core:0xb6a48a,outer:0x837862,shock:0x9c917a,smoke:0x797667};
}

export function impactEnvelope(age, kind = 'vehicle') {
  const t = Math.max(0, age);
  const intensity = kind === 'vehicle' ? 1 : .38;
  return {
    active: t < .98,
    flash: intensity * Math.pow(1 - clamp01(t / .24), 1.7),
    flashSize: 2.3 + 27 * t,
    shock: intensity * .57 * Math.pow(1 - clamp01(t / .46), 1.6),
    shockSize: 2 + 30 * Math.pow(clamp01(t / .55), .8),
    sparks: intensity * Math.pow(1 - clamp01(t / .69), 1.1),
    smoke: .29 * intensity * Math.sin(clamp01(t / .98) * Math.PI),
    cameraKick: intensity * 4.5 * Math.pow(1 - clamp01(t / .32), 2)
  };
}

export function createImpactFX(THREE, parent) {
  const root = new THREE.Group();
  root.visible = false;
  parent.add(root);

  // Shared transparent radial texture eliminates the two enormous faceted
  // icosahedrons from the center of every hit. Soft, layered bloom feels
  // brighter while remaining gentle on small mobile screens.
  const glowCanvas=document.createElement('canvas');
  glowCanvas.width=glowCanvas.height=128;
  const gc=glowCanvas.getContext('2d');
  const glow=gc.createRadialGradient(64,64,0,64,64,63);
  glow.addColorStop(0,'rgba(255,255,248,1)');
  glow.addColorStop(.11,'rgba(255,245,202,.96)');
  glow.addColorStop(.32,'rgba(255,185,94,.70)');
  glow.addColorStop(.60,'rgba(235,112,48,.25)');
  glow.addColorStop(1,'rgba(220,78,35,0)');
  gc.fillStyle=glow;gc.fillRect(0,0,128,128);
  const glowTexture=new THREE.CanvasTexture(glowCanvas);
  glowTexture.colorSpace=THREE.SRGBColorSpace;
  const coreMaterial = new THREE.SpriteMaterial({
    map:glowTexture, color:0xfff3c4,transparent:true,
    opacity:0,depthWrite:false,depthTest:true,
    blending:THREE.AdditiveBlending
  });
  const outerMaterial = new THREE.SpriteMaterial({
    map:glowTexture,color:0xff8d36,transparent:true,
    opacity:0,depthWrite:false,depthTest:true,
    blending:THREE.AdditiveBlending
  });
  const shockMaterial = new THREE.MeshBasicMaterial({
    color: 0xffc46c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide
  });
  const sparkMaterial = new THREE.MeshBasicMaterial({
    color: 0xffca70, transparent: true, opacity: 0, depthWrite: false
  });
  const emberMaterial = new THREE.MeshBasicMaterial({
    color: 0xed6338, transparent: true, opacity: 0, depthWrite: false
  });
  const smokeMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a4841, transparent: true, opacity: 0, depthWrite: false
  });

  const core = new THREE.Sprite(coreMaterial);
  core.position.y = 3.3;
  root.add(core);
  const outer = new THREE.Sprite(outerMaterial);
  outer.position.y = 2.3;
  root.add(outer);

  const shock = new THREE.Mesh(new THREE.RingGeometry(.79, 1.04, 48), shockMaterial);
  shock.rotation.x = -Math.PI / 2;
  shock.position.y = .2;
  root.add(shock);

  const particleGeometry = new THREE.IcosahedronGeometry(.38, 0);
  const smokeGeometry = new THREE.IcosahedronGeometry(1, 1);
  const sparks = [];
  for (let i = 0; i < 30; i++) {
    const particle = new THREE.Mesh(particleGeometry, i % 5 === 0 ? emberMaterial : sparkMaterial);
    root.add(particle);
    sparks.push(particle);
  }
  const plumes = [];
  for (let i = 0; i < 9; i++) {
    const cloud = new THREE.Mesh(smokeGeometry, smokeMaterial);
    root.add(cloud);
    plumes.push(cloud);
  }

  let type = 'vehicle';
  function start(kind, position) {
    type = kind === 'vehicle' ? 'vehicle' : 'ground';
    root.position.set(position.x, position.y, position.z);
    const dust = type === 'ground';
    const palette=impactPalette(type);
    coreMaterial.color.setHex(palette.core);
    outerMaterial.color.setHex(palette.outer);
    shockMaterial.color.setHex(palette.shock);
    smokeMaterial.color.setHex(palette.smoke);
    root.visible = true;
    update(0);
  }
  function update(age) {
    const v = impactEnvelope(age, type), t = Math.max(0, age);
    root.visible = v.active;
    if (!v.active) return;
    coreMaterial.opacity = v.flash * .83;
    outerMaterial.opacity = v.flash * .42;
    core.scale.setScalar(v.flashSize * .52);
    outer.scale.setScalar(v.flashSize * .84);
    shockMaterial.opacity = v.shock;
    shock.scale.setScalar(v.shockSize);
    sparkMaterial.opacity = v.sparks;
    emberMaterial.opacity = v.sparks * .78;
    smokeMaterial.opacity = v.smoke;
    const growth = Math.min(t, .85);
    for (let i = 0; i < sparks.length; i++) {
      const angle = i * 2.399963229728653;
      const speed = 10 + (i % 7) * 2.8;
      const radius = growth * speed;
      const rise = (5 + (i % 6) * 2.5) * growth - 19 * growth * growth;
      const particle = sparks[i];
      particle.position.set(Math.cos(angle) * radius, Math.max(.18, 2 + rise), Math.sin(angle) * radius);
      particle.scale.setScalar(Math.max(.01, (1 - growth * 1.1) * (.65 + i % 4 * .23)));
      particle.visible = v.sparks > .005;
    }
    for (let i = 0; i < plumes.length; i++) {
      const angle = i * 2.399963229728653 + .3;
      const cloud = plumes[i];
      const dist = (2 + i % 3) * t * 4.5;
      cloud.position.set(Math.cos(angle) * dist, 2.2 + t * (5 + i % 4 * 1.7), Math.sin(angle) * dist);
      cloud.scale.setScalar(1.8 + t * (5 + i % 3 * 1.5));
      cloud.visible = v.smoke > .002;
    }
  }
  function clear() { root.visible = false; }
  return { start, update, clear };
}
