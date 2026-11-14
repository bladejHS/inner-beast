// "Minte" in three sections: Unelte (breathing, cold, mobility, discipline), Mental (your why, the 28-day routine,
// the victory journal) and Cartea (the book). Also the chapter reader.

import { BOOK, FORMULA, HABIT_STEPS, PRINCIPLES, type Chapter, type Para } from '../../data/book.ts';
import { habitStreak } from '../../logic/progress.ts';
import { dayKey, esc, shortDay } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { art } from '../art.ts';
import { ic } from '../icons.ts';
import { habitCard } from './today.ts';
import { pageHead, segBar, segOf, top } from './shared.ts';

const TOOLS = [
  { k: 'lab', icon: 'wind', name: 'Breathwork Lab', sub: 'Reset, Tactical, Recovery, Advanced' },
  { k: 'wimhof', icon: 'wind', name: 'Wim Hof', sub: 'Așezat sau întins, niciodată în apă' },
  { k: 'breath', icon: 'mind', name: '4-7-8', sub: 'Sesiunea de breathing' },
  { k: 'shower', icon: 'drop', name: 'Shower', sub: '1 min rece, 1 min cald' },
  { k: 'mobility', icon: 'stretch', name: 'Mobility', sub: '30 min, picioare, șolduri, umeri' },
  { k: 'daily', icon: 'bolt', name: 'Daily Mobility', sub: '10 min, rutina lui Alex' },
  { k: 'disc', icon: 'flag', name: 'Discipline', sub: 'No Fap, Dopamine Discipline' },
  { k: 'stretch-push', icon: 'timer', name: 'Dynamic Warm-up', sub: '10 min, umeri și șolduri' },
];
const SCREENS = new Set(['lab', 'disc']);

function whyBlock(): string {
  const w = ctx.S.why;
  const q = (k: 'victim' | 'winner' | 'drive', label: string, ph: string) =>
    `<label class="small" for="why-${k}" style="font-weight:700;display:block;margin:12px 0 6px">${esc(label)}</label><textarea id="why-${k}" data-a="why" data-k="${k}" placeholder="${esc(ph)}">${esc(w[k])}</textarea>`;
  return `<section id="why">${art('why', 'why-art')}
    ${/* Deeper questions since 2026-11-14 (the user's request). The keys are the old ones, so answers already written stay. */ ''}
    ${q('victim', 'Pentru cine te ridici în zilele în care pentru tine n-ai mai face-o?', 'Un nume, o față. Scrie sincer, doar tu vezi asta.')}
    ${q('winner', 'Ce fel de om ești când nu te vede nimeni și nu te obligă nimic? Și ce fel de om vrei să fii?', 'Nu ce vrei să obții. Cine vrei să fii.')}
    ${q('drive', 'Dacă peste un an ești exact unde ești azi, ce o să-ți reproșezi cel mai tare?', 'Răspunsul ăsta e pentru când corpul spune că nu mai poate.')}
    <p class="small dim" style="margin-top:8px">Se salvează singur. Pe ecranul Azi vezi zilnic unul dintre răspunsuri.</p>
  </section>`;
}

function winsBlock(): string {
  const wins = [...ctx.S.wins].reverse();
  return `<section id="wins">
    <div class="row" style="align-items:stretch;gap:8px"><input type="text" id="win-in" placeholder="O victorie, mare sau mică" maxlength="200" aria-label="Victorie nouă"><button class="btn sm" data-a="win-add" style="min-width:96px">Adaugă</button></div>
    <label class="row small" style="justify-content:flex-start;gap:10px;margin:10px 0 4px;font-weight:600"><span class="switch"><input type="checkbox" id="win-big"><span></span></span>E o victorie mare</label>
    ${wins.length ? `<p class="small dim" style="margin-top:12px">${wins.length} ${wins.length === 1 ? 'victorie notată' : 'victorii notate'}. Nu uita cât de departe ai ajuns.</p>` : ''}
    <ul class="hist">${wins
      .slice(0, 40)
      .map((w) => `<li><div><b>${w.big ? `<span class="hl">${ic('star')}</span>` : ''}${esc(w.text)}</b><span>${shortDay(w.date)}</span></div><button class="icon-btn" data-a="win-del" data-id="${w.id}" aria-label="Șterge">${ic('trash')}</button></li>`)
      .join('')}</ul>
  </section>`;
}

