// The live timer's arena (2026-11-15, the user: "fă Inner Beast și mai spectaculoasă"). Behind the clock, on one
// canvas inside the player:
// - a fuse that burns around the edge of the screen as the phase runs out, with a spark at its head;
// - embers that rise from the floor, faster and thicker in the last ten seconds and in each punch-out burst;
// - a heartbeat at the edges in the last ten seconds.
// The player only reports the phase every tick (feed). Off with reduced motion or "Reduse" in Settings.

import { lite } from './fx.ts';

export type FxKind = 'work' | 'last' | 'burst' | 'easy' | 'rest' | 'prep';

interface State { kind: FxKind; left: number; total: number; at: number; running: boolean }

let st: State | null = null;
let raf = 0;
let cv: HTMLCanvasElement | null = null;
let x: CanvasRenderingContext2D | null = null;
let W = 0, H = 0, dpr = 1;
let last = 0;

interface Ember { x: number; y: number; vy: number; vx: number; r: number; life: number; age: number; hue: number }
const embers: Ember[] = [];
interface Spark { x: number; y: number; vx: number; vy: number; age: number; life: number }
const sparks: Spark[] = [];

/** Called by the player on every tick; null stops the arena. */
export function feed(s: { kind: FxKind; left: number; total: number; running: boolean } | null): void {
  if (!s || lite()) {
    st = null;
    return;
  }
  st = { ...s, at: performance.now() };
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

function canvas(): boolean {
  const el = document.querySelector<HTMLCanvasElement>('.pl-fx');
  if (!el) return false;
  if (el !== cv || el.width !== Math.round(el.clientWidth * dpr) || el.height !== Math.round(el.clientHeight * dpr)) {
    cv = el;
    dpr = Math.min(2, devicePixelRatio || 1);
    W = el.width = Math.round(el.clientWidth * dpr);
    H = el.height = Math.round(el.clientHeight * dpr);
    x = el.getContext('2d');
  }
  return !!x;
}

const DENSITY: Record<FxKind, number> = { work: 34, last: 90, burst: 110, easy: 14, rest: 16, prep: 10 };
const SPEED: Record<FxKind, number> = { work: 1, last: 1.9, burst: 2.3, easy: 0.55, rest: 0.45, prep: 0.5 };

/** A point at distance d (0–1) along the screen edge, clockwise from the top centre, round at the corners like the
 *  phone's screen (radius r). */
function edge(d: number, inset: number, r: number): [number, number] {
  const L = W - inset * 2 - r * 2, M = H - inset * 2 - r * 2, q = (Math.PI * r) / 2;
  const P = 2 * (L + M) + 4 * q;
  let s = ((((d % 1) + 1) % 1) * P + L / 2 + q) % P; // from the top-left corner's end, plus half the top: top centre
  const x0 = inset, y0 = inset, x1 = W - inset, y1 = H - inset;
  const arc = (cx: number, cy: number, a0: number, f: number): [number, number] => [cx + Math.cos(a0 + f * Math.PI / 2) * r, cy + Math.sin(a0 + f * Math.PI / 2) * r];
  // top-left arc, top, top-right arc, right, bottom-right arc, bottom, bottom-left arc, left
  if (s < q) return arc(x0 + r, y0 + r, Math.PI, s / q);
  s -= q;
  if (s < L) return [x0 + r + s, y0];
  s -= L;
  if (s < q) return arc(x1 - r, y0 + r, -Math.PI / 2, s / q);
  s -= q;
  if (s < M) return [x1, y0 + r + s];
  s -= M;
  if (s < q) return arc(x1 - r, y1 - r, 0, s / q);
  s -= q;
  if (s < L) return [x1 - r - s, y1];
  s -= L;
  if (s < q) return arc(x0 + r, y1 - r, Math.PI / 2, s / q);
  s -= q;
  return [x0, y1 - r - Math.min(s, M)];
}

function frame(now: number): void {
  raf = 0;
  if (!st || !canvas()) {
    if (x) x.clearRect(0, 0, W, H);
    embers.length = 0;
    sparks.length = 0;
    return;
  }
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const s = st;
  const left = Math.max(0, s.running ? s.left - (now - s.at) / 1000 : s.left);
  const frac = s.total > 0 ? Math.min(1, left / s.total) : 0;
  const k = s.kind;
  const hot = k === 'last' || k === 'burst';
  const calm = k === 'rest' || k === 'prep' || k === 'easy';
  // on the bright red screens the light reads dark; on the dark ones, fire
  const ink = hot ? '20, 4, 8' : '255, 236, 214';
  const fire = hot ? '25, 5, 10' : calm ? '255, 212, 59' : '255, 214, 110';
  const c = x!;
  c.clearRect(0, 0, W, H);

  // heartbeat: the edges pulse once a second in the last ten seconds
  if (k === 'last' && s.running) {
    const beat = Math.pow(Math.max(0, Math.sin(((now / 1000) % 1) * Math.PI)), 6);
    const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${(0.08 + beat * 0.32).toFixed(3)})`);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }

  // embers
  if (s.running) {
    const want = DENSITY[k];
    const rate = want / 2.4;
    let n = rate * dt;
    while (n > 0 && embers.length < want * 1.4) {
      if (n < 1 && Math.random() > n) break;
      n -= 1;
      embers.push({ x: Math.random() * W, y: H + 10 * dpr, vy: -(40 + Math.random() * 90) * dpr * SPEED[k], vx: (Math.random() - 0.5) * 30 * dpr, r: (1.1 + Math.random() * 2.6) * dpr, life: 1.8 + Math.random() * 2.4, age: 0, hue: Math.random() });
    }
  }
  c.globalCompositeOperation = hot ? 'source-over' : 'lighter';
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i]!;
    e.age += dt;
    if (e.age >= e.life) { embers.splice(i, 1); continue; }
    e.x += (e.vx + Math.sin((e.age + e.hue * 6) * 3) * 14 * dpr) * dt;
    e.y += e.vy * dt;
    const a = Math.sin((e.age / e.life) * Math.PI) * (calm ? 0.5 : 0.95);
    c.fillStyle = hot ? `rgba(${fire}, ${(a * 0.55).toFixed(3)})` : e.hue > 0.7 ? `rgba(255,255,255,${(a * 0.7).toFixed(3)})` : `rgba(${fire}, ${a.toFixed(3)})`;
    c.beginPath();
    c.arc(e.x, e.y, e.r, 0, 6.2832);
    c.fill();
  }

  // the fuse around the screen
  if (s.total >= 8 && k !== 'prep') {
    const inset = 5 * dpr, lw = (hot ? 5 : 3.5) * dpr, rad = 40 * dpr;
    const steps = 220;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    // the burnt track, faint
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = `rgba(${ink}, 0.10)`;
    c.lineWidth = lw;
    c.beginPath();
    c.roundRect(inset, inset, W - inset * 2, H - inset * 2, rad);
    c.stroke();
    if (frac > 0.001) {
      c.strokeStyle = calm && k !== 'easy' ? 'rgba(187, 213, 247, .95)' : `rgba(${ink}, ${hot ? 0.85 : 0.9})`;
      c.shadowColor = hot ? 'rgba(0,0,0,0)' : calm ? 'rgba(174,204,245,.9)' : 'rgba(166,200,244,.95)';
      c.shadowBlur = hot ? 0 : 14 * dpr;
      c.beginPath();
      const n = Math.max(2, Math.ceil(steps * frac));
      for (let i = 0; i <= n; i++) {
        const [px, py] = edge((i / n) * frac, inset, rad);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      c.shadowBlur = 0;
      // the burning head
      const [hx, hy] = edge(frac, inset, rad);
      if (s.running) {
        for (let i = 0; i < (hot ? 3 : 2); i++) {
          const a = Math.random() * Math.PI * 2, v = (60 + Math.random() * 160) * dpr;
          sparks.push({ x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: 0.25 + Math.random() * 0.35 });
        }
      }
      c.globalCompositeOperation = hot ? 'source-over' : 'lighter';
      const g = c.createRadialGradient(hx, hy, 0, hx, hy, 16 * dpr);
      g.addColorStop(0, hot ? 'rgba(20,4,8,.9)' : 'rgba(255,255,255,1)');
      g.addColorStop(0.35, hot ? 'rgba(20,4,8,.5)' : 'rgba(176,206,245,.8)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(hx, hy, 16 * dpr, 0, 6.2832);
      c.fill();
    }
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i]!;
    p.age += dt;
    if (p.age >= p.life) { sparks.splice(i, 1); continue; }
    p.vy += 500 * dpr * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    c.fillStyle = hot ? `rgba(20,4,8,${(1 - p.age / p.life).toFixed(3)})` : `rgba(${200 - Math.round(p.age / p.life * 80)},${220 - Math.round(p.age / p.life * 60)},255,${(1 - p.age / p.life).toFixed(3)})`;
    c.fillRect(p.x, p.y, 1.6 * dpr, 1.6 * dpr);
  }
  c.globalCompositeOperation = 'source-over';
  raf = requestAnimationFrame(frame);
}
