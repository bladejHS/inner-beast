/* The loop after the loop (2026-11-23).

   loop.ts reads what the twelve weeks did. This file decides what the next twelve ask for. Until now the Monday after
   week 12 restarted chapter A with the opening numbers, so a second loop was a photocopy of the first, and the
   ladders had run out anyway (Threshold stopped at 6×8′ with 60 s, the long run at 90 minutes).

   The first draft of this file simply extended every ladder — longer threshold reps, a higher long-run ceiling. The
   research (research_notes/Progresie dupa ciclu/) said that is the wrong move, twice over, so it is not what this
   file does:

   - **Threshold is already too long, not too short.** 6×8′ is 48 minutes of threshold work. Daniels' cap is about
     10% of weekly running volume; at 2,5–3 h of running a week that is 15–18 minutes, so the loop already ends at
     roughly three times the published ceiling. At 134 kg the sensible session is 30–40 minutes of threshold work.
     The next loop therefore does not add reps or minutes: it holds the session and grows the easy volume underneath
     it, so the hard share falls back towards where it belongs, and it moves the pace only after a test, by 2–3%.
   - **The long run is governed by the last 30 days, not by a ceiling.** The 10% rule failed its only randomised
     test (GRONORUN: 20,8% vs 20,3% injuries). What does predict injury is a single session against the longest run
     of the previous 30 days: +10–30% raises risk 64%, more than double it raises it 128%. So the long run grows
     against a rolling window, which also handles missed weeks by itself, and the ceiling stays at 90 minutes while
     the running fraction inside it goes up.

   And one rule that changes how the whole plan is scored: **in a deficit, holding the weights while bodyweight
   falls is a win, not a plateau** (Murphy & Koehler 2021: an energy deficit impaired lean-mass gains, ES −0,57,
   but not strength, ES −0,31, n.s.). A loop with flat loads and five kilograms less bodyweight must not be treated
   as a failed loop, and nothing may be reset downwards because of it. */
import { ENGINE_STEPS, THR_STEPS } from '../data/plan.ts';
import type { CycleId } from '../data/plan.ts';
import type { LoopReview } from './loop.ts';

export interface Grow { base: number; step: number; cap: number }

export interface LoopPlan {
  /** The loop this plan is for: 2 is the first generated one. */
  loop: number;
  /** The threshold session of this loop. The ladder is held; `pacePct` is what moves, after a test. */
  thr: { reps: number; min: number; rest: number };
  /** Change of threshold pace against the last loop, in %, from the test. Never more than 3. */
  pacePct: number;
  /** Minutes of threshold work a session may hold at this body mass. */
  thrCap: number;
  /** The Engine Builder ladder. */
  eng: Array<{ rounds: number; rest: number }>;
  /** Saturday's long run and the two easy runs. The easy runs are where volume grows. */
  long: Grow;
  easy: Grow;
  /** Strength may add load this loop, or must hold it and progress reps and sets instead. */
  loadUp: boolean;
  /** The order of the three emphases. */
  order: CycleId[];
  /** The first week tests instead of building. */
  retest: boolean;
  /** Why the plan looks like this, in the app's voice. */
  why: string[];
}

export const RULES = {
  /** A single long run against the longest of the last 30 days (Garmin-RUNSAFE, 588.071 sessions). */
  longStep: 1.1,
  /** Minutes of threshold work a 134 kg runner holds in one session; the rest of the metabolic work goes low-impact. */
  thrCapMin: 30,
  thrCapMax: 40,
  /** The long run's ceiling stays here: at this mass the fix is a bigger running fraction, not a longer clock. */
  longCap: 90,
  /** Easy minutes are where weekly volume grows, so the hard share falls back towards 10%. */
  easyCapStep: 5,
  easyMax: 60,
  /** Pace moves only after a test, and never by more than the error of the test itself. */
  paceStepPct: 2,
  paceMaxPct: 3,
  /** Under this share of the loop's sessions, nothing grows. */
  repeatUnder: 0.75,
  /** Under this, the loop starts easier than the one before it. */
  backOffUnder: 0.5,
  /** Weekly bodyweight loss above which no lift adds load (the body is already being asked for enough). */
  fastLossPct: 1,
} as const;

