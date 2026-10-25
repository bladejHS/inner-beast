// GPS helpers for the Sunday jog and the Wednesday walk.

export interface Fix {
  lat: number;
  lon: number;
  /** Accuracy radius in meters. */
  acc: number;
  /** Timestamp in ms. */
  t: number;
}

const R = 6371000;
const rad = (d: number): number => (d * Math.PI) / 180;

export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const MAX_ACC = 35;
const MAX_SPEED = 7.5; // m/s, faster than any jog: a GPS jump
const MIN_STEP = 5; // m, ignore standing-still jitter

/** Accumulates distance from GPS fixes, dropping inaccurate points and jumps. */
export class Track {
  pts: Fix[] = [];
  m = 0;
  /** Elapsed seconds when each full km was reached. */
  splits: number[] = [];

  /** Returns true when the fix was used. `elapsed` is the running time in seconds. */
  add(f: Fix, elapsed: number): boolean {
    if (!isFinite(f.lat) || !isFinite(f.lon) || f.acc > MAX_ACC) return false;
    const last = this.pts[this.pts.length - 1];
    if (!last) {
      this.pts.push(f);
      return true;
    }
    const d = haversine(last, f);
    const dt = (f.t - last.t) / 1000;
    if (d < MIN_STEP) return false;
    if (dt > 0 && d / dt > MAX_SPEED) return false;
    const before = this.m;
    this.m += d;
    this.pts.push(f);
    for (let k = Math.floor(before / 1000) + 1; k <= Math.floor(this.m / 1000); k++) this.splits.push(Math.round(elapsed));
    return true;
  }

  /** Recent pace in s/km over the last `window` seconds of fixes, or 0 when unknown. */
  pace(window = 30): number {
    const n = this.pts.length;
    if (n < 2) return 0;
    const end = this.pts[n - 1];
    let i = n - 2;
    while (i > 0 && (end.t - this.pts[i].t) / 1000 < window) i--;
    let d = 0;
    for (let k = i; k < n - 1; k++) d += haversine(this.pts[k], this.pts[k + 1]);
    const dt = (end.t - this.pts[i].t) / 1000;
    return d > 10 && dt > 0 ? (dt / d) * 1000 : 0;
  }
}

/** Keeps points at least `minGap` meters apart (for storage). */
export function simplify(pts: Array<{ lat: number; lon: number }>, minGap = 15): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let last: { lat: number; lon: number } | null = null;
  for (const p of pts) {
    if (!last || haversine(last, p) >= minGap) {
      out.push([+p.lat.toFixed(5), +p.lon.toFixed(5)]);
      last = p;
    }
  }
  const tail = pts[pts.length - 1];
  if (tail && out.length && (out[out.length - 1][0] !== +tail.lat.toFixed(5) || out[out.length - 1][1] !== +tail.lon.toFixed(5))) {
    out.push([+tail.lat.toFixed(5), +tail.lon.toFixed(5)]);
  }
  return out;
}

/** SVG path for a route, fitted into a w × h box with padding. */
export function routePath(pts: Array<[number, number]>, w = 300, h = 180, pad = 12): string {
  if (pts.length < 2) return '';
  const lat0 = rad(pts.reduce((s, p) => s + p[0], 0) / pts.length);
  const xy = pts.map(([la, lo]) => [lo * Math.cos(lat0), -la]);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = (w - 2 * pad) / Math.max(maxX - minX, 1e-9);
  const sy = (h - 2 * pad) / Math.max(maxY - minY, 1e-9);
  const s = Math.min(sx, sy);
  const ox = (w - (maxX - minX) * s) / 2;
  const oy = (h - (maxY - minY) * s) / 2;
  return xy.map((p, i) => `${i ? 'L' : 'M'}${(ox + (p[0] - minX) * s).toFixed(1)} ${(oy + (p[1] - minY) * s).toFixed(1)}`).join(' ');
}
