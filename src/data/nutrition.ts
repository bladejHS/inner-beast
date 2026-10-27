// Nutrition data, moved over from zece-app (FALCO): the food table, the two meal plans, the goals and their rules.
// Nutrition follows Layne Norton (Biolayne / Dr. Layne Norton on YouTube, Fat Loss Forever, The Complete Contest Prep Guide).

import type { DayType } from '../logic/nutri/plan.ts';

export type Goal = 'cut' | 'recomp' | 'bulk';

/** Weekly rate (fraction of body weight) and protein in g per kg of lean mass. */
export const GOALS: Record<Goal, { l: string; rate: number; pl: number }> = {
  cut: { l: 'Cut', rate: -0.005, pl: 2.64 },
  recomp: { l: 'Recompoziție', rate: -0.0025, pl: 2.52 },
  bulk: { l: 'Lean bulk', rate: 0.00175, pl: 2.4 },
};

/** BMR equations: [key, name, based on]. */
export const EQS: Array<[Eq, string, string]> = [
  ['mifflin', 'Mifflin-St Jeor', 'greutate'],
  ['harris', 'Harris-Benedict', 'greutate'],
  ['cunningham', 'Cunningham', 'masă slabă'],
  ['katch', 'Katch-McArdle', 'masă slabă'],
];
export type Eq = 'mifflin' | 'harris' | 'cunningham' | 'katch';

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

