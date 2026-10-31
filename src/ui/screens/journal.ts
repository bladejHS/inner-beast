// "Jurnal": the daily check-in, body measurements, symptoms, medication and goals (SparkyFitness's
// tracking areas the app didn't have). Food, fasting, weight, sleep and steps stay where they already are.

import { addDays, dayKey, esc, shortDay, uid } from '../../logic/util.ts';
import { spark } from '../charts.ts';
import { closeSheet, ctx, openSheet, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';
import { top } from './shared.ts';

const SCALE: Array<['mood' | 'energy' | 'stress', string]> = [['mood', 'Dispoziție'], ['energy', 'Energie'], ['stress', 'Stres']];
const MEASURES = ['Piept', 'Braț', 'Coapsă', 'Șold', 'Gât', 'Grăsime %'];

export function journalHtml(): string {
  const S = ctx.S;
  const today = dayKey();
  const c = S.chk[today] ?? {};
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  const series = (k: 'mood' | 'energy' | 'stress'): number[] => days.flatMap((d) => (S.chk[d]?.[k] ? [S.chk[d][k] as number] : []));
  const meds = S.meds.map((m) => {
    const on = m.days.includes(today);
    return `<li><div><b>${esc(m.name)}</b><span>${esc(m.dose)}</span></div><button class="icon-btn" data-a="jr:med" data-id="${m.id}" aria-pressed="${on}" aria-label="Luat azi">${ic(on ? 'check' : 'plus')}</button><button class="icon-btn" data-a="jr:med-del" data-id="${m.id}" aria-label="Șterge">${ic('trash')}</button></li>`;
  });
  return `${top()}<h1 class="stack mid">Jurnal</h1>
    <section class="card"><h3>Azi</h3>
      ${SCALE.map(([k, t]) => `<div class="field"><div class="field-l">${t}</div><div class="btn-row">${[1, 2, 3, 4, 5].map((n) => `<button class="btn ${c[k] === n ? '' : 'ghost'} jr-n" data-a="jr:scale" data-k="${k}" data-n="${n}">${n}</button>`).join('')}</div></div>`).join('')}
      <div class="field"><div class="field-l">Ore de somn</div><input type="number" step="0.5" data-a="jr:sleep" value="${S.sleep[today] ?? ''}" style="width:100px"></div>
      <textarea data-a="jr:note" rows="2" maxlength="300" placeholder="O notă despre ziua de azi">${esc(c.note ?? '')}</textarea>
    </section>
    <section class="card"><h3>Ultimele 30 de zile</h3>
      ${SCALE.map(([k, t]) => {
        const v = series(k);
        return `<div class="row"><span class="small">${t}</span>${v.length > 1 ? spark(v) : '<span class="small dim">Încă puține date</span>'}</div>`;
      }).join('')}
    </section>
    <section class="card"><div class="row"><h3 style="margin:0">Măsurători (cm)</h3><button class="icon-btn" data-a="jr:meas" aria-label="Adaugă">${ic('plus')}</button></div>
      <ul class="hist">${MEASURES.map((m) => {
        const h = S.meas[m] ?? {};
        const ds = Object.keys(h).sort();
        return ds.length ? `<li><div><b>${esc(m)}: ${h[ds[ds.length - 1]]}</b><span>${shortDay(ds[ds.length - 1])}${ds.length > 1 ? `, ${(h[ds[ds.length - 1]] - h[ds[0]]).toFixed(1)} de la început` : ''}</span></div></li>` : '';
      }).join('')}</ul>
    </section>
    <section class="card"><div class="row"><h3 style="margin:0">Medicamente</h3><button class="icon-btn" data-a="jr:med-new" aria-label="Adaugă">${ic('plus')}</button></div>
      ${meds.length ? `<ul class="hist">${meds.join('')}</ul>` : '<p class="small dim">Nimic adăugat.</p>'}
    </section>
    <section class="card"><div class="row"><h3 style="margin:0">Simptome</h3><button class="icon-btn" data-a="jr:sym" aria-label="Adaugă">${ic('plus')}</button></div>
      ${S.symp.length ? `<ul class="hist">${[...S.symp].reverse().slice(0, 10).map((x) => `<li><div><b>${esc(x.text)}</b><span>${shortDay(x.date)}, intensitate ${x.lvl} din 5</span></div><button class="icon-btn" data-a="jr:sym-del" data-id="${x.id}" aria-label="Șterge">${ic('trash')}</button></li>`).join('')}</ul>` : '<p class="small dim">Nimic notat.</p>'}
    </section>
    <section class="card"><div class="row"><h3 style="margin:0">Obiective</h3><button class="icon-btn" data-a="jr:goal" aria-label="Adaugă">${ic('plus')}</button></div>
      ${S.goals.length ? `<ul class="hist">${S.goals.map((g) => `<li><div><b>${esc(g.text)}</b><span>${g.now} din ${g.target}${g.now >= g.target ? ', atins' : ''}</span><div class="bar"><i style="width:${Math.min(100, (g.now / g.target) * 100).toFixed(0)}%"></i></div></div><button class="icon-btn" data-a="jr:goal-up" data-id="${g.id}" aria-label="Plus unu">${ic('plus')}</button><button class="icon-btn" data-a="jr:goal-del" data-id="${g.id}" aria-label="Șterge">${ic('trash')}</button></li>`).join('')}</ul>` : '<p class="small dim">Un obiectiv cu un număr: 30 de tracțiuni la rând, 100 km pe lună.</p>'}
    </section>`;
}

export function jrInput(a: string, el: HTMLElement): void {
  const v = (el as HTMLInputElement).value;
  const today = dayKey();
  if (a === 'jr:note') {
    (ctx.S.chk[today] ??= {}).note = v;
    save();
  } else if (a === 'jr:sleep') {
    const n = Number(v);
    if (n > 0 && n <= 24) ctx.S.sleep[today] = n;
    else delete ctx.S.sleep[today];
    save();
  }
}

function form(title: string, body: string, ok: (val: (id: string) => string) => string | void, render: () => void): void {
  openSheet(`<h2>${title}</h2>${body}<div style="height:12px"></div><button class="btn" data-a="f-ok">Salvează</button>`, {
    'f-ok': () => {
      const err = ok((id) => (document.getElementById(id) as HTMLInputElement).value.trim());
      if (err) return toast(err);
      save();
      closeSheet();
      render();
    },
  });
}

export function jrAct(a: string, el: HTMLElement, render: () => void): void {
  const S = ctx.S;
  const today = dayKey();
  const id = el.dataset.id;
  switch (a) {
    case 'jr:scale':
      (S.chk[today] ??= {})[el.dataset.k as 'mood' | 'energy' | 'stress'] = Number(el.dataset.n);
      save();
      return render();
    case 'jr:meas':
      return form('Măsurători de azi', MEASURES.map((m, i) => `<div class="field"><div class="field-l">${m}</div><input type="number" step="0.1" id="m${i}" style="width:100px" value="${S.meas[m]?.[today] ?? ''}"></div>`).join(''), (val) => {
        MEASURES.forEach((m, i) => {
          const n = Number(val(`m${i}`));
          if (n > 0) (S.meas[m] ??= {})[today] = n;
        });
      }, render);
    case 'jr:med-new':
      return form('Medicament sau supliment', '<input type="text" id="md-n" placeholder="Nume" maxlength="40"><input type="text" id="md-d" placeholder="Doză" maxlength="40">', (val) => {
        if (!val('md-n')) return 'Scrie numele.';
        S.meds.push({ id: uid(), name: val('md-n'), dose: val('md-d'), days: [] });
      }, render);
    case 'jr:med': {
      const m = S.meds.find((x) => x.id === id);
      if (m) m.days = m.days.includes(today) ? m.days.filter((d) => d !== today) : [...m.days, today];
      save();
      return render();
    }
    case 'jr:med-del':
      S.meds = S.meds.filter((x) => x.id !== id);
      save();
      return render();
    case 'jr:sym':
      return form('Simptom', '<input type="text" id="sy-t" placeholder="ex. durere de genunchi" maxlength="60"><div class="field"><div class="field-l">Intensitate 1–5</div><input type="number" id="sy-l" value="2" min="1" max="5" style="width:100px"></div>', (val) => {
        if (!val('sy-t')) return 'Scrie simptomul.';
        S.symp.push({ id: uid(), date: today, text: val('sy-t'), lvl: Math.min(5, Math.max(1, Number(val('sy-l')) || 1)) });
      }, render);
    case 'jr:sym-del':
      S.symp = S.symp.filter((x) => x.id !== id);
      save();
      return render();
    case 'jr:goal':
      return form('Obiectiv', '<input type="text" id="go-t" placeholder="Ce vrei să atingi" maxlength="60"><div class="field"><div class="field-l">Număr țintă</div><input type="number" id="go-n" style="width:100px"></div>', (val) => {
        const n = Number(val('go-n'));
        if (!val('go-t') || !(n > 0)) return 'Scrie obiectivul și numărul.';
        S.goals.push({ id: uid(), text: val('go-t'), target: n, now: 0 });
      }, render);
    case 'jr:goal-up': {
      const g = S.goals.find((x) => x.id === id);
      if (g) g.now += 1;
      save();
      return render();
    }
    case 'jr:goal-del':
      S.goals = S.goals.filter((x) => x.id !== id);
      save();
      return render();
  }
}
