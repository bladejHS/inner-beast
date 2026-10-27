/* Hidratarea personalizată: necesarul de bază după greutate, plus pierderile estimate din antrenamentul zilei. */

export type Intensity = 'low' | 'moderate' | 'high';

export interface HydrationInput {
  weightKg: number;
  /** Minutele de antrenament de azi (0 = zi fără antrenament). */
  minutes: number;
  intensity: Intensity;
  /** Zi caldă sau sală fără aer condiționat. */
  hot?: boolean;
}

export interface HydrationPlan {
  /** Ținta zilei, ml. */
  totalMl: number;
  baseMl: number;
  /** Pierderea estimată prin transpirație, ml. */
  lossMl: number;
  /** Înainte de antrenament (cu 2–4 ore), ml. */
  preMl: [number, number];
  /** În timpul efortului, ml pe oră (doar peste 45 de minute). */
  duringMlPerHour: [number, number] | null;
  /** După antrenament, ml (150% din pierdere). */
  postMl: number;
  /** Sodiul pierdut estimat prin transpirație (~900 mg pe litru), mg. */
  sodiumMg: number;
  /** Sodiu în timpul efortului, mg pe oră (peste 60 de minute sau la căldură). */
  sodiumPerHour: [number, number] | null;
}

/** Transpirația medie la efort, litri pe oră (variază mult de la om la om). */
export const SWEAT_L_PER_H: Record<Intensity, number> = { low: 0.5, moderate: 0.8, high: 1.1 };
/** Sodiul din transpirație, mg pe litru (media sportivilor; variază de la ~200 la peste 2000). */
export const SWEAT_NA_MG_PER_L = 900;
const BASE_ML_PER_KG = 35;
const r50 = (n: number): number => Math.round(n / 50) * 50;

export function hydration(i: HydrationInput): HydrationPlan {
  const kg = Math.max(35, i.weightKg);
  const baseMl = r50(kg * BASE_ML_PER_KG);
  const lossMl = r50(SWEAT_L_PER_H[i.intensity] * (i.hot ? 1.3 : 1) * (Math.max(0, i.minutes) / 60) * 1000);
  return {
    totalMl: r50(baseMl + lossMl * 1.25),
    baseMl,
    lossMl,
    preMl: [r50(kg * 5), r50(kg * 7)],
    duringMlPerHour: i.minutes > 45 ? [400, 800] : null,
    postMl: r50(lossMl * 1.5),
    sodiumMg: r50((lossMl / 1000) * SWEAT_NA_MG_PER_L),
    sodiumPerHour: i.minutes > 60 || i.hot ? [300, 600] : null,
  };
}

/** Alerta de dinainte de antrenament: dacă azi s-a băut sub minimul de dinainte de efort. */
export function preWorkoutAlert(drankMl: number, plan: HydrationPlan): string | null {
  const need = plan.preMl[0] - drankMl;
  if (need <= 0) return null;
  return `Înainte de antrenament: bea încă ~${r50(need)} ml în următoarele 2 ore (azi ai ${r50(drankMl)} ml).`;
}