// ---------- food table: averages per 100 g (USDA FoodData Central and common labels), raw unless it says otherwise ----------
/** [name, kcal, protein, carbs, fat, category, portion (g), portion in words] */
export type FoodRow = [string, number, number, number, number, string, number, string];
export const FOODS: FoodRow[] = [
  ['Piept de pui crud', 120, 22.5, 0, 2.6, 'p', 150, 'o bucată'], ['Piept de pui gătit', 165, 31, 0, 3.6, 'p', 120, 'o porție'], ['Pulpă de pui fără piele, gătită', 209, 26, 0, 10.9, 'p', 120, 'o porție'],
  ['Piept de curcan gătit', 147, 30, 0, 2.1, 'p', 120, 'o porție'], ['Piept de curcan feliat (șuncă)', 104, 17, 3.5, 2.5, 'p', 50, '3–4 felii'], ['Vită slabă 5% crudă', 137, 21.4, 0, 5, 'p', 150, 'o porție'],
  ['Vită slabă 5% gătită', 164, 26, 0, 6.4, 'p', 120, 'o porție'], ['Carne tocată de vită 15%, crudă', 215, 18.6, 0, 15, 'p', 150, 'o porție'], ['Mușchi de porc crud', 120, 21, 0, 3.5, 'p', 150, 'o porție'],
  ['Somon crud', 208, 20.4, 0, 13.4, 'p', 150, 'un file'], ['Ton în apă, scurs', 116, 25.5, 0, 0.8, 'p', 120, 'o conservă scursă'], ['File de cod crud', 82, 17.8, 0, 0.7, 'p', 150, 'un file'],
  ['Creveți cruzi', 85, 20.1, 0, 0.5, 'p', 150, 'o porție'], ['Ou întreg', 143, 12.6, 0.7, 9.5, 'p', 50, 'un ou'], ['Albuș de ou', 52, 10.9, 0.7, 0.2, 'p', 33, 'un albuș'],
  ['Tofu ferm', 144, 17.3, 2.8, 8.7, 'p', 100, 'o porție'], ['Pudră proteică (whey)', 390, 78, 7, 5.5, 'p', 30, 'o măsură'],
  ['Iaurt grecesc 2%', 73, 10, 3.9, 1.9, 'l', 150, 'un pahar'], ['Iaurt grecesc 5%', 95, 9, 3.5, 5, 'l', 150, 'un pahar'], ['Skyr', 63, 11, 4, 0.2, 'l', 150, 'un pahar'],
  ['Brânză cottage 2%', 81, 10.5, 4.8, 2.3, 'l', 150, 'o porție'], ['Lapte 1,5%', 47, 3.4, 4.9, 1.5, 'l', 250, 'o cană'], ['Lapte 3,5%', 64, 3.3, 4.7, 3.5, 'l', 250, 'o cană'],
  ['Kefir 2%', 50, 3.3, 4.2, 2, 'l', 250, 'o cană'], ['Telemea / feta', 264, 14.2, 4.1, 21.3, 'l', 50, 'o felie'], ['Cașcaval', 356, 25, 2, 28, 'l', 30, 'o felie groasă'], ['Mozzarella', 254, 22, 2.2, 17, 'l', 125, 'o bilă'],
  ['Orez alb crud', 365, 7.1, 80, 0.7, 'c', 75, 'o porție crudă'], ['Orez alb fiert', 130, 2.7, 28.2, 0.3, 'c', 200, 'o porție'], ['Orez brun fiert', 123, 2.7, 25.6, 1, 'c', 200, 'o porție'],
  ['Paste crude', 371, 13, 74.7, 1.5, 'c', 85, 'o porție crudă'], ['Paste fierte', 158, 5.8, 30.9, 0.9, 'c', 200, 'o porție'], ['Fulgi de ovăz', 379, 13.2, 67.7, 6.5, 'c', 50, 'o porție'],
  ['Cartofi cruzi', 77, 2, 17.5, 0.1, 'c', 250, 'o porție'], ['Cartofi fierți', 87, 1.9, 20.1, 0.1, 'c', 250, 'o porție'], ['Cartof dulce copt', 90, 2, 20.7, 0.2, 'c', 200, 'un cartof'],
  ['Pâine albă', 266, 8.9, 49, 3.3, 'c', 30, 'o felie'], ['Pâine integrală', 252, 12.4, 42.7, 3.5, 'c', 35, 'o felie'], ['Lipie de grâu (tortilla)', 306, 8, 51, 7.5, 'c', 60, 'o lipie'],
  ['Mămăligă', 75, 1.7, 16, 0.4, 'c', 250, 'o porție'], ['Mălai (făină de porumb)', 362, 8.1, 76.9, 3.6, 'c', 60, 'o porție'], ['Quinoa fiartă', 120, 4.4, 21.3, 1.9, 'c', 185, 'o porție'],
  ['Couscous fiert', 112, 3.8, 23.2, 0.2, 'c', 160, 'o porție'], ['Bulgur fiert', 83, 3.1, 18.6, 0.2, 'c', 180, 'o porție'], ['Linte fiartă', 116, 9, 20.1, 0.4, 'c', 200, 'o porție'],
  ['Năut fiert', 164, 8.9, 27.4, 2.6, 'c', 160, 'o porție'], ['Fasole boabe fiartă', 127, 8.7, 22.8, 0.5, 'c', 180, 'o porție'], ['Fulgi de porumb (cereale)', 357, 7.5, 84, 0.4, 'c', 40, 'un bol'],
  ['Rondele de orez', 387, 8.2, 81.5, 2.8, 'c', 9, 'o rondea'], ['Miere', 304, 0.3, 82.4, 0, 'c', 21, 'o lingură'], ['Gem', 278, 0.4, 69, 0.1, 'c', 20, 'o lingură'], ['Zahăr', 387, 0, 100, 0, 'c', 5, 'o linguriță'],
  ['Banană', 89, 1.1, 22.8, 0.3, 'f', 120, 'o banană'], ['Măr', 52, 0.3, 13.8, 0.2, 'f', 180, 'un măr'], ['Portocală', 47, 0.9, 11.8, 0.1, 'f', 150, 'o portocală'], ['Afine', 57, 0.7, 14.5, 0.3, 'f', 100, 'un pumn mare'],
  ['Căpșuni', 32, 0.7, 7.7, 0.3, 'f', 150, 'un bol'], ['Struguri', 69, 0.7, 18.1, 0.2, 'f', 150, 'un ciorchine mic'], ['Kiwi', 61, 1.1, 14.7, 0.5, 'f', 75, 'un kiwi'], ['Pară', 57, 0.4, 15.2, 0.1, 'f', 180, 'o pară'],
  ['Curmale', 282, 2.5, 75, 0.4, 'f', 24, '3 curmale'], ['Stafide', 299, 3.1, 79, 0.5, 'f', 30, 'un pumn'], ['Pepene roșu', 30, 0.6, 7.6, 0.2, 'f', 300, 'o felie'],
  ['Broccoli', 34, 2.8, 6.6, 0.4, 'v', 150, 'o porție'], ['Roșii', 18, 0.9, 3.9, 0.2, 'v', 120, 'o roșie'], ['Castraveți', 15, 0.7, 3.6, 0.1, 'v', 150, 'un castravete'], ['Ardei gras roșu', 26, 1, 6, 0.3, 'v', 150, 'un ardei'],
  ['Morcovi', 41, 0.9, 9.6, 0.2, 'v', 80, 'un morcov'], ['Spanac', 23, 2.9, 3.6, 0.4, 'v', 100, 'o porție'], ['Salată verde', 15, 1.4, 2.9, 0.2, 'v', 80, 'un bol'], ['Varză', 25, 1.3, 5.8, 0.1, 'v', 150, 'o porție'],
  ['Ciuperci', 22, 3.1, 3.3, 0.3, 'v', 100, 'o porție'], ['Dovlecel', 17, 1.2, 3.1, 0.3, 'v', 200, 'un dovlecel'], ['Ceapă', 40, 1.1, 9.3, 0.1, 'v', 100, 'o ceapă'], ['Fasole verde', 31, 1.8, 7, 0.2, 'v', 150, 'o porție'],
  ['Conopidă', 25, 1.9, 5, 0.3, 'v', 150, 'o porție'], ['Mazăre', 81, 5.4, 14.5, 0.4, 'v', 100, 'o porție'],
  ['Ulei de măsline', 884, 0, 0, 100, 'g', 10, 'o lingură'], ['Unt', 717, 0.9, 0.1, 81, 'g', 10, 'o porție'], ['Unt de arahide', 588, 25, 20, 50, 'g', 16, 'o lingură'], ['Migdale', 579, 21.2, 21.6, 49.9, 'g', 30, 'un pumn'],
  ['Nuci', 654, 15.2, 13.7, 65.2, 'g', 30, 'un pumn'], ['Arahide', 567, 25.8, 16.1, 49.2, 'g', 30, 'un pumn'], ['Caju', 553, 18.2, 30.2, 43.9, 'g', 30, 'un pumn'], ['Semințe de dovleac', 559, 30.2, 10.7, 49, 'g', 30, 'un pumn'],
  ['Semințe de floarea-soarelui', 584, 20.8, 20, 51.5, 'g', 30, 'un pumn'], ['Semințe de chia', 486, 16.5, 42.1, 30.7, 'g', 15, 'o lingură'], ['Avocado', 160, 2, 8.5, 14.7, 'g', 100, 'jumătate'],
  ['Ciocolată neagră 70–85%', 598, 7.8, 45.9, 42.6, 'g', 20, '2 pătrățele'], ['Măsline', 115, 0.8, 6.3, 10.7, 'g', 30, '8–10 măsline'],
  ['Hummus', 166, 7.9, 14.3, 9.6, 'a', 60, '2 linguri'], ['Maioneză', 680, 1, 0.6, 75, 'a', 15, 'o lingură'], ['Ketchup', 101, 1, 27, 0.1, 'a', 15, 'o lingură'], ['Pizza (margherita)', 266, 11.4, 33.3, 9.7, 'a', 300, 'o pizza mică'],
  ['Suc de portocale', 45, 0.7, 10.4, 0.2, 'a', 250, 'un pahar'], ['Bere 5%', 43, 0.5, 3.6, 0, 'a', 500, 'o halbă'], ['Vin roșu', 85, 0.1, 2.6, 0, 'a', 150, 'un pahar'], ['Cola', 42, 0, 10.6, 0, 'a', 330, 'o doză'],
  ['Băutură izotonică', 26, 0, 6.4, 0, 'a', 500, 'o sticlă'],
  ['Sardine în ulei, scurse', 208, 24.6, 0, 11.5, 'p', 90, 'o conservă scursă'], ['Pastramă de curcan', 110, 20, 2, 2.5, 'p', 50, '3–4 felii'], ['Piept de pui la cuptor, cu piele', 197, 29.8, 0, 7.8, 'p', 150, 'o porție'],
  ['Lapte de soia neîndulcit', 33, 3.3, 0.6, 1.8, 'l', 250, 'o cană'], ['Smântână 12%', 133, 2.7, 4, 12, 'l', 30, 'o lingură mare'], ['Ou fiert', 155, 12.6, 1.1, 10.6, 'p', 50, 'un ou'],
];
export const FCATS: Record<string, string> = { p: 'Carne, pește, ouă', l: 'Lactate', c: 'Carbohidrați', f: 'Fructe', v: 'Legume', g: 'Grăsimi și semințe', a: 'Altele', m: 'Alimentele mele' };

