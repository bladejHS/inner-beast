// Ink figures that show how a mobility move is done: key poses, looped (SVG SMIL), with a hold on every pose.
// To make the move readable at a glance: the end pose is drawn faintly behind (where you are going),
// and a pulsing spot marks where you should feel the stretch.
// Angles are in degrees: 0 = straight down, 90 = to the right, 180 = straight up, -90 = to the left.
// Side-view figures face right; the far arm and leg are drawn fainter.

import { POSES, ZONES, ZONE_NAMES, type Fig, type Pose, type Zone } from '../data/poses.ts';

const TORSO = 24;
const NECK = 6.5;
const HEAD = 5.2;
const UPPER_ARM = 12;
const FOREARM = 11;
const THIGH = 16;
const SHIN = 16;
const FLOOR = 78;

type Pt = [number, number];

const rad = (d: number): number => (d * Math.PI) / 180;
const step = (from: Pt, angle: number, len: number): Pt => [from[0] + Math.sin(rad(angle)) * len, from[1] + Math.cos(rad(angle)) * len];
const f = (n: number): string => n.toFixed(1);
const mix = (a: Pt, b: Pt, t = 0.5): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

interface Joints {
  torso: string;
  head: Pt;
  arms: [string, string];
  legs: [string, string];
  stick: string;
  /** Points used to place the "feel it here" spot. */
  pts: Record<'pelvis' | 'neck' | 'knee0' | 'knee1' | 'foot0' | 'foot1' | 'elbow0' | 'hand0', Pt>;
  all: Pt[];
}

