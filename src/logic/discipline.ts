// Discipline Challenges: No Fap (a streak since the last reset) and Dopamine Discipline
// (a daily checklist of rules; a day counts when every rule is kept).

import { addDays, daysBetween } from './util.ts';

export interface NoFap {
  /** Day the current streak started; null = not started. */
  start: string | null;
  best: number;
  /** Days a streak was reset. */
  resets: string[];
}

export interface Dopa {
  started: string | null;
  /** Rules kept, by day. */
  days: Record<string, string[]>;
}

export interface Discipline {
  nofap: NoFap;
  dopa: Dopa;
}

export const DOPA_RULES: Array<{ id: string; t: string }> = [
  { id: 'social', t: 'Fără scroll pe social media' },
  { id: 'porn', t: 'Fără conținut porno' },
  { id: 'junk', t: 'Fără zahăr și junk food' },
  { id: 'games', t: 'Fără jocuri video și seriale pe bandă' },
  { id: 'phone', t: 'Telefonul nu în prima oră după trezire' },
  { id: 'cold', t: 'Duș rece' },
  { id: 'quiet', t: '10 minute de liniște, fără ecran' },
];

export const MILESTONES = [7, 14, 30, 60, 90, 180, 365];

export function freshDiscipline(): Discipline {
  return { nofap: { start: null, best: 0, resets: [] }, dopa: { started: null, days: {} } };
}

/** Full days clean since the start (the start day itself is day 0). */
export function nofapDays(n: NoFap, today: string): number {
  return n.start ? Math.max(0, daysBetween(n.start, today)) : 0;
}

export function nextMilestone(days: number): number {
  return MILESTONES.find((m) => m > days) ?? days + 30;
}

export function dopaClean(d: Dopa, day: string): boolean {
  const kept = d.days[day] ?? [];
  return DOPA_RULES.every((r) => kept.includes(r.id));
}

/** Clean days in a row, ending today (or yesterday while today isn't finished yet). */
export function dopaStreak(d: Dopa, today: string): number {
  let k = dopaClean(d, today) ? today : addDays(today, -1);
  let n = 0;
  while (dopaClean(d, k)) {
    n++;
    k = addDays(k, -1);
  }
  return n;
}

export function dopaBest(d: Dopa): number {
  const clean = Object.keys(d.days).filter((k) => dopaClean(d, k)).sort();
  let best = 0;
  let run = 0;
  let prev = '';
  for (const k of clean) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}
