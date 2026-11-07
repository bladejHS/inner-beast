// App state, persisted in localStorage. Everything the user logs lives here.

import { EMOM_GOAL, EMOM_START } from '../data/workouts.ts';
import { dayKey, uid } from './util.ts';
import { freshDiscipline, type Discipline } from './discipline.ts';
import type { RaceRun } from './race.ts';
import { cycleStartFor } from './progress.ts';

export type Kind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'wimhof' | 'breath' | 'shower' | 'row' | 'coach' | 'race' | 'cardio';

export interface SetLog {
  id: string;
  name: string;
  /** Reps (or seconds for holds); null = set not done. Ticked sets (Y-T-W, sprints, jumps) store 1. */
  sets: Array<number | null>;
  unit: 'reps' | 'sec' | 'ytw' | 'emom' | 'done';
  emom?: { min: number; reps: number; done: number };
  /** Added weight, on the hardest variation. */
  kg?: number;
}

export interface Entry {
  id: string;
  ts: number;
  date: string;
  kind: Kind;
  block?: string;
  name: string;
  dur: number;
  data: Record<string, unknown>;
}

export interface Habit {
  id: string;
  name: string;
  /** 'count': reach a number every day (50 push-ups). 'check': done / not done. */
  type: 'count' | 'check';
  goal: number;
  start: string;
  days: Record<string, number>;
  archived?: boolean;
}

export interface Settings {
  sound: boolean;
  voice: boolean;
  vibrate: boolean;
  wake: boolean;
  callEvery: number;
  legMode: 'wall' | 'jump';
  /** Thursday's first slot: Jumping Rope or Agility Ladder. */
  thuFeet: 'rope' | 'ladder';
  /** Thursday's last slot: Heavy Bag or Machine Row, and the rowing challenge. */
  thuMain: 'bag' | 'row';
  /** Thursday's shadow slot: alone, or technical sparring / pads with a partner. */
  thuPartner: 'shadow' | 'spar';
  rowCh: 'a' | 'b' | 'c' | 'd';
  rest3: number;
  rest1: number;
  whRounds: number;
  whBreaths: number;
  whPace: 'slow' | 'normal' | 'fast';
  whMed: number;
  breathMin: number;
  showerRounds: number;
  showerEndCold: boolean;
  bwScheme: number;
  whSafety: boolean;
}

/** A logged meal: name, kcal, protein, carbs, fat (g); pl = which plan meal it was ("t2"). */
export interface MealLog {
  n: string;
  k: number;
  p: number;
  c: number;
  g: number;
  pl?: string;
}

/** The weekly correction from the scale (see nutri/engine.ts). */
export interface NAdj {
  c: number;
  d?: string;
  r?: number;
  pred?: number;
  step?: number;
  n?: number;
  h?: number[];
  w0?: number;
  w1?: number;
  eat?: number | null;
}

/** Nutrition profile and settings. Optional fields: unset = automatic. */
export interface NutProfile {
  /** Day the medical disclaimer was accepted. */
  ok?: string;
  sex: 'm' | 'f';
  age: number;
  h: number;
  startW: number;
  goalW: number;
  act: number;
  eq?: string;
  metab?: number;
  bf?: number;
  def?: number;
  kcalT?: number;
  protT?: number;
  waterT?: number;
  goalMode?: 'cut' | 'recomp' | 'bulk';
  dietBreak?: boolean;
  dbStart?: string;
  useMeasured?: boolean;
  nAdj?: NAdj;
  mSwap?: Record<string, string>;
  /** Anthropic API key for the AI meal estimates; stays on this phone, left out of backups. */
  aiKey?: string;
  aiWk?: { d: string; text: string };
}

export interface FoodMine {
  n: string;
  brand?: string;
  k: number;
  p: number;
  c: number;
  g: number;
  por?: number | null;
  code?: string;
}

