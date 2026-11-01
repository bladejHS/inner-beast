// "Progression is mandatory": what to do next time, streaks, weekly completion and totals.

import type { Exercise } from '../data/workouts.ts';
import { BW_SCHEMES, EMOM_GOAL } from '../data/workouts.ts';
import type { Day } from '../data/plan.ts';
import type { Entry, Habit, SetLog } from './store.ts';
import { addDays, daysBetween, inWeek, weekStart } from './util.ts';

export interface LastEx {
  log: SetLog;
  lvl: number;
  date: string;
  ts?: number;
}

/** Most recent logged session of an exercise (optionally before a timestamp). Lighter weeks don't count. */
export function lastExercise(log: Entry[], exId: string, beforeTs = Infinity): LastEx | undefined {
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    if (e.kind !== 'workout' || e.ts >= beforeTs || e.data.deload) continue;
    const list = (e.data.ex as Array<SetLog & { lvl?: number }>) || [];
    const hit = list.find((x) => x.id === exId && x.sets.some((v) => v !== null && v > 0));
    if (hit) return { log: hit, lvl: hit.lvl ?? 0, date: e.date, ts: e.ts };
  }
  return undefined;
}

export interface Advice {
  kind: 'first' | 'up' | 'stay' | 'down' | 'top';
  text: string;
  lvl?: number;
  /** Weight to use next time. */
  kg?: number;
}

const KG_STEP = 2.5;
const EMOM_START_REPS = 3;
const kgStr = (kg: number): string => String(kg).replace('.', ',');

/** Added weight is noted on the hardest variation, where more reps stop being the way up. */
export function loadable(ex: Exercise, lvl: number): boolean {
  return (ex.type === 'reps' || ex.type === 'emom') && ex.vars.length > 1 && lvl === ex.vars.length - 1;
}

/** `prev` is the session before `last`: a fixed target (4 × 15) has to be met twice before moving up. */
export function advise(ex: Exercise, last: LastEx | undefined, lvl: number, prev?: LastEx): Advice {
  if (ex.type === 'emom') return { kind: 'stay', text: '' };
  if (!last) {
    if (ex.type === 'max') return { kind: 'first', text: 'Prima dată: dă tot ce poți și notează.' };
    if (ex.type === 'ytw') return { kind: 'first', text: 'Prima dată: mișcări lente, cu greutate mică sau deloc.' };
    const unit = ex.type === 'time' ? ' de secunde' : ' repetări';
    return { kind: 'first', text: `Prima dată: alege varianta la care faci cel puțin ${ex.lo}${unit} curate.` };
  }
  const done = last.log.sets.filter((v): v is number => v !== null && v > 0);
  const sameVar = last.lvl === lvl;
  if (ex.type === 'max') {
    const unit = ex.id === 'hang' ? ' s' : '';
    if (!sameVar) return { kind: 'stay', text: 'Variantă nouă: dă tot ce poți și notează.' };
    const best = Math.max(0, ...done);
    if (ex.hi && lvl < ex.vars.length - 1 && done.length >= ex.sets && done.every((v) => v >= ex.hi!)) return { kind: 'up', lvl: lvl + 1, text: `Ai atins ${ex.hi}${unit} la toate seriile. Treci la ${ex.vars[lvl + 1]}.` };
    return { kind: 'stay', text: `Data trecută: ${best}${unit}. Bate-l.` };
  }
  if (ex.type === 'ytw') {
    if (sameVar && done.length >= ex.sets && lvl < ex.vars.length - 1) return { kind: 'up', lvl: lvl + 1, text: `Ai terminat toate seriile. Treci la ${ex.vars[lvl + 1]}.` };
    return { kind: 'stay', text: 'Termină toate cele 4 serii, controlat.' };
  }
  const lo = ex.lo ?? 1;
  const hi = ex.hi ?? lo;
  if (!sameVar) return { kind: 'stay', text: `Variantă nouă: țintește ${lo}–${hi}${ex.type === 'time' ? ' s' : ''} pe serie.` };
  const atTop = (l: LastEx): boolean => {
    const v = l.log.sets.filter((x): x is number => x !== null && x > 0);
    return v.length >= ex.sets && v.every((x) => x >= hi);
  };
  if (atTop(last)) {
    if (lvl < ex.vars.length - 1) {
      if (lo === hi && !(prev && prev.lvl === lvl && atTop(prev))) return { kind: 'stay', text: `Ai făcut ${ex.sets} × ${hi}. Încă o sesiune completă și treci la ${ex.vars[lvl + 1]}.` };
      return { kind: 'up', lvl: lvl + 1, text: `Ai atins ${hi} la toate seriile. Treci la ${ex.vars[lvl + 1]}.` };
    }
    const kg = last.log.kg;
    if (kg) return { kind: 'top', kg: kg + KG_STEP, text: `Ai atins ${hi} la toate seriile cu ${kgStr(kg)} kg. Mergi pe ${kgStr(kg + KG_STEP)} kg.` };
    return { kind: 'top', text: 'Ești la varianta cea mai grea: adaugă greutate și noteaz-o, sau încetinește coborârea.' };
  }
  const under = done.filter((v) => v < lo).length;
  if (lvl > 0 && done.length > 0 && under * 2 >= Math.max(done.length, ex.sets)) {
    return { kind: 'down', lvl: lvl - 1, text: `Ai fost sub ${lo} la majoritatea seriilor. Poți reveni la ${ex.vars[lvl - 1]}.` };
  }
  return { kind: 'stay', text: 'Bate data trecută: o repetare în plus la cel puțin o serie.' };
}

