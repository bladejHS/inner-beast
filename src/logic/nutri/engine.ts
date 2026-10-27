// The nutrition engine, Layne Norton's method only: a starting estimate of maintenance, then the real one from what
// you log and what the scale does (measured TDEE and the weekly correction). The goal sets the weekly rate, protein
// comes from lean mass, fats stay low, the rest is carbs, the same target every day. Diet breaks and the weekly verdict
// follow Norton too. Everything reads the app state; nothing here touches the DOM.

import { WEEK, type Block } from '../../data/plan.ts';
import { GOALS, PLAN_DAY_TYPE, type Goal } from '../../data/nutrition.ts';
import type { MealLog, NAdj, NutProfile, State } from '../store.ts';
import { addDays, clamp, daysBetween, weekStart, weekdayIdx } from '../util.ts';
import { KCAL_FLOOR, type Sex } from './floor.ts';
import { DAY_LABEL, type DayType } from './plan.ts';

const r2 = (v: number): number => Math.round(v * 100) / 100;
const sexOf = (P: NutProfile): Sex => (P.sex === 'f' ? 'f' : 'm');

// ---------- meals, weight ----------
export const mlogDay = (S: State, k: string): MealLog[] => S.mlog[k] ?? [];
export function dayTotals(S: State, k: string): { k: number; p: number; c: number; g: number } {
  return mlogDay(S, k).reduce((a, m) => ({ k: a.k + (+m.k || 0), p: a.p + (+m.p || 0), c: a.c + (+m.c || 0), g: a.g + (+m.g || 0) }), { k: 0, p: 0, c: 0, g: 0 });
}

export function wList(S: State): Array<{ d: string; w: number }> {
  return Object.keys(S.weight).sort().map((d) => ({ d, w: S.weight[d] }));
}
/** Weight used for the targets: the average of the last 7 days of weigh-ins, else the last one, else the start weight. */
export function curW(S: State, today: string): number {
  const a = wList(S);
  if (!a.length) return +S.nut.startW || 80;
  const wk = a.filter((x) => x.d > addDays(today, -7) && x.d <= today);
  const b = wk.length ? wk : [a[a.length - 1]];
  return b.reduce((s, x) => s + x.w, 0) / b.length;
}

/** Weigh-ins of the last 7 days against the 7 before (at least 3 in each), in kg per week. */
export function wWeeks(S: State, today: string): { w0: number; w1: number; rate: number; n: number } | null {
  const a = wList(S);
  const m = addDays(today, -7);
  const b1 = a.filter((x) => x.d > m && x.d <= today);
  const b0 = a.filter((x) => x.d > addDays(today, -14) && x.d <= m);
  if (b1.length < 3 || b0.length < 3) return null;
  const avg = (b: typeof a, f: (x: (typeof a)[number]) => number): number => b.reduce((s, x) => s + f(x), 0) / b.length;
  const w1 = avg(b1, (x) => x.w);
  const w0 = avg(b0, (x) => x.w);
  const gap = avg(b1, (x) => daysBetween(m, x.d)) - avg(b0, (x) => daysBetween(m, x.d));
  return { w0, w1, rate: gap > 0 ? ((w1 - w0) / gap) * 7 : w1 - w0, n: b0.length + b1.length };
}

// ---------- body ----------
/** Body fat %: the one you set, otherwise from BMI (Deurenberg). */
export function bfOf(P: NutProfile, w: number): number {
  if (+(P.bf ?? 0)) return clamp(+P.bf!, 3, 60);
  const bmi = w / Math.pow((+P.h || 180) / 100, 2);
  return clamp(Math.round(1.2 * bmi + 0.23 * (+P.age || 30) - (P.sex === 'f' ? 5.4 : 16.2)), 8, 50);
}
/** Starting estimate of resting metabolism (Mifflin-St Jeor); the real maintenance comes from the scale. */
export function bmrOf(P: NutProfile, w: number): { bmr: number; ffm: number } {
  const f = P.sex === 'f';
  return { bmr: Math.round(10 * w + 6.25 * P.h - 5 * P.age + (f ? -161 : 5)), ffm: w * (1 - bfOf(P, w) / 100) };
}

