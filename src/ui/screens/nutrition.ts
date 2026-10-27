// "Nutriție": the whole nutrition system moved over from zece-app. Today (targets, water, supplements, logging by
// AI photo / text / food table / by hand), the goal and its tactics, the meal plans, the shopping list, the TDEE and
// the calculators. Logic in src/logic/nutri, data in src/data/nutrition.ts.

import { ACTIVITY, DISCLAIMER, EQS, FCATS, FOODS, GOALS, METAB, MFD, MFIX, SHOP_RANGE, TAC_SRC, type Eq, type Goal } from '../../data/nutrition.ts';
import { aiErrText, estimatePhoto, estimateText, photoB64, weekReview, type MealEstimate } from '../../logic/nutri/ai.ts';
import {
  autoDef, curW, dayPlan, dayTotals, dietBreakPlan, fuelPlan, mfQty, mfSwapOpts, mlogDay, nAdaptRun, nAdj, nutriDay, protAgeF, protMeals, protPL,
  shopData, tacRules, tacStatus, tacWarn, targets, waterOf, weekTargets, wWeeks, type ShopItem, type Targets,
} from '../../logic/nutri/engine.ts';
import { KCAL_FLOOR } from '../../logic/nutri/floor.ts';
import { mealFeedback, mealPrep } from '../../logic/nutri/meals.ts';
import { BLOCKED, SUPPLEMENTS, USELESS } from '../../logic/nutri/supplements.ts';
import type { MealLog, NutProfile } from '../../logic/store.ts';
import { addDays, clamp, dayKey, daysBetween, esc, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { buzz } from '../audio.ts';
import { bars } from '../charts.ts';
import { ask, ctx, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';
import { top } from './shared.ts';

type NTab = 'azi' | 'tac' | 'plan' | 'shop' | 'nec' | 'tools';
const TABS: Array<[NTab, string]> = [['azi', 'Azi'], ['tac', 'Tactică'], ['plan', 'Mese'], ['shop', 'Listă'], ['nec', 'Necesar'], ['tools', 'Unelte']];
let NT: NTab = 'azi';
let planOff = 0;
let shopN = 7;
const SC: { img: string | null; data: string | null; hint: string; busy: boolean; res: MealEstimate | null; err: string | null } = { img: null, data: null, hint: '', busy: false, res: null, err: null };
const QI: { text: string; busy: boolean; res: MealEstimate | null; err: string | null; rec: { stop(): void } | null } = { text: '', busy: false, res: null, err: null, rec: null };
const FD: { q: string; cat: string; sel: FoodSel | null; g: string; bc: string; busy: boolean; err: string | null } = { q: '', cat: '', sel: null, g: '', bc: '', busy: false, err: null };
const AIW = { busy: false, err: '' };
const TL: Record<string, string> = {};
let swapOpen = '';

interface FoodSel {
  n: string;
  k: number;
  p: number;
  c: number;
  g: number;
  por: number | null;
  pl: string;
  mine?: boolean;
  brand?: string;
  src?: string;
}

const nf = (v: number, d = 1): string => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',');
const S = (): typeof ctx.S => ctx.S;
const P = (): NutProfile => ctx.S.nut;
const tgt = (k = dayKey()): Targets => targets(S(), k, dayKey());
const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
interface SpeechRec {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

function addMeal(m: MealLog, k = dayKey()): void {
  S().mlog[k] = [...mlogDay(S(), k), m];
  save();
}

/** Once a day: the scale correction (and the daily log it needs). */
export function nutriStartup(): void {
  if (!P().ok) return;
  try {
    if (nAdaptRun(S(), dayKey())) save();
  } catch {
    /* never block the app on this */
  }
}

// ---------- small pieces ----------
function miniRing(frac: number, big: string, small: string): string {
  const r = 44;
  const c = 2 * Math.PI * r;
  const off = c * (1 - clamp(frac, 0, 1));
  return `<div class="nr"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" class="nr-t"/><circle cx="50" cy="50" r="${r}" class="nr-v" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg><div><b>${big}</b><span>${small}</span></div></div>`;
}
const kpi = (k: string, v: string, s = ''): string => `<div class="kpi"><span>${k}</span><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div>`;
const note = (t: string, icon = 'info'): string => `<p class="nnote">${ic(icon)}<span>${t}</span></p>`;
const mbar = (l: string, v: number, t: number): string => `<div class="mbar"><div class="row"><span>${l}</span><span class="dim">${Math.round(v)} / ${t} g</span></div><div class="bar"><i style="width:${(clamp(t ? v / t : 0, 0, 1) * 100).toFixed(1)}%"></i></div></div>`;
const numIn = (id: string, label: string, val: string | number, ph = '', step = '1', a = 'nu:p', k = ''): string =>
  `<label class="nfld"><span>${label}</span><input id="${id}" type="number" inputmode="decimal" step="${step}" value="${esc(val)}" placeholder="${esc(ph)}" data-a="${a}" data-k="${k || id}"></label>`;

// ---------- screen ----------
export function nutritionHtml(): string {
  const head = `${top()}<h1 class="stack mid">Nutriție</h1>`;
  if (!P().ok) return head + gateHtml();
  const body = NT === 'tac' ? tacHtml() : NT === 'plan' ? planHtml() : NT === 'shop' ? shopHtml() : NT === 'nec' ? needHtml() : NT === 'tools' ? toolsHtml() : todayHtml();
  return `${head}<nav class="nseg" aria-label="Nutriție">${TABS.map(([k, l]) => `<button class="chip" aria-pressed="${NT === k}" data-a="nu:tab" data-k="${k}">${l}</button>`).join('')}</nav>${body}`;
}

function gateHtml(): string {
  return `<section class="card"><h3>${ic('alert')} Înainte de nutriție</h3><p class="small dim">Citește o dată, apoi începem.</p>
    ${DISCLAIMER.map((p) => `<p class="small">${esc(p)}</p>`).join('')}
    <button class="btn" data-a="nu:ok">${ic('check')} Am înțeles</button></section>`;
}

/** The "Azi" card on the Today screen. */
export function nutriWidget(): string {
  if (!P().ok) return `<section class="card"><div class="row"><div class="row-l"><h3>Nutriție</h3><p class="small dim" style="margin:0">Calorii, proteină și apă după antrenamentul zilei.</p></div><button class="bk-go" data-a="tab" data-k="nutri" aria-label="Deschide nutriția">${ic('play')}</button></div></section>`;
  const k = dayKey();
  const tg = tgt();
  const d = dayTotals(S(), k);
  const wt = waterOf(S(), k);
  return `<section class="card nwid"><div class="row"><div class="row-l"><h3>Nutriție azi</h3><p class="small dim" style="margin:0">${esc(tg.day.label)} · ${esc(tg.phase.label)}</p></div><button class="bk-go" data-a="tab" data-k="nutri" aria-label="Deschide nutriția">${ic('play')}</button></div>
    <div class="nrings sm">${miniRing(d.k / tg.kcal, String(Math.round(d.k)), `din ${tg.kcal} kcal`)}${miniRing(d.p / tg.p, String(Math.round(d.p)), `din ${tg.p} g prot.`)}${miniRing(wt / tg.water, nf(wt / 1000), `din ${nf(tg.water / 1000)} L`)}</div>
    <div class="btn-row"><button class="btn ghost sm" data-a="nu:water" data-i="250">${ic('drop')} +250 ml</button><button class="btn ghost sm" data-a="tab" data-k="nutri">${ic('plus')} Masă</button></div></section>`;
}

// ---------- Azi ----------
function todayHtml(): string {
  const k = dayKey();
  const tg = tgt();
  const d = dayTotals(S(), k);
  const ml = mlogDay(S(), k);
  const wt = waterOf(S(), k);
  const remK = tg.kcal - d.k;
  const remP = tg.p - d.p;
  const cups = Math.min(20, Math.ceil(tg.water / 250));
  const full = Math.floor(wt / 250);
  const freq: Record<string, { n: string; c: number }> = {};
  Object.values(S().mlog).forEach((day) =>
    day.forEach((m) => {
      const n = (m.n || '').trim();
      if (!n || m.pl) return;
      const key = n.toLowerCase();
      freq[key] = freq[key] ?? { n, c: 0 };
      freq[key].c++;
    }),
  );
  const topF = Object.values(freq).sort((a, b) => b.c - a.c).slice(0, 8);
  const wk = Array.from({ length: 7 }, (_, i) => {
    const kk = addDays(k, i - 6);
    return { v: Math.round(dayTotals(S(), kk).k), label: RO_DAYS[weekdayIdx(kk)].slice(0, 2) };
  });
  const pm = protMeals(S(), k);
  return `
  <section class="card"><div class="row"><h3 style="margin:0">Azi · ${esc(shortDay(k))}</h3><span class="ntag" title="${esc(tg.phase.sub)}">${esc(tg.phase.label)}</span></div>
    <div class="nrings">${miniRing(d.k / tg.kcal, String(Math.round(d.k)), `din ${tg.kcal} kcal`)}${miniRing(d.p / tg.p, String(Math.round(d.p)), `din ${tg.p} g proteină`)}</div>
    <div class="chips"><span class="ntag">${remK >= 0 ? `mai ai ${Math.round(remK)} kcal` : `peste cu ${Math.round(-remK)} kcal`}</span><span class="ntag">${remP > 0 ? `mai ai ${Math.round(remP)} g proteină` : 'proteină atinsă'}</span></div>
    ${mbar('Carbohidrați', d.c, tg.c)}${mbar('Grăsimi', d.g, tg.f)}
    <p class="small dim" style="margin:10px 0 0">${esc(tg.phase.sub)} · necesar ${tg.measured ? 'măsurat' : 'estimat'} ${tg.tdee} kcal${tg.manual ? ' · țintă manuală' : ''}</p></section>
  ${dayCard(tg, wt)}
  <section class="card"><div class="row"><div class="row-l"><h3>Apă</h3><p class="nbig">${nf(wt / 1000, 2)}<small> / ${nf(tg.water / 1000)} L</small></p></div>
    <div class="nbtns"><button class="btn ghost sm" data-a="nu:water" data-i="-250" aria-label="minus 250 ml">−</button><button class="btn sm" data-a="nu:water" data-i="250">+250</button><button class="btn sm" data-a="nu:water" data-i="500">+500</button></div></div>
    <div class="glasses">${Array.from({ length: cups }, (_, i) => `<i class="${i < full ? 'on' : ''}"></i>`).join('')}</div></section>
  ${fuelCard(tg)}
  ${suppCard()}
  ${quickCard()}
  ${scanCard()}
  <button class="card nlink" data-a="nu:tab" data-k="tools"><span class="nlink-i">${ic('bowl')}</span><span class="row-l"><b>Caută un aliment</b><span class="small dim">${FOODS.length} alimente la gram, cod de bare${S().foods.length ? ` și ${S().foods.length} ale tale` : ''}</span></span>${ic('chev')}</button>
  <section class="card"><h3>Adaugă manual</h3>
    ${topF.length ? `<div class="chips" style="margin-bottom:10px">${topF.map((f) => `<button class="chip" data-a="nu:again" data-k="${esc(f.n)}">+ ${esc(f.n)}</button>`).join('')}</div>` : ''}
    <div class="nform"><label class="nfld full"><span>Ce ai mâncat</span><input id="mN" type="text" placeholder="ex: omletă cu 4 ouă"></label>
      ${numIn('mK', 'kcal', '', '450', '1', 'nu:x')}${numIn('mP', 'Proteină (g)', '', '30', '1', 'nu:x')}${numIn('mC', 'Carbohidrați (g)', '', 'opțional', '1', 'nu:x')}${numIn('mG', 'Grăsimi (g)', '', 'opțional', '1', 'nu:x')}</div>
    <button class="btn" data-a="nu:add" style="margin-top:12px">${ic('check')} Adaugă</button></section>
  ${ml.length ? `<section class="card"><div class="row"><h3 style="margin:0">Mesele de azi</h3><span class="small dim">${pm.n} cu ≥${pm.thr} g proteină</span></div><ul class="hist">${ml.map((m, i) => `<li><div><b>${esc(m.n || 'Masă')}</b><span>${Math.round(+m.k || 0)} kcal · ${Math.round(+m.p || 0)} g proteină</span></div><button class="icon-btn" data-a="nu:mdel" data-i="${i}" aria-label="Șterge">${ic('trash')}</button></li>`).join('')}</ul>
    <p class="small dim" style="margin:8px 0 0">Pentru masa musculară contează și cum împarți proteina: ideal 3–5 mese a câte ~${pm.thr} g, la 3–5 ore distanță.</p></section>` : ''}
  <section class="card"><h3>Ultimele 7 zile · kcal</h3>${bars(wk, tg.kcal)}<p class="small dim" style="margin:8px 0 0">Plin = la țintă (${tg.kcal} kcal azi). Contează media pe săptămână și trendul greutății, nu o zi anume. Cum se calculează vezi la <b>Necesar</b>.</p></section>`;
}

function dayCard(tg: Targets, wt: number): string {
  const dt = tg.day;
  const per = tg.per;
  const doneToday = S().log.some((e) => e.date === dayKey() && e.block && !['walk', 'shower', 'wimhof', 'breath'].includes(e.kind));
  const pre = dt.type !== 'rest' && !doneToday ? tg.hyd.preMl[0] - wt : 0;
  return `<section class="card nday nday-${dt.type}"><div class="row"><h3 style="margin:0">${esc(dt.label)}</h3><span class="small dim">${esc(dt.t)}</span></div>
    <div class="kpis">${kpi('Calorii', String(tg.kcal), tg.kcal === tg.base.kcal ? 'baza zilei' : `${tg.kcal > tg.base.kcal ? '+' : ''}${tg.kcal - tg.base.kcal} față de bază`)}${kpi('Carbohidrați', `${tg.c} g`, `×${nf(per.factor, 2)}`)}${kpi('Proteină', `${tg.p} g`, 'constantă')}${kpi('Apă', `${nf(tg.water / 1000)} L`, tg.hyd.lossMl ? `+${nf(tg.hyd.lossMl / 1000)} L pierderi` : 'fără antrenament')}</div>
    ${per.notes.map((n) => note(esc(n), per.floorApplied && /prag|deficit/.test(n) ? 'alert' : 'info')).join('')}
    ${tg.hyd.sodiumMg >= 500 ? note(`Sodiu pierdut azi: ~${nf(tg.hyd.sodiumMg / 1000)} g${tg.hyd.sodiumPerHour ? ` · în timpul efortului ${tg.hyd.sodiumPerHour[0]}–${tg.hyd.sodiumPerHour[1]} mg pe oră` : ''}. După: sare în masă sau electroliți în apă.`, 'drop') : ''}
    ${pre > 0 ? `<p class="nalert" role="status">${ic('drop')} Înainte de antrenament: bea încă ~${Math.round(pre / 50) * 50} ml în următoarele 2 ore (azi ai ${Math.round(wt / 50) * 50} ml).</p>` : ''}</section>`;
}

function fuelCard(tg: Targets): string {
  const f = fuelPlan(S(), dayKey());
  if (f.rest)
    return `<section class="card"><h3>Zi de recuperare · nutriție</h3><p class="small">Fără mese speciale azi. Proteina împărțită egal în 3–5 mese de câte <b>~${f.pm} g</b> (Norton: 30–50 g pe masă); fibre (legume, fructe) și somn 7,5–9 ore.</p></section>`;
  const rows: Array<[string, string, string]> = [
    ['timer', 'Înainte', `Cu câteva ore înainte: una din mesele tale proteice (~<b>${f.pm} g proteină</b>). Carbohidrați simpli înainte, dacă te ajută: e o preferință, nu o regulă.`],
    ['fight', 'În timpul efortului', 'Apă. Băutura din planul de mese (intra-workout) e opțională: o iei dacă te ajută.'],
    ['check', 'După', `În câteva ore după: o masă cu ~<b>${f.pm} g proteină</b>. Fereastra anabolică e supraevaluată: contează totalul zilei și distribuția pe 3–5 mese, nu minutul exact.`],
    ['drop', 'Hidratare', 'Apă multă și sare normală în mâncare: sportivii pierd sodiu prin transpirație, nu-l restricționa (doar 5–10% dintre oameni sunt sensibili la sare).'],
    ['moon', 'Seara', 'Ultima masă proteică seara, ca parte din cele 3–5 mese egale (o masă săracă nu se compensează cu una mare).'],
  ];
  return `<section class="card"><div class="row"><h3 style="margin:0">${f.today ? 'Antrenamentul de azi' : 'Antrenamentul următor'} · nutriție</h3><span class="ntag">${f.min} min</span></div>
    <p class="small dim" style="margin:6px 0 4px">${esc(f.title)}</p>
    <div class="fu">${rows.map(([icn, t, h]) => `<div class="fu-r"><span class="fu-i">${ic(icn)}</span><div><b>${t}</b><p>${h}</p></div></div>`).join('')}</div>
    <div class="chips" style="margin-top:10px"><button class="chip" data-a="nu:tool" data-k="caf">Cafeină: doza și ora</button>${f.long ? '<button class="chip" data-a="nu:tool" data-k="sweat">Cât să bei</button>' : ''}</div>
    <p class="small dim" style="margin:10px 0 0">Norton: ${tg.phase.cut ? 'în deficit, carbohidrații în jurul antrenamentului sunt o preferință (aceleași calorii); ' : ''}consecvența contează mai mult decât momentul.</p></section>`;
}

const suppTook = (id: string, k: string): boolean => (S().supp.log[k] ?? []).includes(id);
function suppStreak(id: string): number {
  let n = 0;
  let k = dayKey();
  if (!suppTook(id, k)) k = addDays(k, -1);
  while (suppTook(id, k) && n < 999) {
    n++;
    k = addDays(k, -1);
  }
  return n;
}
function suppCard(): string {
  const k = dayKey();
  const on = SUPPLEMENTS.filter((s) => S().supp.on[s.id]);
  const off = SUPPLEMENTS.filter((s) => !S().supp.on[s.id]);
  return `<section class="card"><div class="row"><h3 style="margin:0">${ic('pill')} Suplimente azi</h3>${on.length ? `<span class="small dim">${on.filter((s) => suppTook(s.id, k)).length}/${on.length} luate</span>` : ''}</div>
    ${on.length ? `<ul class="hist">${on.map((s) => { const t = suppTook(s.id, k); const st = suppStreak(s.id); return `<li class="sp-r"><button class="tick ${t ? 'on' : ''}" data-a="nu:stick" data-k="${s.id}" aria-label="${esc(s.name)} luat azi" aria-pressed="${t}">${ic('check')}</button><div><b>${esc(s.name)}</b><span>${st ? `${st} ${st === 1 ? 'zi' : 'zile'} la rând` : 'nebifat de ieri'}</span></div><button class="icon-btn" data-a="nu:son" data-k="${s.id}" aria-label="Nu mai urmări">${ic('close')}</button></li>`; }).join('')}</ul>` : '<p class="small dim">Alege ce iei și bifează zilnic. Sunt doar cele recomandate de Layne Norton.</p>'}
    ${off.length ? `<details class="ndet"${on.length ? '' : ' open'}><summary>${on.length ? 'Adaugă altele' : 'Ce merită luat'}</summary>${off.map((s) => `<div class="sp-o"><div><b>${esc(s.name)}</b> <span class="ntag">Tier ${s.tier} · ${esc(s.evidence)}</span><p class="small">${esc(s.dose)}</p></div><button class="btn ghost sm" data-a="nu:son" data-k="${s.id}">Îl iau</button></div>`).join('')}</details>` : ''}
    <details class="ndet"><summary>Ce nu merită, după Norton</summary>${USELESS.map((u) => `<p class="small"><b>${esc(u.name)}</b>: ${esc(u.why)}</p>`).join('')}</details>
    <details class="ndet"><summary>${ic('alert')} Blocate în aplicație · Tier 3</summary>${BLOCKED.map((b) => `<p class="small"><b>${esc(b.name)}</b>: ${esc(b.why)}</p>`).join('')}</details>
    <p class="small dim" style="margin:8px 0 0">Cafeina are calculatorul ei la Unelte. Suplimentele nu înlocuiesc somnul, totalul de proteină și deficitul.</p></section>`;
}

function mealCtxFor(): Parameters<typeof mealFeedback>[1] {
  const k = dayKey();
  const tg = tgt();
  const d = dayTotals(S(), k);
  const done = S().log.some((e) => e.date === k && e.block && !['walk', 'shower', 'wimhof', 'breath'].includes(e.kind));
  return { dayType: tg.day.type, timing: done ? 'post' : tg.day.type === 'rest' ? 'other' : 'pre', remaining: { kcal: tg.kcal - d.k, p: tg.p - d.p }, eatenKcal: d.k, sex: P().sex === 'f' ? 'f' : 'm', hour: new Date().getHours() };
}
function fbHtml(r: MealEstimate): string {
  const fb = mealFeedback({ k: r.kcal, p: r.p, c: r.c, g: r.g }, mealCtxFor());
  return fb.map((x) => note(esc(x))).join('');
}
function estOut(r: MealEstimate, pre: string): string {
  return `<h3 style="margin:12px 0 4px">${esc(r.name)}</h3>
    ${r.items.length ? `<ul class="hist">${r.items.map((it) => `<li><div><b>${esc(it.food)}</b><span>~${Math.round(it.grams)} g</span></div><span class="small">${Math.round(it.kcal)} kcal</span></li>`).join('')}</ul>` : ''}
    <div class="nform"><label class="nfld full"><span>Nume</span><input id="${pre}N" type="text" value="${esc(r.name)}"></label>${numIn(pre + 'K', 'kcal', r.kcal, '', '1', 'nu:x')}${numIn(pre + 'P', 'Proteină (g)', r.p, '', '1', 'nu:x')}${numIn(pre + 'C', 'Carbohidrați (g)', r.c, '', '1', 'nu:x')}${numIn(pre + 'G', 'Grăsimi (g)', r.g, '', '1', 'nu:x')}</div>
    <p class="small dim">Încredere: <b>${esc(r.conf || '—')}</b>. ${esc(r.note)}</p>${fbHtml(r)}
    <div class="btn-row"><button class="btn ghost" data-a="nu:${pre}x">Renunță</button><button class="btn" data-a="nu:${pre}add">${ic('check')} Adaugă</button></div>`;
}
const noKey = (): string => '<p class="small dim">Estimarea cere cheia ta Anthropic (Necesar → Antrenor AI). Poți nota și manual, mai jos.</p>';
function quickCard(): string {
  return `<section class="card"><h3>${ic('mic')} Notează rapid · voce sau text</h3>
    <div class="nrow">${SR ? `<button class="btn ghost sm qi-mic ${QI.rec ? 'rec' : ''}" data-a="nu:qimic" aria-label="Dictează masa">${ic('mic')}</button>` : ''}<input id="qiT" type="text" value="${esc(QI.text)}" placeholder="ex: două ouă, o felie de pâine, o banană" aria-label="Ce ai mâncat" data-a="nu:qit"></div>
    ${QI.err ? `<p class="nalert" role="alert">${ic('alert')} ${esc(QI.err)}</p>` : ''}
    ${QI.res ? estOut(QI.res, 'qi') : P().aiKey ? `<button class="btn" style="margin-top:10px" data-a="nu:qirun" ${QI.busy ? 'disabled' : ''}>${QI.busy ? 'Estimez…' : 'Estimează cu AI'}</button>` : noKey()}</section>`;
}
function scanCard(): string {
  if (!SC.img)
    return `<label class="card nlink"><span class="nlink-i">${ic('camera')}</span><span class="row-l"><b>Scanează o masă</b><span class="small dim">Faci o poză, iar AI-ul estimează caloriile și proteina.</span></span>${ic('chev')}<input type="file" accept="image/*" data-a="nu:scanfile" class="sr"></label>`;
  return `<section class="card" id="scanCard"><h3>${ic('camera')} Masa ta · analiză AI</h3><img class="scan-img ${SC.busy ? 'busy' : ''}" src="${SC.img}" alt="Poza mesei">
    ${SC.res ? estOut(SC.res, 'sc') : `<label class="nfld full" style="margin-top:10px"><span>Detalii (opțional): cantități, ulei, sosuri</span><input id="scHint" type="text" value="${esc(SC.hint)}" placeholder="ex: 200 g piept de pui, o lingură de ulei"></label>
      ${SC.err ? `<p class="nalert" role="alert">${ic('alert')} ${esc(SC.err)}</p>` : ''}${P().aiKey ? '' : noKey()}
      <div class="btn-row" style="margin-top:10px"><button class="btn ghost" data-a="nu:scx" ${SC.busy ? 'disabled' : ''}>Renunță</button><button class="btn" data-a="nu:scrun" ${SC.busy || !P().aiKey ? 'disabled' : ''}>${SC.busy ? 'Analizez…' : 'Analizează'}</button></div>`}</section>`;
}

// ---------- Tactică ----------
function tacHtml(): string {
  const k = dayKey();
  const tg = tgt();
  const g = tg.goal;
  const st = tacStatus(S(), tg, k);
  const W = weekTargets(S(), k);
  const ww = wWeeks(S(), k);
  const icn = (c: string): string => (c === 'ok' ? 'check' : c === 'info' ? 'info' : 'alert');
  return `<section class="card"><h3>Obiectivul tău</h3>
      <div class="chips nseg2">${(Object.keys(GOALS) as Goal[]).map((x) => `<button class="chip" aria-pressed="${g === x}" data-a="nu:goal" data-k="${x}">${GOALS[x].l}</button>`).join('')}</div>
      <div class="kpis">${kpi('Media săptămânii', `${W.avg}`, `kcal/zi · ${tg.def > 0 ? `deficit ~${tg.def}` : tg.def < 0 ? `surplus ~${-tg.def}` : 'menținere'} kcal`)}${kpi('Proteină', `${tg.p} g`, `${nf(protPL(P(), g), 2)} g/kg masă slabă · ${tg.ffm} kg`)}${kpi('Ritmul țintă', `${tg.rateT > 0 ? '+' : ''}${nf(tg.rateT, 2)}`, `kg/săpt. · ${tg.phase.brk ? 'pauză de dietă' : g === 'bulk' ? '0,75% pe lună' : `${nf(Math.abs(GOALS[g].rate) * 100, 2)}% pe săptămână`}`)}${kpi('Ritmul tău', ww ? `${ww.rate > 0 ? '+' : ''}${nf(ww.rate, 2)}` : '—', 'kg/săpt. · media cântarului pe 7 zile')}</div>
      <p class="tac-st ${st.c}" role="status">${ic(icn(st.c))}<span>${esc(st.t)}</span></p>
      ${tacWarn(S(), tg).map(([c, t]) => `<p class="tac-st ${c}">${ic(icn(c))}<span>${esc(t)}</span></p>`).join('')}</section>
    <section class="card"><h3>Tactica · ${esc(GOALS[g].l)}</h3>
      <ol class="tac-r">${tacRules(S(), tg, k).map(([icon, t, x, src]) => `<li><span class="tac-i">${ic(icon)}</span><div><b>${esc(t)}</b><p>${esc(x)}</p><div class="tac-src">${src.split(' ').map((s) => `<span>${esc(TAC_SRC[s] ?? s)}</span>`).join('')}</div></div></li>`).join('')}</ol></section>
    <section class="card"><h3>De unde vine</h3>
      <p class="small"><b>Layne Norton · nutriția.</b> PhD în științe nutriționale (metabolismul proteinelor). Canalele Biolayne și Dr. Layne Norton, Fat Loss Forever și The Complete Contest Prep Guide: ritmul de 0,4–0,8%, proteina pe masa slabă și distribuția ei, pauzele de dietă și refeed-urile, NEAT-ul, platourile, dieta de după dietă și reverse diet-ul.</p>
      <p class="small dim">Ritmul, pragurile, pauzele de dietă și corecția din cântar le aplică singură aplicația.</p></section>`;
}

// ---------- Mese ----------
function planHtml(): string {
  const today = dayKey();
  const k = addDays(today, planOff);
  const tg = tgt(k);
  const D = dayPlan(S(), k, tg);
  const eaten = mlogDay(S(), k);
  const fibT = Math.round((tg.kcal / 1000) * 15);
  const span = daysBetween(today, addDays(weekStart(today), 13)) + 1;
  const days = Array.from({ length: span }, (_, i) => {
    const dk = addDays(today, i);
    return `<button class="chip" aria-pressed="${i === planOff}" data-a="nu:pday" data-i="${i}">${i === 0 ? 'Azi' : i === 1 ? 'Mâine' : `${RO_DAYS[weekdayIdx(dk)].slice(0, 2)} ${+dk.slice(8)}`}</button>`;
  }).join('');
  const bar = (l: string, v: number, t: number): string => `<div class="kpi"><span>${l}</span><b>${Math.round(v)}<small>/${t}</small></b><div class="bar"><i style="width:${((clamp(t ? v / t : 0, 0, 1.2) / 1.2) * 100).toFixed(0)}%"></i></div></div>`;
  const cards = D.meals
    .map((m, si) => {
      const done = eaten.some((x) => x.pl === D.kind + si);
      return `<section class="card mcard ${done ? 'eaten' : ''}"><div class="row"><h3 style="margin:0">${ic(m.icn)} ${esc(m.n)}</h3>${done ? `<span class="ntag">${ic('check')} mâncat</span>` : ''}</div>
      ${m.note ? `<p class="small dim" style="margin:4px 0 0">${esc(m.note)}</p>` : ''}
      <div class="chips" style="margin:8px 0"><span class="ntag">${m.k} kcal</span><span class="ntag">P ${m.p} g</span><span class="ntag">C ${m.c} g</span><span class="ntag">G ${m.g} g</span><span class="ntag">Fibre ${m.fb} g</span></div>
      <div class="ingr">${m.it.map((x) => (MFIX[x.of] == null && MFD[x.of][5] !== 'x' && x.of !== 'dextrina' ? `<button class="mf-sw ${x.sw ? 'on' : ''}" data-a="nu:swap" data-k="${D.kind}${si}:${x.of}" aria-label="Înlocuiește ${esc(MFD[x.f][0])}"><b>${mfQty(x.f, x.q)}</b> ${esc(MFD[x.f][0])} ${ic('refresh')}</button>` : `<span><b>${mfQty(x.f, x.q)}</b> ${esc(MFD[x.f][0])}${x.opt ? ' · opțional' : ''}</span>`)).join('')}</div>
      ${swapOpen.startsWith(D.kind + si + ':') ? swapHtml(D.kind, si, swapOpen.split(':')[1]) : ''}
      ${planOff === 0 ? `<button class="btn ${done ? 'ghost' : ''} sm" style="margin-top:10px" data-a="nu:eat" data-i="${si}" ${done ? 'disabled' : ''}>${ic('check')} ${done ? 'Notat' : 'Am mâncat'}</button>` : ''}</section>`;
    })
    .join('');
  return `<section class="card"><div class="row"><h3 style="margin:0">${esc(D.name)}</h3><span class="ntag">${esc(tg.phase.label)}</span></div>
    <div class="chips nscroll" style="margin:12px 0">${days}</div>
    <div class="kpis k4">${bar('kcal', D.tot.k, tg.kcal)}${bar('Proteină', D.tot.p, tg.p)}${bar('Carbo', D.tot.c, tg.c)}${bar('Grăsimi', D.tot.g, tg.f)}</div>
    ${D.tot.fb < fibT ? note(`Fibre: ${D.tot.fb} din ${fibT} g (Norton: cel puțin 15 g la 1000 kcal). Legumele la fiecare masă (au foarte puține calorii, poți dubla porția), un fruct în plus sau cartof dulce în loc de orez (apasă pe aliment ca să-l înlocuiești).`, 'stretch') : note(`Fibre: ${D.tot.fb} g, peste minimul lui Norton (${fibT} g).`, 'check')}
    <p class="small dim">Cantitățile le calculez din ținta zilei (${esc(GOALS[tg.goal].l.toLowerCase())}): proteina împărțită egal pe mese, ${D.kind === 't' ? 'carbohidrații strânși în jurul antrenamentului (pre, intra, post), grăsimile departe de el' : 'carbohidrații mai mulți la prânz și seara'}. ${D.kind === 'r' ? 'Zi de odihnă în plan → planul de odihnă.' : 'Zi cu antrenament în plan → planul de antrenament.'} Orezul și cartofii se cântăresc fierți, carnea crudă. Apasă pe un aliment ca să-l înlocuiești (Norton: dieta flexibilă).</p></section>
    ${cards}`;
}
function swapHtml(kind: 't' | 'r', mi: number, of: string): string {
  const o = mfSwapOpts(S(), kind, mi, of);
  return `<div class="swap"><p class="small"><b>În loc de ${esc(MFD[o.now][0])}</b> · alegi alt aliment cu același rol; cantitatea se recalculează. Schimbarea rămâne pentru toate zilele de ${kind === 't' ? 'antrenament' : 'odihnă'}.</p>
    ${o.locked ? note(esc(o.locked)) : o.list.map((f) => `<button class="fd-r" data-a="nu:swapset" data-k="${kind}${mi}:${of}" data-v="${f}"><span><b>${esc(MFD[f][0])}</b><span class="small dim">${MFD[f][1]} kcal · P ${MFD[f][2]} · C ${MFD[f][3]} · G ${MFD[f][4]} la 100 ${MFD[f][7] === 'ml' ? 'ml' : 'g'}</span></span>${f === of ? '<span class="ntag">original</span>' : ''}</button>`).join('')}
    <button class="link" data-a="nu:swapx">Închide</button></div>`;
}

// ---------- Listă ----------
const fmtG = (g: number): string => (g >= 1000 ? `${nf(g / 1000, 2)} kg` : `${Math.round(g)} g`);
const shopQty = (it: ShopItem): string => {
  const u = MFD[it.f][7];
  return u === 'buc' ? `${it.q} buc` : u === 'felie' ? `${it.q} ${it.q === 1 ? 'felie' : 'felii'}` : u === 'ml' ? (it.q >= 1000 ? `${nf(it.q / 1000, 2)} L` : `${it.q} ml`) : fmtG(it.q);
};
const shopHint = (it: ShopItem): string =>
  it.f === 'albus' ? ` · ~${Math.round(it.q / 33)} ouă sau ${Math.ceil(it.q / 500)} cutii de 500 ml` : it.f === 'whey' ? ` · ~${Math.round(it.q / 30)} doze` : it.f === 'rondea' || it.f === 'toast' ? ` · ~${fmtG(it.g)}` : it.f === 'legume' ? ' · opționale' : it.f === 'orez' ? ` · ~${fmtG(Math.round(it.g / 2.6 / 5) * 5)} crud` : '';
function shopHtml(): string {
  const today = dayKey();
  const D = shopData(S(), today, shopN);
  const when = D.ks.length > 1 ? `${shortDay(D.ks[0])} – ${shortDay(D.ks[D.ks.length - 1])}` : `azi, ${shortDay(today)}`;
  const hero = `<section class="card"><h3>${ic('cart')} Lista de cumpărături</h3>
    <div class="chips nseg2">${SHOP_RANGE.map(([d, l]) => `<button class="chip" aria-pressed="${shopN === d}" data-a="nu:shopn" data-i="${d}">${l}</button>`).join('')}</div>
    <p class="small dim">${esc(when)} · ${D.tr} ${D.tr === 1 ? 'zi' : 'zile'} de antrenament, ${D.ks.length - D.tr} de odihnă</p>
    <div class="kpis">${kpi('De luat', String(D.all - D.got), `din ${D.all}`)}${kpi('Cântărit', fmtG(D.left))}${kpi('Mese', String(D.meals))}</div>
    <div class="btn-row"><button class="btn ghost sm" data-a="nu:shopcopy" ${D.all - D.got ? '' : 'disabled'}>${ic('copy')} Copiază lista</button>${D.got ? `<button class="btn ghost sm" data-a="nu:shopreset">${ic('refresh')} Debifează tot</button>` : ''}</div></section>`;
  if (!D.all) return `${hero}<p class="dim">Planul de mese e gol pentru perioada asta.</p>`;
  const cats = D.order
    .map((c) => {
      const a = D.groups[c];
      const dn = a.filter((x) => x.on).length;
      return `<section class="card sl-cat ${dn === a.length ? 'done' : ''}"><div class="row"><h3 style="margin:0">${esc(c)}</h3><span class="small dim">${dn === a.length ? 'gata' : `${dn} din ${a.length}`}</span></div>
      ${a.map((it) => `<button class="sl-r ${it.on ? 'on' : ''}" data-a="nu:shoptick" data-k="${esc(it.nm)}" aria-pressed="${it.on}"><span class="tick ${it.on ? 'on' : ''}">${ic('check')}</span><span class="row-l"><b>${esc(it.nm)}</b><span class="small dim">${it.n === 1 ? 'o masă' : `în ${it.n} mese`}${shopHint(it)}</span></span><b class="sl-q">${shopQty(it)}</b></button>`).join('')}</section>`;
    })
    .join('');
  const wk = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(today, i);
    return { label: i === 0 ? 'Azi' : RO_DAYS[weekdayIdx(k)], dayType: nutriDay(k).type, t: nutriDay(k).t };
  });
  const mp = mealPrep(wk);
  return `${hero}${cats}<p class="small dim">Cantitățile vin din planul de mese, din ținta fiecărei zile. Orezul și cartofii cântăriți fierți (lângă orez vezi cât iei crud), carnea crudă. Rotunjește la ambalaje.</p>
    <section class="card"><h3>${ic('bowl')} Meal prep · după antrenamentele săptămânii</h3>
      ${mp.batches.map((b) => `<div class="mp-b"><b>${esc(b.day)}</b><span>${esc(b.what)}</span><small>pentru ${esc(b.covers)}</small></div>`).join('')}
      <ul class="hist">${mp.days.map((d, i) => `<li><div><b>${esc(d.label)}</b><span>${esc(wk[i].t)} · ${esc(d.carbs)}</span></div></li>`).join('')}</ul></section>`;
}

