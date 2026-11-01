// A running race simulation. Everything is stored as timestamps, so a race of many hours
// survives closing the app or the phone going to sleep.

import type { Entry } from './store.ts';

export interface RaceRun {
  ev: string;
  lvl: number;
  /** Current segment. */
  i: number;
  start: number;
  /** Total time spent paused, and when the current pause began. */
  paused: number;
  pausedAt: number | null;
  /** Finished segments, in seconds. */
  splits: number[];
}

export const newRun = (ev: string, lvl: number, now: number): RaceRun => ({ ev, lvl, i: 0, start: now, paused: 0, pausedAt: null, splits: [] });

/** Race time in seconds, pauses excluded. */
export function elapsed(r: RaceRun, now: number): number {
  return Math.max(0, ((r.pausedAt ?? now) - r.start - r.paused) / 1000);
}

/** Time on the current segment, in seconds. */
export function segElapsed(r: RaceRun, now: number): number {
  return Math.max(0, elapsed(r, now) - r.splits.reduce((s, x) => s + x, 0));
}

export function pause(r: RaceRun, now: number): void {
  if (r.pausedAt === null) r.pausedAt = now;
}

export function resume(r: RaceRun, now: number): void {
  if (r.pausedAt === null) return;
  r.paused += now - r.pausedAt;
  r.pausedAt = null;
}

/** Closes the current segment and moves on; a timed segment passes its exact length. */
export function advance(r: RaceRun, now: number, sec?: number): void {
  r.splits.push(sec ?? segElapsed(r, now));
  r.i++;
}

/**
 * Undo a mistaken tap: the last segment's time goes back into the current one.
 * A timed segment has nothing to go back into, so it restarts and the clock rewinds to its start.
 */
export function back(r: RaceRun, now: number, restart = false): void {
  if (!r.splits.length) return;
  r.splits.pop();
  r.i--;
  if (restart) r.paused += segElapsed(r, now) * 1000;
}

export function bestTime(log: Entry[], ev: string, lvl: number): number | undefined {
  const t = log.filter((e) => e.kind === 'race' && e.data.ev === ev && e.data.lvl === lvl).map((e) => e.dur);
  return t.length ? Math.min(...t) : undefined;
}
