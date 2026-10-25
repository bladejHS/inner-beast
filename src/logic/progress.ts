// "Progression is mandatory": what to do next time, streaks, weekly completion and totals.

import type { Exercise } from '../data/workouts.ts';
import { EMOM_GOAL } from '../data/workouts.ts';
import type { Day } from '../data/plan.ts';
import type { Entry, Habit, SetLog } from './store.ts';
import { addDays, inWeek } from './util.ts';

export interface LastEx {
  log: SetLog;
  lvl: number;
  date: string;
}

/** Most recent logged session of an exercise (optionally before a timestamp). */
export function lastExercise(log: Entry[], exId: string, beforeTs = Infinity): LastEx | undefined {
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    if (e.kind !== 'workout' || e.ts >= beforeTs) continue;
    const list = (e.data.ex as Array<SetLog & { lvl?: number }>) || [];
    const hit = list.find((x) => x.id === exId && x.sets.some((v) => v !== null && v > 0));
    if (hit) return { log: hit, lvl: hit.lvl ?? 0, date: e.date };
  }
  return undefined;
}

export interface Advice {
  kind: 'first' | 'up' | 'stay' | 'down' | 'top';
  text: string;
  lvl?: number;
}

export function advise(ex: Exercise, last: LastEx | undefined, lvl: number): Advice {
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
    const best = Math.max(0, ...done);
    return { kind: 'stay', text: `Data trecută: ${best}${ex.id === 'hang' ? ' s' : ''}. Bate-l.` };
  }
  if (ex.type === 'ytw') {
    if (sameVar && done.length >= ex.sets && lvl < ex.vars.length - 1) return { kind: 'up', lvl: lvl + 1, text: `Ai terminat toate seriile. Treci la ${ex.vars[lvl + 1]}.` };
    return { kind: 'stay', text: 'Termină toate cele 4 serii, controlat.' };
  }
  const lo = ex.lo ?? 1;
  const hi = ex.hi ?? lo;
  if (!sameVar) return { kind: 'stay', text: `Variantă nouă: țintește ${lo}–${hi}${ex.type === 'time' ? ' s' : ''} pe serie.` };
  const allTop = done.length >= ex.sets && done.every((v) => v >= hi);
  if (allTop) {
    if (lvl < ex.vars.length - 1) return { kind: 'up', lvl: lvl + 1, text: `Ai atins ${hi} la toate seriile. Treci la ${ex.vars[lvl + 1]}.` };
    return { kind: 'top', text: 'Ești la varianta cea mai grea: adaugă greutate (un rucsac) sau încetinește coborârea.' };
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
export function exerciseTrend(log: Entry[], exId: string, limit = 10): Array<{ date: string; best: number; total: number; lvl: number }> {
  const out: Array<{ date: string; best: number; total: number; lvl: number }> = [];
  for (const e of log) {
    if (e.kind !== 'workout') continue;
    const hit = ((e.data.ex as Array<SetLog & { lvl?: number }>) || []).find((x) => x.id === exId);
    if (!hit) continue;
    const vals = hit.sets.filter((v): v is number => v !== null && v > 0);
    if (!vals.length) continue;
    out.push({ date: e.date, best: Math.max(...vals), total: vals.reduce((a, b) => a + b, 0), lvl: hit.lvl ?? 0 });
  }
  return out.slice(-limit);
}
