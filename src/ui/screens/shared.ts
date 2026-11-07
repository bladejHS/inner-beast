// Pieces shared by the screens: header, program block cards, starting and checking off a block.

import { focusCombos } from '../../data/combos.ts';
import { ALL_BLOCKS, BURST_SEC, resolveBlock, WARMUP_SEC, type Block, type Picks, type RestKey } from '../../data/plan.ts';
import { ROW_CHALLENGES, rowChallenge } from '../../data/row.ts';
import { cycleAt, deloadOn, growMinutes } from '../../logic/progress.ts';
import { makeEntry, type Kind, type Settings } from '../../logic/store.ts';
import { dayKey, esc, inWeek, num, RO_DAYS, weekStart, weekdayIdx } from '../../logic/util.ts';
import { art } from '../art.ts';
import { rake } from '../claws.ts';
import { addEntry, ask, ctx, fresh, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';
import { openAmrap } from '../players/amrap.ts';
import { openBreath } from '../players/breath.ts';
import { openRoutine } from '../players/routine.ts';
import { openRounds } from '../players/rounds.ts';
import { openRow } from '../players/row.ts';
import { openRun } from '../players/run.ts';
import { openShower } from '../players/shower.ts';
import { openWimHof } from '../players/wimhof.ts';
import { openWorkout } from '../players/workout.ts';

export function isDark(): boolean {
  return document.documentElement.dataset.theme === 'dark';
}

/** Light or dark, remembered on this device. */
export function setTheme(dark: boolean): void {
  const t = dark ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem('beast:theme', t);
  } catch {
    /* ignore */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#050404' : '#f3f1ec');
}

const TAB_NAME: Record<string, string> = { today: 'Azi', plan: 'Plan', fight: 'Lupte', mind: 'Minte', progress: 'Progres' };

/** The header: the brand, or a way back. `back` is true for views opened over a tab, or the tab a sub-screen belongs to. */
export function top(back: boolean | string = false): string {
  const left =
    typeof back === 'string'
      ? `<button class="icon-btn back-row" style="width:auto;padding-right:10px" data-a="tab" data-k="${back}" aria-label="Înapoi la ${esc(TAB_NAME[back] ?? back)}">${ic('back')}<span>${esc(TAB_NAME[back] ?? '')}</span></button>`
      : back
        ? `<button class="icon-btn" data-a="back" aria-label="Înapoi">${ic('back')}</button>`
        : `<div class="brand">${art('wolf')}<span>Inner Beast</span></div>`;
  return `<header class="top">${left}<div class="top-r"><button class="icon-btn" data-a="settings" aria-label="Setări">${ic('gear')}</button></div></header>`;
}

export function restFor(k: RestKey | undefined): number {
  if (k === 'r3') return ctx.S.set.rest3;
  if (k === 'r1') return ctx.S.set.rest1;
  return 0;
}

/** Rest between rounds of a block: its own fixed rest, or the one from the settings. */
export function blockRest(b: Block): number {
  return b.restSec ?? restFor(b.rest);
}

/** The user's picks plus what this week decides: the emphasis of the loop and the minutes of the blocks that grow. */
export function planPicks(today = dayKey()): Settings & Picks {
  const S = ctx.S;
  const grown: Record<string, number> = {};
  const light = deloadOn(S.deload, today);
  for (const b of ALL_BLOCKS) if (b.grow) grown[b.id] = light ? b.grow.base : growMinutes(S.log, b.id, S.cycle.start, b.grow);
  return { ...S.set, cycle: cycleAt(S.cycle.start, today)?.id, grown };
}

/** A block as it runs this week. */
export function liveBlock(raw: Block): Block {
  return resolveBlock(raw, planPicks());
}

export function startBlock(raw: Block): void {
  const b = liveBlock(raw);
  switch (b.kind) {
    case 'rounds':
      return openRounds({ name: b.name, rounds: b.rounds ?? 1, work: b.work ?? 180, rest: blockRest(b), focus: b.focus, block: b.id, tip: b.tip, cues: b.cues, legSwap: b.legSwap, warmup: b.warmup, burstFrom: b.burstFrom });
    case 'cardio':
      return openRounds({ name: b.name, rounds: 1, work: (b.min ?? 20) * 60, rest: 0, block: b.id, tip: b.tip, cues: b.cues, cardio: true });
    case 'row':
      return openRow(b.id);
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

const KIND_OF: Record<string, Kind> = { row: 'row', rounds: 'rounds', amrap: 'amrap', workout: 'workout', routine: 'routine', run: 'run', walk: 'walk', shower: 'shower', wimhof: 'wimhof', breath: 'breath', cardio: 'cardio' };

/** Entries of this block in the current week, newest first. */
export function blockEntries(b: Block, today = dayKey()): typeof ctx.S.log {
  const mon = weekStart(today);
  return ctx.S.log.filter((e) => e.block === b.id && inWeek(e.date, mon)).reverse();
}

/** Tap on the block number: check off without the timer, or undo the check. */
export function toggleMark(raw: Block): void {
  const b = liveBlock(raw);
  const name = b.name;
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

const ICON_BY_ID: Record<string, string> = {
  'mon-shadow': 'shadow', 'thu-shadow': 'shadow', 'tue-easy': 'shadow', 'fri-easy': 'shadow',
  'mon-bag': 'bag', 'thu-bag': 'bag', 'thu-power': 'bolt', 'thu-rope': 'rope', 'sun-legs': 'stretch', 'mon-bw': 'bolt',
  'tue-cal': 'fight', 'fri-cal': 'fight', 'sun-lunges': 'fight', 'tue-stretch': 'stretch', 'fri-stretch': 'stretch', 'tue-cool': 'stretch',
  'sat-mob': 'stretch', 'wed-walk': 'walk', 'wed-shower': 'drop', 'wed-med': 'wind', 'sat-med': 'wind',
  'sat-breath': 'mind', 'sun-jog': 'run', 'tue-row': 'row',
};

export function blockIcon(raw: Block): string {
  const b = liveBlock(raw);
  if (b.focus === 'ladder') return 'ladder';
  if (b.kind === 'row') return 'row';
  return ICON_BY_ID[b.id] ?? 'timer';
}

/** Rough minutes a block takes, for the day's total. */
export function blockMinutes(raw: Block): number {
  const b = liveBlock(raw);
  if (b.kind === 'rounds') {
    const r = b.rounds ?? 1;
    const work = Array.from({ length: r }, (_, i) => (b.burstFrom && i + 1 >= b.burstFrom ? BURST_SEC : b.work ?? 0)).reduce((s, x) => s + x, 0);
    return Math.round((work + (r - 1) * blockRest(b) + (b.warmup ? WARMUP_SEC : 0)) / 60);
  }
  if (b.kind === 'shower') return ctx.S.set.showerRounds * 2 + (ctx.S.set.showerEndCold ? 1 : 0);
  if (b.kind === 'walk') return 75;
  if (b.kind === 'wimhof' && !b.min) return 12;
  return b.min ?? 10;
}

/** Thursday's two-way slots: which activity, and for the row, which challenge. */
function altPicker(b: Block): string {
  const s = ctx.S.set;
  const opts: Array<[string, string, boolean]> =
    b.alt === 'feet'
      ? [['rope', 'Jumping Rope', s.thuFeet === 'rope'], ['ladder', 'Agility Ladder', s.thuFeet === 'ladder']]
      : b.alt === 'partner'
        ? [['shadow', 'Singur', s.thuPartner !== 'spar'], ['spar', 'Cu partener', s.thuPartner === 'spar']]
        : [['bag', 'Heavy Bag', s.thuMain === 'bag'], ['row', 'Machine Row', s.thuMain === 'row']];
  const chips = (act: string, list: Array<[string, string, boolean]>, label: string) =>
    `<div class="chips bk-alt" role="group" aria-label="${esc(label)}">${list.map(([v, l, on]) => `<button class="chip" aria-pressed="${on}" data-a="${act}" data-b="${b.id}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  let html = chips('alt', opts, 'Alege activitatea');
  if (b.alt === 'main' && s.thuMain === 'row') {
    const cur = rowChallenge(s.rowCh);
    html += chips('row-ch', ROW_CHALLENGES.map((c) => [c.id, `${c.id.toUpperCase()} · ${c.label}`, c.id === cur.id]), 'Alege provocarea');
  }
  return html;
}

export function blockCard(raw: Block, n: number, today: string): string {
  const b = liveBlock(raw);
  const entries = blockEntries(b, today);
  const done = entries.length > 0;
  const name = b.name;
  let extra = b.alt ? altPicker(b) : '';
  if (b.kind === 'walk') {
    const st = ctx.S.steps[today] ?? 0;
    extra = `<div class="steps-in"><label class="sr" for="steps-in">Pași azi</label><input id="steps-in" type="number" inputmode="numeric" min="0" max="100000" data-a="steps" value="${st || ''}" placeholder="Pași azi"><span>din 10.000</span></div>`;
  }
  if (b.kind === 'run') extra = `<button class="link" data-a="polar" data-b="${b.id}">Adaugă din Polar Flow</button>`;
  if (b.kind === 'rounds' && b.focus && b.burstFrom !== 1 && b.focus !== 'legs' && b.focus !== 'rope' && b.focus !== 'ladder') {
    const cs = focusCombos(b.focus, ctx.S.nut.h);
    extra += `<p class="bk-calls"><b>Combinații:</b> ${esc(cs.slice(0, 4).map((c) => c.name).join(' · '))}${cs.length > 4 ? ` și încă ${cs.length - 4}` : ''}</p>`;
  }
  const when = done ? doneWhen(entries[0].date, today) : '';
  const just = done && fresh.block === b.id && Date.now() < fresh.until;
  if (just) fresh.block = '';
  return `<li class="bk ${done ? 'done' : ''} ${just ? 'just' : ''}">
    ${just ? rake('bk-rake') : ''}
    <div class="bk-top">
      <button class="bk-ic" data-a="mark" data-b="${b.id}" aria-label="${done ? 'Anulează bifa' : 'Bifează fără timer'}">${done ? ic('check') : ic(blockIcon(b))}</button>
      <div class="bk-main">
        <span class="bk-n">${String(n).padStart(2, '0')}${when ? ` <em>${esc(when)}</em>` : ''}</span>
        <h3>${esc(name)}</h3>
        <p class="bk-dose">${esc(b.dose)}</p>
      </div>
      <button class="bk-go" data-a="start" data-b="${b.id}" aria-label="${done ? 'Din nou' : 'Start'}: ${esc(name)}">${ic('play')}</button>
    </div>
    <p class="bk-tip">${esc(b.tip)}</p>
    ${extra}
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
