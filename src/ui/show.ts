// Show pieces of 2026-11-15 ("fă tot ce ai zis"): the rank insignia and plate, the rank-up ceremony, the new-chapter
// screen at the start of each emphasis, the walk to the ring before the rounds, and the wolf's mood on Azi.
// Everything here is decoration over facts the app already shows; with reduced motion the entrances are skipped.

import { wolfArt, wolfBadge } from './rankart.ts';
import { CYCLES, CYCLE_WEEKS, cycleAt, loopWeek } from '../logic/progress.ts';
import { rankOf, RANKS, trainingSessions } from '../logic/ranks.ts';
import { dayKey, esc } from '../logic/util.ts';
import { sfx, buzz } from './audio.ts';
import { ctx } from './ctx.ts';
import { celebrate, lite } from './fx.ts';

const BASE = import.meta.env.BASE_URL;

/** The rank's badge: a shield with one chevron per rank; Campion and Bestia in gold, Bestia with the wolf. */
export function insignia(i: number, cls = ''): string {
  const gold = i >= 3;
  const chev = Array.from({ length: Math.min(i + 1, 4) }, (_, k) => `<path d="M30 ${70 - k * 13}l20-11 20 11" />`).join('');
  return `<svg class="ins ${gold ? 'gold' : ''} ${cls}" viewBox="0 0 100 110" aria-hidden="true">
    <path class="ins-sh" d="M50 4 92 18v34c0 27-18 46-42 55C26 98 8 79 8 52V18Z"/>
    <path class="ins-in" d="M50 13 83 24v28c0 22-14 37-33 45C31 89 17 74 17 52V24Z"/>
    ${i >= 4 ? `<image href="${BASE}splash/umbra.webp" x="27" y="20" width="46" height="54"/><path class="ins-ch" d="M30 86l20-9 20 9"/>` : `<g class="ins-ch">${chev}</g>`}
  </svg>`;
}

/** On Azi: the rank, its badge and the road to the next one. */
export function rankPlate(): string {
  const r = rankOf(trainingSessions(ctx.S.log));
  const f = r.next ? r.into / r.span : 1;
  return `<button class="rank${r.i >= 3 ? ' gold' : ''}" data-a="rank" aria-label="Rangul tău: ${esc(r.rank.name)}">
    ${insignia(r.i)}
    <span class="rank-t"><small>Rangul tău</small><b>${esc(r.rank.name)}</b>
      <span class="rank-bar"><i style="--f:${f.toFixed(3)}"></i></span>
      <em>${r.next ? `${r.n} sesiuni · încă ${r.next.min - r.n} până la ${esc(r.next.name)}` : `${r.n} sesiuni · rangul cel mai înalt`}</em></span>
  </button>`;
}

/** The ranks, opened from the plate. */
export function ranksSheet(): string {
  const r = rankOf(trainingSessions(ctx.S.log));
  return `<div class="ranks">${RANKS.map((x, i) => `<div class="rk ${i < r.i ? 'ok' : i === r.i ? 'now' : ''}"><img class="rk-w" src="${wolfBadge(i)}" alt="" width="56" height="56">${insignia(i)}<div><b>${esc(x.name)}</b><span>${x.min ? `de la ${x.min} sesiuni` : 'de la prima sesiune'}</span><p>${esc(x.motto)}</p></div></div>`).join('')}</div>
    <p class="small dim">Se numără antrenamentele: runde, forță, alergare, canotaj, mobilitate. Mersul, dușul și respirația rămân în istoric, dar nu urcă rangul.</p>`;
}

/** Called after a session is saved: the ceremony when it lifted the rank. */
export function rankCheck(before: number, after: number, delay: number): void {
  const a = rankOf(before), b = rankOf(after);
  if (b.i <= a.i) return;
  window.setTimeout(() => {
    sfx.bell(3);
    buzz([200, 80, 200, 80, 400]);
    // the wolf of the new rank is the reveal: it changes with the rank (rankart.ts)
    celebrate(esc(b.rank.name), 'Rang nou · lupul tău a evoluat', { mark: `<img src="${wolfArt(b.i)}" alt="" width="680" height="801">${insignia(b.i, 'rk-ins')}`, word: esc(b.rank.motto), cls: 'cele-rank' });
  }, delay);
}

/* ---------- the new chapter ---------- */

const CH_KEY = 'beast:chapter';