// ---------- goal, protein, phase ----------
export const goalMode = (P: NutProfile): Goal => (P.goalMode && GOALS[P.goalMode] ? P.goalMode : 'cut');
/** Norton: +1.5% protein per year after 30. */
export const protAgeF = (P: NutProfile): number => 1 + 0.015 * Math.max(0, (+P.age || 30) - 30);
/** Protein, g per kg of lean mass, capped at 3.1. */
export const protPL = (P: NutProfile, g: Goal): number => Math.round(Math.min(3.1, GOALS[g].pl * protAgeF(P)) * 100) / 100;
const refKg = (w: number, ffm: number): number => Math.min(w, ffm / 0.85);
/** Default deficit (or surplus, negative) from the goal's weekly rate, at 7700 kcal per kg. */
export const autoDef = (P: NutProfile, w: number): number => Math.round((-w * GOALS[goalMode(P)].rate * 7700) / 7 / 50) * 50;
export const metabF = (P: NutProfile): number => {
  const v = +(P.metab ?? 1);
  return v === 0.9 || v === 0.82 ? v : 1;
};

/** Diet breaks (Norton): the leaner you are, the more often. */
export function dietBreakPlan(S: State, today: string): { c: number; b: number; l: string } {
  const P = S.nut;
  const bf = bfOf(P, curW(S, today));
  const f = P.sex === 'f';
  if (bf < (f ? 22 : 12)) return { c: 2, b: 2, l: '2 săptămâni deficit, 2 la menținere (ești slab: 1:1)' };
  if (bf >= (f ? 35 : 25)) return { c: 6, b: 2, l: '6 săptămâni deficit, 2 la menținere (multă grăsime de pierdut: 1–2 săptămâni la 1–2 luni)' };
  return { c: 4, b: 2, l: '4 săptămâni deficit, 2 la menținere (raport 2:1)' };
}

export interface Phase {
  cut: boolean;
  goal: Goal;
  brk?: boolean;
  label: string;
  sub: string;
}
export function nPhase(S: State, today: string): Phase {
  const P = S.nut;
  const g = goalMode(P);
  if (g === 'bulk') return { cut: false, goal: g, label: 'Lean bulk', sub: 'surplus mic, ~0,75% din greutate pe lună' };
  if (g === 'recomp') return { cut: false, goal: g, label: 'Recompoziție', sub: 'deficit mic, proteină mare' };
  if (P.dietBreak === false) return { cut: true, goal: g, label: 'Cut', sub: 'deficit continuu' };
  const D = dietBreakPlan(S, today);
  const st = P.dbStart || weekStart(today);
  const gw = Math.max(0, Math.floor(daysBetween(st, weekStart(today)) / 7));
  const i = gw % (D.c + D.b);
  return i < D.c
    ? { cut: true, goal: g, label: 'Cut', sub: `săptămâna ${i + 1} din ${D.c} de deficit` }
    : { cut: false, goal: g, brk: true, label: 'Pauză de dietă', sub: `săptămâna ${i - D.c + 1} din ${D.b} la menținere` };
}

// ---------- the day, from Inner Beast's plan ----------
/** Net MET per block kind (above resting). */
function blockMet(b: Block): number {
  if (b.kind === 'rounds') return b.focus === 'slow' || b.focus === 'distance' ? 4 : 7;
  if (b.kind === 'amrap') return 8;
  if (b.kind === 'workout') return 4.5;
  if (b.kind === 'run') return 6.5;
  if (b.kind === 'walk') return 2.5;
  if (b.kind === 'routine') return 1.5;
  return 0;
}
function blockMin(b: Block): number {
  if (b.kind === 'rounds') {
    const r = b.rounds ?? 1;
    return Math.round((r * (b.work ?? 0) + (r - 1) * (b.rest === 'none' ? 0 : 60)) / 60);
  }
  if (b.kind === 'walk') return 90;
  if (b.kind === 'workout' && b.workout === 'legs') return 15;
  if (b.kind === 'shower' || b.kind === 'wimhof' || b.kind === 'breath') return 0;
  return b.min ?? 10;
}