function joints(p: Pose): Joints {
  const pelvis = p.p;
  const neck = step(pelvis, p.t, TORSO * (p.tl ?? 1));
  const mid = mix(pelvis, neck);
  const ctrl = step(mid, p.t + 90, p.c ?? 0);
  const head = step(neck, p.h ?? p.t, NECK * (p.tl !== undefined && p.tl < 0.8 ? 0.7 : 1));
  const limb = (from: Pt, [a, b]: [number, number], l1: number, l2: number): [Pt, Pt] => {
    const m2 = step(from, a, l1);
    return [m2, step(m2, b, l2)];
  };
  const [e0, w0] = limb(neck, p.a[0], UPPER_ARM, FOREARM);
  const [e1, w1] = limb(neck, p.a[1], UPPER_ARM, FOREARM);
  const [k0, f0] = limb(pelvis, p.l[0], THIGH, SHIN);
  const [k1, f1] = limb(pelvis, p.l[1], THIGH, SHIN);
  const line = (a: Pt, b: Pt, c: Pt) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(c[0])} ${f(c[1])}`;
  return {
    torso: `M${f(pelvis[0])} ${f(pelvis[1])}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(neck[0])} ${f(neck[1])}`,
    head,
    arms: [line(neck, e0, w0), line(neck, e1, w1)],
    legs: [line(pelvis, k0, f0), line(pelvis, k1, f1)],
    stick: `M${f(w0[0])} ${f(w0[1])}L${f(w1[0])} ${f(w1[1])}`,
    pts: { pelvis, neck, knee0: k0, knee1: k1, foot0: f0, foot1: f1, elbow0: e0, hand0: w0 },
    all: [pelvis, neck, ctrl, head, e0, w0, e1, w1, k0, f0, k1, f1],
  };
}

function zonePt(z: Zone, j: Joints): Pt {
  const P = j.pts;
  switch (z) {
    case 'hips':
      return P.pelvis;
    case 'groin':
      return mix(P.pelvis, mix(P.knee0, P.knee1), 0.35);
    case 'hamstrings':
      return mix(P.pelvis, P.knee0, 0.55);
    case 'quads':
      return mix(P.pelvis, P.knee1, 0.55);
    case 'calves':
      return mix(P.knee1, P.foot1, 0.5);
    case 'back':
      return mix(P.pelvis, P.neck, 0.55);
    case 'chest':
      return mix(P.pelvis, P.neck, 0.85);
    case 'shoulders':
      return mix(P.neck, P.elbow0, 0.35);
    case 'arms':
      return mix(P.elbow0, P.hand0, 0.2);
    case 'neck':
      return mix(P.neck, j.head, 0.45);
    case 'wrists':
      return P.hand0;
    case 'body':
      return mix(P.pelvis, P.neck, 0.5);
  }
}

/** Ping-pong through the key poses, holding each one. Returns values and keyTimes. */
function timeline<T>(xs: T[], hold: number, move: number): { vals: T[]; times: number[]; dur: number } {
  const seq = xs.length < 2 ? xs : [...xs, ...xs.slice(1, -1).reverse(), xs[0]];
  const vals: T[] = [];
  const marks: number[] = [];
  let t = 0;
  seq.forEach((v, i) => {
    if (i > 0) t += move;
    vals.push(v);
    marks.push(t);
    if (i < seq.length - 1) {
      t += hold;
      vals.push(v);
      marks.push(t);
    }
  });
  return { vals, times: marks.map((m) => m / (t || 1)), dur: t || 1 };
}

function anim(attr: string, values: string[], times: number[], dur: number): string {
  if (values.length < 2 || values.every((v) => v === values[0])) return '';
  const splines = values.slice(1).map(() => '.45 0 .55 1').join(';');
  return `<animate attributeName="${attr}" values="${values.join(';')}" keyTimes="${times.map((x) => x.toFixed(4)).join(';')}" dur="${dur.toFixed(2)}s" repeatCount="indefinite" calcMode="spline" keySplines="${splines}"/>`;
}

function body(j: Joints, fig: Fig, op = 1, a?: (sel: (x: Joints) => string) => string): string {
  const back = fig.front ? 1 : 0.4;
  const A = a ?? (() => '');
  return `<g opacity="${op}">
    <path d="${j.legs[1]}" opacity="${back}">${A((x) => x.legs[1])}</path>
    <path d="${j.arms[1]}" opacity="${back}">${A((x) => x.arms[1])}</path>
    ${fig.stick ? `<path d="${j.stick}" stroke-width="2.4" opacity=".75">${A((x) => x.stick)}</path>` : ''}
    <path d="${j.torso}" stroke-width="7">${A((x) => x.torso)}</path>
    <path d="${j.legs[0]}">${A((x) => x.legs[0])}</path>
    <path d="${j.arms[0]}">${A((x) => x.arms[0])}</path>
  </g>`;
}

/** One frame (key pose `k`), or the whole loop when k is omitted. */
export function figureSvg(fig: Fig, k?: number, zone?: Zone): string {
  const frames = (k === undefined ? fig.k : [fig.k[k]]).map(joints);
  const hold = fig.slow ? 1.4 : 0.7;
  const move = fig.slow ? 1.5 : 0.9;
  const { vals, times, dur } = timeline(frames, hold, move);
  const first = vals[0];
  const A = (sel: (x: Joints) => string) => anim('d', vals.map(sel), times, dur);
  const parts: string[] = [];
  if (fig.floor !== false) parts.push(`<path d="M-60 ${FLOOR + 2.8}H160" stroke-width="1.6" opacity=".55"/>`);
  if (fig.wall !== undefined) parts.push(`<path d="M${fig.wall} -40V${FLOOR + 2.8}" stroke-width="2.4" opacity=".6"/>`);
  if (fig.bar !== undefined) parts.push(`<path d="M-60 ${fig.bar}H160" stroke-width="2.6" opacity=".75"/>`);
  // the target pose, faint: shows where the movement goes
  if (frames.length > 1) {
    const end = frames[frames.length - 1];
    parts.push(`<g class="fig-ghost">${body(end, fig, 0.16)}<circle cx="${f(end.head[0])}" cy="${f(end.head[1])}" r="${HEAD}" fill="currentColor" stroke="none" opacity=".16"/></g>`);
  }
  if (zone) {
    const zs = vals.map((j) => zonePt(zone, j));
    parts.push(`<g class="fig-zone"><circle cx="${f(zs[0][0])}" cy="${f(zs[0][1])}" r="7" fill="currentColor" stroke="none" opacity=".18">${anim('cx', zs.map((p) => f(p[0])), times, dur)}${anim('cy', zs.map((p) => f(p[1])), times, dur)}<animate attributeName="r" values="5;9;5" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="${f(zs[0][0])}" cy="${f(zs[0][1])}" r="9.5" stroke-width="1.2" stroke-dasharray="2 2.2" opacity=".55">${anim('cx', zs.map((p) => f(p[0])), times, dur)}${anim('cy', zs.map((p) => f(p[1])), times, dur)}</circle></g>`);
  }
  parts.push(body(first, fig, 1, A));
  parts.push(
    `<circle cx="${f(first.head[0])}" cy="${f(first.head[1])}" r="${HEAD}" fill="currentColor" stroke="none">${anim('cx', vals.map((s) => f(s.head[0])), times, dur)}${anim('cy', vals.map((s) => f(s.head[1])), times, dur)}</circle>`,
  );
  // zoom on the figure: the box around every pose, at the 100 × 84 aspect, never closer than 46 units wide
  const pts = (fig.k.map(joints)).flatMap((j) => j.all);
  let x0 = Math.min(...pts.map((p) => p[0])) - 8;
  let x1 = Math.max(...pts.map((p) => p[0])) + 8;
  let y0 = Math.min(...pts.map((p) => p[1])) - 9;
  let y1 = Math.max(FLOOR + 4, Math.max(...pts.map((p) => p[1])) + 6);
  if (fig.wall !== undefined) { x0 = Math.min(x0, fig.wall - 4); x1 = Math.max(x1, fig.wall + 4); }
  if (fig.bar !== undefined) y0 = Math.min(y0, fig.bar - 4);
  const w = Math.max(46, x1 - x0, ((y1 - y0) * 100) / 84);
  const h = (w * 84) / 100;
  const cx = (x0 + x1) / 2;
  const top = fig.floor === false ? (y0 + y1) / 2 - h / 2 : y1 - h;
  const vb = `${f(cx - w / 2)} ${f(top)} ${f(w)} ${f(h)}`;
  return `<svg class="fig" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${fig.alt ?? 'Ilustrație'}"><g fill="none" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round">${parts.join('')}</g></svg>`;
}

export function figureFor(name: string, withZone = true): string {
  const fig = POSES[name];
  return fig ? figureSvg(fig, undefined, withZone ? ZONES[name] : undefined) : '';
}

/** "Unde simți": the body part the move works, in Romanian. */
export function zoneLabel(name: string): string {
  const z = ZONES[name];
  return z ? ZONE_NAMES[z] : '';
}

export function hasFigure(name: string): boolean {
  return name in POSES;
}
