// The objective: Brigada Antiteroristă (data/sri.ts). A dossier card on Azi with the three marks and the average
// against 9.00, the days to the selection when a date is set, and the full section in Progres → Teste.

import { SRI_EVENTS, SRI_MIN_AVG, SRI_STAGES, sriNeed, sriStatus, type SriEvent } from '../../data/sri.ts';
import { daysBetween, esc, mmss, shortDay } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';

const val = (ev: SriEvent, v: number): string => (ev.unit === 'mm:ss' ? mmss(v) : ev.unit === 's' ? `${v.toFixed(1).replace('.', ',')} s` : `${v}`);
const mark = (m: number | undefined): string => (m === undefined ? '–' : m.toFixed(m === Math.round(m) ? 0 : 2).replace('.', ','));

/** Days left to the selection date; null without one. */
export function goalDays(today: string): number | null {
  const d = ctx.S.goal.date;
  return d ? daysBetween(today, d) : null;
}

function meter(avg: number | undefined): string {
  const f = Math.max(0, Math.min(1, (avg ?? 0) / 10));
  return `<div class="gl-meter" role="img" aria-label="Media ${mark(avg)} din 10, prag ${SRI_MIN_AVG}"><i style="--f:${f.toFixed(3)}"></i><b style="left:${SRI_MIN_AVG * 10}%"><span>${SRI_MIN_AVG},00</span></b></div>`;
}

/** The three events, each with the latest result, its mark, and what the next mark asks for. */
function rows(full: boolean): string {
  const st = sriStatus(ctx.S.tests);
  return `<ul class="gl-rows">${st.rows.map((r) => {
    const next = r.mark !== undefined && r.mark < 10 ? sriNeed(r.ev, r.mark + 1) : undefined;
    const sub = r.v === undefined
      ? `Netestat · nota 9: ${val(r.ev, sriNeed(r.ev, 9)!)}`
      : `${val(r.ev, r.v)}, ${shortDay(r.date!)}${next !== undefined ? ` · nota ${r.mark! + 1}: ${val(r.ev, next)}` : r.mark === 10 ? ' · maxim' : ` · nota 1: ${val(r.ev, sriNeed(r.ev, 1)!)}`}`;
    return `<li><div><b>${esc(r.ev.name)}</b><span>${esc(sub)}</span></div><em class="gl-n ${r.mark === undefined ? '' : r.mark >= SRI_MIN_AVG ? 'ok' : 'low'}">${mark(r.mark)}</em>${full ? `<button class="btn ghost sm" data-a="test" data-k="${r.ev.id}" aria-label="Notează ${esc(r.ev.name)}">Notează</button>` : ''}</li>`;
  }).join('')}</ul>`;
}

/** The dossier on Azi. */
export function goalCard(today: string): string {
  const st = sriStatus(ctx.S.tests);
  const days = goalDays(today);
  const when = days === null ? '<button class="link" data-a="goal-date">Setează data selecției</button>'
    : days > 0 ? `<b class="num">${days}</b> ${days === 1 ? 'zi' : 'zile'} până la selecție` : days === 0 ? '<b>Azi</b> e selecția' : `Selecția a fost acum ${-days} ${-days === 1 ? 'zi' : 'zile'}`;
  const verdict = st.avg === undefined
    ? 'Fă cele trei probe în săptămâna de teste: de aici pornește dosarul.'
    : st.ready ? 'Peste prag la toate trei. Ține nivelul și crește marja.'
      : st.complete ? `Media e sub ${SRI_MIN_AVG},00. Ridică nota cea mai mică întâi.` : 'Mai lipsesc probe: media se calculează din toate trei.';
  return `<section class="card goal" aria-label="Obiectivul tău">
    <div class="gl-tape" aria-hidden="true"></div>
    <div class="row"><div class="row-l"><p class="label">Obiectiv · dosar</p><h3>Brigada Antitero</h3><p class="small dim" style="margin:4px 0 0">${when}</p></div>
      <div class="gl-avg"><b class="num">${mark(st.avg)}</b><span>media · prag ${SRI_MIN_AVG},00</span></div></div>
    ${meter(st.avg)}
    ${rows(false)}
    <p class="small" style="margin:10px 0 0">${esc(verdict)}</p>
    <button class="link" data-a="tab" data-k="progress" data-to="tests">Dosarul complet</button></section>`;
}

/** Progres → Teste: the dossier, the table and the stages. */
export function goalHtml(today: string): string {
  const st = sriStatus(ctx.S.tests);
  const days = goalDays(today);
  return `<section class="card goal" aria-label="Brigada Antitero">
    <div class="gl-tape" aria-hidden="true"></div>
    <p class="label">Obiectiv · dosar</p><h3>Brigada Antitero</h3>
    <p class="small dim" style="margin:4px 0 0">${days === null ? 'Fără dată de selecție.' : days > 0 ? `${days} ${days === 1 ? 'zi' : 'zile'} până la selecție, ${shortDay(ctx.S.goal.date)}.` : 'Data selecției a trecut.'} <button class="link" data-a="goal-date">${days === null ? 'Setează data' : 'Schimbă data'}</button></p>
    <div class="gl-avg big"><b class="num">${mark(st.avg)}</b><span>media probelor · prag ${SRI_MIN_AVG},00 la intervenție</span></div>
    ${meter(st.avg)}
    ${rows(true)}
    <h4 class="gl-h">Baremul publicat de SRI, bărbați</h4>
    <div class="gl-table" role="table" aria-label="Baremul probelor">
      <div role="row" class="gl-tr gl-th"><span>Nota</span>${SRI_EVENTS.map((e) => `<span>${esc(e.id === 'sprint50' ? '50 m' : e.id === 'run1000' ? '1000 m' : 'Tracțiuni')}</span>`).join('')}</div>
      ${[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((m) => `<div role="row" class="gl-tr ${m === SRI_MIN_AVG ? 'mark' : ''}"><span>${m}</span>${SRI_EVENTS.map((e) => `<span>${esc(val(e, sriNeed(e, m)!))}</span>`).join('')}</div>`).join('')}
    </div>
    <h4 class="gl-h">Etapele selecției</h4>
    <ol class="gl-stages">${SRI_STAGES.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="small dim">Baremul e din anunțul SRI pentru luptător antiterorist (2024) și pragul din broșura Brigăzii; înainte de înscriere verifici pe sri.ro tabelul anului și condițiile. Aici, în plus față de probe: forța picioarelor, trunchiul, kickboxingul și pulsul, ca selecția să te găsească pregătit la tot, nu doar la cele trei.</p>
  </section>`;
}
