// Boxing statistics from the saved rounds and camera sessions.

import { addDays } from './util.ts';
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
    if (e.kind !== 'rounds' || d.manual || d.focus === 'rope' || d.focus === 'ladder' || d.focus === 'legs') continue;
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
