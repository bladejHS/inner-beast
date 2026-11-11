// Autoregulation: how ready the body is today, and how much training the week has carried.
// Readiness is a ten-second self-report (last night's sleep, energy, muscle freshness): self-reported measures followed
// training load more sensitively and consistently than blood markers or heart-rate measures in 56 studies (Saw, Main &
// Gastin 2016). Training adjusted to the day gave more strength than a fixed plan (Zhang 2021, 8 studies; Huang 2025).
// Load is session-RPE: minutes × effort on a 0–10 scale (Foster 2001; reliable in boxing and Muay Thai). The week is
// compared with the user's own usual week; that ratio is a guide for planning, not an injury predictor (Impellizzeri 2020).

import { blockById } from '../data/plan.ts';
import type { Entry, Kind } from './store.ts';
import { addDays, daysBetween, weekStart } from './util.ts';

/** Energy and muscle freshness, each 1–5 (1 = drained / very sore, 5 = full of energy / fresh). */
export interface ReadyNote {
  e?: number;
  f?: number;
}

export type ReadyLevel = 'go' | 'hold' | 'easy';

export interface Ready {
  level: ReadyLevel;
  /** 0–100, for the eye; the level comes from the rules below, not from this number. */
  score: number;
  /** What pulled it down, in Romanian, ready to print. */
  why: string[];
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const h = (v: number): string => String(Math.round(v * 10) / 10).replace('.', ',');

/** `sleep`: last night in hours; `avg3`: the mean of the last three noted nights (when at least two were noted). */
export function readiness(note: ReadyNote, sleep?: number, avg3?: number): Ready | null {
  if (!note.e || !note.f) return null;
  const hard: string[] = [];
  const soft: string[] = [];
  if (sleep !== undefined) {
    if (sleep < 5) hard.push(`ai dormit ${h(sleep)} h`);
    else if (sleep < 6.5) soft.push(`ai dormit ${h(sleep)} h`);
  }
  if (avg3 !== undefined && avg3 < 6.5 && !(sleep !== undefined && sleep < 6.5)) soft.push(`media ultimelor nopți e ${h(avg3)} h`);
  if (note.e <= 1) hard.push('energia e la pământ');
  else if (note.e === 2) soft.push('energia e scăzută');
  if (note.f <= 1) hard.push('mușchii sunt foarte febrili');
  else if (note.f === 2) soft.push('mușchii sunt încă febrili');
  const level: ReadyLevel = hard.length || soft.length >= 2 ? 'easy' : soft.length ? 'hold' : 'go';
  const parts = [(note.e - 1) / 4, (note.f - 1) / 4];
  const score = sleep === undefined ? (parts[0] + parts[1]) / 2 : 0.4 * clamp01((sleep - 4) / 4) + 0.3 * parts[0] + 0.3 * parts[1];
  return { level, score: Math.round(score * 100), why: [...hard, ...soft] };
}

/** The mean of the last three noted nights up to `today`, when at least two of them were noted. */
export function sleepAvg3(sleep: Record<string, number>, today: string): number | undefined {
  const v = [0, 1, 2].map((i) => sleep[addDays(today, -i)]).filter((x): x is number => typeof x === 'number' && x > 0);
  return v.length >= 2 ? v.reduce((a, b) => a + b, 0) / v.length : undefined;
}

// ---------- training load ----------

/** Effort on the 0–10 scale when the session was not rated: what that kind of work usually costs. */
const USUAL: Partial<Record<Kind, number>> = { rounds: 6, amrap: 8, workout: 6, row: 7, race: 8, coach: 5, run: 3, cardio: 3, routine: 2 };

/** Effort of a session, 0–10: the rating given at the end (1–5, doubled), or the usual one. Null = not training load. */
export function entryRpe(e: Entry): number | null {
  const base = USUAL[e.kind];
  if (base === undefined) return null;
  const rated = Number(e.data.rpe);
  if (rated >= 1 && rated <= 5) return rated * 2;
  if (e.kind === 'rounds' && e.data.hiit) return 8;
  if (e.kind === 'workout' && (e.data.wid === 'knee' || e.data.wid === 'kick')) return 3;
  return base;
}

/** Minutes of a session: the measured time, or the plan's time for a block ticked by hand. */
export function entryMinutes(e: Entry): number {
  if (e.dur >= 60) return Math.min(e.dur / 60, 240);
  const b = e.block ? blockById(e.block) : undefined;
  if (!b) return 0;
  return b.min ?? ((b.rounds ?? 0) * (b.work ?? 0)) / 60;
}

/** Session-RPE load in arbitrary units: minutes × effort. */
export function entryLoad(e: Entry): number {
  const r = entryRpe(e);
  return r === null ? 0 : Math.round(entryMinutes(e) * r);
}

export interface LoadReport {
  /** The last 7 days, today included. */
  week: number;
  /** The mean of the three 7-day windows before that; null until two of them hold training. */
  usual: number | null;
  ratio: number | null;
  /** Foster's monotony over the last 7 days: mean daily load / its standard deviation. Null when it cannot be told. */
  monotony: number | null;
  verdict: 'none' | 'low' | 'ok' | 'high' | 'spike';
  /** The last six calendar weeks, oldest first. */
  weeks: Array<{ mon: string; load: number }>;
}

export function loadReport(log: Entry[], today: string): LoadReport {
  const byDay = new Map<string, number>();
  for (const e of log) {
    const l = entryLoad(e);
    if (l) byDay.set(e.date, (byDay.get(e.date) ?? 0) + l);
  }
  const span = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => byDay.get(addDays(today, -(from + i))) ?? 0);
  const sum = (a: number[]): number => a.reduce((x, y) => x + y, 0);
  const last7 = span(0, 6);
  const week = sum(last7);
  const prior = [sum(span(7, 13)), sum(span(14, 20)), sum(span(21, 27))];
  const usual = prior.filter((x) => x > 0).length >= 2 ? sum(prior) / 3 : null;
  const ratio = usual ? week / usual : null;
  const mean = week / 7;
  const sd = Math.sqrt(sum(last7.map((x) => (x - mean) ** 2)) / 7);
  const monotony = week > 0 && sd > 0 ? mean / sd : null;
  const verdict = ratio === null ? 'none' : ratio > 1.5 ? 'spike' : ratio > 1.3 ? 'high' : ratio < 0.7 ? 'low' : 'ok';
  const mon0 = weekStart(today);
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const mon = addDays(mon0, -7 * (5 - i));
    let load = 0;
    for (const [d, l] of byDay) if (daysBetween(mon, d) >= 0 && daysBetween(mon, d) < 7) load += l;
    return { mon, load };
  });
  return { week, usual: usual === null ? null : Math.round(usual), ratio, monotony, verdict, weeks };
}

