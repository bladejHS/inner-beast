// Pieces shared by the screens: header, page title, section switcher, the day's rounds, starting and checking off a block.

import { focusCombos, usesLegs } from '../../data/combos.ts';
import { ALL_BLOCKS, BURST_SEC, resolveBlock, WARMUP_SEC, type Block, type Picks, type RestKey } from '../../data/plan.ts';
import { ROW_CHALLENGES, rowChallenge } from '../../data/row.ts';
import { activeStreak, cycleAt, deloadOn, growMinutes } from '../../logic/progress.ts';
import { makeEntry, type Kind, type Settings } from '../../logic/store.ts';
import { zone2, zoneHard } from '../../logic/runlog.ts';
import { kickPower, kickWeek, kneeNotes, kneeSore, type KneeNote } from '../../logic/knee.ts';
import { dayKey, esc, inWeek, num, pad2, RO_DAYS, weekStart, weekdayIdx } from '../../logic/util.ts';
import { addEntry, ask, ctx, fresh, save, toast, type Tab } from '../ctx.ts';
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

const BASE = import.meta.env.BASE_URL;

const TAB_NAME: Record<string, string> = { today: 'Azi', plan: 'Plan', fight: 'Lupte', mind: 'Minte', progress: 'Progres' };

/** The header. On the tab screens: the wolf and the streak. `true`: a way back for screens opened over a tab;
 *  a tab name: a way back to that tab, for the screens that belong to it (Lab, Discipline, Provocări). */
export function top(back: boolean | Tab = false): string {
  const streak = back ? 0 : activeStreak(ctx.S.log, dayKey());
  const left =
    typeof back === 'string'
      ? `<button class="back" data-a="tab" data-k="${back}" aria-label="Înapoi la ${esc(TAB_NAME[back] ?? back)}">${ic('back')}<span>${esc(TAB_NAME[back] ?? 'Înapoi')}</span></button>`
      : back
        ? `<button class="back" data-a="back" aria-label="Înapoi">${ic('back')}<span>Înapoi</span></button>`
        : `<div class="brand"><img class="brand-mark" src="${BASE}ui/mark.svg" alt="" width="30" height="30"><span>Inner <b>Beast</b></span></div>`;
  const run = streak > 1 ? `<button class="streak${streak >= 7 ? ' hot' : ''}" data-a="tab" data-k="progress" aria-label="${streak} zile active la rând">${ic('claw')}<b class="num">${streak}</b><span>zile</span></button>` : '';
  return `<header class="top">${left}<div class="top-r">${run}<button class="icon-btn" data-a="settings" aria-label="Setări">${ic('gear')}</button></div></header>`;
}

/** The newest knee note, when it rules out kicks in today's fighting rounds (logic/knee.ts). */
export function soreKnee(): KneeNote | null {
  return kneeSore(kneeNotes(ctx.S.log, ctx.S.knee), dayKey());
}

/** The big slanted title of a tab, with one line under it. The title rises out of its own box on entry. */
export function pageHead(title: string, sub = '', kicker = '', size: '' | 'sm' = ''): string {
  return `<div class="ph${size ? ` ph-${size}` : ''}">${kicker ? `<p class="ph-k">${kicker}</p>` : ''}<h1 class="ph-t"><span>${esc(title)}</span></h1><i class="ph-blade" aria-hidden="true"></i>${sub ? `<p class="ph-s">${sub}</p>` : ''}</div>`;
}

/** The section switcher under a tab's title. The red blade under the current section slides (see main.ts). */
export function segBar(label: string, segs: Array<[string, string]>, cur: string): string {
  return `<nav class="seg" aria-label="${esc(label)}"><div class="seg-in">${segs
    .map(([k, l]) => `<button class="seg-b" data-a="seg" data-k="${k}"${k === cur ? ' aria-current="true"' : ''}>${esc(l)}</button>`)
    .join('')}<i class="seg-ink" aria-hidden="true"></i></div></nav>`;
}

