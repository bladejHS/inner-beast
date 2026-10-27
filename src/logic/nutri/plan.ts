/* Nutriția periodizată: ținta zilei urmează tipul zilei de antrenament (intensă, moderată, odihnă, deload),
   cu ajustări după check-in și praguri sigure care nu se pot coborî.
   v16: carbohidrații se mută între zile fără să schimbe totalul săptămânii („fuel for the work required”),
   deload-ul scade carbohidrații cât scade consumul de la antrenament, iar în deficit disponibilitatea energetică
   (aportul minus antrenamentul, pe kg de masă slabă) nu coboară sub pragul de risc RED-S. */
import { KCAL_FLOOR, type Sex } from './floor.ts';

export type DayType = 'high' | 'moderate' | 'rest' | 'deload';
export const DAY_LABEL: Record<DayType, string> = { high: 'Zi intensă', moderate: 'Zi moderată', rest: 'Zi de odihnă', deload: 'Zi de deload' };

export interface Macros { kcal: number; p: number; c: number; f: number }

export interface NutritionPlan extends Macros {
  dayType: DayType;
  base: Macros;
  /** Ce s-a schimbat față de baza zilei și de ce. */
  notes: string[];
  /** Ținta a fost ridicată la pragul sigur. */
  floorApplied: boolean;
  /** Factorul de carbohidrați aplicat azi față de baza zilei. */
  factor: number;
}

export interface PeriodizeInput {
  base: Macros;
  dayType: DayType;
  sex: Sex;
  weightKg: number;
  /** Minimul de grăsimi, g (implicit 0,6 g/kg corp); aplicația îl dă pe masa slabă, pentru o dietă cu puține grăsimi. */
  fatMinG?: number;
  /** Necesarul (estimat sau măsurat), pentru limita de deficit. */
  tdee: number;
  /** În faza de deficit. */
  cut: boolean;
  /** Energia din check-in, 1–5 (dacă există azi). */
  energy?: number;
  /** Readiness 0–100 (dacă există). */
  readiness?: number;
  /** RPE-ul ultimei sesiuni, 1–10. */
  lastRpe?: number;
  /** Media factorilor de carbohidrați pe o săptămână normală a planului (weekCarbMean); fără ea, factorii se aplică direct. */
  weekMean?: number;
  /** Masa slabă, kg (pentru disponibilitatea energetică). */
  ffmKg?: number;
  /** Energia cheltuită azi la antrenament, kcal. */
  exerciseKcal?: number;
  /** v17: baza e deja limitată pe media săptămânii (deficit maxim, disponibilitate energetică); pe zi rămâne doar pragul absolut. */
  weekly?: boolean;
}

/** Cât se schimbă carbohidrații pe tip de zi (proteina rămâne constantă). Zilele normale se împart la media săptămânii;
 *  deload-ul nu: săptămâna de deload are cu ~15–20% mai puțini carbohidrați, cât scade consumul de la antrenament. */
export const CARB_FACTOR: Record<DayType, number> = { high: 1.3, moderate: 0.95, rest: 0.65, deload: 0.85 };
/** Disponibilitatea energetică minimă în deficit, kcal pe kg de masă slabă (sub ea crește riscul RED-S). La bărbați efectele apar abia pe la ~15, așa că pragul e 20 (v17; 25 nu lăsa deficit deloc cu un metabolism lent). */
export const EA_MIN: Record<Sex, number> = { f: 30, m: 20 };

/** Media factorilor pe săptămâna normală a planului (zilele de deload nu intră). */
export function weekCarbMean(types: readonly DayType[]): number {
  const t = types.filter((x) => x !== 'deload');
  return t.length ? t.reduce((a, x) => a + CARB_FACTOR[x], 0) / t.length : 1;
}
/** Deficitul nu trece de 25% din necesar. */
export const MAX_DEFICIT = 0.25;
const PROTEIN_MIN_G_PER_KG = 1.6;
const FAT_MIN_G_PER_KG = 0.6;

