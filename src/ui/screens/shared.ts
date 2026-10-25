// Pieces shared by the screens: header, program block cards, starting and checking off a block.

import { blockName, type Block, type RestKey } from '../../data/plan.ts';
import { makeEntry, type Kind } from '../../logic/store.ts';
import { dayKey, esc, inWeek, num, RO_DAYS, weekStart, weekdayIdx } from '../../logic/util.ts';
import { clawSvg } from '../claws.ts';
import { addEntry, ask, ctx, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';
import { openAmrap } from '../players/amrap.ts';
import { openBreath } from '../players/breath.ts';
import { openRoutine } from '../players/routine.ts';
import { openRounds } from '../players/rounds.ts';
import { openRun } from '../players/run.ts';
import { openShower } from '../players/shower.ts';
import { openWimHof } from '../players/wimhof.ts';
import { openWorkout } from '../players/workout.ts';

export function top(back = false): string {
  return `<header class="top">${
    back
      ? `<button class="icon-btn" data-a="back" aria-label="Înapoi">${ic('back')}</button>`
      : `<div class="brand">${clawSvg('#C7FE51')}<span>Inner Beast</span></div>`
  }<button class="icon-btn" data-a="settings" aria-label="Setări">${ic('gear')}</button></header>`;
}

export function restFor(k: RestKey | undefined): number {
  if (k === 'r3') return ctx.S.set.rest3;
  if (k === 'r1') return ctx.S.set.rest1;
  return 0;
}

export function startBlock(b: Block): void {
  switch (b.kind) {
    case 'rounds':
      return openRounds({ name: blockName(b, ctx.S.set.legMode), rounds: b.rounds ?? 1, work: b.work ?? 180, rest: restFor(b.rest), focus: b.focus, block: b.id, tip: b.tip, legSwap: b.legSwap });
    case 'amrap':
      return openAmrap(b.id, b.min ?? 10);
    case 'workout':
      return openWorkout(b.workout ?? 'push', b.id);
    case 'routine':
      return openRoutine(b.routine ?? 'mobility', b.id);
    case 'run':
      return openRun({ mode: 'run', block: b.id, target: (b.min ?? 20) * 60 });
    case 'walk':
      return openRun({ mode: 'walk', block: b.id });
    case 'shower':
      return openShower(b.id);
    case 'wimhof':
      return openWimHof(b.id);
    case 'breath':
      return openBreath(b.id);
  }
}

const KIND_OF: Record<string, Kind> = { rounds: 'rounds', amrap: 'amrap', workout: 'workout', routine: 'routine', run: 'run', walk: 'walk', shower: 'shower', wimhof: 'wimhof', breath: 'breath' };

/** Entries of this block in the current week, newest first. */
export function blockEntries(b: Block, today = dayKey()): typeof ctx.S.log {
  const mon = weekStart(today);
  return ctx.S.log.filter((e) => e.block === b.id && inWeek(e.date, mon)).reverse();
}

/** Tap on the block number: check off without the timer, or undo the check. */
export function toggleMark(b: Block): void {
  const name = blockName(b, ctx.S.set.legMode);
  const done = blockEntries(b);
  if (done.length) {
    ask('Anulezi bifa?', `„${name}” nu mai apare ca făcut săptămâna asta. Înregistrarea rămâne în istoric.`, 'Anulează bifa', () => {
      done.forEach((e) => (e.block = undefined));
      save();
      ctx.render();
    });
    return;
  }
  ask('Bifezi fără timer?', `Marchezi „${name}” ca făcut azi, de exemplu dacă l-ai făcut la sală.`, 'Bifează', () => {
    addEntry(makeEntry({ kind: KIND_OF[b.kind], block: b.id, name, dur: (b.min ?? 0) * 60 || (b.rounds ?? 0) * (b.work ?? 0), data: { manual: true, workDone: (b.rounds ?? 0) * (b.work ?? 0) } }));
    toast('Bifat.');
    ctx.render();
  });
}

export function blockCard(b: Block, n: number, today: string): string {
  const entries = blockEntries(b, today);
  const done = entries.length > 0;
  const name = blockName(b, ctx.S.set.legMode);
  let extra = '';
  if (b.kind === 'walk') {
    const st = ctx.S.steps[today] ?? 0;
    extra = `<div class="steps-in"><label class="sr" for="steps-in">Pași azi</label><input id="steps-in" type="number" inputmode="numeric" min="0" max="100000" data-a="steps" value="${st || ''}" placeholder="Pași azi"><span style="font-weight:700">din 10.000</span></div>`;
  }
  const when = done ? doneWhen(entries[0].date, today) : '';
  return `<li class="blk ${done ? 'done' : ''}">
    <button class="blk-n" data-a="mark" data-b="${b.id}" aria-label="${done ? 'Anulează bifa' : 'Bifează fără timer'}">${done ? ic('check') : n}</button>
    <div>
      <h3>${esc(name)}</h3>
      <p class="dose">${esc(b.dose)}</p>
      <p class="tip">${esc(b.tip)}</p>
      ${extra}
      <div class="acts"><button class="go ${done ? 'again' : ''}" data-a="start" data-b="${b.id}">${done ? 'Din nou' : 'Start'}${ic('play')}</button>${when ? `<span class="meta">${esc(when)}</span>` : ''}</div>
    </div>
  </li>`;
}

function doneWhen(date: string, today: string): string {
  if (date === today) return 'Făcut azi';
  return `Făcut ${RO_DAYS[weekdayIdx(date)].toLowerCase()}`;
}

/** Saves today's steps; 10.000 checks off the walk. */
export function saveSteps(v: number): void {
  const today = dayKey();
  const steps = Math.max(0, Math.min(100000, Math.round(v)));
  ctx.S.steps[today] = steps;
  const existing = ctx.S.log.find((e) => e.kind === 'walk' && e.date === today && e.data.fromSteps);
  if (steps >= 10000) {
    if (existing) {
      existing.data.steps = steps;
      existing.block = 'wed-walk';
    } else {
      addEntry(makeEntry({ kind: 'walk', block: 'wed-walk', name: 'Walk (10K Steps)', dur: 0, data: { steps, fromSteps: true } }));
      toast(`${num(steps)} de pași. Bifat.`);
    }
  } else if (existing) {
    existing.data.steps = steps;
    existing.block = undefined;
  }
  save();
}
