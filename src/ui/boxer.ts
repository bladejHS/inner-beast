// The animated boxer (2026-11-14): a dark figure with the accent-coloured headband, gloves and boots, in the look of
// the reference clip the user sent, drawn and animated here (SVG SMIL, no video, nobody's footage).
//  - comboSvg(seq): side view, the called combination strike by strike: guard → strike → guard …
//  - drillSvg(name): seen from above, the feet through the agility ladder or around the weight plate.
// Angles as in ui/figures.ts: 0 = straight down, 90 = to the right, 180 = straight up. The boxer faces right.

type Pt = [number, number];
type Limb = [number, number];
interface BP { p: Pt; t: number; a: [Limb, Limb]; l: [Limb, Limb] }

const TORSO = 24, NECK = 6.5, HEAD = 5.2, UPPER = 12, FORE = 11, THIGH = 16, SHIN = 16, FLOOR = 78;
const rad = (d: number) => (d * Math.PI) / 180;
const step = (from: Pt, angle: number, len: number): Pt => [from[0] + Math.sin(rad(angle)) * len, from[1] + Math.cos(rad(angle)) * len];
const n = (v: number) => v.toFixed(1);

/** Legs that keep both feet on the floor when the hips drop by `dy`. */
const legs = (dy = 0): [Limb, Limb] => [[25 + dy * 4, -5 - dy * 3.5], [-22 - dy * 4, -32 + dy * 2.5]];
const GUARD_ARMS: [Limb, Limb] = [[40, 150], [15, 165]];
const guard = (dx = 0, dy = 0, t = 172): BP => ({ p: [46 + dx, 47 + dy], t, a: GUARD_ARMS, l: legs(dy) });
const G = guard();

/** The key pose of one called move. Lead side = arm/leg 0 (drawn in front), rear side = 1. */
export function strikePose(token: string): BP {
  const s = token.toLowerCase();
  const body = /body|liver/.test(s);
  const rear = /right|rear|cross|straight|overhand|loaded/.test(s) && !/lead|left/.test(s);
  const arm = (pose: BP, side: 0 | 1, limb: Limb): BP => ({ ...pose, a: side === 0 ? [limb, pose.a[1]] : [pose.a[0], limb] });
  const leg = (pose: BP, side: 0 | 1, limb: Limb, support: Limb): BP => ({ ...pose, l: side === 0 ? [limb, support] : [support, limb] });

  // legs
  if (/high kick/.test(s)) return leg({ ...guard(1, -1, 208) }, rear ? 1 : 0, [118, 112], rear ? [6, 0] : [-8, -10]);
  if (/body kick/.test(s)) return leg({ ...guard(1, -1, 198) }, rear ? 1 : 0, [92, 85], rear ? [6, 0] : [-8, -10]);
  if (/low kick/.test(s)) return leg({ ...guard(1, 0, 186) }, rear ? 1 : 0, [58, 48], rear ? [8, -2] : [-10, -12]);
  if (/fake teep/.test(s)) return leg({ ...guard(0, -1, 180) }, 0, [70, 10], [-8, -10]);
  if (/teep/.test(s)) return leg({ ...guard(0, -1, 194) }, rear ? 1 : 0, [88, 92], rear ? [4, 0] : [-8, -10]);
  if (/knee/.test(s)) return { ...leg({ ...guard(2, -1, 186) }, 1, [100, 10], [6, 0]), a: [[70, 120], [62, 125]] };
  if (/check/.test(s)) return leg({ ...guard(0, -1, 178) }, 0, [85, 5], [-8, -10]);

  // hands
  if (/feint|fake|tap/.test(s)) return arm(guard(1), 0, [62, 118]);
  if (/jab/.test(s)) return body ? arm(guard(3, 4, 160), 0, [78, 88]) : arm(guard(2), 0, [88, 90]);
  if (/overhand/.test(s)) return arm(guard(4, 1, 158), 1, [122, 74]);
  if (/cross|straight|right hand/.test(s)) return body ? arm(guard(5, 4, 155), 1, [76, 88]) : arm(guard(4, 0, 163), 1, [86, 92]);
  if (/uppercut/.test(s)) { const side = /lead|left/.test(s) ? 0 : 1; return arm(guard(2, -1.5, 176), side, [55, 178]); }
  if (/hook|bodyshot|^body$|gazelle/.test(s)) {
    const side = rear ? 1 : 0;
    return body || /bodyshot|^body$/.test(s) ? arm(guard(2, 4, 166), side, [60, 96]) : arm(guard(2, 0, 178), side, [100, 62]);
  }
  if (/frame|clinch|catch/.test(s)) return { ...guard(1), a: [[75, 110], [70, 115]] };

  // head and feet
  if (/lean back/.test(s)) return guard(-2, 0, 196);
  if (/slip/.test(s)) return guard(1, 2, 154);
  if (/duck|roll|bob|weave|level|^u$/.test(s)) return guard(1, 7, 160);
  if (/step back|step out|small step|push front/.test(s)) return guard(-7);
  if (/step in|step forward|close|shift|hop|push off|^step$/.test(s)) return guard(7);
  if (/pivot|circle|side|switch|angle|step over|move|^[stvwz]$/.test(s)) return leg(guard(-3, -1), 0, [42, 8], [-12, -14]);
  return guard(0, -1.5);
}