export interface State {
  v: 1;
  set: Settings;
  log: Entry[];
  lvl: Record<string, number>;
  emom: { min: number; reps: number };
  habits: Habit[];
  wins: Array<{ id: string; date: string; text: string; big: boolean }>;
  why: { victim: string; winner: string; drive: string };
  sleep: Record<string, number>;
  steps: Record<string, number>;
  warrior: Record<string, 'w' | 'v'>;
  /** Body weight in kg by day. */
  weight: Record<string, number>;
  /** Progress photos (the pictures themselves are in IndexedDB, see photodb.ts). */
  photos: Array<{ id: string; date: string }>;
  /** Waist in cm by day (for the recomposition verdict). */
  waist: Record<string, number>;
  nut: NutProfile;
  mlog: Record<string, MealLog[]>;
  water: Record<string, number>;
  foods: FoodMine[];
  supp: { on: Record<string, boolean>; log: Record<string, string[]> };
  /** The shopping list you write yourself. */
  shop: Array<{ id: string; n: string; q: string; on: boolean }>;
  /** Daily base target and TDEE used, for the weekly scale correction. */
  nlog: Record<string, { k: number; t: number }>;
  /** Discipline Challenges: No Fap and Dopamine Discipline. */
  disc: Discipline;
  /** 30-day challenges running now: id → first day. */
  chal: Record<string, string>;
  /** The race simulation running now. */
  race: RaceRun | null;
  /** Lighter weeks: the Monday the proposal was last answered, and the Monday of the lighter week now on. */
  deload: { last: string; week: string };
  /** The 12-week loop of emphases (A, B, C), from the Monday it started. */
  cycle: { start: string };
  /** Test results by test id, oldest first. */
  tests: Record<string, Array<{ d: string; v: number }>>;
}

export const DEFAULT_NUT: NutProfile = { sex: 'm', age: 30, h: 200, startW: 80, goalW: 75, act: 1.55 };

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  voice: true,
  vibrate: true,
  wake: true,
  callEvery: 15,
  legMode: 'wall',
  thuFeet: 'rope',
  thuMain: 'bag',
  thuPartner: 'shadow',
  rowCh: 'a',
  rest3: 60,
  rest1: 60,
  whRounds: 3,
  whBreaths: 30,
  whPace: 'normal',
  whMed: 2,
  breathMin: 10,
  showerRounds: 3,
  showerEndCold: true,
  bwScheme: 1,
  whSafety: false,
};

export function defaultHabit(today: string): Habit {
  return { id: 'pushups50', name: '50 Push-ups', type: 'count', goal: 50, start: today, days: {} };
}

