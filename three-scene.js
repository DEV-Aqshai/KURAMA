import * as THREE from "three";

/* ============================================
   KURAMA — hero signature scene
   An abstract cluster of orbiting geometric shapes in the
   brand palette. Drag to spin the whole cluster, otherwise
   it drifts and tumbles on its own.
   ============================================ */

const mount = document.getElementById("hero3d");
if (mount) {
  const COLORS = {
    raspberry: 0xbf2b54,
    raspberryDeep: 0x8f1f3f,
    grapefruit: 0xda6c81,
    vanilla: 0xf5e9d0,
    ink: 0x2b1219,
  };
  const PALETTE = [COLORS.raspberry, COLORS.grapefruit, COLORS.vanilla, COLORS.raspberryDeep];

  let width = mount.clientWidth;
  let height = mount.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 6.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  // ---- lights ----
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3, 4, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(COLORS.grapefruit, 1.2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const fill = new THREE.PointLight(COLORS.vanilla, 0.7, 14);
  fill.position.set(0, -3, 3);
  scene.add(fill);

  // ---- root group everything orbits in ----
  const cluster = new THREE.Group();
  scene.add(cluster);

  // ---- centerpiece: a knotted ring, the "signature" shape ----
  const knotGeo = new THREE.TorusKnotGeometry(0.85, 0.24, 180, 24, 2, 3);
  const knotMat = new THREE.MeshStandardMaterial({
    color: COLORS.raspberry,
    roughness: 0.3,
    metalness: 0.25,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  cluster.add(knot);

  // wireframe twin, slightly larger, for depth
  const knotWireGeo = new THREE.TorusKnotGeometry(0.9, 0.27, 90, 12, 2, 3);
  const knotWireMat = new THREE.MeshBasicMaterial({
    color: COLORS.vanilla,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const knotWire = new THREE.Mesh(knotWireGeo, knotWireMat);
  cluster.add(knotWire);

  // ---- orbiting satellite shapes ----
  const shapeFactories = [
    () => new THREE.IcosahedronGeometry(0.34, 0),
    () => new THREE.OctahedronGeometry(0.32, 0),
    () => new THREE.TetrahedronGeometry(0.36, 0),
    () => new THREE.TorusGeometry(0.28, 0.1, 12, 32),
    () => new THREE.DodecahedronGeometry(0.3, 0),
    () => new THREE.BoxGeometry(0.42, 0.42, 0.42),
  ];

  const satellites = [];
  const SAT_COUNT = 9;

  for (let i = 0; i < SAT_COUNT; i++) {
    const geo = shapeFactories[i % shapeFactories.length]();
    const wire = Math.random() > 0.7;
    const mat = wire
      ? new THREE.MeshBasicMaterial({
          color: PALETTE[i % PALETTE.length],
          wireframe: true,
        })
      : new THREE.MeshStandardMaterial({
          color: PALETTE[i % PALETTE.length],
          roughness: 0.4,
          metalness: 0.1,
        });
    const mesh = new THREE.Mesh(geo, mat);

    const radius = 1.7 + Math.random() * 1.15;
    const theta = (i / SAT_COUNT) * Math.PI * 2 + Math.random() * 0.6;
    const phi = Math.acos(1 - 2 * ((i + 0.5) / SAT_COUNT));

    mesh.userData = {
      radius,
      theta,
      phi,
      speed: 0.15 + Math.random() * 0.35,
      spinSpeed: (Math.random() - 0.5) * 1.6,
      bobAmp: 0.15 + Math.random() * 0.2,
      bobSpeed: 0.6 + Math.random() * 0.8,
      bobOffset: Math.random() * Math.PI * 2,
    };

    cluster.add(mesh);
    satellites.push(mesh);
  }

  // faint particle dust for atmosphere
  const dustCount = 120;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2.6 + Math.random() * 2.4;
    const t = Math.random() * Math.PI * 2;
    const p = Math.random() * Math.PI;
    dustPositions[i * 3] = r * Math.sin(p) * Math.cos(t);
    dustPositions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    dustPositions[i * 3 + 2] = r * Math.cos(p);
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: COLORS.vanilla,
    size: 0.035,
    transparent: true,
    opacity: 0.5,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  cluster.rotation.y = -0.5;
  cluster.rotation.x = 0.1;

  // ---- interaction: drag to rotate cluster, idle spin otherwise ----
  let dragging = false;
  let prevX = 0;
  let prevY = 0;
  let velocityX = 0.002;
  let velocityY = 0.0032;

  const dot = document.getElementById("cursorDot");

  const onDown = (e) => {
    dragging = true;
    prevX = e.touches ? e.touches[0].clientX : e.clientX;
    prevY = e.touches ? e.touches[0].clientY : e.clientY;
    if (dot) dot.classList.add("is-active");
  };
  const onMove = (e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = x - prevX;
    const dy = y - prevY;
    velocityY = dx * 0.006;
    velocityX = dy * 0.004;
    cluster.rotation.y += velocityY;
    cluster.rotation.x = THREE.MathUtils.clamp(cluster.rotation.x + velocityX, -0.8, 0.8);
    prevX = x;
    prevY = y;
  };
  const onUp = () => {
    dragging = false;
    if (dot) dot.classList.remove("is-active");
  };

  mount.style.cursor = "grab";
  mount.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  mount.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("touchend", onUp);

  // ---- resize ----
  const ro = new ResizeObserver(() => {
    width = mount.clientWidth;
    height = mount.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  ro.observe(mount);

  // ---- render loop ----
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();

    // centerpiece knot: constant self-rotation, independent of drag
    knot.rotation.x = t * 0.28;
    knot.rotation.y = t * 0.4;
    knotWire.rotation.x = -t * 0.18;
    knotWire.rotation.y = -t * 0.26;

    // satellites orbit the centerpiece + bob + self-spin
    satellites.forEach((mesh) => {
      const d = mesh.userData;
      const angle = t * d.speed + d.theta;
      mesh.position.set(
        d.radius * Math.sin(d.phi) * Math.cos(angle),
        d.radius * Math.cos(d.phi) + Math.sin(t * d.bobSpeed + d.bobOffset) * d.bobAmp,
        d.radius * Math.sin(d.phi) * Math.sin(angle)
      );
      mesh.rotation.x += 0.006 * d.spinSpeed;
      mesh.rotation.y += 0.008 * d.spinSpeed;
    });

    dust.rotation.y = t * 0.015;

    if (!dragging) {
      velocityY = THREE.MathUtils.lerp(velocityY, 0.0032, 0.02);
      cluster.rotation.y += velocityY;
      cluster.position.y = Math.sin(t * 0.9) * 0.08;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}