// ---------- Necesar ----------
function needHtml(): string {
  const k = dayKey();
  const p = P();
  const tg = tgt();
  const ms = tg.ms;
  const rate = (tg.def * 7) / 7700;
  const W = weekTargets(S(), k);
  const A = nAdj(p);
  const m = METAB.find((x) => x[0] === tg.metab);
  const vals = EQS.map(([e]) => tg.A[e]);
  const sel = (id: string, opts: Array<[string | number, string]>, cur: string | number): string => `<select id="${id}" data-a="nu:p" data-k="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  return `<section class="card"><div class="row"><h3 style="margin:0">Ținta de azi</h3><span class="ntag">${esc(tg.phase.label)}</span></div>
      <p class="nbig">${tg.kcal}<small> kcal</small></p>
      <div class="kpis">${kpi('Proteină', `${tg.p} g`)}${kpi('Carbohidrați', `${tg.c} g`)}${kpi('Grăsimi', `${tg.f} g`)}</div>
      <p class="small">Necesar ${tg.measured ? '<b>măsurat</b>' : 'estimat'} ${tg.tdee} kcal${tg.def > 0 ? ` − deficit ${tg.def} kcal (~${nf(rate, 2)} kg/săpt.)` : tg.def < 0 ? ` + surplus ${-tg.def} kcal (~+${nf(-rate, 2)} kg/săpt.)` : ' (menținere)'}${tg.manual ? ` · ai setat manual ${tg.kcal} kcal` : ''}.
        Proteina (Norton): ${nf(protPL(p, tg.goal), 2)} g/kg din ~${tg.ffm} kg masă slabă (${esc(GOALS[tg.goal].l.toLowerCase())}${protAgeF(p) > 1 ? ', cu +1,5% pe an după 30' : ''}); grăsimile ~20% din calorii (cel puțin 0,5 g/kg); restul, carbohidrați; fibre cel puțin 15 g la 1000 kcal. Bazalul tău: ~${tg.bmrR} kcal. Media săptămânii nu coboară sub el.</p>
      ${tg.raised ? note(`Pe media săptămânii, ținta e limitată la ${tg.wkFloor} kcal: Norton nu trece de 1% din greutate pe săptămână, iar aplicația nu coboară sub ${KCAL_FLOOR[p.sex === 'f' ? 'f' : 'm']} kcal. Dacă vrei să slăbești mai repede, crești pașii (NEAT), nu tai din mâncare.`, 'alert') : ''}
      ${tg.goal === 'cut' ? `<div class="btn-row"><button class="btn ghost sm" data-a="nu:def" data-i="-150">− 150 kcal</button><button class="btn ghost sm" data-a="nu:def" data-i="150">+ 150 kcal</button></div><p class="small dim">Deficit real: ${Math.max(0, tg.tdee - tg.base.kcal)} kcal/zi</p>` : ''}</section>
    <section class="card"><h3>Media săptămânii</h3><p class="nbig">${W.avg}<small> kcal/zi · ${W.avg * 7} pe săptămână</small></p>
      <div class="wk-k">${W.days.map((x) => `<div class="${x.k === k ? 'on' : ''} wk-${x.type}"><span>${RO_DAYS[weekdayIdx(x.k)].slice(0, 2)}</span><b>${x.kcal}</b></div>`).join('')}</div>
      <p class="small">Contează media, nu fiecare zi: carbohidrații se mută spre zilele intense, totalul săptămânii rămâne același.</p></section>
    <section class="card"><h3>Ajustarea din cântar</h3>
      <div class="kpis">${kpi('Corecție necesar', `${A.c > 0 ? '+' : ''}${A.c || 0} kcal`, A.d ? `ultima: ${shortDay(A.d)}${A.step ? ` (${A.step > 0 ? '+' : ''}${A.step})` : ' (fără schimbare)'}` : 'încă nu')}${kpi('Metabolism', m ? m[1] : 'Normal', 'în Profil, mai jos')}</div>
      <p class="small">${tg.measured ? 'Folosesc necesarul măsurat din mese și cântar, așa că nu mai corectez separat.' : tg.manual ? 'Ai setat calorii manual: nu le schimb singur.' : A.d && A.w1 != null ? `Media cântarului: <b>${nf(A.w0 ?? 0)} → ${nf(A.w1)} kg</b> (${(A.r ?? 0) > 0 ? '+' : ''}${nf(A.r ?? 0, 2)} kg/săpt.), iar ${A.eat ? `cu ce ai mâncat (~${A.eat} kcal/zi)` : 'cu ținta'} trebuia <b>${(A.pred ?? 0) > 0 ? '+' : ''}${nf(A.pred ?? 0, 2)} kg/săpt.</b> Corectez o dată pe săptămână cu jumătate din diferență, cel mult 200 kcal.` : 'Cântărește-te dimineața (Progres → Greutate), de cel puțin 3 ori pe săptămână. După 2 săptămâni compar media săptămânii cu media celei dinainte și corectez necesarul singur, o dată pe săptămână.'}</p>
      ${p.aiKey ? `<button class="btn ghost" data-a="nu:aiwk" ${AIW.busy ? 'disabled' : ''}>${AIW.busy ? 'Analizez…' : 'Analiza săptămânii cu AI'}</button>${AIW.err ? `<p class="nalert">${ic('alert')} ${esc(AIW.err)}</p>` : ''}${p.aiWk ? `<div class="ai-out"><p class="small dim">${esc(shortDay(p.aiWk.d))}</p><p>${esc(p.aiWk.text).replace(/\n/g, '<br>')}</p></div>` : ''}` : '<p class="small dim">Cu cheia AI (mai jos), primești și o analiză a săptămânii.</p>'}</section>
    <section class="card"><h3>Ritmul săptămânii · ${esc(GOALS[tg.goal].l)}</h3><p class="small">${esc(tacStatus(S(), tg, k).t)}</p><button class="btn ghost sm" data-a="nu:tab" data-k="tac">Tactica</button></section>
    <section class="card"><div class="row"><h3 style="margin:0">Necesar măsurat</h3>${ms.ok ? `<label class="switch"><input type="checkbox" data-a="nu:meas" ${p.useMeasured !== false ? 'checked' : ''} aria-label="Folosește necesarul măsurat"><span></span></label>` : ''}</div>
      ${ms.ok ? `<div class="kpis">${kpi('Necesar', String(ms.tdee))}${kpi('Aport mediu', String(ms.intake))}${kpi('Greutate', `${(ms.perWeek ?? 0) > 0 ? '+' : ''}${nf(ms.perWeek ?? 0, 2)}`, 'kg/săpt.')}</div><p class="small">Din ${ms.days} zile notate complet și ${ms.weighs} cântăriri în ultimele 3 săptămâni. Bate orice formulă, pentru că vine din corpul tău. ${p.useMeasured !== false ? 'Îl folosesc pentru ținte.' : 'Acum folosesc estimarea din formulă.'}</p>`
        : `<p class="small">Calculez necesarul real din ce mănânci și cum se mișcă cântarul. Am nevoie, în ultimele 3 săptămâni, de cel puțin <b>7 zile notate complet</b> (minim 3 mese și 1500 kcal) și <b>8 cântăriri</b>.${ms.odd ? ' Datele de acum dau un rezultat neverosimil; mai notează câteva zile.' : ''}</p>${mbarCount('Zile complete', ms.days, 7)}${mbarCount('Cântăriri', ms.weighs, 8)}`}</section>
    <section class="card"><h3>Metabolism bazal la ${nf(curW(S(), k))} kg</h3>
      <ul class="hist">${EQS.map(([e, l, b]) => `<li><button class="eq ${tg.eq === e ? 'on' : ''}" data-a="nu:eq" data-k="${e}"><span><b>${tg.eq === e ? '▸ ' : ''}${l}</b><span class="small dim">pe baza: ${b}</span></span><b>${tg.A[e]} kcal</b></button></li>`).join('')}</ul>
      <p class="small dim">Atinge un rând ca s-o alegi. Între ele e o diferență de <b>${Math.max(...vals) - Math.min(...vals)} kcal</b> pe zi: atâta incertitudine au toate calculatoarele. Ecuațiile pe masă slabă folosesc grăsimea corporală (masă slabă acum: ${nf(tg.A.ffm)} kg).</p></section>
    <section class="card"><h3>Profil</h3>
      <div class="nform">
        <label class="nfld"><span>Sex</span>${sel('sex', [['m', 'Bărbat'], ['f', 'Femeie']], p.sex)}</label>
        ${numIn('age', 'Vârstă', p.age)}${numIn('h', 'Înălțime (cm)', p.h)}${numIn('startW', 'Greutate la start (kg)', p.startW, '', '0.1')}${numIn('goalW', 'Greutate țintă (kg)', p.goalW, '', '0.1')}
        ${numIn('bf', 'Grăsime corporală (%)', p.bf ?? '', `estimat ${tg.bf}`, '0.5')}
        ${numIn('waist', 'Talie azi (cm)', S().waist[k] ?? '', 'o dată pe săptămână', '0.5', 'nu:waist')}
        <label class="nfld"><span>Activitate</span>${sel('act', ACTIVITY.map(([v, l]) => [v, `${l} ×${v}`]), p.act)}</label>
        <label class="nfld"><span>Metabolism</span>${sel('metab', METAB, tg.metab)}</label>
        ${numIn('def', 'Deficit (kcal/zi)', p.def ?? '', `auto ${autoDef(p, tg.w)}`)}
        ${numIn('kcalT', 'Calorii/zi', p.kcalT ?? '', `auto ${tg.auto}`)}
        ${numIn('protT', 'Proteină g/zi', p.protT ?? '', 'auto')}
        ${numIn('waterT', 'Apă ml/zi', p.waterT ?? '', `auto ${tg.hyd.totalMl}`)}
      </div>
      <p class="small dim">Câmpurile goale rămân pe automat. Greutatea vine din cântăririle de la Progres (media ultimelor 7 zile). Nu coborî sub metabolismul de bază fără un medic sau nutriționist.</p></section>
    <section class="card"><div class="row"><div class="row-l"><h3>Pauze de dietă (la cut)</h3><p class="small dim" style="margin:0">Norton: cu cât ești mai slab, cu atât mai des. Tu: ${esc(dietBreakPlan(S(), k).l)}. Menținerea reală, cu tot notat, nu „mănânci orice”.</p></div>
      <label class="switch"><input type="checkbox" data-a="nu:dbreak" ${p.dietBreak !== false ? 'checked' : ''} aria-label="Pauze de dietă"><span></span></label></div></section>
    <section class="card"><h3>Antrenor AI</h3><p class="small">Pentru estimarea meselor din poză sau text și pentru analiza săptămânii folosesc cheia ta Anthropic (claude-opus-5-5). Cheia stă doar pe telefonul ăsta și nu intră în copia de rezervă.</p>
      <div class="nrow"><input id="aiKey" type="password" autocomplete="off" placeholder="${p.aiKey ? 'cheie salvată' : 'sk-ant-…'}" aria-label="Cheia API"><button class="btn sm" data-a="nu:key">Salvează</button></div>
      ${p.aiKey ? '<button class="link" data-a="nu:keydel">Șterge cheia</button>' : ''}</section>
    <section class="card"><details class="ndet"><summary>Avertizarea medicală</summary>${DISCLAIMER.map((x) => `<p class="small">${esc(x)}</p>`).join('')}</details></section>`;
}
const mbarCount = (l: string, v: number, t: number): string => `<div class="mbar"><div class="row"><span>${l}</span><span class="dim">${v}/${t}</span></div><div class="bar"><i style="width:${(clamp(v / t, 0, 1) * 100).toFixed(0)}%"></i></div></div>`;

// ---------- Unelte: food table, caffeine, sweat rate ----------
const fnorm = (s: string): string => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
type Row = [string, number, number, number, number, string, number, string, string];
const foodAll = (): Row[] => [...S().foods.map((f): Row => [f.n, f.k, f.p, f.c, f.g, 'm', f.por || 100, f.por ? 'o porție' : '100 g', f.brand || '']), ...FOODS.map((f): Row => [...f, ''])];
function foodListHtml(): string {
  const q = fnorm(FD.q).trim();
  const ws = q.split(/\s+/).filter(Boolean);
  const L = foodAll().filter((f) => (!FD.cat || f[5] === FD.cat) && ws.every((w) => fnorm(`${f[0]} ${f[8]}`).includes(w))).slice(0, q || FD.cat ? 40 : 12);
  if (!L.length) return `<p class="dim">Nimic găsit${FD.q ? ` pentru „${esc(FD.q)}”` : ''}. Încearcă alt cuvânt sau adaugă alimentul tău, de pe etichetă.</p>`;
  return L.map((f) => `<button class="fd-r ${FD.sel?.n === f[0] ? 'on' : ''}" data-a="nu:fdpick" data-k="${esc(f[0])}"><span><b>${esc(f[0])}</b><span class="small dim">${f[8] ? `${esc(f[8])} · ` : ''}${Math.round(f[1])} kcal · P ${nf(f[2])} · C ${nf(f[3])} · G ${nf(f[4])} la 100 g</span></span>${ic('plus')}</button>`).join('');
}
function foodMacros(): string {
  const f = FD.sel!;
  const g = parseFloat(FD.g.replace(',', '.'));
  const ok = g > 0 && g <= 3000;
  const x = (v: number): number => (ok ? (v * g) / 100 : 0);
  return `<div class="kpis k4">${kpi('kcal', ok ? String(Math.round(x(f.k))) : '—')}${kpi('Proteină', ok ? `${nf(x(f.p))} g` : '—')}${kpi('Carbo', ok ? `${nf(x(f.c))} g` : '—')}${kpi('Grăsimi', ok ? `${nf(x(f.g))} g` : '—')}</div>`;
}
function foodSelHtml(): string {
  const f = FD.sel;
  if (!f) return '';
  const opts: Array<[number, string]> = [[100, '100 g']];
  if (f.por && f.por !== 100) opts.push([f.por, f.pl || 'o porție']);
  if (f.por) opts.push([f.por * 2, '2 porții']);
  return `<div class="fd-sel"><div class="row"><div class="row-l"><b>${esc(f.n)}</b><p class="small dim" style="margin:0">${f.src === 'off' ? `Open Food Facts${f.brand ? ` · ${esc(f.brand)}` : ''}` : f.mine ? 'alimentul tău' : 'valori medii'} · la 100 g: ${Math.round(f.k)} kcal, P ${nf(f.p)} g</p></div><button class="icon-btn" data-a="nu:fdclear" aria-label="Alt aliment">${ic('close')}</button></div>
    <div class="chips" style="margin:8px 0">${opts.map(([v, l]) => `<button class="chip" aria-pressed="${+FD.g === v}" data-a="nu:fdg" data-i="${v}">${esc(l)}${l.includes(' g') ? '' : ` · ${v} g`}</button>`).join('')}</div>
    ${numIn('fdG', 'Cantitatea (grame)', FD.g, 'ex: 150', '1', 'nu:fdgin')}
    <div id="fdOut">${foodMacros()}</div>
    <button class="btn" style="margin-top:10px" data-a="nu:fdadd">${ic('check')} Adaugă în jurnalul de azi</button></div>`;
}
function toolsHtml(): string {
  const bd = 'BarcodeDetector' in window;
  return `<section class="card" id="food"><h3>${ic('bowl')} Calculator alimente</h3>
      <label class="nfld full"><span>Caută</span><input id="fdQ" type="text" value="${esc(FD.q)}" placeholder="pui, orez, ovăz, iaurt…" autocomplete="off" data-a="nu:fdq"></label>
      <div class="chips nscroll" style="margin:10px 0">${[['', 'Toate'] as [string, string]].concat(Object.entries(FCATS).filter(([c]) => c !== 'm' || S().foods.length)).map(([c, l]) => `<button class="chip" aria-pressed="${FD.cat === c}" data-a="nu:fdcat" data-k="${c}">${l}</button>`).join('')}</div>
      <div id="fdSel">${foodSelHtml()}</div>
      <div class="fd-list" id="fdList">${foodListHtml()}</div>
      <h3 style="margin-top:16px;font-size:17px">Produs ambalat · cod de bare</h3>
      <div class="nrow"><input id="fdBc" type="number" inputmode="numeric" value="${esc(FD.bc)}" placeholder="cifrele de sub codul de bare" aria-label="Cod de bare"><button class="btn sm" data-a="nu:fdbc" ${FD.busy ? 'disabled' : ''}>${FD.busy ? 'Caut…' : 'Caută'}</button></div>
      ${bd ? `<label class="btn ghost sm" style="margin-top:8px">${ic('camera')} Fotografiază codul de bare<input type="file" accept="image/*" capture="environment" data-a="nu:bcimg" class="sr"></label>` : ''}
      ${FD.err ? `<p class="nalert">${ic('alert')} ${esc(FD.err)}</p>` : ''}
      <p class="small dim">Datele vin din Open Food Facts, o bază deschisă cu produse din magazine. Verifică eticheta: are prioritate.</p>
      <details class="ndet"><summary>Adaugă un aliment al tău (de pe etichetă)</summary>
        <div class="nform"><label class="nfld full"><span>Nume</span><input id="faN" type="text" placeholder="ex: Baton proteic X"></label>${numIn('faK', 'kcal / 100 g', '', '', '1', 'nu:x')}${numIn('faP', 'Proteină / 100 g', '', '', '0.1', 'nu:x')}${numIn('faC', 'Carbo / 100 g', '', '', '0.1', 'nu:x')}${numIn('faG', 'Grăsimi / 100 g', '', '', '0.1', 'nu:x')}${numIn('faPor', 'Porția (g, opțional)', '', 'ex: 60', '1', 'nu:x')}</div>
        <button class="btn" style="margin-top:10px" data-a="nu:fdmine">${ic('check')} Salvează în alimentele mele</button></details>
      <p class="small dim">Valori medii la 100 g, pentru alimente crude dacă nu scrie „fiert” sau „gătit”. Cântărește crud când poți: e cel mai precis.</p></section>
    <section class="card" id="caf"><h3>Cafeină: doza și ora</h3>
      <div class="nform">${numIn('cw', 'Greutatea ta (kg)', TL.cw ?? String(Math.round(curW(S(), dayKey()))), '', '1', 'nu:tl')}
        <label class="nfld"><span>Ora antrenamentului</span><input type="time" value="${esc(TL.ct ?? '18:00')}" data-a="nu:tl" data-k="ct"></label>
        <label class="nfld full"><span>Ora de culcare</span><input type="time" value="${esc(TL.cb ?? '23:00')}" data-a="nu:tl" data-k="cb"></label></div>
      <div id="tl-caf">${cafOut()}</div></section>
    <section class="card" id="sweat"><h3>Rata de transpirație · cât să bei</h3>
      <div class="nform">${numIn('sb', 'Greutate înainte (kg)', TL.sb ?? '', '', '0.1', 'nu:tl')}${numIn('sa', 'Greutate după (kg)', TL.sa ?? '', 'cântărit după, uscat', '0.1', 'nu:tl')}${numIn('sd', 'Ai băut în timpul efortului (ml)', TL.sd ?? '500', '', '50', 'nu:tl')}${numIn('sm', 'Durata (min)', TL.sm ?? '60', '', '5', 'nu:tl')}</div>
      <p class="small dim">Cântărește-te fără haine înainte și imediat după un antrenament de cel puțin 45–60 de minute, după ce te ștergi de transpirație.</p>
      <div id="tl-sweat">${sweatOut()}</div></section>`;
}
const tlN = (k: string): number => parseFloat(String(TL[k] ?? '').replace(',', '.'));
const hm = (s: string | undefined): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  return m ? +m[1] * 60 + +m[2] : null;
};
const fmHM = (v: number): string => {
  const x = ((Math.round(v) % 1440) + 1440) % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
};
function cafOut(): string {
  const w = TL.cw != null ? tlN('cw') : Math.round(curW(S(), dayKey()));
  if (!(w > 0)) return '<p class="small dim">Scrie greutatea și ora antrenamentului.</p>';
  const lo = Math.round((w * 3) / 10) * 10;
  const hi = Math.round((w * 6) / 10) * 10;
  const start = Math.min(lo, 200);
  const t0 = hm(TL.ct ?? '18:00');
  const tb = hm(TL.cb ?? '23:00');
  const take = t0 != null ? t0 - 50 : null;
  const last = tb != null ? tb - 8 * 60 : null;
  const late = take != null && last != null && take > last;
  return `<div class="kpis">${kpi('Doză de pornire', `${start} mg`)}${kpi('Interval studiat', `${lo}–${Math.min(hi, 400)} mg`)}${kpi(take != null ? 'Ia-o la' : 'Cu', take != null ? fmHM(take) : '45–60 min')}</div>
    <ul class="nul"><li>Studiile folosesc <b>3–6 mg/kg</b> cu 45–60 de minute înainte. Începe de jos: efectul crește puțin peste 3 mg/kg, efectele adverse cresc mult.</li><li>Nu trece de <b>400 mg pe zi</b>, din toate sursele.</li>
    ${last != null ? `<li>Ca să nu-ți strici somnul: ultima cafeină până la <b>${fmHM(last)}</b> (cu ~8 ore înainte de culcare).${late ? ' <b>Antrenamentul e prea aproape de somn:</b> o doză mică sau deloc. Somnul contează mai mult decât cafeina.' : ''}</li>` : ''}
    <li>Orientativ: espresso ~60–80 mg · cafea la filtru 250 ml ~100–150 mg · energizant 250 ml ~80 mg.</li></ul>
    <p class="small dim">După poziția ISSN despre cafeină. Dacă ai probleme cu inima sau tensiunea, întreabă întâi medicul.</p>`;
}
function sweatOut(): string {
  const b = tlN('sb');
  const a = tlN('sa');
  const dr = TL.sd != null ? tlN('sd') || 0 : 500;
  const m = TL.sm != null ? tlN('sm') : 60;
  if (!(b > 0 && a > 0 && m > 0)) return '<p class="small dim">Completează greutatea înainte și după, ce ai băut și durata. Îți calculez cât transpiri pe oră și cât să bei.</p>';
  const loss = (b - a) * 1000 + dr;
  const rate = loss / (m / 60);
  const pct = ((b - a) / b) * 100;
  if (loss <= 0) return '<p class="small dim">Greutatea de după e mai mare decât pierderea de lichide: verifică cifrele.</p>';
  return `<div class="kpis">${kpi('Transpirație', `${nf(rate / 1000, 2)} L/h`)}${kpi('Pierdut', `${nf(pct)}% corp`)}${kpi('De băut după', `${nf(Math.max(0, b - a) * 1.5)} L`)}</div>
    <ul class="nul"><li>La efort peste 60–90 de minute: <b>~${Math.round((rate * 0.6) / 50) * 50}–${Math.round((rate * 0.8) / 50) * 50} ml pe oră</b>, în înghițituri la 15–20 de minute. Nu bea mai mult decât transpiri.</li>
    <li>Peste 90 de minute sau pe căldură: și sodiu, cam <b>300–600 mg pe oră</b>.</li><li>După efort: <b>~1,5 L pentru fiecare kg pierdut</b>, împreună cu o masă sărată.</li>
    ${pct > 2 ? '<li><b>Ai pierdut peste 2% din greutate</b>: de aici performanța scade vizibil. Bea mai mult în timpul efortului.</li>' : ''}</ul>
    <p class="small dim">Rata se schimbă cu temperatura și intensitatea: refă calculul vara și iarna. Recomandări după ghidurile ACSM.</p>`;
}

// ---------- actions ----------
const val = (id: string): string => (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';
const fnum = (id: string): number => parseFloat(val(id).replace(',', '.'));

function foodSel(f: FoodSel): void {
  FD.sel = f;
  FD.g = String(f.por && f.por !== 100 ? f.por : 100);
  FD.err = null;
}

async function foodBarcode(raw: string, render: () => void): Promise<void> {
  const code = String(raw || '').replace(/\D/g, '');
  if (code.length < 8 || code.length > 14) {
    FD.err = 'Codul de bare are 8–14 cifre.';
    return render();
  }
  FD.bc = code;
  FD.busy = true;
  FD.err = null;
  render();
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_ro,brands,nutriments,serving_quantity`);
    if (!r.ok && r.status !== 404) throw new Error('http');
    const d = (await r.json()) as { status?: number; product?: { product_name?: string; product_name_ro?: string; brands?: string; serving_quantity?: number; nutriments?: Record<string, number> } };
    const p = d.product;
    const nu = p?.nutriments ?? {};
    let k = +nu['energy-kcal_100g'];
    if (!(k > 0) && +nu.energy_100g > 0) k = nu.energy_100g / 4.184;
    if (!p || d.status === 0) FD.err = 'Produsul nu e în Open Food Facts. Adaugă-l mai jos, de pe etichetă.';
    else if (!(k >= 0) || nu.proteins_100g == null) FD.err = 'Produsul există, dar fără valori nutriționale complete. Adaugă-l de pe etichetă.';
    else {
      const sq = +(p.serving_quantity ?? 0);
      const f = { n: String(p.product_name_ro || p.product_name || `Produs ${code}`).trim().slice(0, 70), brand: String(p.brands || '').split(',')[0].trim().slice(0, 40), k: Math.round(k), p: +(+nu.proteins_100g || 0).toFixed(1), c: +(+nu.carbohydrates_100g || 0).toFixed(1), g: +(+nu.fat_100g || 0).toFixed(1), por: sq > 0 && sq < 2000 ? Math.round(sq) : null, code };
      S().foods = [f, ...S().foods.filter((x) => x.code !== code && x.n !== f.n)].slice(0, 60);
      save();
      FD.bc = '';
      foodSel({ ...f, pl: 'o porție', src: 'off' });
    }
  } catch {
    FD.err = 'Nu ajung la Open Food Facts. Verifică internetul și mai încearcă.';
  }
  FD.busy = false;
  render();
}

