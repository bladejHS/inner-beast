// Three tapered claw marks — the app's mark. Geometry in a 100 × 100 box.

export interface Claw {
  /** Filled, tapered outline. */
  fill: string;
  /** Center line, used to reveal the claw with a stroke animation. */
  center: string;
  len: number;
}

function quad(p0: number[], c: number[], p1: number[], t: number): number[] {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}

function quadD(p0: number[], c: number[], p1: number[], t: number): number[] {
  return [2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])];
}

const f = (n: number): string => n.toFixed(2);

function claw(p0: number[], p1: number[], bend: number, width: number): Claw {
  const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const l = Math.hypot(dx, dy);
  const c = [mid[0] - (dy / l) * bend, mid[1] + (dx / l) * bend];
  const N = 28;
  const left: number[][] = [];
  const right: number[][] = [];
  let len = 0;
  let prev = p0;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = quad(p0, c, p1, t);
    const d = quadD(p0, c, p1, t);
    const dl = Math.hypot(d[0], d[1]) || 1;
    // Asymmetric taper: sharp tip at the start, fuller body, pointed tail.
    const w = (width / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.9);
    const nx = -d[1] / dl;
    const ny = d[0] / dl;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  const pts = [...left, ...right.reverse()];
  const fill = pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('') + 'Z';
  const center = `M${f(p0[0])} ${f(p0[1])}Q${f(c[0])} ${f(c[1])} ${f(p1[0])} ${f(p1[1])}`;
  return { fill, center, len: Math.ceil(len) };
}

// Since 2026-11-20 (the Hybrid365 look) the marks are straight speed stripes, "///" like a track's start line, not
// curved claws: no bend, the same taper and timing.
export const CLAWS: Claw[] = [
  claw([50, 12], [22, 88], 0, 9),
  claw([69, 8], [41, 92], 0, 10.5),
  claw([88, 12], [60, 88], 0, 9),
];

const GASH = 'M31 0L13 100L21 100L39 0Z';
const RAKE_AT: [number, number][] = [[0, 0], [19, -6], [38, -2], [57, -4]];

/** Four solid claw gashes; the box sets the size, so the shape stretches with it. */
export function rake(cls = ''): string {
  const gashes = (c: string, dx: number) => RAKE_AT.map(([x, y]) => `<path class="${c}" transform="translate(${x + dx} ${y})" d="${GASH}"/>`).join('');
  return `<svg class="rake ${cls}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${gashes('rk-b', 2)}${gashes('rk-f', 0)}</svg>`;
}

export function clawSvg(color = '#C7FE51', cls = ''): string {
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${CLAWS.map((c) => `<path d="${c.fill}" fill="${color}"/>`).join('')}</svg>`;
}