/** The longest a run may be, from the longest run of the last 30 days. */
export const nextLong = (longest30: number): number => Math.round(longest30 * RULES.longStep);

/**
 * The next loop, from the one that just ended.
 * `prev` is the plan the finished loop ran on; undefined for loop 1, which ran on the constants.
 * `lossPctWeek` is the weekly bodyweight change in % (negative when losing), or null when it is not known.
 */
export function nextLoopPlan(r: LoopReview, prev?: LoopPlan, lossPctWeek: number | null = null, kneeSore = false): LoopPlan {
  const thrPrev = prev?.thr ?? THR_STEPS.at(-1)!;
  const engPrev = prev?.eng ?? ENGINE_STEPS;
  const longPrev: Grow = prev?.long ?? { base: 60, step: 5, cap: RULES.longCap };
  const easyPrev: Grow = prev?.easy ?? { base: 30, step: 5, cap: 45 };
  const why: string[] = [];

  const pct = Math.round(r.rate * 100);
  const thin = r.rate < RULES.repeatUnder;
  const veryThin = r.rate < RULES.backOffUnder;
  const climbed = r.thrSessions >= THR_STEPS.length - 1;
  const losingFast = lossPctWeek != null && -lossPctWeek > RULES.fastLossPct;

  // 1. the threshold session: held, never lengthened
  const thr = veryThin ? THR_STEPS[Math.max(0, THR_STEPS.length - 3)]! : thrPrev;
  const work = (thr.reps * thr.min);
  const thrCap = RULES.thrCapMax;
  if (veryThin) {
    why.push(`Ai dus ${pct}% din sesiunile ciclului. Threshold-ul coboară la ${thr.reps}×${thr.min}′: se reia o scară pe care o poți duce.`);
  } else if (work > thrCap) {
    why.push(`Threshold-ul rămâne la ${thr.reps}×${thr.min}′ și nu mai crește: ${work} de minute tari într-o sesiune sunt deja peste ce susține volumul tău săptămânal. Ce urcă e alergarea ușoară de sub el.`);
  } else {
    why.push(`Threshold-ul rămâne la ${thr.reps}×${thr.min}′. Progresul vine din ritm, nu din minute în plus.`);
  }

  // 2. the pace: only after a test, and only by as much as the test can actually measure
  const retest = !thin && r.finished;
  const pacePct = retest && climbed && !losingFast ? RULES.paceStepPct : 0;
  if (pacePct) why.push(`Dacă testul din prima săptămână iese mai bine, ritmul de prag urcă cu ${pacePct}%, nu mai mult: sub 3% nu se poate distinge de eroarea măsurătorii.`);

  // 3. the conditioning ladder, the one place density may still grow
  const eng = thin ? engPrev : growEng(engPrev);
  if (eng !== engPrev) why.push(`Engine Builder urcă la ${eng.at(-1)!.rounds} runde cu pauză de ${eng.at(-1)!.rest} s.`);

  // 4. the long run: a ceiling that stays, a start that follows the last 30 days
  const base = Math.max(longPrev.base, Math.min(RULES.longCap, r.longBest || longPrev.base));
  const long: Grow = { base: kneeSore ? Math.min(base, longPrev.base) : base, step: longPrev.step, cap: RULES.longCap };
  if (kneeSore) why.push('Ai notat genunchiul în ultima vreme, deci alergarea lungă stă pe loc în ciclul ăsta, iar Threshold-ul rămâne. Durerea de la volum se repară cu mai puține minute lungi, nu cu mai puțină intensitate.');
  else if (r.longBest >= RULES.longCap) why.push(`Alergarea lungă a atins ${RULES.longCap} de minute. Plafonul rămâne acolo: la greutatea ta, ce crește de acum e cât din ea alergi, nu cât ține ceasul.`);
  else why.push(`Alergarea lungă pornește de la ${long.base} de minute, de unde ai ajuns, nu de la 60.`);

  // 5. the easy runs: where the weekly volume grows, so the hard share comes down
  const easy: Grow = thin ? easyPrev : { ...easyPrev, cap: Math.min(RULES.easyMax, easyPrev.cap + RULES.easyCapStep) };
  if (easy.cap > easyPrev.cap) why.push(`Alergările ușoare urcă până la ${easy.cap} de minute. Volumul ușor e cel care face sesiunea tare să fie un procent sănătos din săptămână.`);

  // 6. strength: in a deficit, keeping the weights is the win
  const loadUp = !losingFast && !thin;
  if (losingFast) why.push(`Slăbești cu peste ${RULES.fastLossPct}% pe săptămână. Ciclul următor nu cere greutate în plus la nimic: ținta e să păstrezi ce ridici acum, la o greutate corporală mai mică. Asta e progres, nu stagnare.`);
  else if (thin) why.push('Greutățile rămân unde sunt: întâi sesiunile făcute, apoi kilogramele în plus.');
  if (r.stalls.length) why.push(`${r.stalls.length} ${r.stalls.length === 1 ? 'exercițiu s-a oprit' : 'exerciții s-au oprit'} din progres. La ele se schimbă o singură variabilă: varianta, intervalul de repetări sau frecvența — nu doar greutatea.`);

  // 7. the emphasis that follows, and the test week
  const order: CycleId[] = climbed && !thin ? ['B', 'C', 'A'] : ['A', 'B', 'C'];
  if (order[0] !== 'A') why.push('Ciclul începe cu Volum: baza e construită.');
  if (retest) why.push('Prima săptămână e de testare, într-o săptămână ușoară: un contratimp de 20–30 de minute pentru ritm și seriile de top pentru forță.');
  if (r.blankWeeks >= 2) why.push(`Au fost ${r.blankWeeks} săptămâni fără nimic notat. Dacă se repetă, scurtează săptămâna, nu o rata: o săptămână de trei sesiuni duse e mai bună decât una de șase plănuite.`);

  return { loop: r.loop + 1, thr, pacePct, thrCap, eng, long, easy, loadUp, order, retest, why };
}

