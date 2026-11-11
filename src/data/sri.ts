// The user's objective (2026-11-11): the Brigada Antiteroristă of the SRI. The physical test and its scale are the ones
// published in the SRI's own job notice for "luptător antiterorist" (sri.ro, Brigada Antitero, 2024; men's table):
// a 50 m sprint, a 1000 m run and pull-ups from a dead hang, each marked 1–10. The SRI brochure on the Brigade says
// candidates for antiterrorist / counterterrorist intervention need an average of at least 9.00 on the physical test.
// The other stages are the notice's: interviews, psychological evaluation, medical examination. Everything else in the
// selection (the exact dates, the current year's table) has to be checked on sri.ro before applying.

export interface SriEvent {
  id: 'sprint50' | 'run1000' | 'pullups';
  name: string;
  /** Marks 10 → 1: the value that earns each mark. */
  scale: number[];
  /** True when a smaller value is better (times). */
  lower: boolean;
  unit: string;
}

export const SRI_EVENTS: SriEvent[] = [
  { id: 'sprint50', name: 'Alergare de viteză, 50 m', scale: [6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7], lower: true, unit: 's' },
  // minutes.seconds in the notice: 3.20 = 3:20
  { id: 'run1000', name: 'Alergare de rezistență, 1000 m', scale: [200, 205, 210, 215, 220, 225, 230, 235, 240, 245], lower: true, unit: 'mm:ss' },
  { id: 'pullups', name: 'Tracțiuni în brațe din atârnat', scale: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5], lower: false, unit: 'repetări' },
];

/** The brochure's threshold for the intervention groups. */
export const SRI_MIN_AVG = 9;

export const SRI_STAGES = ['Probele sportive, eliminatorii: 50 m, 1000 m, tracțiuni', 'Interviuri de selecție', 'Evaluare psihologică, preliminară și complexă', 'Examinare medicală'];

/** The mark 1–10 for a result, or 0 under the table. */
export function sriMark(ev: SriEvent, v: number): number {
  for (let i = 0; i < ev.scale.length; i++) {
    const need = ev.scale[i]!;
    if (ev.lower ? v <= need + 1e-9 : v >= need) return 10 - i;
  }
  return 0;
}

/** What a mark asks for: the value on the table. */
export function sriNeed(ev: SriEvent, mark: number): number | undefined {
  return ev.scale[10 - Math.max(1, Math.min(10, Math.round(mark)))];
}

export interface SriStatus {
  rows: Array<{ ev: SriEvent; v?: number; mark?: number; date?: string }>;
  /** Mean of the marks that exist; undefined without any. */
  avg?: number;
  /** All three tested. */
  complete: boolean;
  /** Average at or over the threshold, with all three tested. */
  ready: boolean;
}

export function sriStatus(tests: Record<string, Array<{ d: string; v: number }>>): SriStatus {
  const rows = SRI_EVENTS.map((ev) => {
    const r = tests[ev.id] ?? [];
    const last = r[r.length - 1];
    return last ? { ev, v: last.v, mark: sriMark(ev, last.v), date: last.d } : { ev };
  });
  const marks = rows.map((r) => r.mark).filter((m): m is number => m !== undefined);
  const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : undefined;
  const complete = marks.length === SRI_EVENTS.length;
  return { rows, avg, complete, ready: complete && (avg ?? 0) >= SRI_MIN_AVG };
}
