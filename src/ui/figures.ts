// Ink stick figures that show how a mobility move is done: a few key poses, looped (SVG SMIL).
// Angles are in degrees: 0 = straight down, 90 = to the right, 180 = straight up, -90 = to the left.
// Side-view figures face right; the far arm and leg are drawn fainter.

import { POSES, type Fig, type Pose } from '../data/poses.ts';

const TORSO = 24;
const NECK = 6.5;
const HEAD = 4.6;
const UPPER_ARM = 12;
const FOREARM = 11;
const THIGH = 16;
const SHIN = 16;
const FLOOR = 78;

type Pt = [number, number];

const rad = (d: number): number => (d * Math.PI) / 180;
const step = (from: Pt, angle: number, len: number): Pt => [from[0] + Math.sin(rad(angle)) * len, from[1] + Math.cos(rad(angle)) * len];
const f = (n: number): string => n.toFixed(1);

interface Joints {
  torso: string;
  head: Pt;
  arms: [string, string];
  legs: [string, string];
  stick?: string;
}

function joints(p: Pose): Joints {
  const pelvis = p.p;
  const neck = step(pelvis, p.t, TORSO * (p.tl ?? 1));
  // spine bend: control point pushed sideways from the middle of the torso
  const mid: Pt = [(pelvis[0] + neck[0]) / 2, (pelvis[1] + neck[1]) / 2];
  const ctrl = step(mid, p.t + 90, p.c ?? 0);
  const head = step(neck, p.h ?? p.t, NECK * (p.tl !== undefined && p.tl < 0.8 ? 0.7 : 1));
  const limb = (from: Pt, [a, b]: [number, number], l1: number, l2: number): [Pt, Pt] => {
    const mid2 = step(from, a, l1);
    return [mid2, step(mid2, b, l2)];
  };
  const arm = (i: 0 | 1) => {
    const [e, w] = limb(neck, p.a[i], UPPER_ARM, FOREARM);
    return { d: `M${f(neck[0])} ${f(neck[1])}L${f(e[0])} ${f(e[1])}L${f(w[0])} ${f(w[1])}`, hand: w };
  };
  const leg = (i: 0 | 1) => {
    const [k, ft] = limb(pelvis, p.l[i], THIGH, SHIN);
    return `M${f(pelvis[0])} ${f(pelvis[1])}L${f(k[0])} ${f(k[1])}L${f(ft[0])} ${f(ft[1])}`;
  };
  const a0 = arm(0);
  const a1 = arm(1);
  return {
    torso: `M${f(pelvis[0])} ${f(pelvis[1])}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(neck[0])} ${f(neck[1])}`,
    head,
    arms: [a0.d, a1.d],
    legs: [leg(0), leg(1)],
    stick: `M${f(a0.hand[0])} ${f(a0.hand[1])}L${f(a1.hand[0])} ${f(a1.hand[1])}`,
  };
}

/** Values for a ping-pong loop through the key poses. */
function loop<T>(xs: T[]): T[] {
  return xs.length < 2 ? xs : [...xs, ...xs.slice(1, -1).reverse(), xs[0]];
}

function anim(attr: string, values: string[], dur: number): string {
  if (values.length < 2 || values.every((v) => v === values[0])) return '';
  const n = values.length - 1;
  const splines = Array.from({ length: n }, () => '.45 0 .55 1').join(';');
  return `<animate attributeName="${attr}" values="${values.join(';')}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines="${splines}"/>`;
}

/** One frame (key pose `k`), or the whole loop when k is omitted. */
export function figureSvg(fig: Fig, k?: number): string {
  const frames = (k === undefined ? fig.k : [fig.k[k]]).map(joints);
  const seq = loop(frames);
  const dur = Math.max(2.4, (seq.length - 1) * (fig.slow ? 2 : 1.3));
  const first = seq[0];
  const back = fig.front ? '1' : '.38';
  const path = (d: string, vals: string[], op = '1') => `<path d="${d}" opacity="${op}">${anim('d', vals, dur)}</path>`;
  const parts: string[] = [];
  if (fig.floor !== false) parts.push(`<path d="M4 ${FLOOR + 2.6}H96" stroke-width="1.2" opacity=".5"/>`);
  if (fig.wall !== undefined) parts.push(`<path d="M${fig.wall} 6V${FLOOR + 2.6}" stroke-width="2" opacity=".55"/>`);
  if (fig.bar !== undefined) parts.push(`<path d="M18 ${fig.bar}H82" stroke-width="2.4" opacity=".7"/>`);
  parts.push(path(first.legs[1], seq.map((s) => s.legs[1]), back));
  parts.push(path(first.arms[1], seq.map((s) => s.arms[1]), back));
  if (fig.stick) parts.push(path(first.stick ?? '', seq.map((s) => s.stick ?? ''), '.7'));
  parts.push(path(first.torso, seq.map((s) => s.torso)));
  parts.push(path(first.legs[0], seq.map((s) => s.legs[0])));
  parts.push(path(first.arms[0], seq.map((s) => s.arms[0])));
  parts.push(
    `<circle cx="${f(first.head[0])}" cy="${f(first.head[1])}" r="${HEAD}" fill="currentColor" stroke="none">${anim('cx', seq.map((s) => f(s.head[0])), dur)}${anim('cy', seq.map((s) => f(s.head[1])), dur)}</circle>`,
  );
  return `<svg class="fig" viewBox="0 0 100 84" role="img" aria-label="${fig.alt ?? 'Ilustrație'}"><g fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${parts.join('')}</g></svg>`;
}

export function figureFor(name: string): string {
  const fig = POSES[name];
  return fig ? figureSvg(fig) : '';
}

export function hasFigure(name: string): boolean {
  return name in POSES;
}
