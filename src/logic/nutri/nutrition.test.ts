import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mealFeedback, mealPrep } from './meals.ts';
import { belowFloor, periodize, weekCarbMean, type DayType, type PeriodizeInput } from './plan.ts';
import { tierOf } from './supplements.ts';

const base: PeriodizeInput = { base: { kcal: 2500, p: 180, c: 260, f: 70 }, dayType: 'moderate', sex: 'm', weightKg: 85, tdee: 2800, cut: true };

/* săptămâna planului: Lu moderată, Ma–Mi intense, Jo moderată, Vi–Sâ intense, Du odihnă */
const WEEK: DayType[] = ['moderate', 'high', 'high', 'moderate', 'high', 'high', 'rest'];
const mean = weekCarbMean(WEEK);
/* fără deficit și cu destule grăsimi, ca pragurile să nu intervină */
const nb: PeriodizeInput = { ...base, cut: false, base: { kcal: 2700, p: 180, c: 260, f: 90 }, weekMean: mean };

test('periodizare: carbohidrații urmează ziua, proteina rămâne', () => {
  const hi = periodize({ ...nb, dayType: 'high' }), mo = periodize(nb), re = periodize({ ...nb, dayType: 'rest' });
  assert.equal(hi.c, 305); assert.equal(mo.c, 223); assert.equal(re.c, 153);
  assert.equal(hi.p, mo.p); assert.equal(re.p, mo.p);
  assert.ok(hi.kcal > mo.kcal && mo.kcal > re.kcal);
});

test('periodizare: totalul săptămânii rămâne baza, deload-ul scade carbohidrații cu ~15–20%', () => {
  const week = WEEK.reduce((a, d) => a + periodize({ ...nb, dayType: d }).c, 0);
  assert.ok(Math.abs(week - 7 * 260) <= 3, String(week));
  const dl = periodize({ ...nb, dayType: 'deload' });
  assert.equal(dl.c, 221); assert.equal(dl.factor, 0.85);
  const dlWeek = WEEK.reduce((a, d) => a + periodize({ ...nb, dayType: d === 'rest' ? 'rest' : 'deload' }).c, 0);
  assert.ok(dlWeek / week < 0.85 && dlWeek / week > 0.78, String(dlWeek / week));
});

test('check-in: energie scăzută micșorează deficitul, RPE mare adaugă carbohidrați', () => {
  assert.equal(periodize({ ...base, energy: 2 }).c, 287);
  assert.ok(periodize({ ...base, energy: 2, dayType: 'rest' }).c < periodize({ ...base, energy: 2 }).c);
  assert.equal(periodize({ ...base, lastRpe: 9 }).c, 272);
});

test('disponibilitate energetică: în deficit rămân cel puțin 20 (bărbați) / 30 (femei) kcal pe kg de masă slabă', () => {
  const lean = { ...base, base: { kcal: 2300, p: 170, c: 280, f: 56 }, weightKg: 80, tdee: 2760, ffmKg: 68, weekMean: mean };
  const hard = periodize({ ...lean, dayType: 'high', exerciseKcal: 1300 });
  assert.ok(hard.kcal >= 20 * 68 + 1300 - 5, String(hard.kcal)); assert.equal(hard.floorApplied, true);
  assert.ok(hard.notes.some((n) => /masă slabă/.test(n)));
  const wk = periodize({ ...lean, dayType: 'high', exerciseKcal: 1300, weekly: true });
  assert.equal(wk.floorApplied, false, 'pe media săptămânii pragul se aplică bazei, nu zilei');
  const off = periodize({ ...lean, cut: false, dayType: 'high', exerciseKcal: 1300 });
  assert.equal(off.floorApplied, false);
  const f = periodize({ ...lean, sex: 'f', weightKg: 60, ffmKg: 46, base: { kcal: 1700, p: 130, c: 160, f: 45 }, tdee: 2100, dayType: 'moderate', exerciseKcal: 400 });
  assert.ok(f.kcal >= 30 * 46 + 400 - 5, String(f.kcal));
});

test('praguri sigure: 2000 kcal bărbați, 1600 femei, deficit cel mult 25%', () => {
  const low = periodize({ ...base, base: { kcal: 1500, p: 120, c: 120, f: 50 }, weightKg: 60, tdee: 2200 });
  assert.ok(low.kcal >= 2000); assert.equal(low.floorApplied, true);
  const f = periodize({ ...base, sex: 'f', base: { kcal: 1300, p: 100, c: 110, f: 40 }, weightKg: 55, tdee: 1900 });
  assert.ok(f.kcal >= 1600);
  const deep = periodize({ ...base, base: { kcal: 2100, p: 180, c: 150, f: 70 }, tdee: 3400 });
  assert.ok(deep.kcal >= 2550 - 5, String(deep.kcal));
  assert.equal(belowFloor(1500, 'f'), true); assert.equal(belowFloor(1700, 'f'), false);
});

test('suplimente: niveluri și blocări', () => {
  assert.equal(tierOf('Creatină monohidrat'), 1);
  assert.equal(tierOf('omega3'), 2);
  assert.equal(tierOf('fat burner extrem'), 3);
  assert.equal(tierOf('test booster'), 3);
  assert.equal(tierOf('ceai verde'), null);
});

test('feedback pe masă și meal prep', () => {
  const ctx = { dayType: 'high' as const, timing: 'post' as const, remaining: { kcal: 1200, p: 90 }, eatenKcal: 1500, sex: 'm' as const, hour: 13 };
  const fb = mealFeedback({ k: 400, p: 12, c: 20, g: 10 }, ctx);
  assert.ok(fb.some((x) => /proteină/.test(x)) && fb.some((x) => /glicogenul/.test(x)));
  assert.ok(mealFeedback({ k: 300, p: 20, c: 30, g: 10 }, { ...ctx, timing: 'other', hour: 21, eatenKcal: 1200 }).some((x) => /pragul sigur/.test(x)));
  const wk = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'].map((label, i) => ({ label, dayType: (i === 6 ? 'rest' : i % 2 ? 'high' : 'moderate') as 'rest' | 'high' | 'moderate' }));
  const mp = mealPrep(wk);
  assert.equal(mp.batches.length, 2); assert.equal(mp.days.length, 7);
  assert.match(mp.batches[0]!.what, /4 porții/);
});
