/* The end of a loop, on screen (2026-11-23).

   Twelve weeks finish and, until now, nothing happened: the app quietly started chapter A again with the opening
   numbers. This card is the moment the loop is closed — what it actually did, and what the next one asks for, with
   the reasons written out — and the one button that starts it.

   It appears in the last week of a loop and stays until the next loop's plan is accepted. Accepting writes a
   LoopPlan into the cycle; everything else (the runs, the threshold session, the ladders) reads it from there. */
import { loopEnding, loopIndex, reviewLoop, type LoopReview } from '../../logic/loop.ts';
import { activePlan, lossPerWeek, nextLoopPlan } from '../../logic/nextblock.ts';
import { kneeNotes, kneeSore } from '../../logic/knee.ts';
import { ctx, save, toast } from '../ctx.ts';
import { dayKey, esc } from '../../logic/util.ts';

/** The review of the loop that is ending, or null when there is nothing to close. */
export function closing(): { review: LoopReview; loop: number } | null {
  const S = ctx.S;
  const today = dayKey();
  const loop = loopIndex(S.cycle.start, today, S.cycle.repeats);
  if (loop < 1) return null;
  const has = activePlan(S, loop);
  // the card shows in the last week of a loop, and afterwards until the new loop has a plan of its own
  const ending = loopEnding(S.cycle.start, today, S.cycle.repeats);
  const r = reviewLoop(S.log, S.cycle.start, today, ending ? loop : loop - 1, S.cycle.repeats);
  if (!r) return null;
  if (ending) return { review: r, loop };
  if (loop > 1 && !has) return { review: r, loop: loop - 1 };
  return null;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** What the loop did and what the next one asks for. Empty when the loop is not near its end. */
export function nextLoopCard(): string {
  const c = closing();
  if (!c) return '';
  const S = ctx.S;
  const today = dayKey();
  const prev = activePlan(S, c.review.loop);
  const loss = lossPerWeek(S.weight, c.review.from, today);
  const sore = !!kneeSore(kneeNotes(S.log, S.knee), today);
  const plan = nextLoopPlan(c.review, prev, loss, sore);
  const done = `${c.review.done} din ${c.review.planned}`;
  const recs = c.review.records.length;
  return `<section class="card nl">
    <p class="nl-k">Ciclul ${c.review.loop} se încheie</p>
    <h2 class="nl-t">Ce ai construit</h2>
    <div class="nl-g">
      <div><b>${pct(c.review.rate)}</b><span>${done} de sesiuni</span></div>
      <div><b>${c.review.thrSessions}</b><span>sesiuni de prag</span></div>
      <div><b>${c.review.longBest || '–'}</b><span>minute, cea mai lungă</span></div>
      <div><b>${recs}</b><span>${recs === 1 ? 'record nou' : 'recorduri noi'}</span></div>
    </div>
    ${loss != null ? `<p class="nl-w">Greutatea a mers cu ${String(loss).replace('.', ',')}% pe săptămână.${loss < -1 ? ' La ritmul ăsta, să păstrezi greutățile de la bară e deja progres.' : ''}</p>` : ''}
    <h3>Ciclul ${plan.loop} cere</h3>
    <ul class="nl-why">${plan.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
    <button class="btn" data-a="nl:go">Pornesc ciclul ${plan.loop}</button>
    <p class="small dim">Poți începe și fără: ciclul merge mai departe cu cifrele de acum. Dar atunci repetă ce ai făcut deja.</p>
  </section>`;
}

/** Accepts the next loop: its plan is written into the cycle and everything reads it from there. */
export function nextLoopAct(a: string): boolean {
  if (a !== 'nl:go') return false;
  const S = ctx.S;
  const c = closing();
  if (!c) return true;
  const today = dayKey();
  const prev = activePlan(S, c.review.loop);
  const loss = lossPerWeek(S.weight, c.review.from, today);
  const sore = !!kneeSore(kneeNotes(S.log, S.knee), today);
  const plan = nextLoopPlan(c.review, prev, loss, sore);
  S.cycle.plans = [...(S.cycle.plans ?? []).filter((p) => p.loop !== plan.loop), plan];
  save();
  toast(`Ciclul ${plan.loop} e pornit.`);
  return true;
}