export interface NutDay {
  type: DayType;
  label: string;
  /** The plan day's title. */
  t: string;
  d: number;
  /** Training minutes (walks and breathing left out). */
  minutes: number;
}
export function nutriDay(k: string): NutDay {
  const d = weekdayIdx(k);
  const day = WEEK[d];
  const type = PLAN_DAY_TYPE[d];
  const minutes = day.blocks.filter((b) => b.kind !== 'walk').reduce((s, b) => s + (blockMet(b) >= 4 ? blockMin(b) : 0), 0);
  return { type, label: DAY_LABEL[type], t: day.title, d, minutes };
}
// ---------- measured TDEE and the weekly correction from the scale ----------
export interface Measured {
  ok: boolean;
  days: number;
  weighs: number;
  odd?: boolean;
  tdee?: number;
  intake?: number;
  perWeek?: number;
}
/** Average intake on fully logged days minus the energy of the weight change (regression over 21 days). */
export function tdeeMeasured(S: State, today: string): Measured {
  const ks: number[] = [];
  for (let i = 1; i <= 21; i++) {
    const k = addDays(today, -i);
    const t = dayTotals(S, k);
    if (mlogDay(S, k).length >= 3 && t.k >= 1500) ks.push(t.k);
  }
  const a = wList(S).filter((x) => x.d >= addDays(today, -21) && x.d <= today);
  const res: Measured = { ok: false, days: ks.length, weighs: a.length };
  if (ks.length < 7 || a.length < 8) return res;
  const xs = a.map((p) => daysBetween(a[0].d, p.d));
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length;
  const my = a.reduce((s, p) => s + p.w, 0) / a.length;
  let cov = 0;
  let vr = 0;
  xs.forEach((x, i) => {
    cov += (x - mx) * (a[i].w - my);
    vr += (x - mx) * (x - mx);
  });
  if (!vr) return res;
  const slope = cov / vr;
  const intake = ks.reduce((s, x) => s + x, 0) / ks.length;
  const tdee = Math.round(intake - slope * 7700);
  if (tdee < 1500 || tdee > 7000) return { ...res, odd: true };
  return { ok: true, tdee, intake: Math.round(intake), perWeek: slope * 7, days: ks.length, weighs: a.length };
}
export const nAdj = (P: NutProfile): NAdj => ({ c: 0, ...(P.nAdj ?? {}) });

/** Daily: log the base target and TDEE. Weekly: compare the scale's trend with what should have happened and correct
 *  the TDEE by half the difference, at most ±200 kcal a week, −900…+500 in total. Returns true when the state changed. */
