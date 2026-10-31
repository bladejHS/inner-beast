// "Activități": imported GPX / TCX tracks, their statistics, and the gear that carried them.

import { gearMeters, parseActivity, type Activity } from '../../logic/activities.ts';
import { routePath } from '../../logic/geo.ts';
import { addDays, dayKey, esc, km, mmss, paceStr, shortDay, uid, weekStart } from '../../logic/util.ts';
import { ask, ctx, openSheet, closeSheet, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';
import { bars } from '../charts.ts';
import { top } from './shared.ts';

const pace = (a: Activity): string => (a.m ? paceStr((a.dur / a.m) * 1000) : '–');

function row(a: Activity): string {
  const g = ctx.S.gear.find((x) => x.id === a.gear);
  return `<li><button class="more-r" data-a="ac:open" data-id="${a.id}"><span class="more-t"><b>${esc(a.name)}</b><span>${esc(a.sport)}, ${shortDay(a.date)}, ${km(a.m)} km în ${mmss(a.dur)}${g ? `, ${esc(g.name)}` : ''}</span></span>${ic('chev')}</button></li>`;
}

export function activitiesHtml(): string {
  const L = [...ctx.S.act].sort((a, b) => b.ts - a.ts);
  const mon = weekStart(dayKey());
  const week = L.filter((a) => a.date >= mon);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const s = addDays(mon, (i - 7) * 7);
    const e = addDays(s, 7);
    return { v: Math.round(L.filter((a) => a.date >= s && a.date < e).reduce((t, a) => t + a.m, 0) / 1000), label: s.slice(8) };
  });
  const best = L.filter((a) => a.m >= 1000).reduce<Activity | null>((b, a) => (!b || a.dur / a.m < b.dur / b.m ? a : b), null);
  return `${top()}<h1 class="stack mid">Activități</h1>
    <section class="card">
      <h3>Importă un traseu</h3>
      <p class="small dim">Fișiere GPX sau TCX din ceas, Strava, Garmin. Rămân doar pe telefonul tău.</p>
      <label class="btn">${ic('upload')} Alege fișiere<input type="file" id="ac-file" data-a="ac:file" accept=".gpx,.tcx,application/gpx+xml" multiple hidden></label>
    </section>
    <div class="stats" style="margin:12px 0">
      <div class="stat"><b>${km(week.reduce((s, a) => s + a.m, 0))}</b><span>km săptămâna asta</span></div>
      <div class="stat"><b>${L.length}</b><span>activități</span></div>
      <div class="stat"><b>${km(L.reduce((s, a) => s + a.m, 0))}</b><span>km în total</span></div>
      <div class="stat"><b>${best ? pace(best) : '–'}</b><span>cel mai bun ritm /km</span></div>
    </div>
    ${L.length ? `<section class="card"><h3>Km pe săptămână</h3>${bars(weeks)}</section>` : ''}
    <section class="card"><div class="row"><h3 style="margin:0">Echipament</h3><button class="icon-btn" data-a="ac:gear" aria-label="Adaugă echipament">${ic('plus')}</button></div>
      ${ctx.S.gear.length ? `<ul class="hist">${ctx.S.gear.map((g) => {
        const m = gearMeters(g, ctx.S.act);
        return `<li><div><b>${esc(g.name)}</b><span>${km(m)} din ${km(g.limit)} km${m >= g.limit ? ', de schimbat' : ''}</span></div><button class="icon-btn" data-a="ac:gear-del" data-id="${g.id}" aria-label="Șterge">${ic('trash')}</button></li>`;
      }).join('')}</ul>` : '<p class="small dim">Adaugă pantofii și vezi câți kilometri au.</p>'}
    </section>
    ${L.length ? `<section class="card"><h3>Istoric</h3><ul class="plain">${L.map(row).join('')}</ul></section>` : ''}`;
}

