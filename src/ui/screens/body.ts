// Body weight (kg) and progress photos every 2 weeks, with a before / after comparison. Shown on "Progres".

import { delPhoto, getPhoto, putPhoto, shrink } from '../../logic/photodb.ts';
import { addDays, dayKey, daysBetween, esc, shortDay, uid } from '../../logic/util.ts';
import { spark } from '../charts.ts';
import { ask, ctx, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';

export const PHOTO_EVERY = 14;

const kgStr = (v: number): string => v.toFixed(1).replace('.', ',');
const signed = (v: number): string => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${kgStr(Math.abs(v))}`;

/** Weight on a day, or the closest weigh-in before it. */
function kgAt(day: string): number | undefined {
  const ds = Object.keys(ctx.S.weight).filter((d) => d <= day).sort();
  return ds.length ? ctx.S.weight[ds[ds.length - 1]] : undefined;
}

/** Days until the next photo is due (0 = today or overdue). */
export function photoDue(today = dayKey()): number {
  const ph = ctx.S.photos;
  if (!ph.length) return 0;
  return Math.max(0, PHOTO_EVERY - daysBetween(ph[ph.length - 1].date, today));
}

// ---------- weight ----------
export function weightHtml(): string {
  const today = dayKey();
  const W = ctx.S.weight;
  const days = Object.keys(W).sort();
  const n = days.length;
  const last = n ? W[days[n - 1]] : 0;
  const first = n ? W[days[0]] : 0;
  const wk = kgAt(addDays(today, -7));
  const todayV = W[today];
  const stats = n
    ? `<div class="stats" style="margin-bottom:12px">
        <div class="stat"><b>${kgStr(last)}</b><span>kg acum</span></div>
        <div class="stat"><b>${n > 1 ? signed(last - first) : '–'}</b><span>kg de la început (${esc(shortDay(days[0]))})</span></div>
        ${wk !== undefined && n > 1 && days[0] <= addDays(today, -7) ? `<div class="stat"><b>${signed(last - wk)}</b><span>kg față de acum o săptămână</span></div>` : ''}
        <div class="stat"><b>${n}</b><span>${n === 1 ? 'cântărire' : 'cântăriri'}</span></div>
      </div>`
    : '';
  const shown = days.slice(-30);
  const chart = n > 1 ? `<div class="kg-chart">${spark(shown.map((d) => W[d]))}<div class="kg-ax"><span>${esc(shortDay(shown[0]))}</span><span>${esc(shortDay(shown[shown.length - 1]))}</span></div></div>` : '';
  const list = days
    .slice(-5)
    .reverse()
    .map((d, i) => {
      const prev = days[n - 2 - i];
      return `<li><div><b>${kgStr(W[d])} kg</b><span>${esc(shortDay(d))}${prev !== undefined ? `, ${signed(W[d] - W[prev])} kg` : ''}</span></div><button class="icon-btn" data-a="body:kg-del" data-d="${d}" aria-label="Șterge">${ic('trash')}</button></li>`;
    })
    .join('');
  return `<h2 class="sec">Greutate<small>Dimineața, pe stomacul gol, mereu în același fel</small></h2>
    ${stats}
    <div class="kg-in">
      <label class="sr" for="kg-in">Kilograme azi</label>
      <input id="kg-in" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="${n ? kgStr(last) : 'kg'}" value="${todayV ?? ''}">
      <button class="btn sm" data-a="body:kg-save">${todayV ? 'Actualizează' : 'Salvează'}</button>
    </div>
    ${chart}
    ${list ? `<ul class="hist">${list}</ul>` : '<p class="dim">Prima cântărire e punctul de plecare.</p>'}`;
}

// ---------- photos ----------
let cmpA = '';
let cmpB = '';
let cmpX = 50;

export function photosHtml(): string {
  const ph = ctx.S.photos;
  const due = photoDue();
  const sub = ph.length ? (due ? `Următoarea în ${due} ${due === 1 ? 'zi' : 'zile'}` : 'Azi e ziua pozei') : 'O poză la fiecare 2 săptămâni';
  const head = `<h2 class="sec">Poze de progres<small>${sub}</small></h2>`;
  const add = `<label class="btn ${ph.length && due ? 'ghost' : ''} ph-add">${ic('plus')}<span>${ph.length ? 'Adaugă poza' : 'Prima poză'}</span><input type="file" accept="image/*" data-a="body:file" class="sr"></label>
    <p class="small dim" style="margin:8px 0 14px">Aceeași lumină, același loc, aceeași poziție. Pozele stau doar pe telefon.</p>`;
  if (!ph.length) return head + add;
  if (!ph.some((p) => p.id === cmpA)) cmpA = ph[0].id;
  if (!ph.some((p) => p.id === cmpB)) cmpB = ph[ph.length - 1].id;
  const a = ph.find((p) => p.id === cmpA)!;
  const b = ph.find((p) => p.id === cmpB)!;
  let cmp = '';
  if (ph.length > 1) {
    const ka = kgAt(a.date);
    const kb = kgAt(b.date);
    const gap = Math.abs(daysBetween(a.date, b.date));
    const opts = (sel: string): string => ph.map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(shortDay(p.date))}</option>`).join('');
    cmp = `<div class="cmp-pick">
        <label><span>Înainte</span><select data-a="body:cmp-a">${opts(cmpA)}</select></label>
        <label><span>După</span><select data-a="body:cmp-b">${opts(cmpB)}</select></label>
      </div>
      <div class="cmp" style="--x:${cmpX}%">
        <img data-ph="${b.id}" alt="După, ${esc(shortDay(b.date))}">
        <img data-ph="${a.id}" class="cmp-top" alt="Înainte, ${esc(shortDay(a.date))}">
        <i class="cmp-line"></i>
        <span class="cmp-l">Înainte</span><span class="cmp-r">După</span>
        <input type="range" min="0" max="100" value="${cmpX}" data-a="body:cmp-x" aria-label="Glisează între înainte și după">
      </div>
      <p class="small" style="margin:8px 0 14px"><b>${gap} ${gap === 1 ? 'zi' : 'zile'}</b> între poze${ka !== undefined && kb !== undefined ? `, ${signed(kb - ka)} kg` : ''}. Glisează pe poză.</p>`;
  }
  const grid = `<div class="ph-grid">${[...ph]
    .reverse()
    .map((p) => {
      const k = kgAt(p.date);
      return `<figure><img data-ph="${p.id}" alt="${esc(shortDay(p.date))}"><figcaption>${esc(shortDay(p.date))}${k !== undefined ? `, ${kgStr(k)} kg` : ''}</figcaption><button class="icon-btn" data-a="body:ph-del" data-id="${p.id}" aria-label="Șterge poza">${ic('trash')}</button></figure>`;
    })
    .join('')}</div>`;
  return head + cmp + add + grid;
}