/** Next EMOM target. Success adds a rep up to 10, then two minutes up to Alex's 30 × 10. */
export function emomNext(cur: { min: number; reps: number }, minutesDone: number): { min: number; reps: number } {
  if (minutesDone < cur.min) return { ...cur };
  if (cur.reps < EMOM_GOAL.reps) return { min: cur.min, reps: cur.reps + 1 };
  return { min: Math.min(EMOM_GOAL.min, cur.min + 2), reps: cur.reps };
}

/** What the EMOM history asks for today. Only a proposal: `S.emom` doesn't change until the user takes it. */
export function emomAdvice(log: Entry[], cur: { min: number; reps: number }, lvl: number, vars: string[]): { text: string; reps?: number; lvl?: number } | null {
  const runs: Array<{ min: number; reps: number; done: number; lvl: number }> = [];
  for (const e of log) {
    if (e.kind !== 'workout' || e.data.deload) continue;
    const hit = ((e.data.ex as Array<SetLog & { lvl?: number }>) || []).find((x) => x.emom);
    if (hit?.emom) runs.push({ ...hit.emom, lvl: hit.lvl ?? 0 });
  }
  const last = runs[runs.length - 1];
  if (!last) return null;
  if (lvl > last.lvl) {
    const reps = Math.max(EMOM_START_REPS, Math.ceil(cur.reps / 2));
    return reps < cur.reps ? { text: `Variantă mai grea: propun ${cur.min} × ${reps}, apoi urci din nou.`, reps } : null;
  }
  const before = runs[runs.length - 2];
  const missed = (r: typeof last): boolean => r.done < r.min && r.min === cur.min && r.reps === cur.reps;
  if (before && missed(last) && missed(before) && cur.reps > 1) return { text: `Ai ratat de două ori ${cur.min} × ${cur.reps}. Propun ${cur.min} × ${cur.reps - 1}, apoi urci din nou.`, reps: cur.reps - 1 };
  if (cur.min >= EMOM_GOAL.min && cur.reps >= EMOM_GOAL.reps && lvl < vars.length - 1) return { text: `Ai ajuns la ${EMOM_GOAL.min} × ${EMOM_GOAL.reps}. Treci la ${vars[lvl + 1]}.`, lvl: lvl + 1 };
  return null;
}

/** Three sessions in a row that didn't beat the one before them, at the same variation and weight. */
export function stalled(log: Entry[], exId: string, lvl: number, kg = 0): boolean {
  const t = exerciseTrend(log, exId, 100).filter((x) => x.lvl === lvl && x.kg === kg);
  if (t.length < 4) return false;
  const [base, ...rest] = t.slice(-4);
  return rest.every((x) => x.total <= base.total);
}

export const STALL_TEXT = 'Fără progres la ultimele 3 sesiuni. Schimbă ceva azi: 30 s de pauză în plus, coborâre în 3 secunde sau o sesiune pe varianta precedentă.';

/** When each variation of an exercise was first used, in order. */
export function variationPath(log: Entry[], exId: string): Array<{ lvl: number; date: string }> {
  const out: Array<{ lvl: number; date: string }> = [];
  for (const t of exerciseTrend(log, exId, Infinity)) if (out[out.length - 1]?.lvl !== t.lvl) out.push({ lvl: t.lvl, date: t.date });
  return out;
}

const amrapRuns = (log: Entry[], scheme: number): Entry[] => log.filter((e) => e.kind === 'amrap' && (Number(e.data.scheme) || 0) === scheme);
const amrapScore = (e: Entry): number => (Number(e.data.rounds) || 0) * 1000 + (Number(e.data.extra) || 0);

/** Best result at one scheme: results at different schemes can't be compared. */
export function amrapBest(log: Entry[], scheme: number): Entry | undefined {
  return amrapRuns(log, scheme).reduce<Entry | undefined>((b, e) => (!b || amrapScore(e) > amrapScore(b) ? e : b), undefined);
}