export function acChange(a: string, el: HTMLElement, render: () => void): void {
  if (a !== 'ac:file') return;
  const input = el as HTMLInputElement;
  const files = [...(input.files ?? [])];
  void Promise.all(files.map(async (f) => parseActivity(await f.text(), f.name, uid()))).then((res) => {
    const seen = new Set(ctx.S.act.map((x) => x.ts));
    const ok = res.filter((x): x is Activity => !!x && !seen.has(x.ts));
    ctx.S.act.push(...ok);
    save();
    input.value = '';
    toast(ok.length ? `${ok.length} ${ok.length === 1 ? 'activitate importată' : 'activități importate'}.` : 'Nimic nou: fișier fără traseu sau deja importat.');
    render();
  });
}

function detail(a: Activity, render: () => void): void {
  const path = routePath(a.route);
  openSheet(
    `<h2>${esc(a.name)}</h2><p class="small dim">${esc(a.sport)}, ${shortDay(a.date)}</p>
    ${path ? `<svg viewBox="0 0 300 180" style="width:100%" role="img" aria-label="Traseu"><path d="${path}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
    <div class="stats">
      <div class="stat"><b>${km(a.m)}</b><span>km</span></div><div class="stat"><b>${mmss(a.dur)}</b><span>durată</span></div>
      <div class="stat"><b>${pace(a)}</b><span>ritm /km</span></div><div class="stat"><b>${a.gain}</b><span>m urcare</span></div>
      ${a.hr ? `<div class="stat"><b>${a.hr}</b><span>puls mediu</span></div><div class="stat"><b>${a.hrMax}</b><span>puls maxim</span></div>` : ''}
    </div>
    ${a.splits.length ? `<h3>Pe kilometru</h3><ul class="hist">${a.splits.map((s, i) => `<li><div><b>Km ${i + 1}</b><span>${paceStr(s)}</span></div></li>`).join('')}</ul>` : ''}
    ${ctx.S.gear.length ? `<label class="small" for="ac-g" style="font-weight:700">Echipament</label><select id="ac-g"><option value="">Fără</option>${ctx.S.gear.map((g) => `<option value="${g.id}" ${g.id === a.gear ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>` : ''}
    <div class="btn-row" style="margin-top:14px"><button class="btn ghost danger" data-a="ac-del">Șterge</button><button class="btn" data-a="ac-ok">Gata</button></div>`,
    {
      'ac-ok': () => {
        const s = document.getElementById('ac-g') as HTMLSelectElement | null;
        if (s) a.gear = s.value || undefined;
        save();
        closeSheet();
        render();
      },
      'ac-del': () => {
        ctx.S.act = ctx.S.act.filter((x) => x.id !== a.id);
        save();
        closeSheet();
        render();
      },
    },
  );
}

export function acAct(a: string, el: HTMLElement, render: () => void): void {
  const id = el.dataset.id;
  if (a === 'ac:open') {
    const x = ctx.S.act.find((v) => v.id === id);
    if (x) detail(x, render);
  } else if (a === 'ac:gear-del') {
    ask('Ștergi echipamentul?', 'Activitățile rămân.', 'Șterge', () => {
      ctx.S.gear = ctx.S.gear.filter((g) => g.id !== id);
      ctx.S.act.forEach((v) => {
        if (v.gear === id) v.gear = undefined;
      });
      save();
      render();
    }, 'Renunță', true);
  } else if (a === 'ac:gear') {
    openSheet(
      `<h2>Echipament nou</h2><input type="text" id="g-n" placeholder="ex. Pantofi de alergare" maxlength="40">
      <div class="field"><div class="field-l">Limită km</div><input type="number" id="g-l" value="700" style="width:100px"></div>
      <div class="field"><div class="field-l">Km deja făcuți</div><input type="number" id="g-b" value="0" style="width:100px"></div>
      <button class="btn" data-a="g-save">Salvează</button>`,
      {
        'g-save': () => {
          const v = (i: string): string => (document.getElementById(i) as HTMLInputElement).value.trim();
          if (!v('g-n')) return toast('Scrie un nume.');
          ctx.S.gear.push({ id: uid(), name: v('g-n'), limit: (Number(v('g-l')) || 700) * 1000, base: (Number(v('g-b')) || 0) * 1000 });
          save();
          closeSheet();
          render();
        },
      },
    );
  }
}
