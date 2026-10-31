// Heart monitoring maths (NOOP's scores, rewritten from the published methods it documents):
// RMSSD (Task Force 1996), Karvonen heart-rate reserve, Edwards TRIMP on a log 0–100 scale,
// and a recovery score against your own baseline. Approximations, not medical readings.

export interface Reading {
  rmssd: number;
  rhr: number;
}

/** Parses the standard Heart Rate Measurement characteristic (0x2A37): bpm and R-R in ms. */
export function parseHrm(v: DataView): { hr: number; rr: number[] } {
  const flags = v.getUint8(0);
  const wide = flags & 1;
  const hr = wide ? v.getUint16(1, true) : v.getUint8(1);
  let i = wide ? 3 : 2;
  if (flags & 8) i += 2; // energy expended
  const rr: number[] = [];
  if (flags & 16) for (; i + 1 < v.byteLength; i += 2) rr.push((v.getUint16(i, true) * 1000) / 1024);
  return { hr, rr };
}

/** Drops impossible beats and ectopics (more than 20% from the previous clean beat). */
export function cleanRr(rr: number[]): number[] {
  const out: number[] = [];
  for (const x of rr) {
    if (x < 300 || x > 2000) continue;
    const prev = out[out.length - 1];
    if (prev !== undefined && Math.abs(x - prev) / prev > 0.2) continue;
    out.push(x);
  }
  return out;
}

export function rmssd(rr: number[]): number | null {
  const c = cleanRr(rr);
  if (c.length < 20) return null;
  let s = 0;
  for (let i = 1; i < c.length; i++) s += (c[i] - c[i - 1]) ** 2;
  return Math.sqrt(s / (c.length - 1));
}

/** Tanaka: 208 − 0.7 × age. */
export const hrMax = (age: number): number => Math.round(208 - 0.7 * age);

/** Edwards zone 0–5 from the percentage of heart-rate reserve. */
export function zone(hr: number, rest: number, max: number): number {
  const pct = (hr - rest) / Math.max(1, max - rest);
  return pct < 0.5 ? 0 : Math.min(5, Math.floor(pct * 10) - 4);
}

/** One minute at zone z adds z to TRIMP; Effort = 100 · ln(TRIMP + 1) / ln(7201). */
export const effort = (trimp: number): number => Math.round((100 * Math.log(trimp + 1)) / Math.log(7201));

/** Charge 0–100 from today against at least 4 earlier readings; null while calibrating. */
export function charge(today: Reading, past: Reading[], sleepH?: number): number | null {
  if (past.length < 4) return null;
  const z = (v: number, xs: number[]): number => {
    const m = xs.reduce((s, x) => s + x, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length);
    return (v - m) / Math.max(sd, m * 0.05, 1e-6);
  };
  const hrv = z(Math.log(today.rmssd), past.map((r) => Math.log(r.rmssd)));
  const rhr = -z(today.rhr, past.map((r) => r.rhr));
  const sleep = sleepH === undefined ? 0 : Math.max(-1.5, Math.min(1, (sleepH - 7.5) / 1.5));
  // 0.32 is the logit of 58%, the anchor NOOP documents for an average day
  const score = 0.32 + 0.9 * hrv + 0.4 * rhr + 0.3 * sleep;
  return Math.round(100 / (1 + Math.exp(-score)));
}
