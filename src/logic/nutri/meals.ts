/* Mesele: feedback după antrenamentul zilei și meal prep sincronizat cu calendarul săptămânii. */
import { KCAL_FLOOR, type Sex } from './floor.ts';
import { DAY_LABEL, type DayType } from './plan.ts';

export interface Meal { k: number; p: number; c: number; g: number }

export interface MealContext {
  dayType: DayType;
  /** Momentul față de antrenamentul de azi. */
  timing: 'pre' | 'post' | 'other';
  /** Ce mai rămâne din ținta zilei înainte de masa asta. */
  remaining: { kcal: number; p: number };
  /** Totalul de azi înainte de masa asta. */
  eatenKcal: number;
  sex: Sex;
  /** Ora din zi (0–23). */
  hour: number;
}

/** Observații scurte, concrete, despre o masă, în contextul antrenamentului de azi. */
export function mealFeedback(m: Meal, x: MealContext): string[] {
  const out: string[] = [];
  if (x.timing === 'post' && m.p < 25) out.push(`După antrenament: masa are ${Math.round(m.p)} g proteină; ideal 25–40 g. Adaugă iaurt grecesc, ouă sau o porție de proteină.`);
  if (x.timing === 'post' && x.dayType === 'high' && m.c < 40) out.push('După o sesiune intensă: adaugă carbohidrați (orez, cartofi, pâine) ca să refaci glicogenul.');
  if (x.timing === 'pre' && x.dayType !== 'rest' && m.g > 30) out.push('Înainte de efort: multe grăsimi se digeră greu. Mută-le după antrenament.');
  if (x.timing === 'pre' && x.dayType === 'high' && m.c < 30) out.push('Înainte de o sesiune intensă: mai mulți carbohidrați (o banană, ovăz, pâine) te țin în ritm până la ultima rundă.');
  if (x.dayType === 'rest' && m.c > 120) out.push('Zi de odihnă: porția de carbohidrați poate fi mai mică; păstrează proteina.');
  const left = x.remaining.kcal - m.k;
  if (left < -150) out.push(`Cu masa asta treci de ținta zilei cu ~${Math.round(-left)} kcal. Contează media săptămânii, nu o zi.`);
  const after = x.eatenKcal + m.k;
  if (x.hour >= 20 && after < KCAL_FLOOR[x.sex]) out.push(`Azi ai doar ~${Math.round(after)} kcal: nu coborî sub pragul sigur de ${KCAL_FLOOR[x.sex]} kcal. Mai adaugă o masă.`);
  if (!out.length && x.remaining.p - m.p > 0) out.push(`Bună alegere. Mai ai ~${Math.round(x.remaining.p - m.p)} g proteină de atins azi.`);
  return out;
}

export interface PrepDay { label: string; dayType: DayType; carbs: string; note: string }
export interface MealPrep { batches: { day: string; covers: string; what: string }[]; days: PrepDay[] }

const CARBS: Record<DayType, string> = {
  high: '2 porții de carbohidrați la prânz, 1 seara',
  moderate: '1 porție la prânz, 1 seara',
  rest: '1 porție la prânz; seara legume în loc de carbohidrați',
  deload: '1 porție la prânz, 1 mică seara',
};
const NOTE: Record<DayType, string> = {
  high: 'masa de dinainte cu 2–3 ore, gustare cu carbohidrați după, 30–40 g proteină înainte de somn',
  moderate: 'mese normale, proteina în 3–5 mese, 30–40 g înainte de somn',
  rest: 'proteina la fel, mai multe legume și fructe',
  deload: 'volum mai mic: carbohidrați cu ~15% mai puțini, proteina la fel',
};

/** Meal prep pe săptămână: două sesiuni de gătit (duminică și miercuri), porțiile după tipul fiecărei zile. */
export function mealPrep(week: readonly { label: string; dayType: DayType }[]): MealPrep {
  const high = (from: number, to: number): number => week.slice(from, to).filter((d) => d.dayType === 'high').length;
  return {
    batches: [
      { day: 'Duminică', covers: week.slice(0, 3).map((d) => d.label).join(', '), what: `proteina pentru 3 zile, ${3 + high(0, 3)} porții de carbohidrați, legume tăiate` },
      { day: 'Miercuri seara', covers: week.slice(3, 7).map((d) => d.label).join(', '), what: `proteina pentru 4 zile, ${4 + high(3, 7)} porții de carbohidrați, gustări pentru zilele intense` },
    ],
    days: week.map((d) => ({ label: d.label, dayType: d.dayType, carbs: CARBS[d.dayType], note: `${DAY_LABEL[d.dayType]}: ${NOTE[d.dayType]}` })),
  };
}