async function runQuick(render: () => void): Promise<void> {
  const t = (val('qiT') || QI.text).trim();
  QI.text = t;
  const key = P().aiKey;
  if (!t) {
    QI.err = 'Scrie ce ai mâncat.';
    return render();
  }
  if (!key) return render();
  QI.busy = true;
  QI.err = null;
  QI.res = null;
  render();
  try {
    QI.res = await estimateText(key, t.slice(0, 1000));
  } catch (e) {
    QI.err = await aiErrText(e);
  }
  QI.busy = false;
  render();
}

async function runScan(render: () => void): Promise<void> {
  const key = P().aiKey;
  if (SC.busy || !SC.data || !key) return;
  SC.hint = val('scHint').trim().slice(0, 200);
  SC.busy = true;
  SC.err = null;
  SC.res = null;
  render();
  try {
    SC.res = await estimatePhoto(key, SC.data, SC.hint);
  } catch (e) {
    SC.err = await aiErrText(e);
  }
  SC.busy = false;
  render();
}

function weekFacts(): string {
  const k = dayKey();
  const tg = tgt();
  const W = weekTargets(S(), k);
  const ww = wWeeks(S(), k);
  const A = nAdj(P());
  const eat: number[] = [];
  for (let i = 1; i <= 7; i++) {
    const kk = addDays(k, -i);
    const t = dayTotals(S(), kk);
    if (mlogDay(S(), kk).length >= 3 && t.k >= 1200) eat.push(t.k);
  }
  const done = S().log.filter((e) => e.date > addDays(k, -7) && e.block).length;
  return `Bilanțul săptămânii. Obiectiv: ${GOALS[tg.goal].l} (faza: ${tg.phase.label.toLowerCase()}, ${tg.phase.sub}). ${ww ? `Media cântarului: ${nf(ww.w0)} kg în săptămâna dinainte, ${nf(ww.w1)} kg în ultimele 7 zile (${ww.rate > 0 ? '+' : ''}${nf(ww.rate, 2)} kg/săpt.), ritmul țintă ${nf(tg.rateT, 2)} kg/săpt. ` : 'Am prea puține cântăriri pentru media pe două săptămâni. '}Ținta medie: ${W.avg} kcal/zi, proteină ${tg.p} g (necesar ${tg.tdee} kcal, ${tg.measured ? 'măsurat' : 'estimat'}; corecția din cântar ${A.c > 0 ? '+' : ''}${A.c || 0} kcal). ${eat.length ? `Mesele notate complet în ${eat.length} zile, în medie ${Math.round(eat.reduce((a, x) => a + x, 0) / eat.length)} kcal/zi. ` : 'Nu am notat mesele complet. '}Blocuri de antrenament făcute în ultimele 7 zile: ${done}. Analizează săptămâna pe medii și spune-mi pe scurt ce aș schimba (calorii, pași, notare) și de ce.`;
}

