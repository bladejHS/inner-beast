// Publishes the weekly plan under its own key so Beast Nutrition (same origin) can size each day's fuel.
// It writes nothing else; the app's state stays in beast:v1.

import { BURST_SEC, resolveBlock, WARMUP_SEC, WEEK, type Block, type Picks, type RestKey } from '../data/plan.ts';

export const PLAN_KEY = 'beast:plan:v1';

export interface Rests { rest3: number; rest1: number }
/** `alt`: the slot has two options. This is the picked one, `other` the one left out, `detail` the rowing challenge. */
export interface PlanSession { id: string; name: string; kind: string; min: number; focus?: string; alt?: { other: string; detail?: string } }

function minutes(b: Block, r: Rests): number {
  if (b.kind === 'rounds') {
    const n = b.rounds ?? 1;
    const rest: Record<RestKey, number> = { r3: r.rest3, r1: r.rest1, none: 0 };
    const work = Array.from({ length: n }, (_, i) => (b.burstFrom && i + 1 >= b.burstFrom ? BURST_SEC : b.work ?? 0)).reduce((s, x) => s + x, 0);
    return Math.round((work + (n - 1) * (b.restSec ?? rest[b.rest ?? 'none']) + (b.warmup ? WARMUP_SEC : 0)) / 60);
  }
  if (b.kind === 'walk') return 75;
  if (b.kind === 'wimhof' && !b.min) return 12;
  if (b.kind === 'workout') return b.min ?? 60;
  return b.min ?? 10;
}

function altOf(raw: Block, b: Block): PlanSession['alt'] {
  if (raw.alt === 'feet') return { other: b.focus === 'ladder' ? 'Jumping Rope' : 'Agility Ladder' };
  if (raw.alt === 'partner') return { other: b.name === raw.name ? 'Technical Sparring / Pads' : raw.name };
  if (raw.alt === 'main') return b.kind === 'row' ? { other: raw.name, detail: b.dose } : { other: 'Machine Row' };
  if (raw.alt === 'aero') return { other: b.kind === 'cardio' ? raw.name : 'Easy Row' };
  return undefined;
}

/** Beast Nutrition knows the session kinds of the first plan; easy cardio counts there as a run. */
const kindFor = (b: Block): string => (b.kind === 'cardio' ? 'run' : b.kind);

export function planSnapshot(set: Picks & Rests): PlanSession[][] {
  return WEEK.map((d) => d.blocks.map((raw) => {
    const b = resolveBlock(raw, set);
    const alt = altOf(raw, b);
    return { id: b.id, name: b.name, kind: kindFor(b), min: minutes(b, set), ...(b.focus ? { focus: b.focus } : {}), ...(alt ? { alt } : {}) };
  }));
}

let last = '';

export function publishPlan(set: Picks & Rests): void {
  const text = JSON.stringify({ week: planSnapshot(set) });
  if (text === last) return;
  last = text;
  try {
    localStorage.setItem(PLAN_KEY, text);
  } catch {
    /* storage blocked: Beast Nutrition falls back to its own copy of the plan */
  }
}
