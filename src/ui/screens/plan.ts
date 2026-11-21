// "Plan": the week as seven day cards and the 12-week Hybrid365 loop as a campaign map.

import { ENGINE_STEPS, POWER_STEPS, THR_STEPS, WEEK, blockLine, resolveBlock, type Block, type Day, type Picks } from '../../data/plan.ts';
import { workoutById } from '../../data/workouts.ts';
import { CYCLE_WEEKS, CYCLES, cycleAt, dayComplete, dayProgress, daysOff, loopWeek, repeatMonday, weekDone, weekSince } from '../../logic/progress.ts';
import { addDays, dayKey, esc, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { campaignSvg } from '../campaign.ts';
import { blockIcon, blockMinutes, pageHead, planPicks, top, heroBand } from './shared.ts';

function weekRange(mon: string): string {
  const end = addDays(mon, 6);
  const [a, b] = [shortDay(mon), shortDay(end)];
  return a.split(' ')[1] === b.split(' ')[1] ? `${a.split(' ')[0]}–${b}` : `${a} – ${b}`;
}

/** A repeat placed on this Monday or the next one, which can still be taken back. */
function pendingRepeat(today: string): string {
  const mon = weekStart(today);
  return ctx.S.cycle.repeats.find((r) => r === mon || r === addDays(mon, 7)) ?? '';
}

/**
 * After 3+ days without training: the week repeats in the loop instead of moving on, so the load doesn't jump.
 * `lead`: the line above, on Azi the days missed.
 */
export function repeatHtml(today: string, lead = ''): string {
  const { start, repeats } = ctx.S.cycle;
  const mon = weekStart(today);
  const when = (r: string) => (r === mon ? 'Săptămâna asta' : `De luni, ${shortDay(r)},`);
  const set = pendingRepeat(today);
  if (set) {
    const p = cycleAt(start, set, repeats);
    return `<div class="cy-rep">${lead}<p class="small">${set === mon ? '' : 'Săptămâna asta ai luat-o de la capăt: zilele sunt din nou deschise, ce ai făcut înainte rămâne în istoric. '}${when(set)} repeți ${p ? `ciclul ${p.id}, săptămâna ${p.week} din 4` : 'săptămâna'}, în loc să treci mai departe.</p>
      <button class="btn ghost sm" data-a="cy-repeat" data-k="0" data-d="${set}">Anulează</button></div>`;
  }
  const at = repeatMonday(ctx.S.log, start, today);
  if (!at) return '';
  const p = cycleAt(start, at, [...repeats, at]);
  if (!p) return '';
  return `<div class="cy-rep">${lead}<p class="small dim">Ai stat 3 zile sau mai mult fără antrenament? ${at === mon ? '' : 'Săptămâna asta o iei de la capăt: zilele bifate se deschid din nou, iar ce ai făcut rămâne în istoric. '}${when(at)} repeți ciclul ${p.id}, săptămâna ${p.week} din 4, cu aceleași greutăți, în loc să treci la următoarea.</p>
    <button class="btn sm" data-a="cy-repeat" data-k="1" data-d="${at}">Repetă săptămâna</button></div>`;
}

/** On Azi, only after more than 3 days without a block of the plan, and while no repeat is set. */
export function repeatCard(today: string): string {
  const off = daysOff(ctx.S.log, today);
  if (off === null || off <= 3 || pendingRepeat(today)) return '';
  const html = repeatHtml(today, `<h3>Ai lipsit ${off} zile</h3>`);
  return html ? `<section class="card lime" aria-label="Repetă săptămâna"><p class="label">Ciclul</p>${html}</section>` : '';
}

/** This week's Hybrid365 targets, under the map: the threshold set and the run minutes as the plan gives them now. */
function weekTargets(): string {
  const picks = planPicks();
  const at = (id: string) => { const b = WEEK.flatMap((d) => d.blocks).find((x) => x.id === id); return b ? resolveBlock(b, picks) : undefined; };
  const thr = at('tue-thr'), easy = at('mon-run'), long = at('sat-long');
  return `<div class="cp-goals"><span><b>${thr ? `${thr.rounds}×${Math.round((thr.work ?? 0) / 60)}′ · ${thr.restSec}″` : ''}</b>Threshold</span><span><b>${easy?.min ?? 30}′</b>Easy Run</span><span><b>${long?.min ?? 60}′</b>Long Run</span></div>`;
}

/** The 12 weeks of the loop as a strip: three emphases of four, the fourth week lighter. */
function cycleCard(today: string): string {
  const start = ctx.S.cycle.start;
  const c = cycleAt(start, today, ctx.S.cycle.repeats);
  const loop = CYCLES.length * CYCLE_WEEKS;
  const w = loopWeek(start, today, ctx.S.cycle.repeats);
  const pos = w < 0 ? -1 : w % loop;
  const lap = w < 0 ? 1 : Math.floor(w / loop) + 1;
  if (!c) {
    return `<section class="cycle"><p class="label">Campania · de luni</p><h3>Ciclul A: bază</h3>
      ${campaignSvg(-1, 1)}
      ${weekTargets()}
      <p class="small dim">Trei etape de câte 4 săptămâni, a 4-a mereu ușoară și cu teste. Threshold Run crește de la o etapă la alta: 4 × 6, apoi 5 × 6, apoi 5 × 7 min cu pauză mai scurtă.</p></section>`;
  }
  return `<section class="cycle"><p class="label">Campania${lap > 1 ? ` · turul ${lap}` : ''} · ciclul ${c.id}, săptămâna ${c.week} din 4</p><h3>${esc(c.name)}</h3>
    ${campaignSvg(pos, lap)}
    ${weekTargets()}
    <p class="small dim">${c.lighter ? 'Săptămâna ușoară, cu testele.' : esc(c.what)}</p>
    ${repeatHtml(today)}</section>`;
}

/** The day's banner (2026-11-21, the user: "ceva mai specific și motivațional"): the day's own coaching line from
 *  the Hybrid365 slide, the day's targets as they stand this week (minutes, sets × reps, the progression step), and the
 *  day's discipline drawn in gold on the right by the arena engine (animated on today, still on the others). */
const DAY_LINE: Array<[string, string]> = [
  ['Build momentum,', 'not fatigue.'],
  ['Your key', 'performance session.'],
  ['Lift heavy', 'with intent.'],
  ['Move well. Lift strong.', 'Recover smart.'],
  ['Beat last week’s', 'top set.'],
  ['Finish stronger', 'than you started.'],
  ['This is where', 'you get better.'],
];
const DAY_KIND = ['bench', 'run', 'pull', 'deadlift', 'press', 'run', 'calm'];
/** The day's discipline, as on its slide, and how hard it hits (of 5). */
const DAY_TAG = ['Run · Upper', 'Threshold', 'Upper · Engine', 'Run · Lower', 'Strength · Power', 'Long Run', 'Recovery'];
const DAY_HEAT = [2, 4, 4, 2, 5, 3, 1];

/** A session as a short target: "30′ Z2", "4×6′ prag", "DB Bench 4×6–8", "Engine 8×250". */
function target(raw: Block, picks: Picks): string {
  const b = resolveBlock(raw, picks);
  if (b.id === 'tue-wu' || b.id === 'tue-cd' || b.id === 'sun-foam') return '';
  if (b.kind === 'run' || b.kind === 'cardio') return b.id === 'sat-long' ? `Long ${b.min}′` : b.id === 'sun-walk' ? `Walk ${b.min}′` : `${b.min}′ Z2`;
  if (b.thr) return `${b.rounds}×${Math.round((b.work ?? 0) / 60)}′ prag`;
  if (b.kind === 'row') return `Engine ${b.dose.replace(' m', '')}`;
  if (b.kind === 'amrap') return 'AMRAP 10′';
  if (b.kind === 'rounds' && b.hiit) return b.name;
  if (b.workout === 'core') return 'Core';
  if (b.kind === 'workout') {
    const ex = workoutById(b.workout ?? 'upper').ex[0];
    if (!ex) return b.name;
    const st = ex.steps?.[0];
    return `${ex.name.replace('Weighted ', '').replace('Dumbbell ', 'DB ')} ${st ? st.sets : ex.sets}×${ex.lo === ex.hi ? ex.lo : `${ex.lo}–${ex.hi}`}`;
  }
  if (b.routine === 'emom-power') return b.dose.replace('EMOM × ', 'EMOM ');
  if (b.kind === 'routine') return 'Mobility';
  if (b.kind === 'breath') return 'Breath';
  return '';
}

/**
 * The day's title card (2026-11-21, the user: "ceva mai spectaculos"): the day's number huge in gold outline behind
 * the athlete, the discipline and its intensity, the Hybrid365 coaching line with its last words in molten gold, the
 * week's real targets as metal tags. Today burns (live badge, moving light, a gold edge running round the card);
 * a finished day gets the SUMMIT stamp.
 */
function dayBanner(d: Day, picks: Picks, today: boolean, full: boolean): string {
  const [a, b] = DAY_LINE[d.idx] ?? DAY_LINE[0]!;
  const tags = [...new Set(d.blocks.map((x) => target(x, picks)).filter(Boolean))].slice(0, 4);
  const heat = DAY_HEAT[d.idx] ?? 3;
  const n = String(d.idx + 1).padStart(2, '0');
  const bars = [1, 2, 3, 4, 5].map((i) => `<i class="${i <= heat ? `on${i === 5 ? ' max' : ''}` : ''}" style="--i:${i}"></i>`).join('');
  return `<div class="dban${today ? ' today' : ''}${full ? ' full' : ''}" style="--n:${d.idx}" aria-hidden="true">
    <i class="db-num">${n}</i>
    <i class="db-beam"></i>
    <canvas class="hero-cv" data-kind="${DAY_KIND[d.idx] ?? 'run'}"${today ? '' : ' data-still="1"'}></canvas>
    <i class="po-sheen"></i>
    <p class="db-k"><b>Day ${n}</b><span>${esc(DAY_TAG[d.idx] ?? '')}</span>${today ? '<em>Azi</em>' : ''}</p>
    ${full ? '<i class="db-stamp">Summit</i>' : ''}
    <p class="db-l"><span>${esc(a)}</span><b>${esc(b)}</b></p>
    <p class="db-h"><span>Intensitate</span>${bars}</p>
    <p class="db-t">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</p>
  </div>`;
}

/** One progression as a ladder of steps rising left to right: done in gold, the current one lit, the rest outlined. */
function ladder(name: string, labels: string[], cur: number, note: string): string {
  const n = labels.length, at = Math.min(cur, n - 1);
  return `<div class="lad"><div class="lad-h"><b>${esc(name)}</b><span>${esc(labels[at]!)}</span></div>
    <div class="lad-s">${labels.map((l, i) => `<i class="${i < at ? 'ok' : i === at ? 'now' : ''}" style="--i:${i};--h:${(0.3 + (0.7 * (i + 1)) / n).toFixed(3)}"><span>${esc(l)}</span></i>`).join('')}</div>
    <p class="small dim">${esc(note)}</p></div>`;
}

/** A run that grows by minutes: where it is between its start and its cap. */
function runBar(name: string, b: Block | undefined, picks: Picks): string {
  if (!b?.grow) return '';
  const m = resolveBlock(b, picks).min ?? b.grow.base;
  const f = (m - b.grow.base) / (b.grow.cap - b.grow.base || 1);
  return `<div class="lad-run"><span>${esc(name)}</span><div class="lad-bar"><i style="--f:${Math.max(0.04, f).toFixed(3)}"></i></div><b>${m}′<small>/${b.grow.cap}′</small></b></div>`;
}

/** The Hybrid365 progressions as they stand, under the map (2026-11-20, the user: "animație pentru progresie"). */
function progressionHtml(): string {
  const p = planPicks();
  const blk = (id: string) => WEEK.flatMap((d) => d.blocks).find((x) => x.id === id);
  return `<h2 class="sec">Progresia<small>Fiecare scară urcă o treaptă după o sesiune completă. Auriu: făcut; luminat: acum.</small></h2>
    <section class="card lads">
      ${ladder('Threshold Run', THR_STEPS.map((s) => `${s.reps}×${s.min}′${s.rest < 90 ? ' 60″' : ''}`), p.thrStep ?? 0, 'Hybrid365: o repetare în plus până la 6, apoi repetări de 7–8 minute, apoi pauză de 60 s.')}
      ${ladder('Engine Builder', ENGINE_STEPS.map((s) => `${s.rounds}·${s.rest}″`), p.engStep ?? 0, 'Hybrid365: densitate mai mare, mai puțină pauză sau mai multe runde.')}
      ${ladder('Power Finisher', POWER_STEPS.map((s) => `${s.min}′ ${s.throws}/${s.plyo}`), p.powStep ?? 0, 'Scara aplicației (Hybrid365 cere doar viteză mai mare): câte o repetare în plus, apoi 12 minute.')}
      <div class="lad-runs">
        ${runBar('Easy Run luni', blk('mon-run'), p)}
        ${runBar('Easy Run joi', blk('thu-run'), p)}
        ${runBar('Long Run', blk('sat-long'), p)}
      </div>
    </section>`;
}

export function planHtml(): string {
  const today = dayKey();
  const mon = weekStart(today);
  const done = weekDone(ctx.S.log, mon, weekSince(ctx.S.cycle, mon));
  const full = WEEK.filter((d) => dayComplete(d, done)).length;
  const blocksDone = WEEK.reduce((s, d) => s + dayProgress(d, done), 0);
  const tIdx = weekdayIdx(today);
  const picks = planPicks(today);
  const totalBlocks = WEEK.reduce((s, d) => s + d.blocks.length, 0);
  const days = WEEK.map((d) => {
    const n = dayProgress(d, done);
    const complete = n === d.blocks.length;
    const mins = d.blocks.reduce((s, b) => s + blockMinutes(b), 0);
    const state = d.idx === tIdx ? 'Azi' : complete ? 'Gata' : d.idx < tIdx && n < d.blocks.length ? 'Rămas' : '';
    return `<li>
      <button class="dc ${d.idx === tIdx ? 'now' : ''} ${complete ? 'full' : ''}" style="--f:${(n / d.blocks.length).toFixed(3)}" data-a="${d.idx === tIdx ? 'tab' : 'day'}" data-k="today" data-i="${d.idx}">
        <span class="dc-ph dc-ban">${dayBanner(d, picks, d.idx === tIdx, complete)}</span>
        <span class="dc-head">
          <span class="dc-day">${esc(RO_DAYS[d.idx])}</span>
          ${state ? `<span class="dc-tag">${state}</span>` : ''}
          <span class="dc-min">~${mins} min</span>
        </span>
        <span class="dc-t">${esc(d.title)}</span>
        <span class="dc-list">${d.blocks.map((b) => `<span class="dc-li ${done.has(b.id) ? 'ok' : ''}">${ic(done.has(b.id) ? 'check' : blockIcon(b))}<span>${esc(blockLine(b, picks))}</span></span>`).join('')}</span>
        <span class="dc-bar" aria-hidden="true"><i></i></span>
      </button>
    </li>`;
  }).join('');
  return `${top()}
    ${pageHead('Planul', `Săptămâna ${weekRange(mon)}`)}
    ${heroBand('bench')}
    <p class="obj-plate"><b>Obiectiv</b><span>SRI · Brigada Antiteroristă</span></p>
    <section class="plan-sum">
      <div class="ps-n"><b class="num" data-count="${full}">${full}</b><span>din 7 zile</span></div>
      <div class="ps-n"><b class="num" data-count="${blocksDone}">${blocksDone}</b><span>din ${totalBlocks} blocuri</span></div>
      <div class="wk-bar" aria-hidden="true">${WEEK.map((d) => {
        const f = dayProgress(d, done) / d.blocks.length;
        return `<i class="${[d.idx === tIdx ? 'now' : '', f === 1 ? 'full' : ''].filter(Boolean).join(' ')}" style="--f:${f.toFixed(3)}"></i>`;
      }).join('')}</div>
    </section>
    ${cycleCard(today)}
    ${progressionHtml()}
    <h2 class="sec">Săptămâna</h2>
    <ol class="dcs">${days}</ol>`;
}