/** Card on "Azi" once the 2 weeks are up. */
export function photoReminderCard(): string {
  if (!ctx.S.photos.length || photoDue()) return '';
  return `<section class="card"><div class="row"><div class="row-l"><h3>Ziua pozei</h3><p class="small dim" style="margin:0">Au trecut 2 săptămâni. Fă poza și vezi diferența.</p></div><button class="bk-go" data-a="tab" data-k="progress" aria-label="Mergi la poze">${ic('play')}</button></div></section>`;
}

// ---------- loading pictures ----------
const urls = new Map<string, string>();

/** Fills every <img data-ph> under root from IndexedDB (object URLs are cached). */
export function hydratePhotos(root: ParentNode): void {
  root.querySelectorAll<HTMLImageElement>('img[data-ph]').forEach((img) => {
    const id = img.dataset.ph!;
    const u = urls.get(id);
    if (u) {
      img.src = u;
      return;
    }
    getPhoto(id)
      .then((b) => {
        if (!b) return;
        const nu = urls.get(id) ?? URL.createObjectURL(b);
        urls.set(id, nu);
        img.src = nu;
      })
      .catch(() => {});
  });
}

// ---------- actions ----------
export function bodyAct(a: string, el: HTMLElement, render: () => void): void {
  const S = ctx.S;
  switch (a) {
    case 'body:kg-save': {
      const inp = document.getElementById('kg-in') as HTMLInputElement | null;
      const v = parseFloat((inp?.value ?? '').replace(',', '.'));
      if (!(v >= 30 && v <= 250)) return toast('Scrie greutatea în kg, de exemplu 78,4.');
      S.weight[dayKey()] = Math.round(v * 10) / 10;
      save();
      toast('Greutate notată.');
      return render();
    }
    case 'body:kg-del':
      delete S.weight[el.dataset.d || ''];
      save();
      return render();
    case 'body:ph-del':
      ask('Ștergi poza?', 'Dispare de pe telefon. Nu se poate anula.', 'Șterge', () => {
        const id = el.dataset.id || '';
        S.photos = S.photos.filter((p) => p.id !== id);
        save();
        delPhoto(id).catch(() => {});
        const u = urls.get(id);
        if (u) URL.revokeObjectURL(u);
        urls.delete(id);
        render();
      }, 'Renunță', true);
      return;
  }
}

export function bodyChange(a: string, el: HTMLElement, render: () => void): void {
  if (a === 'body:file') {
    const inp = el as HTMLInputElement;
    const f = inp.files?.[0];
    if (!f) return;
    toast('Salvez poza…');
    shrink(f)
      .then(async (blob) => {
        const id = uid();
        await putPhoto(id, blob);
        ctx.S.photos.push({ id, date: dayKey() });
        ctx.S.photos.sort((x, y) => x.date.localeCompare(y.date));
        cmpB = id;
        save();
        toast('Poză salvată. Următoarea peste 2 săptămâni.');
        render();
      })
      .catch(() => toast('Nu am putut salva poza.'));
    return;
  }
  if (a === 'body:cmp-a') cmpA = (el as HTMLSelectElement).value;
  if (a === 'body:cmp-b') cmpB = (el as HTMLSelectElement).value;
  render();
}

export function bodyInput(a: string, el: HTMLElement): void {
  if (a !== 'body:cmp-x') return;
  cmpX = Number((el as HTMLInputElement).value);
  el.closest<HTMLElement>('.cmp')?.style.setProperty('--x', `${cmpX}%`);
}