const r5 = (n: number): number => Math.round(n / 5) * 5;

export function periodize(i: PeriodizeInput): NutritionPlan {
  const notes: string[] = [];
  const kg = Math.max(35, i.weightKg);
  let p = Math.max(i.base.p, Math.round(PROTEIN_MIN_G_PER_KG * kg));
  let f = Math.max(i.base.f, i.fatMinG ?? Math.round(FAT_MIN_G_PER_KG * kg));
  const factor = i.dayType === 'deload' ? CARB_FACTOR.deload : CARB_FACTOR[i.dayType] / (i.weekMean || 1);
  let c = Math.round(i.base.c * factor);
  const pct = Math.round(Math.abs(factor - 1) * 100), vs = i.weekMean ? ' față de media săptămânii' : '';
  if (i.dayType === 'high') notes.push(`Zi intensă: +${pct}% carbohidrați${vs}, pentru efort și refacerea glicogenului.`);
  if (i.dayType === 'moderate' && pct >= 3) notes.push(`Zi moderată: ${factor < 1 ? '−' : '+'}${pct}% carbohidrați${vs}; îi muți în zilele intense.`);
  if (i.dayType === 'rest') notes.push(`Zi de odihnă: −${pct}% carbohidrați${vs}; proteina rămâne la fel.`);
  if (i.dayType === 'deload') notes.push(`Săptămână de deload: −${pct}% carbohidrați, cât scade consumul de la antrenament; proteina neschimbată.`);

  const training = i.dayType !== 'rest';
  const tired = (i.energy != null && i.energy <= 2) || (i.readiness != null && i.readiness < 45);
  if (training && tired && i.cut) { c += 40; notes.push('Energie scăzută azi: deficitul scade cu ~150 kcal, din carbohidrați.'); }
  if ((i.lastRpe ?? 0) >= 8) { c = Math.round(c * 1.1); notes.push('Sesiunea trecută a fost foarte grea: +10% carbohidrați pentru recuperare.'); }

  let kcal = p * 4 + c * 4 + f * 9;
  let floorApplied = false;
  const minByDeficit = i.weekly ? 0 : Math.round(i.tdee * (1 - MAX_DEFICIT));
  const minByEa = !i.weekly && i.cut && i.ffmKg && i.ffmKg > 0 ? Math.round(EA_MIN[i.sex] * i.ffmKg + Math.max(0, i.exerciseKcal ?? 0)) : 0;
  const floor = Math.max(KCAL_FLOOR[i.sex], i.cut ? minByDeficit : 0, minByEa);
  if (kcal < floor) {
    c += Math.ceil((floor - kcal) / 4);
    kcal = p * 4 + c * 4 + f * 9;
    floorApplied = true;
    notes.push(floor === minByEa && minByEa > KCAL_FLOOR[i.sex] && minByEa >= minByDeficit
      ? `Ținta a fost ridicată ca să-ți rămână cel puțin ${EA_MIN[i.sex]} kcal pe kg de masă slabă după antrenamentul de azi (${minByEa} kcal): sub atât scad recuperarea, hormonii și oasele.`
      : kcal <= KCAL_FLOOR[i.sex] + 4
        ? `Ținta a fost ridicată la pragul sigur de ${KCAL_FLOOR[i.sex]} kcal pe zi.`
        : `Deficitul a fost limitat la ${Math.round(MAX_DEFICIT * 100)}% din necesar (${i.tdee} kcal).`);
  }
  return { kcal: r5(kcal), p, c: Math.max(0, c), f, dayType: i.dayType, base: i.base, notes, floorApplied, factor: Math.round(factor * 100) / 100 };
}

/** Un aport propus (de utilizator sau de altcineva) e sub pragul sigur? */
export const belowFloor = (kcal: number, sex: Sex): boolean => kcal > 0 && kcal < KCAL_FLOOR[sex];
