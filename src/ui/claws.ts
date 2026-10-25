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

export const CLAWS: Claw[] = [
  claw([52, 12], [16, 84], 4, 8.5),
  claw([71, 7], [35, 91], 4.5, 10),
  claw([90, 14], [54, 86], 4, 8.5),
];

export function clawSvg(color = '#C7FE51', cls = ''): string {
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${CLAWS.map((c) => `<path d="${c.fill}" fill="${color}"/>`).join('')}</svg>`;
}
