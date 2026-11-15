// The result after a session (2026-11-15): a broadcast stat card instead of a plain "Gata." The title lands like a
// referee's call, the numbers count up, and below them the week and the run of days in a row.

import { WEEK } from '../data/plan.ts';
import { weekDone, weekSince } from '../logic/progress.ts';
import { addDays, dayKey, esc, weekStart } from '../logic/util.ts';
import { ctx } from './ctx.ts';
import { countUp, lite } from './fx.ts';
import { savePoster, type PosterData } from './poster.ts';

export interface WinStat { v: number | string; label: string; unit?: string }

/** Days in a row, up to today, with at least one session in the log. */
export function trainStreak(today = dayKey()): number {
  const days = new Set(ctx.S.log.map((e) => e.date));
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/**
 * `full`: the whole block was done (the title is the win); otherwise the work is saved and the title says so.
 * `first`: the first time this screen shows, so the entrance plays once and not on every redraw (the ratings).
 */
export function winHtml(o: { name: string; full: boolean; by: string; stats: WinStat[]; first: boolean; recs?: string[] }): string {
  const today = dayKey();
  const mon = weekStart(today);
  const done = weekDone(ctx.S.log, mon, weekSince(ctx.S.cycle, mon)).size;
  const total = WEEK.reduce((s, d) => s + d.blocks.length, 0);
  const streak = trainStreak(today);
  last = { title: o.full ? 'Victorie' : 'Salvat', by: o.by, name: o.name, stats: o.stats, recs: o.recs ?? [], date: new Date(`${today}T12:00:00`).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) };
  const tile = (s: WinStat, i: number): string => {
    const num = typeof s.v === 'number';
    return `<div class="win-s" style="--i:${i}"><b class="num"${num ? ` data-win="${s.v}"` : ''}>${num && o.first && !lite() ? 0 : esc(String(s.v))}</b>${s.unit ? `<small>${esc(s.unit)}</small>` : ''}<span>${esc(s.label)}</span></div>`;
  };
  return `<div class="win${o.first ? ' play' : ''}${o.full ? '' : ' part'}">
    <p class="win-k"><i></i>Rezultat oficial<i></i></p>
    <h1 class="win-t"><span>${o.full ? 'Victorie' : 'Salvat'}</span></h1>
    <p class="win-by">${esc(o.by)}</p>
    <p class="win-n">${esc(o.name)}</p>
    ${o.recs?.length ? `<div class="win-rec"><b>${o.recs.length === 1 ? 'Record nou' : `${o.recs.length} recorduri noi`}</b><span>${o.recs.map(esc).join(' · ')}</span></div>` : ''}
    <div class="win-g">${o.stats.map(tile).join('')}</div>
    <div class="win-wk"><div><b class="num">${done}</b>/${total}<span>blocuri săptămâna asta</span></div><i style="--f:${(done / total).toFixed(3)}"></i>
      ${streak > 1 ? `<p class="win-st"><span class="win-fl" aria-hidden="true"></span><b class="num">${streak}</b> zile la rând</p>` : ''}</div>
    ${o.full ? '<button class="btn ghost win-post" data-poster>Salvează posterul</button>' : ''}
  </div>`;
}

/** After the first render: the numbers climb. */
export function winPlay(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.win.play [data-win]').forEach((el, i) => {
    const to = Number(el.dataset.win);
    window.setTimeout(() => countUp(el, 0, to, 900), lite() ? 0 : 700 + i * 140);
  });
}

let last: PosterData | null = null;

// the poster button lives in the players' screens, which handle their own actions: this one is caught here
document.addEventListener('click', (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLButtonElement>('[data-poster]');
  if (!b || !last) return;
  ev.stopPropagation();
  b.disabled = true;
  b.textContent = 'Pregătesc posterul…';
  void savePoster(last).finally(() => {
    b.disabled = false;
    b.textContent = 'Salvează posterul';
  });
}, true);
