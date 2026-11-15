// The last 12 weeks as a calendar on fire (2026-11-16, the user picked it from the list): one square per day, Monday
// on top, this week on the right; the more minutes of training that day, the hotter it burns. Walks, showers and
// breathing do not light it. Under it: the active days, the longest run of days and the best week.
import type { Entry } from '../logic/store.ts';
import { addDays, dayKey, esc, weekStart } from '../logic/util.ts';

const TRAINING = new Set(['rounds', 'amrap', 'workout', 'routine', 'run', 'row', 'coach', 'race', 'cardio']);

/** Minutes of training per date. */
export function minutesByDay(log: Entry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of log) if (TRAINING.has(e.kind)) m.set(e.date, (m.get(e.date) ?? 0) + Math.max(1, (e.dur || 0) / 60));
  return m;
}

/** 0 cold, then embers, flame, blaze, inferno. */
export const heat = (min: number): number => (min <= 0 ? 0 : min < 20 ? 1 : min < 45 ? 2 : min < 75 ? 3 : 4);

export function fireCalendar(log: Entry[], today = dayKey(), weeks = 12): string {
  const by = minutesByDay(log);
  const first = addDays(weekStart(today), -7 * (weeks - 1));
  let active = 0, run = 0, best = 0, bestWeek = 0;
  const cols: string[] = [];
  for (let w = 0; w < weeks; w++) {
    let wk = 0;
    const cells: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(first, w * 7 + d);
      const min = date <= today ? by.get(date) ?? 0 : -1;
      if (min > 0) { active++; run++; best = Math.max(best, run); wk += min; } else if (min === 0 && date < today) run = 0;
      const h = min < 0 ? -1 : heat(min);
      cells.push(`<i class="${h < 0 ? 'fut' : `h${h}`}${date === today ? ' now' : ''}" title="${esc(date)}${min > 0 ? `: ${Math.round(min)} min` : ''}" style="--d:${(w * 7 + d) * 12}ms"></i>`);
    }
    bestWeek = Math.max(bestWeek, wk);
    cols.push(`<div class="fc-w">${cells.join('')}</div>`);
  }
  const months = Array.from({ length: weeks }, (_, w) => { const d = addDays(first, w * 7); return d.slice(8) <= '07' || w === 0 ? new Date(`${d}T12:00:00`).toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '') : ''; });
  return `<div class="fire" role="img" aria-label="Ultimele ${weeks} săptămâni: ${active} zile de antrenament, cea mai lungă serie ${best} zile">
    <div class="fc-m" aria-hidden="true">${months.map((m) => `<span>${esc(m)}</span>`).join('')}</div>
    <div class="fc-g"><div class="fc-d" aria-hidden="true"><span>L</span><span></span><span>Mi</span><span></span><span>V</span><span></span><span>D</span></div>${cols.join('')}</div>
    <div class="fc-k" aria-hidden="true"><span>rece</span>${[0, 1, 2, 3, 4].map((h) => `<i class="h${h}"></i>`).join('')}<span>infern</span></div>
  </div>
  <div class="stats fc-s"><div class="stat hot"><b class="num">${active}</b><span>zile de antrenament în ${weeks} săptămâni</span></div><div class="stat"><b class="num">${best}</b><span>zile la rând, cea mai lungă serie</span></div><div class="stat"><b class="num">${Math.round(bestWeek)}</b><span>minute în cea mai bună săptămână</span></div></div>`;
}