function habitsBlock(): string {
  const today = dayKey();
  const active = ctx.S.habits.find((h) => !h.archived);
  const streak = active ? habitStreak(active, today) : 0;
  const old = ctx.S.habits.filter((h) => h.archived);
  return `${habitCard()}
    <ol class="ticks" style="margin-top:10px">${HABIT_STEPS.map(([d, t]) => `<li style="${streak >= d ? 'color:var(--white)' : 'color:var(--dim)'}"><b>${d} zile.</b> ${esc(t)}</li>`).join('')}</ol>
    <div class="btn-row"><button class="btn ghost sm" data-a="hab-edit">Schimbă rutina</button>${streak >= 28 ? '<button class="btn sm" data-a="hab-new">Adaugă un obicei nou</button>' : ''}</div>
    ${old.length ? `<p class="small dim" style="margin-top:12px">Obiceiuri construite: ${old.map((h) => esc(h.name)).join(', ')}.</p>` : ''}`;
}

export const MIND_SEGS: Array<[string, string]> = [['tools', 'Unelte'], ['mental', 'Mental'], ['book', 'Cartea']];

function toolsSeg(): string {
  return `<div class="tiles">${TOOLS.map((t) => `<button class="tile" data-a="${SCREENS.has(t.k) ? 'tab' : 'tool'}" data-k="${t.k}">${ic(t.icon)}<b>${esc(t.name)}</b><span>${esc(t.sub)}</span></button>`).join('')}</div>`;
}

function mentalSeg(): string {
  return `<h2 class="sec first">De ce-ul tău<small>„Găsește-ți de ce-ul și îți vei găsi succesul.”</small></h2>
    ${whyBlock()}
    <h2 class="sec">Rutina de 28 de zile<small>Un singur lucru simplu, în fiecare zi. Nu te culci până nu e gata.</small></h2>
    ${habitsBlock()}
    <h2 class="sec">Jurnalul victoriilor<small>Privește înapoi la victoriile tale, mari și mici.</small></h2>
    ${winsBlock()}
    <section class="card" style="margin-top:28px"><p class="label">Alex</p><h3>Mentalitatea lui Alex</h3><p class="dim" style="margin:0 0 12px">Toate mesajele lui din video-uri sunt în Lupte, la Alex.</p><button class="btn ghost sm" data-a="tab" data-k="alex">Deschide Alex</button></section>`;
}

function bookSeg(): string {
  return `<p class="lead dim">Unleash Your Inner Beast, tot în afară de nutriție.</p>
    <ul class="toc">${BOOK.map((c) => `<li class="${/^\d$/.test(c.num) ? 'sub' : ''}"><button data-a="chapter" data-id="${c.id}"><span class="n">${esc(c.num)}</span><span class="t">${esc(c.title)}</span>${ic('chev')}</button></li>`).join('')}</ul>
    <div class="sign">${art('trust')}</div>`;
}

export function mindHtml(): string {
  const seg = segOf('mind', MIND_SEGS.map(([k]) => k));
  const body = seg === 'mental' ? mentalSeg() : seg === 'book' ? bookSeg() : toolsSeg();
  return `${top()}
    ${pageHead('Minte', 'Respirație, frig, disciplină și de ce-ul tău.')}
    ${segBar('Secțiuni Minte', MIND_SEGS, seg)}
    <div class="seg-body" data-seg="${seg}">${body}</div>`;
}

