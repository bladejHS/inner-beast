// Machine Row challenges for Thursday's last slot, the alternative to the Heavy Bag.
// The app can't read the rowing machine: distance comes from its monitor, entered by hand.

export type RowId = 'a' | 'b' | 'c' | 'd';

export interface RowChallenge {
  id: RowId;
  name: string;
  /** Short target line, e.g. "1.000 m" or "250 m × 8". */
  label: string;
  /** Metres per interval (the whole distance for a continuous piece). */
  meters: number;
  reps: number;
  /** Rest between consecutive intervals, in seconds; none after the last one. */
  rest: number;
  /** Rough minutes, for the day's total. */
  min: number;
}

export const ROW_CHALLENGES: RowChallenge[] = [
  { id: 'a', name: 'Challenge A', label: '1.000 m', meters: 1000, reps: 1, rest: 0, min: 5 },
  { id: 'b', name: 'Challenge B', label: '5.000 m', meters: 5000, reps: 1, rest: 0, min: 22 },
  { id: 'c', name: 'Challenge C', label: '10.000 m', meters: 10000, reps: 1, rest: 0, min: 45 },
  { id: 'd', name: 'Challenge D', label: '250 m × 8', meters: 250, reps: 8, rest: 45, min: 14 },
];

export function rowChallenge(id: string | undefined): RowChallenge {
  return ROW_CHALLENGES.find((c) => c.id === id) ?? ROW_CHALLENGES[0];
}

export function rowTotal(c: RowChallenge): number {
  return c.meters * c.reps;
}

/** Rest periods in an interval challenge: only between consecutive intervals. */
export function rowRests(c: RowChallenge): number {
  return c.rest > 0 ? c.reps - 1 : 0;
}
