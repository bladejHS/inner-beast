// The 3D athlete: an original, stylised boxer that plays the exercise key poses in WebGL.
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

function build(three: typeof T): Rig {
  const r = new three.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  canvas = r.domElement;
  const scene = new three.Scene();
  const cam = new three.PerspectiveCamera(32, 1.2, 0.1, 100);
  scene.add(new three.HemisphereLight(0xfff1e8, 0x301014, 1.5));
  const key = new three.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 7, 6);
  scene.add(key);
  const rim = new three.DirectionalLight(0xff2436, 2.6);
  rim.position.set(-5, 3, -5);
  scene.add(rim);
  const root = new three.Group();
  root.scale.setScalar(0.1);
  scene.add(root);
  const props = new three.Group();
  root.add(props);
  const skin = new three.MeshStandardMaterial({ color: 0xc69274, roughness: 0.48, metalness: 0.05 });
  const dark = new three.MeshStandardMaterial({ color: 0x0f0f11, roughness: 0.6 });
  const red = new three.MeshStandardMaterial({ color: 0xa8101c, roughness: 0.4 });
  const limbs: T.Mesh[] = [];
  const up = new three.Vector3(0, 1, 0);
  const dir = new three.Vector3();
  // 8 limbs: arm 0 upper/fore, arm 1 upper/fore, leg 0 thigh/shin, leg 1 thigh/shin
  for (let i = 0; i < 8; i++) {
    const [a, b] = LIMBS[i < 4 ? i % 2 : 2 + (i % 2)];
    const m = new three.Mesh(new three.CylinderGeometry(a, b, 1, 18), i === 4 || i === 6 ? dark : skin);
    root.add(m);
    limbs.push(m);
  }
  // 10 joints: shoulders, elbows, gloves, knees, feet
  const sizes = [3.2, 3.2, 2.2, 2.2, 3, 3, 2.7, 2.7, 2.2, 2.2];
  const joints = sizes.map((s, i) => {
    const m = new three.Mesh(new three.SphereGeometry(s, 18, 14), i === 4 || i === 5 ? red : i > 7 ? dark : skin);
    root.add(m);
    return m;
  });
  const torso = new three.Mesh(new three.CylinderGeometry(1, 0.72, 1, 24), skin);
  const hips = new three.Mesh(new three.SphereGeometry(1, 20, 16), dark);
  const head = new three.Mesh(new three.SphereGeometry(3.7, 24, 18), skin);
  head.add(new three.Mesh(new three.SphereGeometry(3.85, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), dark));
  root.add(torso, hips, head);
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
  const d = new three.Mesh(new three.CircleGeometry(38, 48), new three.MeshBasicMaterial({ color: 0xa8101c, transparent: true, opacity: 0.16 }));
  d.rotation.x = -Math.PI / 2;
  R.props.add(d);
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
  R.torso.scale.set(f.front ? 7.4 : 4.8, len, f.front ? 4.8 : 7.4);
  R.hips.position.copy(hip);
  R.hips.scale.set(f.front ? 5.8 : 4.6, 3.8, f.front ? 4.6 : 5.8);
  R.head.position.copy(v(head2, 0, 0));
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
  const dist = Math.max(span, 9.5 / rig.cam.aspect) / (2 * Math.tan(rad(16))) * 0.82;
  rig.root.position.set(0, -span / 2 + 0.1, 0);
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
    fig = fig3d(next.dataset.b3d ?? '', next.dataset.v);
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

export function anim3d(name: string, variation?: string): string {
  if (!fig3d(name, variation)) return '';
  return `<div class="b3d" data-b3d="${esc(name)}"${variation ? ` data-v="${esc(variation)}"` : ''} role="img" aria-label="Animație 3D"></div>`;
}
