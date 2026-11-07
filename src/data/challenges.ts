// 30-day challenges built on what the plan already logs: a day counts by itself when the session is saved.

import { addDays } from '../logic/util.ts';
import type { Entry } from '../logic/store.ts';

export interface Challenge {
  id: string;
  name: string;
  sub: string;
  hit(e: Entry): boolean;
}

export const CHALLENGES: Challenge[] = [
  { id: 'box', name: '30 Days of Rounds', sub: 'O sesiune de runde pe zi; în zilele ușoare ajung 10 minute de shadow lent', hit: (e) => e.kind === 'rounds' },
  { id: 'mob', name: '30 Days of Mobility', sub: 'O rutină în fiecare zi', hit: (e) => e.kind === 'routine' },
  { id: 'cold', name: '30 Cold Showers', sub: 'Duș alternativ zilnic', hit: (e) => e.kind === 'shower' },
  { id: 'breath', name: '30 Days of Breath', sub: 'Wim Hof sau 4-7-8 zilnic', hit: (e) => e.kind === 'wimhof' || e.kind === 'breath' },
  { id: 'plan', name: '30 Days On Plan', sub: 'Un bloc din plan bifat în fiecare zi', hit: (e) => !!e.block },
];

export const CHALLENGE_DAYS = 30;

/** Which of the 30 days counted, in order. */
export function challengeDays(c: Challenge, start: string, log: Entry[]): boolean[] {
  const hits = new Set(log.filter(c.hit).map((e) => e.date));
  return Array.from({ length: CHALLENGE_DAYS }, (_, i) => hits.has(addDays(start, i)));
}