interface Drawn { torso: string; arms: [string, string]; legs: [string, string]; head: Pt; hands: [Pt, Pt]; feet: [Pt, Pt] }

function draw(b: BP): Drawn {
  const neck = step(b.p, b.t, TORSO);
  const head = step(neck, b.t, NECK);
  const limb = (from: Pt, [u, f]: Limb, l1: number, l2: number): [string, Pt] => {
    const m = step(from, u, l1), e = step(m, f, l2);
    return [`M${n(from[0])} ${n(from[1])}L${n(m[0])} ${n(m[1])}L${n(e[0])} ${n(e[1])}`, e];
  };
  const [a0, h0] = limb(neck, b.a[0], UPPER, FORE), [a1, h1] = limb(neck, b.a[1], UPPER, FORE);
  const [l0, f0] = limb(b.p, b.l[0], THIGH, SHIN), [l1, f1] = limb(b.p, b.l[1], THIGH, SHIN);
  return { torso: `M${n(b.p[0])} ${n(b.p[1])}L${n(neck[0])} ${n(neck[1])}`, arms: [a0, a1], legs: [l0, l1], head, hands: [h0, h1], feet: [f0, f1] };
}

/** SMIL values and keyTimes for frames that each hold, then move to the next; the last moves back to the first. */
function track(count: number, hold: (i: number) => number, move: (i: number) => number) {
  const at: number[] = [];
  let t = 0;
  for (let i = 0; i < count; i++) { at.push(t); t += hold(i); at.push(t); t += move(i); }
  const dur = t;
  const keyTimes = [...at.map((x) => (x / dur).toFixed(4)), '1'].join(';');
  const vals = <T,>(xs: T[], f: (x: T) => string) => [...xs.flatMap((x) => [f(x), f(x)]), f(xs[0]!)].join(';');
  return { dur, keyTimes, vals };
}

const anim = (attr: string, values: string, keyTimes: string, dur: number) => `<animate attributeName="${attr}" values="${values}" keyTimes="${keyTimes}" dur="${dur.toFixed(2)}s" repeatCount="indefinite"/>`;

