// Nutrition data, moved over from zece-app (FALCO): the goals and their settings.
// Nutrition follows Layne Norton (Biolayne / Dr. Layne Norton on YouTube, Fat Loss Forever, The Complete Contest Prep Guide).

import type { DayType } from '../logic/nutri/plan.ts';

export type Goal = 'cut' | 'recomp' | 'bulk';

/** Weekly rate (fraction of body weight) and protein in g per kg of lean mass. */
export const GOALS: Record<Goal, { l: string; rate: number; pl: number }> = {
  cut: { l: 'Cut', rate: -0.005, pl: 2.64 },
  recomp: { l: 'Recompoziție', rate: -0.0025, pl: 2.52 },
  bulk: { l: 'Lean bulk', rate: 0.00175, pl: 2.4 },
};

/** Declared metabolism (some people burn less than the formulas say). */
export const METAB: Array<[number, string]> = [
  [1, 'Normal'],
  [0.9, 'Lent (−10%)'],
  [0.82, 'Foarte lent (−18%)'],
];

export const ACTIVITY: Array<[number, string]> = [
  [1.375, 'Ușoară'],
  [1.55, 'Moderată'],
  [1.725, 'Mare'],
  [1.9, 'Foarte mare'],
];

/** Inner Beast's week as nutrition sees it (Mon … Sun): what kind of day each plan day is. */
export const PLAN_DAY_TYPE: DayType[] = ['high', 'moderate', 'rest', 'high', 'moderate', 'rest', 'moderate'];

export const DISCLAIMER = [
  'Țintele de calorii, macronutrienți, apă și suplimente de aici sunt estimări pentru oameni sănătoși care se antrenează. Nu sunt sfat medical și nu înlocuiesc un medic sau un nutriționist.',
  'Discută cu un medic înainte să schimbi alimentația dacă ai diabet, boli de inimă, rinichi sau tiroidă, tensiune mare, o tulburare de alimentație (acum sau în trecut), dacă ești însărcinată sau alăptezi, sau dacă iei medicamente.',
  'Aplicația nu propune niciodată un aport sub 1600 kcal pe zi pentru femei sau 2000 kcal pe zi pentru bărbați, un ritm de slăbit peste 1% din greutate pe săptămână sau suplimente fără dovezi de siguranță.',
  'Oprește-te și cere ajutor medical dacă ai amețeli, leșin, palpitații sau slăbiciune neobișnuită.',
];

export const TAC_SRC: Record<string, string> = { FLF: 'Norton · Fat Loss Forever', CPG: 'Norton · Contest Prep Guide', NY: 'Norton · YouTube', MW: 'Dr. Milo Wolf' };
