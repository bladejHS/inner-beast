// Publishes the weekly plan under its own key so Beast Nutrition (same origin) can size each day's fuel.
// It writes nothing else; the app's state stays in beast:v1.

import { resolveBlock, WARMUP_SEC, WEEK, type Block, type Picks, type RestKey } from '../data/plan.ts';

export const PLAN_KEY = 'beast:plan:v1';

export interface Rests { rest3: number; rest1: number }
export interface PlanSession { id: string; name: string; kind: string; min: number; focus?: string }

function minutes(b: Block, r: Rests): number {
  if (b.kind === 'rounds') {
    const n = b.rounds ?? 1;
    const rest: Record<RestKey, number> = { r3: r.rest3, r1: r.rest1, none: 0 };
    return Math.round((n * (b.work ?? 0) + (n - 1) * rest[b.rest ?? 'none'] + (b.warmup ? WARMUP_SEC : 0)) / 60);
  }
  if (b.kind === 'walk') return 75;
  if (b.kind === 'wimhof' && !b.min) return 12;
  if (b.kind === 'workout' && b.workout === 'legs') return 15;
  if (b.kind === 'workout') return 60;
  return b.min ?? 10;
}

export function planSnapshot(set: Picks & Rests): PlanSession[][] {
  return WEEK.map((d) => d.blocks.map((raw) => {
    const b = resolveBlock(raw, set);
    return { id: b.id, name: b.name, kind: b.kind, min: minutes(b, set), ...(b.focus ? { focus: b.focus } : {}) };
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
