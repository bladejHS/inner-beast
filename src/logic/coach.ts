// Camera coach maths: pure functions over pose landmarks (normalised, y grows downward), so they can be tested.

export interface Pt {
  x: number;
  y: number;
  visibility?: number;
}

export const L = { sh: [11, 12], el: [13, 14], wr: [15, 16], hip: [23, 24], kn: [25, 26], an: [27, 28] } as const;

const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Angle at b, in degrees. */
export function angle(a: Pt, b: Pt, c: Pt): number {
  const u = Math.atan2(a.y - b.y, a.x - b.x) - Math.atan2(c.y - b.y, c.x - b.x);
  const d = Math.abs((u * 180) / Math.PI) % 360;
  return d > 180 ? 360 - d : d;
}

export const seen = (lm: Pt[], ids: number[], min = 0.5): boolean => ids.every((i) => (lm[i]?.visibility ?? 0) >= min);

/** 0 or 1: the side of the body turned to the camera. */
export function nearSide(lm: Pt[]): 0 | 1 {
  const s = (i: 0 | 1): number => [L.sh[i], L.el[i], L.hip[i], L.an[i]].reduce((t, k) => t + (lm[k]?.visibility ?? 0), 0);
  return s(1) > s(0) ? 1 : 0;
}

export type RepEvent = 'rep' | 'shallow' | null;

/** Counts extended → flexed → extended, with a dead band so jitter never counts. */
export class RepCounter {
  reps = 0;
  shallow = 0;
  /** Seconds from the bottom back to the top, per rep. */
  ups: number[] = [];
  private state: 'top' | 'down' = 'top';
  private low = 180;
  private lowAt = 0;
  private smooth: number | null = null;
  private hi: number;
  private lo: number;

  constructor(hi: number, lo: number) {
    this.hi = hi;
    this.lo = lo;
  }

  feed(raw: number, t: number): RepEvent {
    const a = (this.smooth = this.smooth === null ? raw : this.smooth * 0.55 + raw * 0.45);
    if (this.state === 'top') {
      if (a < this.hi - 25) {
        this.state = 'down';
        this.low = a;
        this.lowAt = t;
      }
      return null;
    }
    if (a < this.low) {
      this.low = a;
      this.lowAt = t;
    }
    if (a < this.hi - 12) return null;
    this.state = 'top';
    if (this.low <= this.lo) {
      this.reps++;
      this.ups.push(t - this.lowAt);
      return 'rep';
    }
    this.shallow++;
    return 'shallow';
  }

  /** True once the last rep rose 40% slower than the first three. */
  get slowed(): boolean {
    if (this.ups.length < 5) return false;
    const base = (this.ups[0] + this.ups[1] + this.ups[2]) / 3;
    return this.ups[this.ups.length - 1] > base * 1.4;
  }
}

/** Shoulder-hip-ankle line: 180 is a straight body. */
export function bodyLine(lm: Pt[], side: 0 | 1): number {
  return angle(lm[L.sh[side]], lm[L.hip[side]], lm[L.an[side]]);
}

export interface GuardEvent {
  punch: boolean;
  drop: boolean;
}

/** Punches and guard in shadow boxing. A hand is "up" near the chin; a punch is a hand far out on a straight arm. */
export class GuardTracker {
  punches = 0;
  drops = 0;
  /** Punches per started minute. */
  perMin: number[] = [];
  private up = 0;
  private all = 0;
  private out: [boolean, boolean] = [false, false];
  private lowSince: [number | null, number | null] = [null, null];
  private lastDrop = -99;
  private t0: number | null = null;

  feed(lm: Pt[], t: number): GuardEvent {
    this.t0 ??= t;
    const ev: GuardEvent = { punch: false, drop: false };
    const torso = dist(mid(lm[11], lm[12]), mid(lm[23], lm[24]));
    if (torso < 0.02) return ev;
    for (const i of [0, 1] as const) {
      const sh = lm[L.sh[i]], el = lm[L.el[i]], wr = lm[L.wr[i]];
      const reach = dist(sh, wr) / torso;
      // a straight arm hanging at the side is a dropped guard, not a punch
      if (!this.out[i] && reach > 0.75 && angle(sh, el, wr) > 140 && wr.y < sh.y + 0.5 * torso) {
        this.out[i] = true;
        this.punches++;
        const m = Math.floor((t - this.t0) / 60);
        while (this.perMin.length <= m) this.perMin.push(0);
        this.perMin[m]++;
        ev.punch = true;
      } else if (this.out[i] && reach < 0.55) this.out[i] = false;
      const low = wr.y > sh.y + 0.35 * torso && !this.out[i];
      this.all++;
      if (!low) {
        this.up++;
        this.lowSince[i] = null;
      } else if (this.lowSince[i] === null) this.lowSince[i] = t;
      else if (t - (this.lowSince[i] as number) > 0.7 && t - this.lastDrop > 4) {
        this.lastDrop = t;
        this.drops++;
        ev.drop = true;
      }
    }
    return ev;
  }

  get guardPct(): number {
    return this.all ? Math.round((this.up / this.all) * 100) : 0;
  }
}

/** Middle split: the angle between the legs at the hips. */
export const splitAngle = (lm: Pt[]): number => angle(lm[27], mid(lm[23], lm[24]), lm[28]);
/** Seated forward fold: trunk to thigh, smaller is deeper. */
export const foldAngle = (lm: Pt[], s: 0 | 1): number => angle(lm[L.sh[s]], lm[L.hip[s]], lm[L.kn[s]]);