/** The combination as a looping side view. `bag`: a heavy bag in front, for the bag rounds. Empty when nothing to show. */
export function comboSvg(seq: string[], bag = false): string {
  const moves = seq.filter(Boolean).slice(0, 8);
  if (!moves.length) return '';
  const poses: BP[] = [G];
  for (const m of moves) poses.push(strikePose(m), G);
  poses.pop();
  poses.push(G);
  const frames = poses.map(draw);
  // even frames are the guard (short hold), odd ones the strike (snap in, hold, ease back); the loop rests at the end
  const last = frames.length - 1;
  const { dur, keyTimes, vals } = track(frames.length, (i) => (i === last ? 0.9 : i % 2 ? 0.3 : 0.22), (i) => (i % 2 ? 0.2 : 0.12));
  const A = (attr: string, f: (d: Drawn) => string) => anim(attr, vals(frames, f), keyTimes, dur);
  const f0 = frames[0]!;
  const path = (sel: (d: Drawn) => string, extra = '') => `<path d="${sel(f0)}" ${extra}>${A('d', sel)}</path>`;
  const dot = (sel: (d: Drawn) => Pt, r: number, cls: string) => `<circle class="${cls}" cx="${n(sel(f0)[0])}" cy="${n(sel(f0)[1])}" r="${r}">${A('cx', (d) => n(sel(d)[0]))}${A('cy', (d) => n(sel(d)[1]))}</circle>`;
  const boot = (i: 0 | 1) => `<path class="bx-acc" d="M${n(f0.feet[i][0] - 1.5)} ${n(f0.feet[i][1])}h5.5" stroke-width="3.6"${i ? ' opacity=".6"' : ''}>${A('d', (d) => `M${n(d.feet[i][0] - 1.5)} ${n(d.feet[i][1])}h5.5`)}</path>`;
  const band = (d: Drawn) => `M${n(d.head[0] - HEAD - 2.6)} ${n(d.head[1] + 0.6)}L${n(d.head[0] - HEAD + 0.2)} ${n(d.head[1] - 1.6)}H${n(d.head[0] + HEAD - 0.2)}`;
  return `<svg class="bx" viewBox="14 4 ${bag ? 82 : 76} 80" role="img" aria-label="Combinația, pas cu pas"><g fill="none" stroke="currentColor" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 ${FLOOR + 2.6}H120" stroke-width="1.4" opacity=".4"/>
    ${bag ? `<g class="bx-bag"><path d="M83.5 0V14" stroke-width="1.2" opacity=".6"/><rect x="77" y="14" width="13" height="40" rx="5" fill="currentColor" stroke="none" opacity=".28"/><path class="bx-acc" d="M77 22h13" stroke-width="2"/></g>` : ''}
    ${path((d) => d.legs[1], 'opacity=".55"')}${boot(1)}
    ${path((d) => d.arms[1], 'opacity=".55"')}${dot((d) => d.hands[1], 3.4, 'bx-glove far')}
    ${path((d) => d.torso, 'stroke-width="8"')}
    ${path((d) => d.legs[0])}${boot(0)}
    <circle cx="${n(f0.head[0])}" cy="${n(f0.head[1])}" r="${HEAD}" fill="currentColor" stroke="none">${A('cx', (d) => n(d.head[0]))}${A('cy', (d) => n(d.head[1]))}</circle>
    <path class="bx-acc" d="${band(f0)}" stroke-width="2.3">${A('d', band)}</path>
    ${path((d) => d.arms[0])}${dot((d) => d.hands[0], 3.8, 'bx-glove')}
  </g></svg>`;
}

// ---------- footwork from above ----------

/** One beat of a drill: where the left and the right foot stand, and a punch thrown on it. */
interface Beat { L: Pt; R: Pt; hit?: 'JAB' | 'CROSS' }
interface Drill { kind: 'ladder' | 'plate'; beats: Beat[]; fast?: boolean }

/** Ladder: seven squares going up the picture, rails at x 38 and 62, square i centred on y = 101 − 14 i. */
const sq = (i: number) => 101 - 14 * i;
/** Beside the ladder, in stance, facing it (lead foot = left, nearer the ladder). `inn`: the lead foot in the square. */
const beside = (i: number, inn: boolean, hit?: Beat['hit']): Beat => ({ L: [inn ? 46 : 30, sq(i)], R: [inn ? 24 : 15, sq(i) + 6], ...(hit ? { hit } : {}) });
const rows = <T,>(count: number, f: (i: number) => T[]): T[] => Array.from({ length: count }, (_, i) => f(i)).flat();