export function freshState(today: string = dayKey()): State {
  return {
    v: 1,
    set: { ...DEFAULT_SETTINGS },
    log: [],
    lvl: {},
    emom: { ...EMOM_START },
    habits: [defaultHabit(today)],
    wins: [],
    why: { victim: '', winner: '', drive: '' },
    sleep: {},
    steps: {},
    warrior: {},
    weight: {},
    photos: [],
    waist: {},
    nut: { ...DEFAULT_NUT },
    mlog: {},
    water: {},
    foods: [],
    supp: { on: {}, log: {} },
    shop: [],
    nlog: {},
    disc: freshDiscipline(),
    chal: {},
    race: null,
    deload: { last: '', week: '' },
    cycle: { start: cycleStartFor(today) },
    tests: {},
  };
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

/** Fills in anything missing so older or hand-edited backups still load. */
export function normalize(raw: unknown, today: string = dayKey()): State {
  const base = freshState(today);
  if (!isObj(raw)) return base;
  const r = raw as Partial<State>;
  const set = { ...DEFAULT_SETTINGS, ...(isObj(r.set) ? r.set : {}) } as Settings;
  return {
    v: 1,
    set,
    log: Array.isArray(r.log) ? r.log.filter((e) => isObj(e) && typeof e.date === 'string' && typeof e.kind === 'string') : [],
    lvl: isObj(r.lvl) ? (r.lvl as Record<string, number>) : {},
    // The climb now stops at EMOM_GOAL: a target from the old 30 × 10 ladder comes back down to it.
    emom: isObj(r.emom) && typeof r.emom.min === 'number' && typeof r.emom.reps === 'number' ? { min: Math.min(r.emom.min, EMOM_GOAL.min), reps: Math.min(r.emom.reps, EMOM_GOAL.reps) } : base.emom,
    habits: Array.isArray(r.habits) && r.habits.length ? r.habits : base.habits,
    wins: Array.isArray(r.wins) ? r.wins : [],
    why: { ...base.why, ...(isObj(r.why) ? r.why : {}) },
    sleep: isObj(r.sleep) ? (r.sleep as Record<string, number>) : {},
    steps: isObj(r.steps) ? (r.steps as Record<string, number>) : {},
    warrior: isObj(r.warrior) ? (r.warrior as Record<string, 'w' | 'v'>) : {},
    weight: isObj(r.weight) ? (r.weight as Record<string, number>) : {},
    photos: Array.isArray(r.photos) ? r.photos.filter((x) => isObj(x) && typeof x.id === 'string' && typeof x.date === 'string') : [],
    waist: isObj(r.waist) ? (r.waist as Record<string, number>) : {},
    // Height drives the boxing combinations too; a profile never confirmed still holds the old default, so it takes the current one.
    nut: { ...DEFAULT_NUT, ...(isObj(r.nut) ? r.nut : {}), ...(isObj(r.nut) && r.nut.ok ? {} : { h: DEFAULT_NUT.h }) } as NutProfile,
    mlog: isObj(r.mlog) ? (r.mlog as Record<string, MealLog[]>) : {},
    water: isObj(r.water) ? (r.water as Record<string, number>) : {},
    foods: Array.isArray(r.foods) ? r.foods.filter((x) => isObj(x) && typeof x.n === 'string') : [],
    supp: { on: {}, log: {}, ...(isObj(r.supp) ? r.supp : {}) },
    shop: Array.isArray(r.shop) ? r.shop.filter((x) => isObj(x) && typeof x.n === 'string') : [],
    nlog: isObj(r.nlog) ? (r.nlog as Record<string, { k: number; t: number }>) : {},
    disc: {
      nofap: { ...base.disc.nofap, ...(isObj(r.disc) && isObj(r.disc.nofap) ? r.disc.nofap : {}) },
      dopa: { ...base.disc.dopa, ...(isObj(r.disc) && isObj(r.disc.dopa) ? r.disc.dopa : {}) },
    },
    chal: isObj(r.chal) ? (r.chal as Record<string, string>) : {},
    race: isObj(r.race) && typeof r.race.ev === 'string' && Array.isArray(r.race.splits) ? (r.race as unknown as RaceRun) : null,
    deload: { ...base.deload, ...(isObj(r.deload) ? r.deload : {}) },
    cycle: isObj(r.cycle) && typeof r.cycle.start === 'string' && r.cycle.start ? { start: r.cycle.start } : base.cycle,
    tests: isObj(r.tests) ? (r.tests as State['tests']) : {},
  };
}

export const STORE_KEY = 'beast:v1';

export function loadState(): State {
  try {
    const s = localStorage.getItem(STORE_KEY);
    return normalize(s ? JSON.parse(s) : null);
  } catch {
    return freshState();
  }
}

export function saveState(s: State): boolean {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

export function makeEntry(p: Omit<Entry, 'id' | 'ts' | 'date'> & { date?: string; ts?: number }): Entry {
  const ts = p.ts ?? Date.now();
  return { id: uid(), ts, date: p.date ?? dayKey(new Date(ts)), kind: p.kind, block: p.block, name: p.name, dur: Math.round(p.dur), data: p.data };
}