/** The Engine Builder ladder of the next loop: one round more, at the rest it already holds.
 *  Deliberately small. Nothing in the research covers rowing density, and the ladder's own floor is 30 s, so the
 *  rest is not cut further and the rounds move by one a loop, not by three. */
export function growEng(prev: Array<{ rounds: number; rest: number }>): Array<{ rounds: number; rest: number }> {
  const top = prev.at(-1)!;
  const rest = Math.max(30, top.rest);
  return [{ rounds: top.rounds, rest }, { rounds: top.rounds + 1, rest }];
}

/** Weekly bodyweight change in %, from the weights of the loop; null when there are not enough. */
export function lossPerWeek(weights: Record<string, number>, from: string, to: string): number | null {
  const kept = Object.entries(weights).filter(([d]) => d >= from && d <= to).sort(([a], [b]) => a.localeCompare(b));
  if (kept.length < 4) return null;
  const first = kept[0]!, last = kept.at(-1)!;
  const days = Math.round((Date.parse(`${last[0]}T12:00:00Z`) - Date.parse(`${first[0]}T12:00:00Z`)) / 864e5);
  if (days < 14) return null;
  const pct = ((last[1] - first[1]) / first[1]) * 100;
  return Math.round((pct / (days / 7)) * 100) / 100;
}

/** The plan the loop at `today` runs on, or undefined while the first loop is still going. */
export function activePlan(
  s: { cycle: { start: string; repeats: string[]; plans?: LoopPlan[] } },
  loopNow: number,
): LoopPlan | undefined {
  return s.cycle.plans?.find((p) => p.loop === loopNow);
}
