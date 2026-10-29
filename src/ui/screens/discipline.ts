// "Discipline Challenges": No Fap and Dopamine Discipline.

import { DOPA_RULES, dopaBest, dopaClean, dopaStreak, MILESTONES, nextMilestone, nofapDays } from '../../logic/discipline.ts';
import { addDays, dayKey, esc, RO_DAYS, weekdayIdx } from '../../logic/util.ts';
import { ask, ctx, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';
import { top } from './shared.ts';

const zile = (n: number): string => `${n} ${n === 1 ? 'zi' : 'zile'}`;

function nofapCard(today: string): string {
  const n = ctx.S.disc.nofap;
  if (!n.start) {
    return `<section class="card"><h3>No Fap</h3>
      <p class="dim">Fără pornografie și fără masturbare. Numeri zilele, iar energia o pui în antrenament.</p>
      <button class="btn" data-a="dc:nf-start">${ic('flag')} Începe de azi</button></section>`;
  }
  const days = nofapDays(n, today);
  const next = nextMilestone(days);
  const prev = [...MILESTONES].reverse().find((m) => m <= days) ?? 0;
  const best = Math.max(n.best, days);
  return `<section class="card lime"><div class="row"><h3 style="margin:0">No Fap</h3><span class="ntag">record ${zile(best)}</span></div>
    <div class="fast-t num">${zile(days)}</div>
    <p class="small" style="margin:0">Următorul prag: ${zile(next)}, mai ai ${zile(next - days)}.</p>
    <div class="bar" aria-hidden="true"><i style="width:${(((days - prev) / (next - prev)) * 100).toFixed(1)}%"></i></div>
    <details class="how"><summary>Când vine impulsul</summary><div class="how-body"><ul class="ticks small">
      <li>Te ridici și ieși din cameră; nu negocia cu el.</li><li>20 de flotări sau 2 minute de shadow boxing, pe loc.</li>
      <li>Duș rece, 1 minut.</li><li>Telefonul în altă cameră, mai ales seara în pat.</li></ul></div></details>
    <button class="btn ghost sm" data-a="dc:nf-reset">Am cedat, o iau de la capăt</button>
    ${n.resets.length ? `<p class="small dim" style="margin:8px 0 0">Reluat de ${n.resets.length} ori. Contează că te ridici.</p>` : ''}</section>`;
}

function dopaCard(today: string): string {
  const d = ctx.S.disc.dopa;
  if (!d.started) {
    return `<section class="card"><h3>Dopamine Discipline</h3>
      <p class="dim">Tai plăcerile ieftine ca munca grea să redevină satisfăcătoare. În fiecare zi bifezi regulile ținute; ziua contează doar dacă le ții pe toate.</p>
      <ul class="ticks small">${DOPA_RULES.map((r) => `<li>${esc(r.t)}</li>`).join('')}</ul>
      <button class="btn" data-a="dc:dp-start">${ic('flag')} Începe de azi</button></section>`;
  }
  const kept = d.days[today] ?? [];
  const streak = dopaStreak(d, today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  return `<section class="card ${dopaClean(d, today) ? 'lime' : ''}"><div class="row"><h3 style="margin:0">Dopamine Discipline</h3><span class="ntag">record ${zile(Math.max(dopaBest(d), streak))}</span></div>
    <div class="fast-t num">${zile(streak)}</div>
    <p class="small" style="margin:0 0 10px">Azi: ${kept.length} din ${DOPA_RULES.length} reguli${dopaClean(d, today) ? '. Zi curată.' : '.'}</p>
    <div class="chips" style="flex-direction:column;align-items:stretch">${DOPA_RULES.map((r) => `<button class="chip" style="justify-content:flex-start;text-align:left" aria-pressed="${kept.includes(r.id)}" data-a="dc:dp" data-k="${r.id}">${kept.includes(r.id) ? ic('check') : ''}${esc(r.t)}</button>`).join('')}</div>
    <div class="dc-week" aria-label="Ultimele 7 zile">${week.map((k) => `<span class="${dopaClean(d, k) ? 'ok' : (d.days[k] ?? []).length ? 'part' : ''}"><i></i>${RO_DAYS[weekdayIdx(k)].slice(0, 2)}</span>`).join('')}</div>
    <button class="link" data-a="dc:dp-stop">Oprește provocarea</button></section>`;
}

export function disciplineHtml(): string {
  const today = dayKey();
  return `${top()}<h1 class="stack mid">Discipline Challenges</h1>
    <p class="dim" style="margin-top:-6px">Disciplina e un mușchi. Îl antrenezi zilnic, ca pe restul.</p>
    ${nofapCard(today)}
    ${dopaCard(today)}`;
}

export function discAct(a: string, el: HTMLElement, render: () => void): void {
  const D = ctx.S.disc;
  const today = dayKey();
  switch (a) {
    case 'dc:nf-start':
      D.nofap.start = today;
      save();
      return render();
    case 'dc:nf-reset':
      return ask('O iei de la capăt?', 'Seria de acum se oprește; recordul rămâne. Ziua de azi devine ziua 0.', 'De la capăt', () => {
        D.nofap.best = Math.max(D.nofap.best, nofapDays(D.nofap, today));
        D.nofap.resets = [...D.nofap.resets, today].slice(-200);
        D.nofap.start = today;
        save();
        toast('Ziua 0. Mergi mai departe.');
        render();
      });
    case 'dc:dp-start':
      D.dopa.started = today;
      save();
      return render();
    case 'dc:dp': {
      const id = el.dataset.k ?? '';
      const kept = D.dopa.days[today] ?? [];
      D.dopa.days[today] = kept.includes(id) ? kept.filter((x) => x !== id) : [...kept, id];
      save();
      if (dopaClean(D.dopa, today)) toast('Zi curată.');
      return render();
    }
    case 'dc:dp-stop':
      return ask('Oprești provocarea?', 'Zilele bifate rămân salvate; o poți reporni oricând.', 'Oprește', () => {
        D.dopa.started = null;
        save();
        render();
      });
  }
}
