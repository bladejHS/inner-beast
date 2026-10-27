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
}

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