export function nAdaptRun(S: State, today: string): boolean {
  const P = S.nut;
  if (P.kcalT) return false;
  let changed = false;
  if (!S.nlog[today]) {
    const tg = targets(S, today);
    S.nlog[today] = { k: tg.kcal, t: tg.tdee };
    for (const d of Object.keys(S.nlog)) if (d < addDays(today, -60)) delete S.nlog[d];
    changed = true;
  }
  const A = nAdj(P);
  if (A.d && daysBetween(A.d, today) < 7) return changed;
  if (tdeeMeasured(S, today).ok && P.useMeasured !== false) return changed;
  const W = wWeeks(S, today);
  if (!W) return changed;
  const L = S.nlog;
  const days = Object.keys(L).filter((d) => d > addDays(today, -14) && d <= today);
  if (days.length < 7) return changed;
  const ate = (d: string): number | null => {
    const t = dayTotals(S, d);
    return mlogDay(S, d).length >= 3 && t.k >= 1200 ? t.k : null;
  };
  const eaten = days.map(ate).filter((v): v is number => v != null);
  const pred = ((days.reduce((a, d) => a + ((ate(d) ?? L[d].k) - L[d].t), 0) / days.length) * 7) / 7700;
  const err = W.rate - pred;
  let step = Math.round(((-err * 7700) / 7) * 0.5 / 10) * 10;
  step = clamp(step, -200, 200);
  if (Math.abs(step) < 30) step = 0;
  const c = clamp((A.c || 0) + step, -900, 500);
  P.nAdj = { c, d: today, r: r2(W.rate), pred: r2(pred), step, n: W.n, h: (A.h ?? []).concat([r2(W.rate)]).slice(-4), w0: r2(W.w0), w1: r2(W.w1), eat: eaten.length >= 4 ? Math.round(eaten.reduce((a, x) => a + x, 0) / eaten.length) : null };
  return true;
}

// ---------- the targets ----------
export interface Targets {
  kcal: number;
  p: number;
  c: number;
  f: number;
  day: NutDay;
  bmr: number;
  bmrR: number;
  tdee: number;
  est: number;
  measured: boolean;
  ms: Measured;
  auto: number;
  manual: boolean;
  phase: Phase;
  def: number;
  autoDef: number;
  ffm: number;
  adj: number;
  metab: number;
  wkFloor: number;
  raised: boolean;
  bf: number;
  goal: Goal;
  rateT: number;
  w: number;
}

/** The daily target (Norton): maintenance minus the goal's deficit, protein on lean mass, ~20-25% fat, the rest carbs. */
export function targets(S: State, k: string, today = k): Targets {
  const P = S.nut;
  const w = curW(S, today);
  const { bmr, ffm } = bmrOf(P, w);
  const sex = sexOf(P);
  const mf = metabF(P);
  const bmrR = Math.round(bmr * mf);
  const est = Math.round(bmr * (+P.act || 1.55) * mf);
  const ms = tdeeMeasured(S, today);
  const useM = ms.ok && P.useMeasured !== false;
  const adj = useM ? 0 : nAdj(P).c;
  const tdee = useM ? ms.tdee! : Math.max(Math.round(bmrR * 1.1), est + adj);
  const ph = nPhase(S, today);
  const ad = autoDef(P, w);
  const def = ph.goal === 'cut' ? (ph.cut ? +(P.def ?? 0) || ad : 0) : ad;
  const goal = Math.max(Math.round((bmrR * 1.1) / 50) * 50, Math.round((tdee - def) / 50) * 50);
  // never faster than 1% of body weight a week, never under the app's absolute floor
  const wkFloor = def > 0 ? Math.ceil(Math.max(KCAL_FLOOR[sex], Math.round(tdee - (w * 0.01 * 7700) / 7)) / 50) * 50 : 0;
  const auto = Math.max(goal, wkFloor);
  const kcal = +(P.kcalT ?? 0) || auto;
  const rk = refKg(w, ffm);
  const p = +(P.protT ?? 0) || Math.round(protPL(P, ph.goal) * ffm);
  let f = Math.max(Math.round((kcal * 0.2) / 9), Math.round(0.5 * rk));
  let c = Math.round((kcal - p * 4 - f * 9) / 4);
  if (c < 80) {
    f = Math.max(Math.round(0.5 * ffm), Math.round((kcal - p * 4 - 320) / 9));
    c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
  }
  return {
    kcal: Math.round(kcal / 5) * 5, p, c, f, day: nutriDay(k), bmr, bmrR, tdee, est, measured: useM, ms, auto, manual: !!P.kcalT, phase: ph, def, autoDef: ad,
    ffm: Math.round(ffm), adj, metab: mf, wkFloor, raised: !P.kcalT && wkFloor > goal, bf: Math.round(bfOf(P, w)), goal: ph.goal, rateT: Math.round((-(P.kcalT ? 0 : def) * 7 / 7700) * 100) / 100, w,
  };
}