const DRILLS: Record<string, Drill> = {
  // the five drills of the reference clip
  'In and Out': { kind: 'ladder', beats: rows(4, (i) => [beside(i, false), beside(i, true)]) },
  'Step-in Jab': { kind: 'ladder', beats: rows(4, (i) => [beside(i, false), beside(i, true, 'JAB')]) },
  'Jab-Cross-Jab': { kind: 'ladder', beats: rows(3, (i) => [beside(i, false), beside(i, true, 'JAB'), beside(i, true, 'CROSS'), beside(i, true, 'JAB')]) },
  'Step-in Pivot': { kind: 'ladder', beats: rows(3, (i) => [beside(i, false), beside(i, true), { L: [46, sq(i)], R: [50, sq(i) + 15] }, { L: [46, sq(i)], R: [27, sq(i) + 12] }]) },
  Shuffle: { kind: 'ladder', fast: true, beats: rows(5, (i) => [{ L: [30, sq(i) + 4], R: [70, sq(i) + 4] }, { L: [45, sq(i)], R: [55, sq(i)] }]) },
  // the classics the plan already had
  'One Foot In': { kind: 'ladder', fast: true, beats: rows(6, (i) => [i % 2 ? { L: [46, sq(i - 1)], R: [54, sq(i)] } : { L: [46, sq(i)], R: [54, sq(i - 1)] }]) },
  'Two Feet In': { kind: 'ladder', fast: true, beats: rows(5, (i) => [{ L: [46, sq(i)], R: [54, sq(i - 1)] }, { L: [46, sq(i)], R: [54, sq(i)] }]) },
  'Lateral Shuffle': { kind: 'ladder', fast: true, beats: rows(5, (i) => [{ L: [50, sq(i)], R: [50, sq(i - 1) - 2] }, { L: [50, sq(i) - 5], R: [50, sq(i) + 5] }]) },
  'In-In-Out-Out': { kind: 'ladder', fast: true, beats: rows(4, (i) => [{ L: [46, sq(i)], R: [70, sq(i) + 6] }, { L: [46, sq(i)], R: [54, sq(i)] }, { L: [30, sq(i) - 6], R: [54, sq(i)] }, { L: [30, sq(i) - 6], R: [70, sq(i) - 6] }]) },
  'Icky Shuffle': { kind: 'ladder', fast: true, beats: rows(4, (i) => (i % 2 ? [{ L: [46, sq(i)], R: [70, sq(i) + 8] }, { L: [46, sq(i)], R: [54, sq(i)] }, { L: [30, sq(i) - 7], R: [54, sq(i)] }] : [{ L: [30, sq(i) + 8], R: [54, sq(i)] }, { L: [46, sq(i)], R: [54, sq(i)] }, { L: [46, sq(i)], R: [70, sq(i) - 7] }])) },
  // around the weight plate (centre 50, 60), the five levels of the second clip
  'Toe Taps': { kind: 'plate', fast: true, beats: [{ L: [46, 55], R: [57, 80] }, { L: [43, 80], R: [54, 55] }] },
  'In & Out': { kind: 'plate', beats: [{ L: [46, 82], R: [60, 96] }, { L: [49, 60], R: [60, 80] }] },
  'Lateral Step-Over': { kind: 'plate', beats: [{ L: [20, 60], R: [32, 60] }, { L: [32, 60], R: [50, 60] }, { L: [50, 60], R: [68, 60] }, { L: [68, 60], R: [80, 60] }, { L: [50, 60], R: [68, 60] }, { L: [32, 60], R: [50, 60] }] },
  'Open & Close': { kind: 'plate', fast: true, beats: [{ L: [30, 60], R: [70, 60] }, { L: [46, 60], R: [54, 60] }] },
  'Step-in & Duck': { kind: 'plate', beats: [{ L: [46, 82], R: [60, 96] }, { L: [49, 60], R: [60, 80] }, { L: [49, 60], R: [60, 80], hit: 'JAB' }, { L: [46, 82], R: [60, 96] }] },
};

export const hasDrill = (name: string): boolean => name in DRILLS;

/** The drill from above: left foot in the accent colour, right foot in white; the punch thrown is named on its beat. */
export function drillSvg(name: string): string {
  const d = DRILLS[name];
  if (!d) return '';
  const b = d.beats;
  const { dur, keyTimes, vals } = track(b.length, () => (d.fast ? 0.2 : 0.42), () => (d.fast ? 0.16 : 0.24));
  const A = (attr: string, f: (x: Beat) => string) => anim(attr, vals(b, f), keyTimes, dur);
  const foot = (side: 'L' | 'R') => `<ellipse class="bx-foot ${side}" cx="${n(b[0]![side][0])}" cy="${n(b[0]![side][1])}" rx="3.6" ry="6.2">${A('cx', (x) => n(x[side][0]))}${A('cy', (x) => n(x[side][1]))}</ellipse>`;
  const hits = (['JAB', 'CROSS'] as const).filter((h) => b.some((x) => x.hit === h)).map((h) => `<text class="bx-hit" x="${h === 'JAB' ? 74 : 88}" y="18" opacity="0">${h}${A('opacity', (x) => (x.hit === h ? '1' : '0'))}</text>`).join('');
  const scene = d.kind === 'ladder'
    ? `<g class="bx-ladder"><path d="M38 4V112M62 4V112"/>${Array.from({ length: 8 }, (_, i) => `<path d="M38 ${108 - 14 * i}H62"/>`).join('')}</g>`
    : '<g class="bx-plate"><circle cx="50" cy="60" r="13"/><circle cx="50" cy="60" r="3"/></g>';
  return `<svg class="bx bx-top" viewBox="${d.kind === 'ladder' ? '0 0 100 116' : '6 36 88 68'}" role="img" aria-label="Pașii, văzuți de sus">${scene}${foot('R')}${foot('L')}${hits}</svg>`;
}