// ---------- the meal plans ----------
/** Meal-plan food: [name, kcal, protein, carbs, fat per 100 g or 100 ml, role, shop category, unit?, grams per unit?]
 *  Role: p protein, c carbs, f fat, v vegetables, x supplements (not scaled). */
export type MealFood = [string, number, number, number, number, 'p' | 'c' | 'f' | 'v' | 'x', string, string?, number?];
export const MFD: Record<string, MealFood> = {
  ovaz: ['fulgi de ovăz', 379, 13.2, 67.7, 6.5, 'c', 'Carbohidrați'],
  fruct: ['mix de fructe congelate', 50, 0.8, 12, 0.3, 'c', 'Fructe'],
  whey: ['whey (pudră proteică)', 390, 78, 7, 5.5, 'p', 'Proteine'],
  arahide: ['unt de arahide', 588, 25, 20, 50, 'f', 'Grăsimi'],
  orez: ['orez (cântărit fiert)', 130, 2.7, 28.2, 0.3, 'c', 'Carbohidrați'],
  pui: ['piept de pui (crud)', 120, 22.5, 0, 2.6, 'p', 'Proteine'],
  ulei: ['ulei de măsline', 884, 0, 0, 100, 'f', 'Grăsimi', 'ml', 0.92],
  legume: ['legume la alegere', 30, 2, 5, 0.3, 'v', 'Legume'],
  crema: ['cremă de orez', 370, 6, 82, 1, 'c', 'Carbohidrați'],
  rondea: ['rondele de orez', 387, 8.2, 81.5, 2.8, 'c', 'Carbohidrați', 'buc', 9],
  miere: ['miere', 304, 0.3, 82, 0, 'c', 'Carbohidrați'],
  creatina: ['creatină', 0, 0, 0, 0, 'x', 'Suplimente'],
  eaa: ['EAA', 400, 95, 0, 0, 'x', 'Suplimente'],
  dextrina: ['dextrină', 380, 0, 95, 0, 'c', 'Suplimente'],
  corn: ['corn flakes', 378, 7, 84, 0.9, 'c', 'Carbohidrați'],
  ananas: ['ananas', 50, 0.5, 13, 0.1, 'c', 'Fructe'],
  albus: ['albuș de ou', 52, 10.9, 0.7, 0.2, 'p', 'Proteine', 'ml', 1.03],
  ou: ['ou întreg', 143, 12.6, 0.7, 9.5, 'p', 'Proteine', 'buc', 55],
  avocado: ['avocado', 160, 2, 8.5, 14.7, 'f', 'Grăsimi'],
  toast: ['pâine toast', 265, 8, 49, 3.5, 'c', 'Carbohidrați', 'felie', 28],
  cartof: ['cartofi (cântăriți fierți)', 87, 1.9, 20.1, 0.1, 'c', 'Carbohidrați'],
  vita: ['vită slabă (crudă)', 137, 21, 0, 5.5, 'p', 'Proteine'],
  mar: ['măr', 52, 0.3, 13.8, 0.2, 'c', 'Fructe'],
  iaurt: ['iaurt 2%', 61, 4.2, 5.3, 2, 'p', 'Proteine'],
  // swaps (Norton, flexible dieting: change the food, keep the macros)
  curcan: ['piept de curcan (crud)', 114, 23.7, 0, 1.5, 'p', 'Proteine'],
  ton: ['ton în apă (scurs)', 116, 26, 0, 1, 'p', 'Proteine'],
  cod: ['cod / pește alb (crud)', 82, 18, 0, 0.7, 'p', 'Proteine'],
  skyr: ['skyr', 63, 11, 4, 0.2, 'p', 'Proteine'],
  vaci: ['brânză de vaci slabă', 90, 13, 3.4, 2, 'p', 'Proteine'],
  paste: ['paste (cântărite fierte)', 158, 5.8, 30.9, 0.9, 'c', 'Carbohidrați'],
  cartdulce: ['cartof dulce (cântărit fiert)', 90, 2, 20.7, 0.2, 'c', 'Carbohidrați'],
  banana: ['banană', 89, 1.1, 22.8, 0.3, 'c', 'Fructe'],
  migdale: ['migdale', 579, 21, 22, 50, 'f', 'Grăsimi'],
  nuci: ['nuci', 654, 15, 14, 65, 'f', 'Grăsimi'],
};
/** Fixed amounts (not scaled with the target). */
export const MFIX: Record<string, number> = { ou: 1, legume: 100, creatina: 5, eaa: 10 };
/** Fibre per 100 g (Norton: at least 15 g per 1000 kcal). */
export const MFIB: Record<string, number> = { ovaz: 10.6, fruct: 3, arahide: 6, orez: 0.4, legume: 2.5, crema: 1, rondea: 3.4, corn: 3, ananas: 1.4, avocado: 6.7, toast: 2.5, cartof: 1.8, mar: 2.4, paste: 1.8, cartdulce: 3, banana: 2.6, migdale: 12.5, nuci: 6.7 };