/** How many of today's meals have enough protein: ~30 g, 3–5 times a day (Norton). */
export function protMeals(S: State, k: string): { thr: number; n: number; tot: number } {
  const ml = mlogDay(S, k);
  return { thr: 30, n: ml.filter((m) => (+m.p || 0) >= 30 * 0.85).length, tot: ml.length };
}

// ---------- the weekly verdict ----------
const nf = (v: number, d = 2): string => v.toFixed(d).replace('.', ',');
function waistDelta(S: State): { d: number; days: number } | null {
  const b = Object.keys(S.waist).sort().map((d) => ({ d, v: S.waist[d] }));
  if (b.length < 2) return null;
  const a = b[b.length - 1];
  const z = b.filter((x) => daysBetween(x.d, a.d) >= 14).pop() ?? b[0];
  return a === z ? null : { d: a.v - z.v, days: daysBetween(z.d, a.d) };
}
export type Verdict = { c: 'ok' | 'warn' | 'bad' | 'info'; t: string };
/** The scale's 7-day average against the 7 before, compared with the goal's rate. Change something only after
 *  2 weekly checks in a row under half the rate (Norton), by 100–200 kcal. */
export function tacStatus(S: State, tg: Targets, today: string): Verdict {
  const ww = wWeeks(S, today);
  const w = tg.w;
  const T = tg.rateT;
  const h = nAdj(S.nut).h ?? [];
  const g = tg.goal;
  if (!ww) return { c: 'info', t: 'Am nevoie de cel puțin 3 cântăriri în fiecare din ultimele două săptămâni (dimineața, după toaletă), ca să compar mediile.' };
  const r = ww.rate;
  const rs = `${r > 0 ? '+' : ''}${nf(r)} kg/săpt.`;
  const pc = `${nf((Math.abs(r) / w) * 100)}%`;
  if (tg.phase.brk) return { c: Math.abs(r) <= w * 0.004 ? 'ok' : 'warn', t: `Pauză de dietă: greutatea ar trebui să stea pe loc (acum ${rs}). După ea revii la deficit.` };
  const low = (x: number): boolean => (T < 0 ? x > T * 0.5 : x < T * 0.5);
  const two = h.length >= 2 && low(h[h.length - 1]) && low(h[h.length - 2]);
  if (g === 'cut') {
    if (r < -w * 0.01) return { c: 'bad', t: `Scazi ${rs} (${pc} din greutate), peste maximul de 1% pe săptămână: riști să pierzi mușchi. Adaugă 100–200 kcal, din carbohidrați.` };
    if (low(r))
      return two
        ? { c: 'bad', t: `Platou: a doua săptămână la rând sub jumătate din ritmul țintă (${nf(T)} kg/săpt.). Întâi verifică notarea (zilele nenotate umflă aportul), apoi o singură schimbare: −100…200 kcal sau +2000 de pași pe zi. Corecția din cântar scade deja ținta o dată pe săptămână.` }
        : { c: 'warn', t: `${rs}: sub jumătate din ritmul țintă (${nf(T)} kg/săpt.). O săptămână nu e platou: nu schimba nimic încă, dar notează tot ce mănânci.` };
    return { c: 'ok', t: `Scazi ${rs} (${pc} pe săptămână), în ritmul bun. Nu schimba nimic.` };
  }
  if (g === 'bulk') {
    if (r > w * 0.003) return { c: 'bad', t: `Crești ${rs}, peste ~1,3% pe lună: în mare parte grăsime. Scade 100–200 kcal, din carbohidrați.` };
    if (low(r))
      return two
        ? { c: 'warn', t: `A doua săptămână sub jumătate din ritmul țintă (+${nf(T)} kg/săpt.): crește caloriile cu 100–200 kcal, din carbohidrați. Corecția din cântar le urcă deja o dată pe săptămână.` }
        : { c: 'info', t: `${rs}: sub ritmul țintă (+${nf(T)} kg/săpt.). Mai așteaptă o săptămână înainte de orice schimbare.` };
    return { c: 'ok', t: `Crești ${rs}, în ritmul țintă. Urmărește talia: dacă urcă mai repede decât forța, încetinește.` };
  }
  const wd = waistDelta(S);
  const c: Verdict['c'] = r > w * 0.002 ? 'warn' : wd ? (wd.d < 0 ? 'ok' : wd.d > 0.5 ? 'warn' : 'info') : 'info';
  return {
    c,
    t:
      `Cântarul: ${rs}. La recompoziție judeci după talie și forță, nu după greutate.` +
      (wd ? ` Talia: ${wd.d > 0 ? '+' : ''}${nf(wd.d, 1)} cm în ${wd.days} zile${wd.d < 0 ? ', deci merge.' : wd.d > 0.5 ? ': urcă, scade 100–200 kcal.' : '.'}` : ' Notează talia o dată pe săptămână (Necesar → Profil).') +
      (r > w * 0.002 ? ' Greutatea urcă prea repede pentru recompoziție: −100…200 kcal.' : ''),
  };
}
export function tacWarn(S: State, tg: Targets): Array<[Verdict['c'], string]> {
  const P = S.nut;
  const bf = tg.bf;
  const g = tg.goal;
  const out: Array<[Verdict['c'], string]> = [];
  const calc = Math.round(tg.bmr * (+P.act || 1.55));
  if (tg.manual) out.push(['info', `Ai calorii setate manual (${tg.kcal} kcal): tactica nu le schimbă. Le pui pe automat din Necesar → Profil.`]);
  if (g === 'bulk' && bf > 20) out.push(['bad', `Ai ~${bf}% grăsime. Un surplus acum adaugă mai ales grăsime: întâi cut sau recompoziție la menținere, apoi bulk-ul controlat (Norton).`]);
  else if (g === 'bulk' && bf > 15) out.push(['warn', `Ai ~${bf}% grăsime: merge un bulk lent (0,5% pe lună), dar și recompoziția la menținere e o opțiune bună.`]);
  if (g === 'recomp' && bf > 25) out.push(['warn', `Ai ~${bf}% grăsime: recompoziția merge, dar un cut te duce mai repede în zona de 10–25%.`]);
  if (tg.raised && tg.def > 0)
    out.push(['info', tg.wkFloor <= KCAL_FLOOR[sexOf(P)] ? `Ținta e ținută la ${tg.wkFloor} kcal, pragul de siguranță al aplicației: deficitul real e mai mic de ~${tg.def} kcal. Restul îl faci din pași (NEAT), nu tăind din mâncare.` : `Ținta e limitată la ${tg.wkFloor} kcal: Norton nu trece de 1% din greutate pe săptămână (peste el, până la jumătate din kilograme sunt masă slabă).`]);
  if (g === 'cut' && tg.ms.ok && tg.ms.tdee! < calc * 0.75) out.push(['bad', `Menții greutatea cu ~${tg.ms.tdee} kcal, sub 75% din necesarul calculat (${calc} kcal). Norton: nu mai slăbi acum; ridică caloriile spre necesar și mișcă-te mai mult, apoi reiei cut-ul.`]);
  return out;
}

