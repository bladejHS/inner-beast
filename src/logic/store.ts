// App state, persisted in localStorage. Everything the user logs lives here.

import { EMOM_START } from '../data/workouts.ts';
import { dayKey, uid } from './util.ts';

export type Kind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'wimhof' | 'breath' | 'shower';

export interface SetLog {
  id: string;
  name: string;
  /** Reps (or seconds for holds); null = set not done. YTW sets store 1/0. */
  sets: Array<number | null>;
  unit: 'reps' | 'sec' | 'ytw' | 'emom';
  emom?: { min: number; reps: number; done: number };
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
  shop: Record<string, boolean>;
  /** Daily base target and TDEE used, for the weekly scale correction. */
  nlog: Record<string, { k: number; t: number }>;
}

export const DEFAULT_NUT: NutProfile = { sex: 'm', age: 30, h: 180, startW: 80, goalW: 75, act: 1.55 };

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  voice: true,
  vibrate: true,
  wake: true,
  callEvery: 15,
  legMode: 'wall',
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
    shop: {},
    nlog: {},
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
    emom: isObj(r.emom) && typeof r.emom.min === 'number' && typeof r.emom.reps === 'number' ? r.emom : base.emom,
    habits: Array.isArray(r.habits) && r.habits.length ? r.habits : base.habits,
    wins: Array.isArray(r.wins) ? r.wins : [],
    why: { ...base.why, ...(isObj(r.why) ? r.why : {}) },
    sleep: isObj(r.sleep) ? (r.sleep as Record<string, number>) : {},
    steps: isObj(r.steps) ? (r.steps as Record<string, number>) : {},
    warrior: isObj(r.warrior) ? (r.warrior as Record<string, 'w' | 'v'>) : {},
    weight: isObj(r.weight) ? (r.weight as Record<string, number>) : {},
    photos: Array.isArray(r.photos) ? r.photos.filter((x) => isObj(x) && typeof x.id === 'string' && typeof x.date === 'string') : [],
    waist: isObj(r.waist) ? (r.waist as Record<string, number>) : {},
    nut: { ...DEFAULT_NUT, ...(isObj(r.nut) ? r.nut : {}) } as NutProfile,
    mlog: isObj(r.mlog) ? (r.mlog as Record<string, MealLog[]>) : {},
    water: isObj(r.water) ? (r.water as Record<string, number>) : {},
    foods: Array.isArray(r.foods) ? r.foods.filter((x) => isObj(x) && typeof x.n === 'string') : [],
    supp: { on: {}, log: {}, ...(isObj(r.supp) ? r.supp : {}) },
    shop: isObj(r.shop) ? (r.shop as Record<string, boolean>) : {},
    nlog: isObj(r.nlog) ? (r.nlog as Record<string, { k: number; t: number }>) : {},
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
