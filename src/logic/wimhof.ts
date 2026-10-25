// Wim Hof breathing: power breaths, a hold after the exhale, a 15-second recovery breath, repeated.

import type { Entry } from './store.ts';

/** Seconds per full breath (in + out). */
export const PACE: Record<'slow' | 'normal' | 'fast', number> = { slow: 4, normal: 3.2, fast: 2.4 };
export const RECOVERY_SEC = 15;
/** Share of each breath spent inhaling. */
const IN_SHARE = 0.55;

export interface BreathPos {
  /** 0-based breath number. */
  n: number;
  inhale: boolean;
  /** 0..1 progress inside the current half (in or out). */
  frac: number;
  /** Lung fill 0..1 for the animation. */
  fill: number;
}

export function breathPos(t: number, per: number): BreathPos {
  const n = Math.floor(t / per);
  const into = t - n * per;
  const inLen = per * IN_SHARE;
  if (into < inLen) {
    const frac = into / inLen;
    return { n, inhale: true, frac, fill: easeInOut(frac) };
  }
  const frac = (into - inLen) / (per - inLen);
  return { n, inhale: false, frac, fill: 1 - easeInOut(frac) };
}

function easeInOut(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

export interface HoldStats {
  best: number;
  last: number[];
  sessions: number;
}

export function holdStats(log: Entry[]): HoldStats {
  let best = 0;
  let last: number[] = [];
  let sessions = 0;
  for (const e of log) {
    if (e.kind !== 'wimhof') continue;
    const holds = (e.data.holds as number[]) || [];
    if (!holds.length) continue;
    sessions++;
    best = Math.max(best, ...holds);
    last = holds;
  }
  return { best, last, sessions };
}