/** Once per emphasis of the loop, on Azi: a title card for the chapter that starts. */
export function chapterCheck(): void {
  // while the opening plays, the card waits for the wolf to land
  if (document.getElementById('splash')) { addEventListener('beast:landed', () => window.setTimeout(chapterCheck, 700), { once: true }); return; }
  const start = ctx.S.cycle.start;
  const today = dayKey();
  const c = cycleAt(start, today, ctx.S.cycle.repeats);
  if (!c) return;
  const w = loopWeek(start, today, ctx.S.cycle.repeats);
  const key = `${start}:${Math.floor(w / CYCLE_WEEKS)}`;
  let seen = '';
  try { seen = localStorage.getItem(CH_KEY) ?? ''; } catch { return; }
  if (seen === key) return;
  try { localStorage.setItem(CH_KEY, key); } catch { /* storage blocked: it would show every time, so not at all */ return; }
  const idx = CYCLES.findIndex((x) => x.id === c.id);
  const lap = Math.floor(w / (CYCLES.length * CYCLE_WEEKS)) + 1;
  const el = document.createElement('div');
  el.className = `chap${lite() ? ' calm' : ''}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<i class="chap-flood" aria-hidden="true"></i><i class="chap-rays" aria-hidden="true"></i>
    <div class="chap-core">
      <p class="chap-k">${lap > 1 ? `Turul ${lap} · ` : ''}Capitolul ${idx + 1} din ${CYCLES.length}</p>
      <div class="chap-id" aria-hidden="true">${c.id}</div>
      <h2 class="chap-t">${esc(c.name)}</h2>
      <p class="chap-w">${esc(c.what)}</p>
      <div class="chap-wk" aria-hidden="true">${Array.from({ length: CYCLE_WEEKS }, (_, i) => `<i class="${i + 1 === c.week ? 'on' : i + 1 < c.week ? 'ok' : ''}${i === CYCLE_WEEKS - 1 ? ' t' : ''}"></i>`).join('')}</div>
      <p class="chap-s">${c.week === 1 ? '4 săptămâni, a patra ușoară și cu teste' : `Săptămâna ${c.week} din 4`}</p>
    </div>
    <p class="cele-tap">Atinge ca să începi</p>`;
  document.body.appendChild(el);
  sfx.bell(1);
  const close = (): void => {
    if (el.classList.contains('out')) return;
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 520);
  };
  el.addEventListener('click', close);
  window.setTimeout(close, 7000);
}

/* ---------- the walk to the ring ---------- */

/** Before the first round: the tunnel, the spotlights and the block's name, then `go`. A tap skips it. */
export function walkIn(name: string, sub: string, go: () => void): void {
  if (lite()) { go(); return; }
  const el = document.createElement('div');
  el.className = 'walk';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<i class="walk-tun"></i><i class="walk-sp l"></i><i class="walk-sp r"></i><i class="walk-floor"></i>
    <div class="walk-core"><p class="walk-k">Intră în ring</p><b class="walk-t">${esc(name)}</b><p class="walk-s">${esc(sub)}</p></div><i class="walk-flash"></i>`;
  document.body.appendChild(el);
  let done = false;
  const end = (): void => {
    if (done) return;
    done = true;
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 380);
    go();
  };
  el.addEventListener('click', end);
  buzz(60);
  window.setTimeout(() => sfx.tick(), 900);
  window.setTimeout(() => sfx.tick(), 1700);
  window.setTimeout(end, 2700);
}

/* ---------- the wolf's mood on Azi ---------- */

/** Days in a row with a session, up to today or yesterday. */
function streak(): number {
  const days = new Set(ctx.S.log.map((e) => e.date));
  const d = new Date(`${dayKey()}T12:00:00`);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/** The medallion in the corner of the mission stage: resting on the easy days, hungry on a run of days, marked after
 *  a hard week (six sessions or more in seven days), on the prowl otherwise. */
export function wolfMood(dayIdx: number): string {
  const today = dayKey();
  const week = new Set(ctx.S.log.filter((e) => e.date <= today && (Date.parse(today) - Date.parse(e.date)) / 864e5 < 7).map((e) => `${e.date}:${e.block ?? e.id}`)).size;
  const s = streak();
  const rest = dayIdx === 2 || dayIdx === 6;
  const scar = week >= 6;
  const fierce = !rest && s >= 3;
  const cls = [rest ? 'sleep' : fierce ? 'fierce' : '', scar ? 'scar' : ''].filter(Boolean).join(' ');
  const say = rest ? 'Se odihnește' : fierce ? `Flămând · ${s} zile` : scar ? 'Urme de luptă' : 'Pândește';
  return `<span class="wm ${cls}"><span class="wm-m"><img src="${wolfBadge()}" alt="" width="680" height="801" decoding="async">${scar ? '<svg class="wm-sc" viewBox="0 0 40 40"><path d="M22 12l4 11M26 11l4 11M30 12l3 9"/></svg>' : ''}${rest ? '<i class="wm-z">z<i>z</i></i>' : ''}</span><b>${say}</b></span>`;
}