/** The rules of the goal, with your numbers: [icon, title, text, sources]. */
export function tacRules(S: State, tg: Targets, today: string): Array<[string, string, string, string]> {
  const P = S.nut;
  const g = tg.goal;
  const W = tg.kcal;
  const T = Math.abs(GOALS[g].rate * tg.w);
  const d = Math.abs(Math.round((GOALS[g].rate * tg.w * 7700) / 7 / 50) * 50);
  const pl = nf(protPL(P, g));
  const age = protAgeF(P) > 1;
  const prot = (x: string): [string, string, string, string] => ['bowl', 'Proteina', `${x}Pe masa slabă (~${tg.ffm} kg): ${pl} g/kg${age ? ' (cu +1,5% pe an după 30 de ani)' : ''}, adică ${tg.p} g pe zi. 3–5 mese cu 30–50 g fiecare, distribuite uniform: o masă săracă nu se compensează cu una mare.`, 'NY'];
  const meal: [string, string, string, string] = ['timer', 'Mesele și antrenamentul', 'Fereastra anabolică e supraevaluată: dacă ai mâncat proteine cu câteva ore înainte și după, e suficient. Carbohidrați înainte de antrenament dacă te ajută (preferință, nu fiziologie). Nu te antrena flămând; postul intermitent a pierdut mai multă masă slabă (65% din kilograme) în studiul Weiss.', 'NY'];
  const fib: [string, string, string, string] = ['stretch', 'Fibre și volum', `Cel puțin 15 g de fibre la 1000 kcal (~${Math.round((W / 1000) * 15)} g pe zi la media ta), legume și fructe, alimente cu densitate calorică mică; proteinele și fibrele au cel mai mare efect termic (20–30%). Numeri tot: legume, sosuri, băuturi, gustări. Alcoolul are 7 kcal/g.`, 'NY FLF'];
  const sleep: [string, string, string, string] = ['moon', 'Somnul', '7,5–9 ore. Sub 5,5 ore, jumătate din kilogramele pierdute au fost masă slabă (față de aproape doar grăsime la 8 ore): foamea crește, NEAT-ul scade.', 'NY'];
  const supp: [string, string, string, string] = ['bolt', 'Suplimente (Norton)', 'Merită: creatină monohidrat 3–5 g pe zi (și în cut), cafeină 150–250 mg constant, până la 6 mg/kg la sesiunile cheie, proteină pudră doar ca mâncare comodă, vitamina D dacă ai deficit. Nu merită: glutamină, carnitină, BCAA/EAA când proteina zilei e atinsă, boostere și arzătoare.', 'NY'];
  if (g === 'cut')
    return [
      ['steps', 'Ritmul', `0,4–0,8% din greutate pe săptămână, niciodată peste 1% (atunci până la jumătate din kilograme pot fi masă slabă). Aplicația: 0,5%, ~${nf(T)} kg, adică un deficit de ~${d} kcal pe zi.`, 'NY FLF'],
      prot('În deficit proteina crește cu 10–20% (aici +10%, ca să rămână carbohidrați pentru antrenament). '),
      ['bolt', 'Grăsimi și carbohidrați', 'La calorii și proteine egale, împărțirea dintre ele nu schimbă pierderea de grăsime (DIETFITS, 12 luni). Grăsimile puține (~20%, niciodată sub ~15% din calorii: hormonii), restul carbohidrați.', 'NY'],
      ['walk', 'NEAT și pași', 'NEAT-ul e partea care scade cel mai mult în dietă (până la −500 kcal pe zi). Ține pașii în dietă; dacă scad, plimbări intenționate. Cardio-ul nu e obligatoriu; pe nemâncate nu arde mai multă grăsime.', 'NY'],
      ['flag', 'Platoul', 'Cântar zilnic dimineața, medii săptămânale. Întâi verifici notarea (oamenii își subestimează aportul cu până la 50%), apoi o singură schimbare: −100…200 kcal sau mai mulți pași. Nu schimbi nimic după o singură săptămână.', 'NY FLF'],
      ['stretch', 'Pauze de dietă', `MATADOR: mai multă grăsime pierdută și metabolism mai bine păstrat. Frecvența după cât de slab ești (slab 1:1, normal 2:1, multă grăsime 1–2 săptămâni la 1–2 luni). Tu: ${dietBreakPlan(S, today).l}. În pauză: menținere, aceeași proteină, carbohidrați mai mulți. ${P.dietBreak !== false ? 'Sunt pornite.' : 'Acum sunt oprite; le pornești din Necesar.'} Opțional, refeed: 2 zile la rând la menținere (din carbohidrați).`, 'NY FLF CPG'],
      meal, fib, sleep, supp,
      ['fight', 'Antrenamentul', 'Același program ca până acum: aproape de eșec, progresie; forța e cel mai mare factor care păstrează mușchiul în deficit.', 'MW'],
      ['trophy', 'După cut', 'La final urci la menținerea REALĂ (din ritmul tău de slăbit, nu din formulă); apoi, dacă vrei mai multe calorii, reverse diet: +2–5% carbohidrați și grăsimi pe săptămână, proteina la fel. Păstrezi antrenamentul și cântarul zilnic.', 'NY FLF'],
    ];
  if (g === 'recomp')
    return [
      ['today', 'Când are sens', 'Începător, revenire după pauză sau grăsime moderată: poți pierde grăsime și câștiga masă în același timp. La avansați merge mai lent.', 'NY'],
      ['steps', 'Caloriile', `Menținere sau un deficit mic: ~0,25% pe săptămână (~${nf(T)} kg, ~${d} kcal pe zi), în medie ${W} kcal/zi.`, 'NY'],
      prot(''), meal, fib, sleep, supp,
      ['fight', 'Antrenamentul face treaba', 'Nutriția doar permite creșterea; stimulul e antrenamentul: volum, aproape de eșec, progresie.', 'MW'],
      ['progress', 'Cum judeci', 'Nu după cântar: talia o dată pe săptămână, poze la 2 săptămâni (Progres), aceeași metodă și aceleași condiții; contează tendința, nu o săptămână.', 'NY FLF'],
      ['flag', 'Când schimbi direcția', 'Dacă după 4 săptămâni talia nu scade și forța stă, treci pe cut sau pe un bulk lent.', 'FLF'],
    ];
  return [
    ['today', 'Când are sens', 'Ești sub greutatea pe care o vrei, la o grăsime rezonabilă. Bulk controlat: diferența față de yo-yo e urcarea controlată.', 'NY'],
    ['steps', 'Ritmul', `Creșteri mici: ~0,75% din greutate pe lună (~${nf(T * 4.33, 1)} kg pe lună, ~${d} kcal peste menținere). Dacă vii din cut: întâi menținerea reală, apoi +10–20% calorii.`, 'NY FLF'],
    prot(''), meal, fib, sleep,
    ['bolt', 'Carbohidrați și grăsimi', 'Carbohidrații ajută creșterea musculară (ketogenic cu aceeași proteină = mai puțină masă slabă câștigată); grăsimile puține, restul carbohidrați.', 'NY'],
    ['fight', 'Antrenamentul', 'Bulk lung și lent: progresie la fiecare exercițiu, aproape de eșec.', 'MW'],
    ['flag', 'Prea repede', 'Peste ~1,3% pe lună sau talia urcă mai repede decât forța: −100…200 kcal.', 'NY FLF'],
    supp,
  ];
}

// ---------- around training ----------
export interface Fuel {
  title: string;
  rest: boolean;
  min: number;
  long: boolean;
  pm: number;
  today: boolean;
}
/** Today's session if there is training today, otherwise the next training day. */
export function fuelPlan(S: State, today: string): Fuel {
  const pm = clamp(Math.round(targets(S, today).p / 4), 30, 55);
  for (let i = 0; i < 7; i++) {
    const k = addDays(today, i);
    const d = nutriDay(k);
    if (d.type !== 'rest' || i === 0) {
      if (d.type === 'rest' && i === 0) return { title: d.t, rest: true, min: 0, long: false, pm, today: true };
      return { title: d.t, rest: false, min: d.minutes, long: d.minutes >= 90, pm, today: i === 0 };
    }
  }
  return { title: '', rest: true, min: 0, long: false, pm, today: true };
}
