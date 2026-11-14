// Boxing statistics from the saved rounds and camera sessions.

import { addDays, clamp, daysBetween } from './util.ts';
import type { Entry } from './store.ts';

export interface BoxStats {
  rounds: number;
  min30: number;
  minPrev30: number;
  bagMin: number;
  shadowMin: number;
  punches: number;
  /** Guard % of the last camera sessions, oldest first. */
  guard: number[];
  called: Record<string, number>;
}

const isBox = (e: Entry): boolean => e.kind === 'rounds' && !e.data.manual && !['rope', 'ladder', 'plate', 'legs'].includes(String(e.data.focus));

/**
 * 0–100 for a rated session: rounds finished × how clean it felt (60%) and how easy the same work was (40%).
 * `q` and `rpe` go from 1 to 5.
 */
export function boxScore(d: Record<string, unknown>): number | undefined {
  const q = Number(d.q);
  const rpe = Number(d.rpe);
  if (!q || !rpe) return undefined;
  const done = clamp((Number(d.rounds) || 0) / (Number(d.planned) || 1), 0, 1);
  return Math.round(100 * done * (0.6 * (q / 5) + 0.4 * ((6 - rpe) / 5)));
}

const avg = (v: number[]): number => Math.round(v.reduce((a, b) => a + b, 0) / v.length);

export interface BoxCycle {
  /** Week of the 8-week cycle. */
  week: number;
  /** Next checkpoint: week 4 or week 8. */
  check: number;
  base: number;
  target: number;
  /** Average of the last 14 days, null without rated sessions. */
  now: number | null;
  scores: number[];
}

/** Eight-week cycles from the first rated session: +5 by week 4, +10 by week 8, measured from the first sessions. */
export function boxCycle(log: Entry[], today: string): BoxCycle | null {
  const rated = log.filter(isBox).map((e) => ({ date: e.date, s: boxScore(e.data) })).filter((x): x is { date: string; s: number } => x.s !== undefined);
  if (rated.length < 3) return null;
  const days = daysBetween(rated[0].date, today);
  const start = addDays(rated[0].date, Math.floor(days / 56) * 56);
  const inCycle = rated.filter((x) => x.date >= start).map((x) => x.s);
  const before = rated.filter((x) => x.date < start).map((x) => x.s);
  const base = avg(inCycle.length >= 3 || !before.length ? inCycle.slice(0, 3) : before.slice(-3));
  const week = Math.floor((days % 56) / 7) + 1;
  const check = week <= 4 ? 4 : 8;
  const recent = rated.filter((x) => x.date >= addDays(today, -13)).map((x) => x.s);
  return { week, check, base, target: Math.min(100, base + (check === 4 ? 5 : 10)), now: recent.length ? avg(recent) : null, scores: rated.map((x) => x.s).slice(-12) };
}

export function boxStats(log: Entry[], today: string): BoxStats {
  const from = addDays(today, -29);
  const prev = addDays(today, -59);
  const s: BoxStats = { rounds: 0, min30: 0, minPrev30: 0, bagMin: 0, shadowMin: 0, punches: 0, guard: [], called: {} };
  for (const e of log) {
    const d = e.data;
    if (e.kind === 'coach' && d.mode === 'box') {
      s.punches += Number(d.punches) || 0;
      s.guard.push(Number(d.guard) || 0);
    }
    if (e.kind !== 'rounds' || d.manual || d.focus === 'rope' || d.focus === 'ladder' || d.focus === 'plate' || d.focus === 'legs') continue;
    const min = (Number(d.workDone) || 0) / 60;
    s.rounds += Number(d.rounds) || 0;
    if (e.date >= from) s.min30 += min;
    else if (e.date >= prev) s.minPrev30 += min;
    if (/bag/i.test(e.name)) s.bagMin += min;
    else if (/shadow/i.test(e.name)) s.shadowMin += min;
    for (const [k, v] of Object.entries((d.called as Record<string, number>) ?? {})) s.called[k] = (s.called[k] ?? 0) + v;
  }
  s.guard = s.guard.slice(-12);
  return s;
}
