// The 3D athlete: an original masked boxer (black balaclava with white war paint, black gloves and shorts) that plays the exercise key poses in WebGL.
// One renderer for the whole app: the canvas moves to whichever .b3d host is on screen.
// three.js loads only when the first host appears. Drag to turn the athlete.

import type * as T from 'three';
import { fig3d, type Fig3 } from '../data/poses3d.ts';
import type { Pose } from '../data/poses.ts';
import { esc } from '../logic/util.ts';

const TORSO = 24, NECK = 6.5, UPPER = 12, FORE = 11, THIGH = 16, SHIN = 16, FLOOR = 78;
const rad = (d: number): number => (d * Math.PI) / 180;
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
type P2 = [number, number];
const step = (o: P2, a: number, l: number): P2 => [o[0] + Math.sin(rad(a)) * l, o[1] + Math.cos(rad(a)) * l];

function mixPose(a: Pose, b: Pose, t: number): Pose {
  const m = (x: number, y: number): number => lerp(x, y, t);
  const pair = (x: [number, number], y: [number, number]): [number, number] => [m(x[0], y[0]), m(x[1], y[1])];
  return {
    p: pair(a.p, b.p), t: m(a.t, b.t), tl: m(a.tl ?? 1, b.tl ?? 1), h: m(a.h ?? a.t, b.h ?? b.t),
    a: [pair(a.a[0], b.a[0]), pair(a.a[1], b.a[1])], l: [pair(a.l[0], b.l[0]), pair(a.l[1], b.l[1])],
  };
}

interface Rig {
  three: typeof T;
  r: T.WebGLRenderer;
  scene: T.Scene;
  cam: T.PerspectiveCamera;
  root: T.Group;
  props: T.Group;
  limb(i: number, a: T.Vector3, b: T.Vector3): void;
  joint(i: number, a: T.Vector3): void;
  torso: T.Mesh;
  head: T.Mesh;
  hips: T.Mesh;
}

// radius at each end: upper arm, forearm, thigh, shin
const LIMBS: Array<[number, number]> = [[2.6, 2.1], [2.1, 1.7], [3.4, 2.5], [2.6, 1.7]];
let rig: Rig | null = null;
let loading = false;
let failed = false;
let canvas: HTMLCanvasElement | null = null;
let host: HTMLElement | null = null;
let fig: Fig3 | undefined;
let figKey = '';
let t0 = 0;
let sway = 0;
let dragYaw = 0;
let raf = 0;
let gym: T.Group | null = null;

/** The balaclava: black wool, an original white paint with drips, two eye holes. Centred on the +z side. */
function maskTexture(three: typeof T): T.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0b0b0d';
  g.fillRect(0, 0, 1024, 512);
  const x = 256; // u = .25 is +z on a three.js sphere
  g.fillStyle = '#e9e6df';
  g.beginPath();
  g.ellipse(x, 215, 74, 92, 0, 0, Math.PI * 2);
  g.fill();
  for (const [dx, len] of [[-58, 86], [-34, 120], [-10, 96], [14, 132], [38, 100], [60, 78]]) g.fillRect(x + dx, 240, 12, len);
  g.fillStyle = '#0b0b0d';
  g.fillRect(x - 7, 225, 14, 80); // nose line
  for (const s of [-1, 1]) {
    g.fillStyle = '#0b0b0d';
    g.beginPath();
    g.ellipse(x + s * 38, 212, 28, 20, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#c69274';
    g.beginPath();
    g.ellipse(x + s * 38, 212, 21, 13, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#17110f';
    g.beginPath();
    g.arc(x + s * 38, 212, 7, 0, Math.PI * 2);
    g.fill();
  }
  const t = new three.CanvasTexture(c);
  t.colorSpace = three.SRGBColorSpace;
  return t;
}

/** Skin with soft pectoral and abdominal shading, repeated so chest shows from both sides. */
function bodyTexture(three: typeof T): T.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#b98465';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(70,35,20,.55)';
  g.lineWidth = 9;
  g.lineCap = 'round';
  const line = (a: number, b: number, d: number, e: number): void => {
    g.beginPath();
    g.moveTo(a, b);
    g.lineTo(d, e);
    g.stroke();
  };
  line(256, 30, 256, 480);
  g.beginPath();
  g.ellipse(180, 120, 76, 58, 0, 0.1, Math.PI * 0.9);
  g.ellipse(332, 120, 76, 58, 0, 0.1, Math.PI * 0.9);
  g.stroke();
  for (const y of [235, 305, 375]) line(190, y, 322, y);
  const t = new three.CanvasTexture(c);
  t.colorSpace = three.SRGBColorSpace;
  t.wrapS = three.RepeatWrapping;
  t.repeat.set(2, 1);
  t.offset.x = 0.5;
  return t;
}