/** A meal: [name, icon, note, share of the day's protein / carbs / fat, foods: [key, weight within its role] or [key] for fixed ones]. */
export type PlanMeal = [string, string, string, [number, number, number], Array<[string, number?]>];
export const MPLANS: Record<'t' | 'r', { name: string; meals: PlanMeal[] }> = {
  t: {
    name: 'Zi de antrenament',
    meals: [
      ['Masa 1', 'sun', 'dimineața', [1 / 4, 0.2, 0.35], [['ovaz', 0.75], ['fruct', 0.25], ['whey', 1], ['arahide', 1]]],
      ['Masa 2', 'bowl', 'prânzul', [1 / 4, 0.2, 0.35], [['orez', 1], ['pui', 1], ['ulei', 1], ['legume']]],
      ['Masa 3 · pre-workout', 'bolt', 'cu 60–90 de minute înainte de antrenament', [1 / 4, 0.27, 0.1], [['crema', 0.6], ['whey', 1], ['fruct', 0.15], ['rondea', 0.1], ['arahide', 1], ['miere', 0.15]]],
      ['Intra-workout', 'drop', 'băutură în timpul antrenamentului, în apă (nu e masă; fără EAA: Norton — inutile când proteina zilei e atinsă)', [0, 0.08, 0], [['creatina'], ['dextrina', 1]]],
      ['Masa 4 · post-workout', 'star', 'după antrenament, ca cină', [1 / 4, 0.25, 0.2], [['orez', 0.6], ['ananas', 0.4], ['pui', 0.6], ['albus', 0.4], ['ou'], ['ulei', 1], ['legume']]],
    ],
  },
  r: {
    name: 'Zi de odihnă',
    meals: [
      ['Masa 1', 'sun', 'dimineața', [1 / 4, 0.2, 0.35], [['albus', 1], ['ou'], ['avocado', 1], ['toast', 1]]],
      ['Masa 2', 'bowl', 'prânzul', [1 / 4, 0.3, 0.25], [['orez', 1], ['pui', 1], ['ulei', 1], ['legume']]],
      ['Masa 3', 'bowl', 'după-amiaza', [1 / 4, 0.3, 0.1], [['cartof', 1], ['vita', 1], ['legume']]],
      ['Masa 4', 'moon', 'seara', [1 / 4, 0.2, 0.3], [['ovaz', 0.6], ['mar', 0.2], ['fruct', 0.2], ['whey', 0.7], ['iaurt', 0.3], ['arahide', 1]]],
    ],
  },
};

export const SHOP_ORDER = ['Proteine', 'Carbohidrați', 'Fructe', 'Legume', 'Grăsimi', 'Suplimente'];
export const SHOP_RANGE: Array<[number, string]> = [
  [1, 'Azi'],
  [7, 'Săptămâna asta'],
  [14, 'Săptămâna viitoare'],
];

export const TAC_SRC: Record<string, string> = { FLF: 'Norton · Fat Loss Forever', CPG: 'Norton · Contest Prep Guide', NY: 'Norton · YouTube', MW: 'Dr. Milo Wolf' };
