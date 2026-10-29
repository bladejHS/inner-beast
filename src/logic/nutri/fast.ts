// Fasting: 16/8 (16 h without food, then an 8 h eating window) and "No food today" (24 h without food).
// The timer is timestamp based, like the workout clock, so a closed app or locked phone never loses it.

export type FastMode = '168' | '24';

export interface Fast {
  mode: FastMode;
  /** Start, ms since epoch. */
  start: number;
}

export interface FastLog extends Fast {
  end: number;
  /** Reached the full fast. */
  done: boolean;
}

export const FAST_MODES: Record<FastMode, { name: string; hours: number; window: number }> = {
  '168': { name: 'Fasting 16/8', hours: 16, window: 8 },
  '24': { name: 'NO FOOD TODAY', hours: 24, window: 0 },
};

const H = 3600_000;

export interface FastStatus {
  /** ms fasted so far (capped at the fast length). */
  elapsed: number;
  /** ms left until the fast is complete (0 once done). */
  left: number;
  /** 0..1 of the fast. */
  frac: number;
  done: boolean;
  /** When the fast ends (eating may start). */
  endsAt: number;
  /** 16/8 only: while the 8 h eating window is open after the fast, ms left in it. */
  windowLeft: number;
  /** The whole cycle is over (fast, plus the eating window for 16/8). */
  over: boolean;
}

export function fastStatus(f: Fast, now: number): FastStatus {
  const m = FAST_MODES[f.mode];
  const len = m.hours * H;
  const endsAt = f.start + len;
  const elapsed = Math.max(0, Math.min(len, now - f.start));
  const done = now >= endsAt;
  const winEnd = endsAt + m.window * H;
  return { elapsed, left: Math.max(0, endsAt - now), frac: elapsed / len, done, endsAt, windowLeft: done && now < winEnd ? winEnd - now : 0, over: now >= winEnd };
}

/** "15:59:07" style countdown. */
export function hms(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${Math.floor(s / 3600)}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}
