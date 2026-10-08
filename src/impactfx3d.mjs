// Bounded, reusable arcade impact feedback. Fictional encounter effects only.
// A small procedural pool avoids textures, asset downloads and per-hit geometry allocation.
const clamp01 = v => Math.max(0, Math.min(1, v));

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

  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe9a3, transparent: true, opacity: 0, depthWrite: false
  });
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8d33, transparent: true, opacity: 0, depthWrite: false
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

  const coreGeometry = new THREE.IcosahedronGeometry(1, 2);
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.y = 3.3;
  root.add(core);
  const outer = new THREE.Mesh(coreGeometry, outerMaterial);
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
    coreMaterial.color.setHex(dust ? 0xa59a7d : 0xffe9a3);
    outerMaterial.color.setHex(dust ? 0x716b58 : 0xff8d33);
    shockMaterial.color.setHex(dust ? 0x948a74 : 0xffc46c);
    smokeMaterial.color.setHex(dust ? 0x797667 : 0x4a4841);
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