/** One sentence for the Progres screen. */
export function loadText(r: LoadReport): string {
  if (r.verdict === 'none') return 'După două săptămâni de sesiuni vezi aici dacă săptămâna e peste sau sub obișnuitul tău.';
  const pct = Math.round(Math.abs((r.ratio ?? 1) - 1) * 100);
  const mono = r.monotony !== null && r.monotony > 2 && r.verdict !== 'low' ? ' Zilele seamănă prea mult între ele: păstrează zilele ușoare cu adevărat ușoare.' : '';
  switch (r.verdict) {
    case 'spike':
      return `Ultimele 7 zile sunt cu ${pct}% peste obișnuitul tău: un salt mare. Săptămâna viitoare nu mai adăuga nimic și dormi mai mult.${mono}`;
    case 'high':
      return `Ultimele 7 zile sunt cu ${pct}% peste obișnuitul tău. E în regulă o săptămână; nu urca și mai mult în următoarea.${mono}`;
    case 'low':
      return `Ultimele 7 zile sunt cu ${pct}% sub obișnuitul tău. Bine dacă e săptămâna ușoară; altfel, revino la plan.`;
    default:
      return `Ultimele 7 zile sunt în zona ta obișnuită (${pct}% ${(r.ratio ?? 1) >= 1 ? 'peste' : 'sub'}).${mono}`;
  }
}
