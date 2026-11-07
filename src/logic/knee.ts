// The knees decide when the jumps come back (user, 2026-11-07: jumps hurt the knees at the current body weight).
// After each Leg Day the user notes the pain during the session and the next morning, on four steps (0, 2, 4, 6 of 10).
// The rule follows the pain-monitoring model of tendon rehab: under 3 of 10 during and the next morning is a clean day;
// 5 or more means a step back. Box Jump after 3 clean Leg Days in a row on the throws; Countermovement Jump and
// Broad Jump after 3 more clean Leg Days with Box Jump.

import type { Advice } from './progress.ts';
import type { Entry } from './store.ts';
import { daysBetween } from './util.ts';

export interface KneeDay {
  d?: number;
  m?: number;
}

/** The four answers, as values out of 10. */
export const KNEE_STEPS: Array<[number, string]> = [
  [0, 'Deloc'],
  [2, 'Puțin'],
  [4, 'Deranjează'],
  [6, 'Doare'],
];
/** Under this, a day is clean. */
export const KNEE_OK = 3;
/** From this on, the jumps step back. */
export const KNEE_BAD = 5;
/** Clean Leg Days in a row before each step. */
export const KNEE_RUN = 3;

export interface LegDay {
  date: string;
  /** Variation used on the lower-body power slot (0 throws, 1 Box Jump, 2 CMJ). */
  cmj: number;
  d?: number;
  m?: number;
}

/** Leg Day sessions, newest first, one per date, with the knee notes of that date. */
export function legDays(log: Entry[], knee: Record<string, KneeDay>): LegDay[] {
  const seen = new Set<string>();
  const out: LegDay[] = [];
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    if (e.kind !== 'workout' || e.data.wid !== 'legs' || e.data.deload || seen.has(e.date)) continue;
    seen.add(e.date);
    const ex = (e.data.ex as Array<{ id: string; lvl: number }> | undefined) ?? [];
    const k = knee[e.date] ?? {};
    out.push({ date: e.date, cmj: ex.find((x) => x.id === 'cmj')?.lvl ?? 0, d: k.d, m: k.m });
  }
  return out;
}

/** No pain worth the name during the session, nor the next morning (when that was noted). */
export const kneeClean = (l: LegDay): boolean => l.d !== undefined && l.d < KNEE_OK && (l.m === undefined || l.m < KNEE_OK);
export const kneeBad = (l: LegDay): boolean => (l.d ?? 0) >= KNEE_BAD || (l.m ?? 0) >= KNEE_BAD;

/** Clean Leg Days in a row, newest first; `jump`: how many of them already had Box Jump or more. */
export function kneeStreak(days: LegDay[]): { clean: number; jump: number } {
  let clean = 0;
  let jump = 0;
  for (const l of days) {
    if (!kneeClean(l)) break;
    clean++;
    if (l.cmj >= 1) jump++;
  }
  return { clean, jump };
}

/** What the knees allow on the two power slots of Leg Day; null for every other exercise. */
export function kneeAdvice(exId: string, lvl: number, days: LegDay[]): Advice | null {
  if (exId !== 'cmj' && exId !== 'broad') return null;
  const last = days[0];
  if (last && kneeBad(last) && lvl > 0) {
    return { kind: 'down', lvl: 0, text: 'La ultimul Leg Day genunchii au durut (5 din 10 sau mai mult). Revii la aruncări până trece. Dacă durerea nu trece în câteva zile, mergi la un medic.' };
  }
  if (!days.some((l) => l.d !== undefined)) {
    return { kind: 'stay', text: 'La final notezi cât te-au durut genunchii: așa știe aplicația când pot reveni săriturile.' };
  }
  const { clean, jump } = kneeStreak(days);
  if (exId === 'cmj') {
    if (lvl === 0) {
      if (clean >= KNEE_RUN) return { kind: 'up', lvl: 1, text: `${KNEE_RUN} Leg Day-uri la rând fără durere de genunchi. Poți încerca Box Jump: aterizezi pe cutie și cobori pe jos, nu sari înapoi.` };
      return { kind: 'stay', text: `Box Jump revine după ${KNEE_RUN} Leg Day-uri la rând fără durere de genunchi (sub 3 din 10, și a doua zi). Acum: ${clean} din ${KNEE_RUN}.` };
    }
    if (lvl === 1) {
      if (jump >= KNEE_RUN) return { kind: 'up', lvl: 2, text: `Box Jump fără durere ${KNEE_RUN} Leg Day-uri la rând. Poți trece la Countermovement Jump, cu aterizare moale.` };
      return { kind: 'stay', text: `Box Jump: ${jump} din ${KNEE_RUN} Leg Day-uri la rând fără durere. Apoi vine Countermovement Jump.` };
    }
    return null;
  }
  if (lvl === 0) {
    if (jump >= KNEE_RUN) return { kind: 'up', lvl: 1, text: `Genunchii au ținut la Box Jump ${KNEE_RUN} Leg Day-uri la rând. Poți încerca Broad Jump: aterizezi moale, pe toată talpa.` };
    return { kind: 'stay', text: 'Broad Jump revine odată cu Countermovement Jump, când genunchii țin la Box Jump trei Leg Day-uri la rând.' };
  }
  return null;
}

/** The note still missing on Azi: today's session, or the morning after a Leg Day of the last two days. */
export function kneeAsk(days: LegDay[], today: string): { date: string; field: 'd' | 'm' } | null {
  const l = days[0];
  if (!l) return null;
  const ago = daysBetween(l.date, today);
  if (ago === 0) return l.d === undefined ? { date: l.date, field: 'd' } : null;
  if (ago > 2) return null;
  if (l.d === undefined) return { date: l.date, field: 'd' };
  return l.m === undefined ? { date: l.date, field: 'm' } : null;
}