export function amrapTrend(log: Entry[], scheme: number): number[] {
  return amrapRuns(log, scheme).map((e) => Number(e.data.rounds) || 0).slice(-12);
}

/** The next scheme, once this one has been beaten twice in a row. */
export function amrapUp(log: Entry[], scheme: number): number | null {
  const up = BW_SCHEMES[scheme]?.up;
  const runs = amrapRuns(log, scheme).slice(-2);
  return up && runs.length === 2 && runs.every((e) => (Number(e.data.rounds) || 0) >= up) ? scheme + 1 : null;
}

export const DELOAD_WEEKS = 6;
/** Sessions kept in a lighter week: rounds, sets, EMOM minutes and jogging time. */
export const lighter = (n: number): number => Math.ceil((n * 2) / 3);

export const deloadOn = (d: { week: string }, today: string): boolean => d.week === weekStart(today);

/** Six weeks of real work (at least 3 active days a week) since the last lighter week. */
export function deloadDue(log: Entry[], d: { last: string; week: string }, today: string): boolean {
  const mon = weekStart(today);
  const base = d.last || (log[0] ? weekStart(log[0].date) : '');
  if (!base || d.week === mon || daysBetween(base, mon) < DELOAD_WEEKS * 7) return false;
  const from = addDays(mon, -DELOAD_WEEKS * 7);
  return new Set(log.filter((e) => e.date >= from && e.date < mon).map((e) => e.date)).size >= DELOAD_WEEKS * 3;
}

/** Block ids logged during the week that starts on `monday`. */
export function weekDone(log: Entry[], monday: string): Set<string> {
  const s = new Set<string>();
  for (const e of log) if (e.block && inWeek(e.date, monday)) s.add(e.block);
  return s;
}

export function dayComplete(day: Day, done: Set<string>): boolean {
  return day.blocks.every((b) => done.has(b.id));
}

export function dayProgress(day: Day, done: Set<string>): number {
  return day.blocks.filter((b) => done.has(b.id)).length;
}

/** Consecutive days with at least one logged activity, ending today (or yesterday if today is still empty). */
export function activeStreak(log: Entry[], today: string): number {
  const days = new Set(log.map((e) => e.date));
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function habitDone(h: Habit, day: string): boolean {
  return (h.days[day] ?? 0) >= (h.type === 'check' ? 1 : h.goal);
}

export function habitStreak(h: Habit, today: string): number {
  let d = habitDone(h, today) ? today : addDays(today, -1);
  let n = 0;
  while (habitDone(h, d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** The milestone the streak reached (7/14/21/28) or 0. */
export function habitMilestone(streak: number): number {
  return [28, 21, 14, 7].find((m) => streak >= m) ?? 0;
}

export interface Totals {
  sessions: number;
  boxingMin: number;
  runKm: number;
  coldMin: number;
  breathMin: number;
  bestHold: number;
}

export function totals(log: Entry[]): Totals {
  const t: Totals = { sessions: log.length, boxingMin: 0, runKm: 0, coldMin: 0, breathMin: 0, bestHold: 0 };
  for (const e of log) {
    const d = e.data as Record<string, number | number[]>;
    if (e.kind === 'rounds') t.boxingMin += (Number(d.workDone) || 0) / 60;
    if (e.kind === 'run') t.runKm += (Number(d.m) || 0) / 1000;
    if (e.kind === 'shower') t.coldMin += (Number(d.coldSec) || 0) / 60;
    if (e.kind === 'wimhof' || e.kind === 'breath') t.breathMin += e.dur / 60;
    if (e.kind === 'wimhof' && Array.isArray(d.holds)) t.bestHold = Math.max(t.bestHold, ...d.holds);
  }
  return t;
}

/** Values of one exercise over time (best set per session, same variation index as given). */
export function exerciseTrend(log: Entry[], exId: string, limit = 10): Array<{ date: string; best: number; total: number; lvl: number; kg: number }> {
  const out: Array<{ date: string; best: number; total: number; lvl: number; kg: number }> = [];
  for (const e of log) {
    if (e.kind !== 'workout' || e.data.deload) continue;
    const hit = ((e.data.ex as Array<SetLog & { lvl?: number }>) || []).find((x) => x.id === exId);
    if (!hit) continue;
    const vals = hit.sets.filter((v): v is number => v !== null && v > 0);
    if (!vals.length) continue;
    out.push({ date: e.date, best: Math.max(...vals), total: vals.reduce((a, b) => a + b, 0), lvl: hit.lvl ?? 0, kg: hit.kg ?? 0 });
  }
  return limit === Infinity ? out : out.slice(-limit);
}