/** Rough dark brick for the back wall. */
function brickTexture(three: typeof T): T.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = '#0a0808';
  g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 16; y++) {
    for (let x = -1; x < 8; x++) {
      const v = 22 + ((x * 7 + y * 13) % 5) * 5;
      g.fillStyle = `rgb(${v + 10},${v - 4},${v - 6})`;
      g.fillRect(x * 74 + (y % 2) * 37, y * 32, 70, 28);
    }
  }
  const t = new three.CanvasTexture(c);
  t.colorSpace = three.SRGBColorSpace;
  t.wrapS = t.wrapT = three.RepeatWrapping;
  t.repeat.set(4, 2);
  return t;
}

/** The dark boxing gym: concrete floor, brick wall, hanging heavy bags, ring ropes, a blue window glow. */
function buildGym(three: typeof T): T.Group {
  const gym = new three.Group();
  const floor = new three.Mesh(new three.PlaneGeometry(40, 30), new three.MeshStandardMaterial({ color: 0x1b1716, roughness: 0.85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  const wall = new three.Mesh(new three.PlaneGeometry(40, 14), new three.MeshStandardMaterial({ map: brickTexture(three), roughness: 0.95 }));
  wall.position.set(0, 7, -7);
  const glow = new three.Mesh(new three.PlaneGeometry(3.2, 1.8), new three.MeshBasicMaterial({ color: 0x24506e }));
  glow.position.set(3.4, 5, -6.95);
  gym.add(floor, wall, glow);
  const leather = new three.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.3 });
  const chain = new three.MeshStandardMaterial({ color: 0x55504c, roughness: 0.4, metalness: 0.8 });
  for (const [x, z] of [[-4.6, -3.6], [4.8, -4.4], [-1.6, -5.4]]) {
    const bag = new three.Mesh(new three.CapsuleGeometry(0.72, 2.6, 8, 20), leather);
    bag.position.set(x, 3.6, z);
    bag.castShadow = true;
    const link = new three.Mesh(new three.CylinderGeometry(0.03, 0.03, 6, 6), chain);
    link.position.set(x, 8.2, z);
    gym.add(bag, link);
  }
  const rope = new three.MeshStandardMaterial({ color: 0x5c0c12, roughness: 0.6 });
  for (const y of [1.1, 1.9, 2.7]) {
    const q = new three.Mesh(new three.CylinderGeometry(0.05, 0.05, 30, 8), rope);
    q.rotation.z = Math.PI / 2;
    q.position.set(0, y, -2.6);
    gym.add(q);
  }
  return gym;
}

/** A limb with a muscle belly, not a plain cylinder. Radius a at the top, b at the bottom. */
function limbGeo(three: typeof T, a: number, b: number): T.LatheGeometry {
  const pts: T.Vector2[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    pts.push(new three.Vector2(lerp(b, a, t) * (1 + 0.2 * Math.sin(Math.PI * t ** 1.5)), t - 0.5));
  }
  return new three.LatheGeometry(pts, 22);
}

/** Waist to shoulders. */
function torsoGeo(three: typeof T): T.LatheGeometry {
  const prof: Array<[number, number]> = [[0, 0.68], [0.25, 0.64], [0.5, 0.72], [0.75, 0.94], [0.92, 1], [1, 0.72]];
  return new three.LatheGeometry(prof.map(([y, x]) => new three.Vector2(x, y - 0.5)), 32);
}

function build(three: typeof T): Rig {
  const r = new three.WebGLRenderer({ antialias: true });
  r.toneMapping = three.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.15;
  r.shadowMap.enabled = true;
  r.shadowMap.type = three.PCFSoftShadowMap;
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  canvas = r.domElement;
  const scene = new three.Scene();
  scene.background = new three.Color(0x050405);
  scene.fog = new three.Fog(0x050405, 11, 26);
  gym = buildGym(three);
  scene.add(gym);
  const cam = new three.PerspectiveCamera(32, 1.2, 0.1, 100);
  scene.add(new three.HemisphereLight(0x8a93a6, 0x140a08, 0.85));
  const key = new three.SpotLight(0xffe6cc, 190, 22, 0.5, 0.65, 1.6);
  key.position.set(1.5, 9.5, 3.5);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0006;
  scene.add(key, key.target);
  const rim = new three.DirectionalLight(0x5f93c4, 0.55);
  rim.position.set(5, 3, -6);
  scene.add(rim);
  const root = new three.Group();
  root.scale.setScalar(0.1);
  scene.add(root);
  const props = new three.Group();
  root.add(props);
  const skin = new three.MeshPhysicalMaterial({ color: 0xb98465, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.5, side: three.DoubleSide });
  const dark = new three.MeshStandardMaterial({ color: 0x0f0f11, roughness: 0.6 });
  const glove = new three.MeshStandardMaterial({ color: 0x08080a, roughness: 0.22, metalness: 0.2 });
  const limbs: T.Mesh[] = [];
  const up = new three.Vector3(0, 1, 0);
  const dir = new three.Vector3();
  // 8 limbs: arm 0 upper/fore, arm 1 upper/fore, leg 0 thigh/shin, leg 1 thigh/shin
  for (let i = 0; i < 8; i++) {
    const [a, b] = LIMBS[i < 4 ? i % 2 : 2 + (i % 2)];
    const m = new three.Mesh(limbGeo(three, a, b), skin);
    if (i === 4 || i === 6) {
      const shorts = new three.Mesh(new three.CylinderGeometry(a * 1.2, a * 1.3, 0.62, 18), dark);
      shorts.position.y = 0.2;
      m.add(shorts);
    }
    root.add(m);
    limbs.push(m);
  }
  // 10 joints: shoulders, elbows, gloves, knees, feet
  const sizes = [3.1, 3.1, 2.2, 2.2, 3.5, 3.5, 2.7, 2.7, 2.2, 2.2];
  const joints = sizes.map((s, i) => {
    const m = new three.Mesh(new three.SphereGeometry(s, 18, 14), i === 4 || i === 5 ? glove : i > 7 ? dark : skin);
    root.add(m);
    return m;
  });
  const torso = new three.Mesh(torsoGeo(three), new three.MeshPhysicalMaterial({ map: bodyTexture(three), roughness: 0.42, clearcoat: 0.25, side: three.DoubleSide }));
  const hips = new three.Mesh(new three.SphereGeometry(1, 20, 16), dark);
  const head = new three.Mesh(new three.SphereGeometry(3.7, 32, 22), new three.MeshStandardMaterial({ map: maskTexture(three), roughness: 0.9 }));
  const collar = new three.Mesh(new three.CylinderGeometry(2.6, 3.6, 4.5, 20), dark);
  collar.position.y = -3.6;
  head.add(collar);
  root.add(torso, hips, head);
  root.traverse((o) => {
    o.castShadow = true;
  });
  return {
    three, r, scene, cam, root, props, torso, head, hips,
    limb(i, a, b) {
      const m = limbs[i];
      m.position.copy(a).add(b).multiplyScalar(0.5);
      dir.copy(a).sub(b);
      m.scale.set(1, dir.length(), 1);
      m.quaternion.setFromUnitVectors(up, dir.normalize());
    },
    joint(i, a) {
      joints[i].position.copy(a);
    },
  };
}

/** Floor, bar, wall and bench for the current exercise. */
function setProps(f: Fig3): void {
  const R = rig as Rig;
  const three = R.three;
  R.props.clear();
  const mat = new three.MeshStandardMaterial({ color: 0x3a2a2c, roughness: 0.7 });
  const steel = new three.MeshStandardMaterial({ color: 0xb9b6b0, roughness: 0.3, metalness: 0.8 });
  if (f.bar !== undefined) {
    const b = new three.Mesh(new three.CylinderGeometry(0.8, 0.8, 34, 12), steel);
    if (f.front) b.rotation.z = Math.PI / 2;
    else b.rotation.x = Math.PI / 2;
    b.position.set(0, FLOOR - f.bar, 0);
    R.props.add(b);
  }
  if (f.wall !== undefined) {
    const w = new three.Mesh(new three.BoxGeometry(2, 90, 40), mat);
    w.position.set(f.wall - 50, 45, 0);
    R.props.add(w);
  }
  if (f.box) {
    const [x, hw, top] = f.box;
    const b = new three.Mesh(new three.BoxGeometry(hw * 2, FLOOR - top, 16), mat);
    b.position.set(x - 50, (FLOOR - top) / 2, 0);
    R.props.add(b);
  }
}

function pose(p: Pose, f: Fig3): void {
  const R = rig as Rig;
  const V = R.three.Vector3;
  const v = (q: P2, x: number, z: number): T.Vector3 => new V(q[0] - 50 + x, FLOOR - q[1], z);
  const neck2 = step(p.p, p.t, TORSO * (p.tl ?? 1));
  const head2 = step(neck2, p.h ?? p.t, NECK);
  const sA = f.front && p.a[0][0] < p.a[1][0] ? -1 : 1;
  const sL = f.front && p.l[0][0] < p.l[1][0] ? -1 : 1;
  const off = (i: number, w: number, s: number): [number, number] => {
    const d = (i ? -1 : 1) * s * w;
    return f.front ? [d, 0] : [0, d];
  };
  for (const i of [0, 1]) {
    const [ax, az] = off(i, 6.2, sA);
    const e = step(neck2, p.a[i][0], UPPER);
    const w = step(e, p.a[i][1], FORE);
    const s3 = v(neck2, ax, az), e3 = v(e, ax, az), w3 = v(w, ax, az);
    R.limb(i * 2, s3, e3);
    R.limb(i * 2 + 1, e3, w3);
    R.joint(i, s3);
    R.joint(2 + i, e3);
    R.joint(4 + i, w3);
    const [lx, lz] = off(i, 3, sL);
    const k = step(p.p, p.l[i][0], THIGH);
    const a = step(k, p.l[i][1], SHIN);
    const h3 = v(p.p, lx, lz), k3 = v(k, lx, lz), a3 = v(a, lx, lz);
    R.limb(4 + i * 2, h3, k3);
    R.limb(5 + i * 2, k3, a3);
    R.joint(6 + i, k3);
    R.joint(8 + i, a3);
  }
  const hip = v(p.p, 0, 0), neck = v(neck2, 0, 0);
  const dir = neck.clone().sub(hip);
  const len = dir.length();
  R.torso.position.copy(hip).add(neck).multiplyScalar(0.5);
  R.torso.quaternion.setFromUnitVectors(new V(0, 1, 0), dir.normalize());
  R.torso.rotateY(f.front ? 0 : Math.PI / 2);
  R.torso.scale.set(8.2, len, 5);
  R.hips.position.copy(hip);
  R.hips.scale.set(f.front ? 5.8 : 4.6, 3.8, f.front ? 4.6 : 5.8);
  R.head.position.copy(v(head2, 0, 0));
  R.head.rotation.y = f.front ? 0 : p.t < 0 ? -Math.PI / 2 : Math.PI / 2;
}

function frame(now: number): void {
  raf = 0;
  if (!rig || !fig || !host?.isConnected) return;
  raf = requestAnimationFrame(frame);
  if (document.hidden) return;
  const k = fig.k;
  const pos = ((now - t0) / 1000 / (fig.slow ? 1.7 : 0.8)) % k.length;
  const i = Math.floor(pos);
  const u = Math.min(1, (pos - i) / 0.72); // the rest of the segment holds the pose
  pose(mixPose(k[i], k[(i + 1) % k.length], u * u * (3 - 2 * u)), fig);
  sway += 0.012;
  rig.root.rotation.y = (fig.front ? 0 : -0.45) + Math.sin(sway) * 0.3 + dragYaw;
  rig.r.render(rig.scene, rig.cam);
}

function fit(): void {
  if (!rig || !host || !fig) return;
  const w = host.clientWidth, h = host.clientHeight;
  rig.r.setSize(w, h);
  rig.cam.aspect = w / h;
  rig.cam.updateProjectionMatrix();
  const span = fig.bar !== undefined && fig.bar < 20 ? 8.6 : 7.4;
  const dist = Math.max(span, 9.5 / rig.cam.aspect) / (2 * Math.tan(rad(16))) * 1.02;
  rig.root.position.set(0, -span / 2 - 0.25, 0);
  if (gym) gym.position.y = rig.root.position.y;
  rig.cam.position.set(0, 0.7, dist);
  rig.cam.lookAt(0, 0, 0);
}

/** Picks the visible host and moves the canvas there. */
function sync(): void {
  const list = [...document.querySelectorAll<HTMLElement>('.b3d')].filter((h) => h.offsetWidth > 0);
  const next = list[list.length - 1] ?? null;
  if (!next) {
    host = null;
    return;
  }
  if (failed) {
    next.hidden = true;
    return;
  }
  if (!rig) {
    if (loading) return;
    loading = true;
    import('three')
      .then((three) => {
        rig = build(three);
        loading = false;
        sync();
      })
      .catch(() => {
        failed = true;
        loading = false;
        sync();
      });
    return;
  }
  const key = `${next.dataset.b3d}|${next.dataset.v ?? ''}`;
  if (next === host && key === figKey && canvas?.parentElement === next) return;
  host = next;
  next.appendChild(canvas as HTMLCanvasElement);
  if (key !== figKey || !fig) {
    figKey = key;
    fig = fig3d(next.dataset.b3d ?? '');
    t0 = performance.now();
    if (fig) setProps(fig);
  }
  fit();
  if (!raf) raf = requestAnimationFrame(frame);
}

export function initBeast3d(): void {
  try {
    if (!document.createElement('canvas').getContext('webgl2')) failed = true;
  } catch {
    failed = true;
  }
  let q = 0;
  const later = (): void => {
    cancelAnimationFrame(q);
    q = requestAnimationFrame(sync);
  };
  new MutationObserver((list) => {
    // the canvas moving between hosts must not retrigger the scan
    if (list.every((m) => [...m.addedNodes, ...m.removedNodes].every((n) => n === canvas))) return;
    later();
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('toggle', later, true);
  window.addEventListener('resize', later);
  let down: number | null = null;
  document.addEventListener('pointerdown', (e) => {
    if (e.target === canvas) down = e.clientX;
  });
  document.addEventListener('pointermove', (e) => {
    if (down === null) return;
    dragYaw += (e.clientX - down) * 0.012;
    down = e.clientX;
  });
  document.addEventListener('pointerup', () => (down = null));
  later();
}

export function anim3d(name: string): string {
  if (!fig3d(name)) return '';
  return `<div class="b3d" data-b3d="${esc(name)}" role="img" aria-label="Animație 3D"></div>`;
}