export function nuAct(a: string, el: HTMLElement, render: () => void): void {
  const st = S();
  const p = P();
  const k = dayKey();
  const key = el.dataset.k ?? '';
  const I = Number(el.dataset.i ?? 0);
  switch (a) {
    case 'nu:ok':
      p.ok = k;
      if (!p.dbStart) p.dbStart = weekStart(k);
      save();
      nutriStartup();
      return render();
    case 'nu:tab':
      NT = (key as NTab) || 'azi';
      swapOpen = '';
      render();
      window.scrollTo({ top: 0 });
      return;
    case 'nu:tool':
      NT = 'tools';
      render();
      requestAnimationFrame(() => document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    case 'nu:water':
      st.water[k] = clamp(waterOf(st, k) + I, 0, 15000);
      save();
      buzz(12);
      return render();
    case 'nu:add': {
      const n = val('mN').trim();
      const kc = fnum('mK');
      if (!n) return toast('Scrie ce ai mâncat.');
      if (!(kc >= 0 && kc <= 5000)) return toast('Scrie caloriile mesei.');
      addMeal({ n: n.slice(0, 80), k: Math.round(kc), p: Math.round(fnum('mP') || 0), c: Math.round(fnum('mC') || 0), g: Math.round(fnum('mG') || 0) });
      toast(`Masă adăugată · ${Math.round(kc)} kcal`);
      return render();
    }
    case 'nu:again': {
      let m: MealLog | null = null;
      Object.keys(st.mlog).sort().forEach((d) => st.mlog[d].forEach((x) => {
        if ((x.n || '').toLowerCase() === key.toLowerCase()) m = x;
      }));
      if (m) {
        const mm: MealLog = { ...(m as MealLog) };
        delete mm.pl;
        addMeal(mm);
        toast(`Masă adăugată · ${Math.round(+mm.k || 0)} kcal`);
        render();
      }
      return;
    }
    case 'nu:mdel':
      ask('Ștergi masa?', 'Dispare din jurnalul de azi.', 'Șterge', () => {
        st.mlog[k] = mlogDay(st, k).filter((_, j) => j !== I);
        save();
        render();
      }, 'Renunță', true);
      return;
    case 'nu:qimic': {
      if (!SR) return;
      if (QI.rec) {
        QI.rec.stop();
        return;
      }
      try {
        const r = new SR();
        r.lang = 'ro-RO';
        r.interimResults = true;
        r.continuous = false;
        r.onresult = (e) => {
          let t = '';
          for (const x of Array.from(e.results)) t += x[0].transcript;
          QI.text = t;
          const inp = document.getElementById('qiT') as HTMLInputElement | null;
          if (inp) inp.value = t;
        };
        r.onend = () => {
          QI.rec = null;
          if (QI.text.trim() && P().aiKey) void runQuick(render);
          else render();
        };
        r.onerror = () => {
          QI.rec = null;
          render();
        };
        QI.rec = r;
        r.start();
        buzz(20);
        render();
      } catch {
        QI.rec = null;
        toast('Dictarea nu merge aici. Scrie masa în câmp.');
      }
      return;
    }
    case 'nu:qirun':
      void runQuick(render);
      return;
    case 'nu:qix':
      Object.assign(QI, { res: null, err: null });
      return render();
    case 'nu:qiadd':
    case 'nu:scadd': {
      const pre = a === 'nu:qiadd' ? 'qi' : 'sc';
      const n = val(pre + 'N').trim() || 'Masă';
      const kc = Math.round(fnum(pre + 'K') || 0);
      addMeal({ n: n.slice(0, 80), k: kc, p: Math.round(fnum(pre + 'P') || 0), c: Math.round(fnum(pre + 'C') || 0), g: Math.round(fnum(pre + 'G') || 0) });
      if (pre === 'qi') Object.assign(QI, { text: '', res: null, err: null });
      else Object.assign(SC, { img: null, data: null, res: null, err: null, hint: '' });
      toast(`Masă adăugată · ${kc} kcal`);
      return render();
    }
    case 'nu:scrun':
      void runScan(render);
      return;
    case 'nu:scx':
      Object.assign(SC, { img: null, data: null, res: null, err: null, busy: false, hint: '' });
      return render();
    case 'nu:stick': {
      const d = [...(st.supp.log[k] ?? [])];
      const i = d.indexOf(key);
      if (i >= 0) d.splice(i, 1);
      else {
        d.push(key);
        buzz(10);
      }
      if (d.length) st.supp.log[k] = d;
      else delete st.supp.log[k];
      save();
      return render();
    }
    case 'nu:son':
      if (st.supp.on[key]) delete st.supp.on[key];
      else st.supp.on[key] = true;
      save();
      return render();
    case 'nu:goal':
      if (key in GOALS) {
        if (key === 'cut' && p.goalMode !== 'cut') p.dbStart = weekStart(k);
        p.goalMode = key as Goal;
        save();
        toast(`Obiectiv: ${GOALS[key as Goal].l}. Țintele și mesele s-au recalculat.`);
        render();
      }
      return;
    case 'nu:pday':
      planOff = I;
      swapOpen = '';
      return render();
    case 'nu:eat': {
      const D = dayPlan(st, k, tgt());
      const m = D.meals[I];
      if (!m) return;
      addMeal({ n: `${D.name} · ${m.n}`, k: m.k, p: m.p, c: m.c, g: m.g, pl: D.kind + I });
      buzz(20);
      toast(`Masă notată · ${m.k} kcal`);
      return render();
    }
    case 'nu:swap':
      swapOpen = swapOpen === key ? '' : key;
      return render();
    case 'nu:swapx':
      swapOpen = '';
      return render();
    case 'nu:swapset': {
      const v = el.dataset.v ?? '';
      const of = key.split(':')[1];
      if (!MFD[v]) return;
      const m = { ...(p.mSwap ?? {}) };
      if (v === of) delete m[key];
      else m[key] = v;
      p.mSwap = m;
      save();
      swapOpen = '';
      toast(`Înlocuit cu ${MFD[v][0]}; cantitățile s-au recalculat.`);
      return render();
    }
    case 'nu:shopn':
      shopN = I;
      return render();
    case 'nu:shoptick':
      if (st.shop[key]) delete st.shop[key];
      else st.shop[key] = true;
      save();
      buzz(8);
      return render();
    case 'nu:shopreset':
      st.shop = {};
      save();
      return render();
    case 'nu:shopcopy': {
      const D = shopData(st, k, shopN);
      const L = D.order.map((c) => {
        const xs = D.groups[c].filter((x) => !x.on);
        return xs.length ? `${c}\n${xs.map((x) => `- ${x.nm}: ${shopQty(x)}`).join('\n')}` : '';
      }).filter(Boolean);
      const t = `Lista de cumpărături · ${(SHOP_RANGE.find((x) => x[0] === D.n)?.[1] ?? '').toLowerCase()}\n\n${L.join('\n\n')}`;
      navigator.clipboard.writeText(t).then(() => toast(`Lista copiată · ${D.all - D.got} alimente`), () => toast('Browserul nu permite copierea aici.'));
      return;
    }
    case 'nu:def': {
      p.def = clamp((+(p.def ?? 0) || autoDef(p, curW(st, k))) + I, 0, 1200);
      save();
      toast(`Deficit ${p.def} kcal · ținta nouă: ${tgt().kcal} kcal`);
      return render();
    }
    case 'nu:eq':
      p.eq = key as Eq;
      save();
      return render();
    case 'nu:aiwk': {
      if (!p.aiKey || AIW.busy) return;
      AIW.busy = true;
      AIW.err = '';
      render();
      weekReview(p.aiKey, weekFacts())
        .then((text) => {
          p.aiWk = { d: k, text };
          save();
        })
        .catch(async (e) => {
          AIW.err = await aiErrText(e);
        })
        .finally(() => {
          AIW.busy = false;
          render();
        });
      return;
    }
    case 'nu:key': {
      const v = val('aiKey').trim();
      if (!/^sk-ant-/.test(v)) return toast('Cheia începe cu sk-ant-.');
      p.aiKey = v;
      save();
      toast('Cheie salvată pe telefon.');
      return render();
    }
    case 'nu:keydel':
      delete p.aiKey;
      save();
      return render();
    case 'nu:fdcat':
      FD.cat = key;
      return render();
    case 'nu:fdpick': {
      const f = foodAll().find((x) => x[0] === key);
      if (!f) return;
      foodSel({ n: f[0], k: f[1], p: f[2], c: f[3], g: f[4], por: f[5] === 'm' ? (f[6] !== 100 ? f[6] : null) : f[6], pl: f[7], mine: f[5] === 'm', brand: f[8] });
      render();
      requestAnimationFrame(() => document.getElementById('fdSel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    case 'nu:fdclear':
      FD.sel = null;
      return render();
    case 'nu:fdg':
      FD.g = String(I);
      return render();
    case 'nu:fdadd': {
      const f = FD.sel;
      const g = parseFloat(FD.g.replace(',', '.'));
      if (!f || !(g > 0 && g <= 3000)) return toast('Scrie cantitatea în grame.');
      const m = { n: `${f.n} · ${Math.round(g)} g`.slice(0, 80), k: Math.round((f.k * g) / 100), p: Math.round((f.p * g) / 100), c: Math.round((f.c * g) / 100), g: Math.round((f.g * g) / 100) };
      addMeal(m);
      FD.sel = null;
      FD.q = '';
      toast(`Adăugat · ${m.k} kcal · ${m.p} g proteină`);
      return render();
    }
    case 'nu:fdbc':
      void foodBarcode(val('fdBc') || FD.bc, render);
      return;
    case 'nu:fdmine': {
      const n = val('faN').trim();
      const kc = fnum('faK');
      const pr = fnum('faP');
      if (!n) return toast('Scrie numele alimentului.');
      if (!(kc >= 0 && kc <= 950)) return toast('kcal la 100 g: între 0 și 950.');
      if (!(pr >= 0 && pr <= 100)) return toast('Proteina la 100 g: între 0 și 100.');
      const por = fnum('faPor');
      const f = { n: n.slice(0, 70), k: Math.round(kc), p: +pr.toFixed(1), c: +(fnum('faC') || 0).toFixed(1), g: +(fnum('faG') || 0).toFixed(1), por: por > 0 ? Math.round(por) : null };
      st.foods = [f, ...st.foods.filter((x) => x.n !== f.n)].slice(0, 60);
      save();
      FD.cat = 'm';
      foodSel({ ...f, pl: 'o porție', mine: true });
      toast(`Aliment salvat: ${f.n}`);
      return render();
    }
  }
}

export function nuChange(a: string, el: HTMLElement, render: () => void): void {
  const p = P();
  const inp = el as HTMLInputElement;
  if (a === 'nu:p') {
    const key = el.dataset.k as keyof NutProfile;
    const raw = inp.value.trim();
    if (key === 'sex') p.sex = raw === 'f' ? 'f' : 'm';
    else {
      const v = parseFloat(raw.replace(',', '.'));
      const lim: Record<string, [number, number]> = { age: [14, 90], h: [130, 230], startW: [35, 250], goalW: [35, 250], bf: [3, 60], act: [1.2, 2], metab: [0.8, 1], def: [0, 1200], kcalT: [1200, 6000], protT: [40, 400], waterT: [1000, 8000] };
      const [lo, hi] = lim[key] ?? [0, 1e6];
      const opt = ['bf', 'def', 'kcalT', 'protT', 'waterT'].includes(key);
      if (!raw && opt) delete (p as unknown as Record<string, unknown>)[key];
      else if (!(v >= lo && v <= hi)) {
        toast(`Valoare între ${lo} și ${hi}.`);
        return render();
      } else (p as unknown as Record<string, unknown>)[key] = v;
      // the app never proposes less than the safe floor
      if (key === 'kcalT' && p.kcalT && p.kcalT < KCAL_FLOOR[p.sex === 'f' ? 'f' : 'm']) {
        p.kcalT = KCAL_FLOOR[p.sex === 'f' ? 'f' : 'm'];
        toast(`Nu cobor sub ${p.kcalT} kcal pe zi.`);
      }
    }
    save();
    return render();
  }
  if (a === 'nu:waist') {
    const v = parseFloat(inp.value.replace(',', '.'));
    if (v >= 40 && v <= 200) S().waist[dayKey()] = Math.round(v * 10) / 10;
    else if (!inp.value.trim()) delete S().waist[dayKey()];
    save();
    return render();
  }
  if (a === 'nu:meas') {
    p.useMeasured = inp.checked;
    save();
    return render();
  }
  if (a === 'nu:dbreak') {
    p.dietBreak = inp.checked;
    save();
    return render();
  }
  if (a === 'nu:scanfile' || a === 'nu:bcimg') {
    const f = inp.files?.[0];
    inp.value = '';
    if (!f) return;
    if (a === 'nu:scanfile') {
      photoB64(f)
        .then((r) => {
          Object.assign(SC, { img: r.url, data: r.data, res: null, err: null, busy: false, hint: '' });
          render();
          requestAnimationFrame(() => document.getElementById('scanCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        })
        .catch(() => toast('Nu am putut citi poza.'));
      return;
    }
    const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect(b: ImageBitmap): Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
    if (!BD) return;
    createImageBitmap(f)
      .then((bmp) => new BD({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }).detect(bmp))
      .then((r) => {
        if (r.length) void foodBarcode(r[0].rawValue, render);
        else {
          FD.err = 'Nu am găsit un cod de bare în poză. Apropie telefonul și asigură lumină bună, sau scrie cifrele.';
          render();
        }
      })
      .catch(() => {
        FD.err = 'Nu am putut citi poza. Scrie cifrele de sub codul de bare.';
        render();
      });
    return;
  }
}

/** Live typing: the food search, grams, the calculators. No full re-render, so the keyboard stays open. */
export function nuInput(a: string, el: HTMLElement): void {
  const v = (el as HTMLInputElement).value;
  if (a === 'nu:fdq') {
    FD.q = v;
    const l = document.getElementById('fdList');
    if (l) l.innerHTML = foodListHtml();
  } else if (a === 'nu:fdgin') {
    FD.g = v;
    const o = document.getElementById('fdOut');
    if (o && FD.sel) o.innerHTML = foodMacros();
  } else if (a === 'nu:tl') {
    TL[el.dataset.k ?? ''] = v;
    const c = document.getElementById('tl-caf');
    if (c) c.innerHTML = cafOut();
    const s = document.getElementById('tl-sweat');
    if (s) s.innerHTML = sweatOut();
  } else if (a === 'nu:qit') QI.text = v;
}

