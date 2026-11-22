/* What happened in a 12-week loop, read from the log (2026-11-22).

   Until now the loop wrapped: `cycleAt` takes the week modulo twelve, so the Monday after week 12 started chapter A
   again with the same ladders — Threshold back at 4×6′, the long run back at 60 minutes, everything that had been
   earned over three months quietly reset. This file is the first half of the fix: it reads the loop that just ended
   and says, with numbers, what actually happened. The second half (nextblock.ts) decides what the next loop asks for.

   Nothing here judges or advises. It counts: how many of the planned sessions were done, how far each ladder got,
   what the long run reached, which records were set, which exercises stopped moving. A plan built on anything else
   would be a plan built on hope. */
import { CYCLE_WEEKS, CYCLES, allRecords, fullSessions, loopWeek, stalled, type Rec } from './progress.ts';
import type { Entry } from './store.ts';
import { addDays, daysBetween, inWeek, weekStart } from './util.ts';

/** Weeks in one whole loop: three emphases of four weeks. */
export const LOOP_WEEKS = CYCLE_WEEKS * CYCLES.length;

/** The blocks a full week asks for; the ones a loop is measured by. */
export const KEY_BLOCKS = ['mon-run', 'mon-upper', 'tue-thr', 'wed-upper', 'wed-cond', 'thu-run', 'thu-lower', 'fri-upper', 'sat-long'];

export interface LoopReview {
  /** 1 for the first loop, 2 for the one after it. */
  loop: number;
  /** The Mondays the loop ran between, the second one exclusive. */
  from: string;
  to: string;
  /** Weeks of the loop that have a Monday in the past. */
  weeksDone: number;
  /** Sessions of KEY_BLOCKS logged, and how many the loop asked for. */
  done: number;
  planned: number;
  /** 0–1. */
  rate: number;
  /** Weeks with nothing logged at all. */
  blankWeeks: number;
  /** Threshold sessions that counted (the ladder's step), and the long run's best minutes. */
  thrSessions: number;
  longBest: number;
  easyBest: number;
  /** Records set inside the loop, newest first. */
  records: Rec[];
  /** Exercise ids that stopped moving by the end. */
  stalls: string[];
  /** True once the last week of the loop is behind us. */
  finished: boolean;
}

/** Which loop `today` falls in, 1-based; 0 before the first one starts. */
export function loopIndex(start: string, today: string, repeats: string[] = []): number {
  const w = loopWeek(start, today, repeats);
  return w < 0 ? 0 : Math.floor(w / LOOP_WEEKS) + 1;
}

/** The Mondays loop `n` (1-based) runs between; `to` is the Monday after its last week. */
export function loopRange(start: string, n: number, repeats: string[] = []): { from: string; to: string } {
  const extra = (mon: string) => repeats.filter((r) => r > start && r <= mon).length;
  // the loop is counted in trained weeks, so a repeated week pushes the end out by one
  let from = addDays(start, (n - 1) * LOOP_WEEKS * 7);
  from = addDays(from, extra(from) * 7);
  let to = addDays(start, n * LOOP_WEEKS * 7);
  to = addDays(to, extra(to) * 7);
  return { from, to };
}

const minutesOf = (e: Entry): number => {
  const d = e.data as { minutes?: number; min?: number };
  return Number(d.minutes ?? d.min ?? e.dur ?? 0);
};

/** Everything the loop did, as numbers. `today` decides how much of it has already happened. */
export function reviewLoop(log: Entry[], start: string, today: string, n?: number, repeats: string[] = []): LoopReview | null {
  if (!start) return null;
  const loop = n ?? loopIndex(start, today, repeats);
  if (loop < 1) return null;
  const { from, to } = loopRange(start, loop, repeats);
  const mine = log.filter((e) => e.date >= from && e.date < to && e.date <= today);
  const weeksDone = Math.max(0, Math.min(LOOP_WEEKS, Math.floor(daysBetween(from, weekStart(today)) / 7) + (today >= to ? 0 : 1)));
  const full = weeksDone;
  const done = mine.filter((e) => e.block && KEY_BLOCKS.includes(e.block)).length;
  // the lighter fourth week of every emphasis still asks for its sessions, so the count is flat
  const planned = full * KEY_BLOCKS.length;
  let blankWeeks = 0;
  for (let i = 0; i < full; i++) {
    const mon = addDays(from, i * 7);
    if (!mine.some((e) => inWeek(e.date, mon))) blankWeeks++;
  }
  const runs = (id: string) => mine.filter((e) => e.block === id).map(minutesOf).filter((v) => v > 0);
  const longBest = Math.max(0, ...runs('sat-long'));
  const easyBest = Math.max(0, ...runs('mon-run'), ...runs('thu-run'));
  const recs = allRecords(log).filter((r) => r.date >= from && r.date < to && r.date <= today);
  const ids = [...new Set(recs.map((r) => r.id))];
  const stalls = ids.filter((id) => stalled(log, id, recs.find((r) => r.id === id)!.lvl));
  return {
    loop, from, to, weeksDone: full,
    done, planned,
    rate: planned ? Math.round((done / planned) * 100) / 100 : 0,
    blankWeeks,
    thrSessions: fullSessions(mine, 'tue-thr'),
    longBest, easyBest,
    records: recs,
    stalls,
    finished: today >= to,
  };
}

/** True in the last week of a loop: the moment to show what comes next. */
export function loopEnding(start: string, today: string, repeats: string[] = []): boolean {
  const w = loopWeek(start, today, repeats);
  return w >= 0 && (w % LOOP_WEEKS) === LOOP_WEEKS - 1;
}