/** The section of a tab now shown: the saved one if it still exists, else the first. */
export function segOf(tab: string, keys: string[]): string {
  const k = ctx.seg[tab];
  return k && keys.includes(k) ? k : keys[0];
}

/** A progress ring: `f` from 0 to 1; `key` lets the ring move from its last value when the screen redraws. */
export function gauge(f: number, inner: string, key = '', cls = ''): string {
  return `<div class="gauge ${cls}"${key ? ` data-ring="${key}"` : ''} style="--f:${Math.max(0, Math.min(1, f)).toFixed(3)}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="g-t" cx="32" cy="32" r="28"/><circle class="g-v" cx="32" cy="32" r="28"/></svg><div class="g-in">${inner}</div></div>`;
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

let picksKey = '';
let picksVal: (Settings & Picks) | null = null;

/** The user's picks plus what this week decides: the emphasis of the loop and the minutes of the blocks that grow.
 *  A screen asks for it once per block, so the answer is kept until the log, the settings or the day change. */
export function planPicks(today = dayKey()): Settings & Picks {
  const S = ctx.S;
  const lastTs = S.log.length ? S.log[S.log.length - 1].ts : 0;
  // a check can be undone without touching the log's length, so the checked entries are counted too
  let marked = 0;
  for (const e of S.log) if (e.block) marked++;
  const key = `${today}|${S.log.length}|${lastTs}|${marked}|${S.cycle.start}|${S.cycle.repeats.join(',')}|${S.deload.week}|${JSON.stringify(S.set)}`;
  if (picksVal && key === picksKey) return picksVal;
  const grown: Record<string, number> = {};
  const light = deloadOn(S.deload, today);
  for (const b of ALL_BLOCKS) if (b.grow) grown[b.id] = light ? b.grow.base : growMinutes(S.log, b.id, S.cycle.start, b.grow);
  picksKey = key;
  const c = cycleAt(S.cycle.start, today, S.cycle.repeats);
  picksVal = { ...S.set, cycle: c?.id, cycleWeek: c?.week, grown };
  return picksVal;
}

/** A block as it runs this week. */
export function liveBlock(raw: Block): Block {
  return resolveBlock(raw, planPicks());
}

export function startBlock(raw: Block): void {
  const b = liveBlock(raw);
  switch (b.kind) {
    case 'rounds':
      return openRounds({ name: b.name, rounds: b.rounds ?? 1, work: b.work ?? 180, rest: blockRest(b), focus: b.focus, block: b.id, tip: b.tip, cues: b.cues, legSwap: b.legSwap, warmup: b.warmup, burstFrom: b.burstFrom, hiit: b.hiit, react: b.react });
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
  'tue-cal': 'fight', 'tue-lower': 'fight', 'fri-cal': 'fight', 'sun-lunges': 'fight', 'tue-stretch': 'stretch', 'fri-stretch': 'stretch', 'tue-cool': 'stretch',
  'sat-mob': 'stretch', 'wed-walk': 'walk', 'wed-shower': 'drop', 'wed-med': 'wind', 'sat-med': 'wind',
  'sat-breath': 'mind', 'sun-jog': 'run', 'tue-row': 'row', 'knee-tue': 'wall', 'knee-sat': 'wall', 'kick-fri': 'stretch',
};

export function blockIcon(raw: Block): string {
  const b = liveBlock(raw);
  if (b.focus === 'ladder') return 'ladder';
  if (b.kind === 'row' || b.hiit || (b.kind === 'cardio' && b.alt === 'aero')) return 'row';
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
        : b.alt === 'aero'
          ? [['row', 'Vâslitor', s.sunAero !== 'run'], ['run', 'Alergare', s.sunAero === 'run']]
          : [['bag', 'Heavy Bag', s.thuMain === 'bag'], ['row', 'Machine Row', s.thuMain === 'row']];
  const chips = (act: string, list: Array<[string, string, boolean]>, label: string) =>
    `<div class="chips rd-alt" role="group" aria-label="${esc(label)}">${list.map(([v, l, on]) => `<button class="chip" aria-pressed="${on}" data-a="${act}" data-b="${b.id}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  let html = chips('alt', opts, 'Alege activitatea');
  if (b.alt === 'main' && s.thuMain === 'row') {
    const cur = rowChallenge(s.rowCh);
    html += chips('row-ch', ROW_CHALLENGES.map((c) => [c.id, `${c.id.toUpperCase()}: ${c.label}`, c.id === cur.id]), 'Alege provocarea');
  }
  return html;
}

/** One round of the day's card: the number on the rail (tap to check off), what it is, and its start button. */
export function blockCard(raw: Block, n: number, today: string, next = false): string {
  const b = liveBlock(raw);
  const entries = blockEntries(b, today);
  const done = entries.length > 0;
  const name = b.name;
  let extra = b.alt ? altPicker(b) : '';
  if (b.kind === 'walk') {
    const st = ctx.S.steps[today] ?? 0;
    extra = `<div class="steps-in"><label class="sr" for="steps-in">Pași azi</label><input id="steps-in" type="number" inputmode="numeric" min="0" max="100000" data-a="steps" value="${st || ''}" placeholder="Pași azi"><span>din 10.000</span></div>`;
  }
  if (b.kind === 'run' || b.kind === 'cardio') {
    const [lo, hi] = zone2(ctx.S.set.hrMax);
    extra += `<p class="rd-hr">${ic('pulse')}<span>Zona 2: <b>${lo}–${hi}</b> bpm</span></p>`;
  }
  if (b.hiit) {
    const [lo, hi] = zoneHard(ctx.S.set.hrMax);
    extra += `<p class="rd-hr">${ic('pulse')}<span>Intervale: <b>${lo}–${hi}</b> bpm</span></p>`;
  }
  if (b.kind === 'run') extra += `<button class="link" data-a="polar" data-b="${b.id}">Adaugă din Polar Flow</button>`;
  if (b.kind === 'rounds' && b.focus && b.burstFrom !== 1 && b.focus !== 'legs' && b.focus !== 'rope' && b.focus !== 'ladder') {
    const sore = soreKnee();
    const cs = focusCombos(b.focus, ctx.S.nut.h, !sore);
    extra += `<p class="rd-calls"><b>${sore ? 'Doar box, cât genunchiul cere pauză de la kick-uri:' : 'Combinații strigate:'}</b> ${esc(cs.slice(0, 4).map((c) => c.name).join(', '))}${cs.length > 4 ? ` și încă ${cs.length - 4}` : ''}</p>`;
    const kw = !sore && cs.some(usesLegs) ? kickWeek(ctx.S.log, dayKey()) : 0;
    if (kw && kickPower(kw) < 100) extra += `<p class="rd-calls"><b>Kick-uri la ${kickPower(kw)}% din putere:</b> săptămâna ${kw} din 4 de kickboxing.</p>`;
  }
  const when = done ? doneWhen(entries[0].date, today) : '';
  const just = done && fresh.block === b.id && Date.now() < fresh.until;
  if (just) fresh.block = '';
  const state = done ? 'done' : next ? 'next' : '';
  return `<li class="rd ${state}${just ? ' just' : ''}" style="--n:${n}">
    <button class="rd-node" data-a="mark" data-b="${b.id}" aria-label="${done ? `Anulează bifa: ${esc(name)}` : `Bifează fără timer: ${esc(name)}`}">${done ? ic('check') : `<b>${pad2(n)}</b>`}</button>
    <div class="rd-main">
      <p class="rd-meta">${ic(blockIcon(b))}<span>${esc(b.dose)}</span>${when ? `<em>${esc(when)}</em>` : ''}</p>
      <h3 class="rd-name">${esc(name)}</h3>
      <p class="rd-tip">${esc(b.tip)}</p>
      ${extra}
    </div>
    <button class="rd-go" data-a="start" data-b="${b.id}" aria-label="${done ? 'Din nou' : 'Start'}: ${esc(name)}">${ic('play')}</button>
    ${just ? '<i class="rd-slash" aria-hidden="true"><i></i><i></i><i></i></i>' : ''}
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
