// Ranks (2026-11-15, renamed 2026-11-20 with HYBRID FORGE): the sessions add up to a rank, from Rookie to Forged. Only training counts: walks, showers and
// the breathing sessions are kept in the log but do not raise the rank.

import type { Entry, Kind } from './store.ts';

export interface Rank { name: string; min: number; motto: string }

export const RANKS: Rank[] = [
  { name: 'Rookie', min: 0, motto: 'Ai intrat în sală. Restul se câștigă.' },
  { name: 'Athlete', min: 10, motto: 'Zece sesiuni: nu mai e o încercare, e un obicei.' },
  { name: 'Hybrid', min: 40, motto: 'Patruzeci de sesiuni. Alergi și ridici la fel de bine.' },
  { name: 'Elite', min: 100, motto: 'O sută. Puțini ajung aici.' },
  { name: 'Forged', min: 200, motto: 'Două sute. Nu te mai antrenezi pentru formă: ești forjat.' },
];

const TRAINING: ReadonlySet<Kind> = new Set<Kind>(['rounds', 'amrap', 'workout', 'routine', 'run', 'row', 'coach', 'race', 'cardio']);

export const trainingSessions = (log: Entry[]): number => log.filter((e) => TRAINING.has(e.kind)).length;

export interface RankNow { i: number; rank: Rank; next: Rank | null; n: number; into: number; span: number }

export function rankOf(n: number): RankNow {
  let i = 0;
  while (i + 1 < RANKS.length && n >= RANKS[i + 1]!.min) i++;
  const rank = RANKS[i]!, next = RANKS[i + 1] ?? null;
  return { i, rank, next, n, into: n - rank.min, span: next ? next.min - rank.min : 0 };
}
