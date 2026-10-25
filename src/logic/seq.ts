// Timer sequences. A session is a list of phases; the clock is timestamp based,
// so throttled timers or a locked screen never make it drift.

export type PhaseKind = 'prep' | 'work' | 'rest' | 'cold' | 'warm' | 'in' | 'hold' | 'out' | 'move';

export interface Phase {
  kind: PhaseKind;
  sec: number;
  label: string;
  round?: number;
  rounds?: number;
  /** Index of the routine move, for routines. */
  move?: number;
}

export function roundsSeq(rounds: number, work: number, rest: number, prep = 5): Phase[] {
  const out: Phase[] = [];
  if (prep > 0) out.push({ kind: 'prep', sec: prep, label: 'Pregătește-te' });
  for (let r = 1; r <= rounds; r++) {
    out.push({ kind: 'work', sec: work, label: 'Lucru', round: r, rounds });
    if (r < rounds && rest > 0) out.push({ kind: 'rest', sec: rest, label: 'Pauză', round: r, rounds });
  }
  return out;
}

/** "1 min cold, 1 min warm", repeated; optionally one more cold minute at the end. */
export function showerSeq(rounds: number, cold = 60, warm = 60, endCold = true, prep = 5): Phase[] {
  const out: Phase[] = [];
  if (prep > 0) out.push({ kind: 'prep', sec: prep, label: 'Pregătește-te' });
  for (let r = 1; r <= rounds; r++) {
    out.push({ kind: 'cold', sec: cold, label: 'Rece', round: r, rounds });
    out.push({ kind: 'warm', sec: warm, label: 'Cald', round: r, rounds });
  }
  if (endCold) out.push({ kind: 'cold', sec: cold, label: 'Rece', round: rounds + 1, rounds });
  return out;
}

/** 4-7-8 breathing for about `minutes` (whole cycles only). */
export function breath478Seq(minutes: number, prep = 3): Phase[] {
  const cycles = Math.max(1, Math.round((minutes * 60) / 19));
  const out: Phase[] = [];
  if (prep > 0) out.push({ kind: 'prep', sec: prep, label: 'Expiră complet' });
  for (let c = 1; c <= cycles; c++) {
    out.push({ kind: 'in', sec: 4, label: 'Inspiră pe nas', round: c, rounds: cycles });
    out.push({ kind: 'hold', sec: 7, label: 'Ține aerul', round: c, rounds: cycles });
    out.push({ kind: 'out', sec: 8, label: 'Expiră pe gură', round: c, rounds: cycles });
  }
  return out;
}

export function routineSeq(moves: Array<{ sec: number; name: string }>, prep = 5): Phase[] {
  const out: Phase[] = [];
  if (prep > 0) out.push({ kind: 'prep', sec: prep, label: 'Pregătește-te' });
  moves.forEach((m, i) => out.push({ kind: 'move', sec: m.sec, label: m.name, move: i, round: i + 1, rounds: moves.length }));
  return out;
}

export function totalSec(phases: Phase[]): number {
  return phases.reduce((s, p) => s + p.sec, 0);
}

export interface Located {
  i: number;
  left: number;
  into: number;
  done: boolean;
}

/** Where `elapsed` seconds fall inside the sequence. */
export function locate(phases: Phase[], elapsed: number): Located {
  let t = 0;
  for (let i = 0; i < phases.length; i++) {
    const end = t + phases[i].sec;
    if (elapsed < end) return { i, left: end - elapsed, into: elapsed - t, done: false };
    t = end;
  }
  return { i: phases.length - 1, left: 0, into: phases.length ? phases[phases.length - 1].sec : 0, done: true };
}

export function phaseStart(phases: Phase[], i: number): number {
  let t = 0;
  for (let k = 0; k < i && k < phases.length; k++) t += phases[k].sec;
  return t;
}

/** Seconds of the given kind already completed at `elapsed`. */
export function doneSec(phases: Phase[], elapsed: number, kind: PhaseKind): number {
  let t = 0;
  let s = 0;
  for (const p of phases) {
    if (p.kind === kind) s += Math.max(0, Math.min(p.sec, elapsed - t));
    t += p.sec;
  }
  return s;
}

/** Pausable stopwatch. `now` is injectable for tests. */
export class Clock {
  private startAt = 0;
  private acc = 0;
  running = false;
  private now: () => number;
  constructor(now: () => number = () => performance.now()) {
    this.now = now;
  }
  start(): void {
    this.acc = 0;
    this.startAt = this.now();
    this.running = true;
  }
  pause(): void {
    if (!this.running) return;
    this.acc += this.now() - this.startAt;
    this.running = false;
  }
  resume(): void {
    if (this.running) return;
    this.startAt = this.now();
    this.running = true;
  }
  /** Elapsed seconds. */
  get t(): number {
    return (this.acc + (this.running ? this.now() - this.startAt : 0)) / 1000;
  }
  /** Jump to an absolute elapsed time (used for "skip"). */
  set(seconds: number): void {
    this.acc = seconds * 1000;
    this.startAt = this.now();
  }
}