// ---------- reader ----------
function para(p: Para): string {
  if (typeof p === 'string') return `<p>${esc(p)}</p>`;
  if ('hl' in p) return `<p class="hl-p">${esc(p.hl)}</p>`;
  if ('list' in p) return `<ul class="ticks">${p.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  if ('note' in p) return `<aside class="check-note"><b>Ce spun studiile</b><p>${esc(p.note)}</p></aside>`;
  return `<ol class="steps">${p.steps.map(([a, b]) => `<li><b>${esc(a)}</b>${esc(b)}</li>`).join('')}</ol>`;
}

function formulaSvg(): string {
  const n = FORMULA.length;
  const R = 49;
  const r = 22;
  const segs = FORMULA.map((label, i) => {
    // start at the top-right like the e-book's wheel, each segment ends in an arrow tip
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.05;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.05;
    const tip = a1 + 0.09;
    const p = (a: number, rad: number) => `${(50 + rad * Math.cos(a)).toFixed(2)} ${(50 + rad * Math.sin(a)).toFixed(2)}`;
    const mid = (a0 + a1) / 2;
    const tx = 50 + 35.5 * Math.cos(mid);
    const ty = 50 + 35.5 * Math.sin(mid);
    const words = label.toUpperCase().split(' ');
    const lines = words.length > 2 ? [words[0], words.slice(1).join(' ')] : [label.toUpperCase()];
    const text = lines
      .map((l, k) => `<tspan x="${tx.toFixed(2)}" dy="${k === 0 ? (-(lines.length - 1) * 2).toFixed(1) : '4.2'}">${esc(l)}</tspan>`)
      .join('');
    return `<path d="M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(tip, (R + r) / 2)} L${p(a1, r)} A${r} ${r} 0 0 0 ${p(a0, r)} L${p(a0 + 0.09, (R + r) / 2)} Z" fill="#fff"/><text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-family="Archivo, sans-serif" font-weight="800" font-stretch="condensed" font-size="3.5" fill="#000">${text}</text>`;
  }).join('');
  return `<div class="formula"><svg viewBox="0 0 100 100" role="img" aria-label="${esc(FORMULA.join(', apoi '))}">${segs}</svg></div>`;
}

function chapterTool(c: Chapter): string {
  switch (c.tool) {
    case 'formula':
      return formulaSvg();
    case 'warrior': {
      const v = ctx.S.warrior[dayKey()];
      if (v === 'v') return `<div class="card white">${art('masks', 'card-art')}<h3>20 de flotări. Acum.</h3><p>Apoi răspunde din nou.</p><button class="btn" data-a="warrior" data-v="">Am făcut 20</button></div>`;
      if (v === 'w') return `<div class="card lime">${art('wolf', 'card-art')}<h3>Războinic.</h3><p class="dim">Poartă-te ca atare azi.</p></div>`;
      return `<div class="btn-row"><button class="btn ghost" data-a="warrior" data-v="v">Victimă</button><button class="btn" data-a="warrior" data-v="w">Războinic</button></div>`;
    }
    case 'habit':
      return `<h2 class="sec">Rutina ta</h2>${habitCard()}`;
    case 'why':
    case 'drive':
      return `<h2 class="sec">De ce-ul tău</h2>${whyBlock()}`;
    case 'wins':
      return `<h2 class="sec">Jurnalul victoriilor</h2>${winsBlock()}`;
    case 'principles':
      return `<div class="principles">${PRINCIPLES.map((p) => `<div class="principle"><b>${esc(p.title)}</b>${esc(p.text)}</div>`).join('')}</div>`;
    case 'plan':
      return '<button class="btn" data-a="tab" data-k="plan">Vezi planul</button>';
    case 'recovery':
      return `<div class="tiles">
        <button class="tile" data-a="tab" data-k="today">${ic('moon')}<b>Somn</b><span>Notează orele pe ecranul Azi</span></button>
        <button class="tile" data-a="tool" data-k="shower">${ic('drop')}<b>Rece</b><span>Dușul alternativ</span></button>
        <button class="tile" data-a="tool" data-k="mobility">${ic('stretch')}<b>Mobilitate</b><span>30 de minute</span></button>
        <button class="tile" data-a="tool" data-k="wimhof">${ic('wind')}<b>Meditație</b><span>Wim Hof</span></button>
      </div>`;
    default:
      return '';
  }
}

export function chapterHtml(id: string): string {
  const i = BOOK.findIndex((c) => c.id === id);
  const c = BOOK[i] ?? BOOK[0];
  const prev = BOOK[i - 1];
  const next = BOOK[i + 1];
  return `${top(true)}
    ${pageHead(c.title, '', `Capitolul ${esc(c.num)}`, 'sm')}
    <div class="reader">${c.body.map(para).join('')}</div>
    ${chapterTool(c)}
    <div class="btn-row" style="margin-top:28px">
      ${prev ? `<button class="btn ghost sm" data-a="chapter" data-id="${prev.id}">Înapoi</button>` : '<span></span>'}
      ${next ? `<button class="btn sm" data-a="chapter" data-id="${next.id}">Mai departe</button>` : '<button class="btn sm" data-a="tab" data-k="today">E timpul să ataci</button>'}
    </div>`;
}
