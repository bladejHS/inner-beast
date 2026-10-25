// Small pure helpers shared by the UI and the tests.

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseDay(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(k: string, n: number): string {
  const d = parseDay(k);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86400000);
}

/** 0 = Monday … 6 = Sunday (the program week starts on Monday). */
export function weekdayIdx(k: string): number {
  return (parseDay(k).getDay() + 6) % 7;
}

/** Monday of the week that contains day k. */
export function weekStart(k: string): string {
  return addDays(k, -weekdayIdx(k));
}

export function inWeek(k: string, monday: string): boolean {
  const d = daysBetween(monday, k);
  return d >= 0 && d < 7;
}

/** 75 -> "1:15", 3600 -> "60:00". */
export function mmss(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

/** Pace in seconds per km -> "6:05". */
export function paceStr(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '–';
  return mmss(secPerKm);
}

export function minutesLabel(sec: number): string {
  const m = Math.round(sec / 60);
  return m < 1 ? `${Math.round(sec)} s` : `${m} min`;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: unknown): string => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const RO_DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];
export const RO_MONTHS = ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.'];

export function prettyDay(k: string): string {
  const d = parseDay(k);
  return `${RO_DAYS[weekdayIdx(k)]}, ${d.getDate()} ${RO_MONTHS[d.getMonth()]}`;
}

export function shortDay(k: string): string {
  const d = parseDay(k);
  return `${d.getDate()} ${RO_MONTHS[d.getMonth()]}`;
}

/** Romanian thousands separator: 10000 -> "10.000". */
export function num(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function km(meters: number): string {
  return (meters / 1000).toFixed(2).replace('.', ',');
}
