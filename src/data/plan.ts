// The weekly plan since 2026-11-20: the Hybrid365 run-focused split (@hybrid.365, "Hybrid Training Split - Lift, Run &
// Perform"), which the user asked for in place of the e-book's kickboxing week: 3 runs + 3 upper lifts + 1 lower lift +
// 1 hybrid conditioning, Sunday for recovery and mobility. Sessions, sets, reps, rests, coaching points and
// progressions are the ones on the eleven Hybrid365 slides (Desktop\hybrid365); tips and cues are in Romanian.
// Fitted to the user only where they asked before: no squats with the bar (the Hack Squat takes the Back Squat's
// place), dumbbells up to 30 kg, and the easy runs can go on the rower on a day the knees ask for it.
// Block ids are stable keys in saved logs and in Beast Nutrition.

export type BlockKind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'shower' | 'wimhof' | 'breath' | 'row' | 'cardio';
export type ComboFocus = 'jab' | 'move' | 'combo' | 'power' | 'slow' | 'distance' | 'rope' | 'ladder' | 'plate' | 'legs' | 'week' | 'pads';
export type RestKey = 'r3' | 'r1' | 'none';
/** The three emphases of the 12-week loop: strength + aerobic base, power + speed, capacity. */
export type CycleId = 'A' | 'B' | 'C';

/** A punch-out round: 14 × (3 s all-out, 10 s easy) = 182 s, the tested protocol (Kamandulis 2018, Herrera-Valenzuela 2020). */
export const BURST = { on: 3, off: 10, reps: 14 };
export const BURST_SEC = BURST.reps * (BURST.on + BURST.off);

/** What a block becomes in one emphasis of the loop. */
type CycleVariant = Partial<Omit<Block, 'id' | 'cycle' | 'cycleEven'>>;

export interface Block {
  id: string;
  kind: BlockKind;
  name: string;
  /** Short dose line, e.g. "5 × 3 min". */
  dose: string;
  /** The line as the plan page prints it, when it differs from "dose name". */
  line?: string;
  /** What the block is for, in Romanian. */
  tip: string;
  rounds?: number;
  work?: number;
  rest?: RestKey;
  /** Fixed rest in seconds, for intervals the settings don't cover. */
  restSec?: number;
  focus?: ComboFocus;
  workout?: 'upper' | 'upper2' | 'lower' | 'power' | 'core';
  routine?: 'stretch-push' | 'stretch-pull' | 'mobility' | 'legwarm' | 'cooldown' | 'flow' | 'stretch' | 'foam' | 'emom-power';
  min?: number;
  /** Quick-timer block: Wall Sit or Jumping Squats, as the user picks. */
  legSwap?: boolean;
  /** What to focus on during the block, a few short cues (Romanian). */
  cues?: string[];
  /** A slot with two alternatives the user picks from (Thursday, Sunday): see resolveBlock. */
  alt?: 'feet' | 'main' | 'partner' | 'aero' | 'cond';
  /** First boxing block of the day: offers the warm-up before round 1. */
  warmup?: boolean;
  /** From this round on (1-based), every round is a punch-out (see BURST). */
  burstFrom?: number;
  /** Needs the bag: becomes the same protocol in shadow when Thursday's main slot is the rowing machine. */
  bagOnly?: boolean;
  /** Changes in one emphasis of the 12-week loop. */
  cycle?: Partial<Record<CycleId, CycleVariant>>;
  /** Changes on the even weeks (2 and 4) of an emphasis, over `cycle`: for work that alternates week by week. */
  cycleEven?: Partial<Record<CycleId, CycleVariant>>;
  /** Hard intervals off the bag (the rower): no combinations called, saved as cardio, steered by the pulse. */
  hiit?: boolean;
  /** Minutes that grow by `step` after each completed session, from `base` to `cap` (easy aerobic work). */
  grow?: { base: number; step: number; cap: number };
  /** A reaction drill (see REACT_CUES): one whole round, or the last seconds of a single long round. */
  react?: { round?: number; lastSec?: number };
  /** Threshold intervals on foot: the pulse window is the threshold one, not the rower's 4 × 4. */
  thr?: boolean;
  /** A circuit for the AMRAP timer, in place of the bodyweight schemes. */
  circuit?: { moves: string[]; reps: number[] };
  /** A fixed Machine Row challenge (see data/row.ts), whatever the Settings say. */
  rowCh?: string;
  /** The challenge's rounds and rest for this session, when its progression moves them (Engine Builder). */
  rowDose?: { reps: number; rest: number };
}

/** 7-minute warm-up before the first fighting block (Monday, Thursday): the hips open for the kicks, no jumping. */
export const WARMUP: Array<{ name: string; sec: number; cue: string }> = [
  { name: 'Arm Circles', sec: 45, cue: 'Cercuri mari cu brațele, înainte, apoi înapoi.' },
  { name: 'Shoulder Rolls', sec: 45, cue: 'Umerii rotiți larg, apoi mâinile în gardă și înapoi.' },
  { name: 'Torso Twists', sec: 45, cue: 'Rotești trunchiul stânga-dreapta, șoldurile urmează.' },
  { name: 'Hip Circles', sec: 45, cue: 'Mâinile pe șolduri, cercuri largi în ambele sensuri.' },
  { name: 'Leg Swings', sec: 60, cue: 'Te ții de perete și balansezi piciorul înainte-înapoi, 30 s pe fiecare.' },
  { name: 'Lateral Leg Swings', sec: 45, cue: 'Cu fața la perete, balansezi piciorul prin fața corpului și în lateral: deschide șoldul pentru kick-uri.' },
  { name: 'Light Footwork', sec: 60, cue: 'Pași mici pe vârfuri, înainte, înapoi și lateral, fără sărituri. Scuturi brațele.' },
  { name: 'Easy Shadow', sec: 60, cue: 'Shadow la 50%: jab, cross, apoi teep și low kick lente, cu pivot pe vârf.' },
];

export const WARMUP_SEC = WARMUP.reduce((s, m) => s + m.sec, 0);

/** The user's picks for the swappable blocks, plus what the calendar and the log decide this week. */
export interface Picks {
  legMode: 'wall' | 'jump';
  thuFeet: 'rope' | 'ladder' | 'plate';
  thuMain: 'bag' | 'row';
  thuPartner?: 'shadow' | 'spar';
  rowCh: string;
  /** The emphasis running this week, if the loop has started, and its week (1-4). */
  cycle?: CycleId;
  cycleWeek?: number;
  /** The easy and long runs: run (Hybrid365), or row on a day the knees ask for it. */
  aero?: 'run' | 'row';
  /** Where the Hybrid365 progressions stand: the threshold step (THR_STEPS) and the Engine Builder step (ENGINE_STEPS). */
  thrStep?: number;
  engStep?: number;
  powStep?: number;
  /** Wednesday's conditioning: A Engine Builder (row), B Hybrid Circuit, C Norwegian 4x4, D Hill Repeats, E 30/30s. */
  wedCond?: 'a' | 'b' | 'c' | 'd' | 'e';
  /** Today's minutes for the blocks that grow (see Block.grow). */
  grown?: Record<string, number>;
}

export interface Day {
  idx: number;
  title: string;
  blocks: Block[];
}

/** Wednesday's extra conditioning options (2026-11-20, the user: "Norwegian 4x4, Hill repeats, 30/30s"), all hard
 *  intervals on the rounds timer with the pulse window on screen, saved as cardio. */
const COND: Partial<Record<string, Partial<Block>>> = {
  c: {
    kind: 'rounds', name: 'Norwegian 4x4', dose: '4 × 4 min', line: 'Conditioning: Norwegian 4x4, 4 × 4 min at 85–95% HRmax, 3 min easy', rounds: 4, work: 240, restSec: 180, hiit: true, thr: false, min: 28,
    tip: 'Metoda norvegiană (Helgerud 2007): 4 intervale de 4 minute la 85–95% din pulsul maxim, cu 3 minute ușor între ele (jogging, vâslit sau bicicletă). Cea mai studiată metodă pentru VO2max. Pe vâslitor sau bicicletă genunchii nu iau impact.',
    cues: ['Primul interval mai temperat: pulsul urcă în zonă abia în minutul doi.', 'Tare, dar egal: trebuie să poți termina al patrulea la fel.', 'În pauză nu te oprești: mișcare ușoară, pulsul coboară.'],
  },
  d: {
    kind: 'rounds', name: 'Hill Repeats', dose: '8 × 60 s', line: 'Conditioning: Hill Repeats, 8 × 60 s uphill, walk/jog down', rounds: 8, work: 60, restSec: 90, hiit: true, thr: false, min: 22,
    tip: '8 urcări de 60 de secunde, tare, pe pantă; cobori mergând sau la jogging ușor (90 s). Forță pentru picioare și motor, cu impact mai mic decât sprintul pe plat. Încălzește-te 10 minute înainte.',
    cues: ['Pași scurți și rapizi, pieptul ușor înainte, brațele împing.', 'Același efort la fiecare urcare: dacă ultima e mult mai lentă, ai pornit prea tare.', 'La coborâre mergi: genunchii nu iau șocuri.'],
  },
  e: {
    kind: 'rounds', name: '30/30s', dose: '16 × 30 s', line: 'Conditioning: 30/30s, 16 × 30 s hard / 30 s easy', rounds: 16, work: 30, restSec: 30, hiit: true, thr: false, min: 16,
    tip: '30 de secunde tare, 30 de secunde ușor, de 16 ori (Billat): mult timp aproape de VO2max fără să te arzi. Alergare, vâslitor sau bicicletă. Ritmul tare e cel pe care l-ai putea ține 5–6 minute, nu sprint.',
    cues: ['Tare, nu maxim: ultimele repetări la fel de rapide ca primele.', 'În cele 30 de secunde ușoare continui să te miști.', 'Dacă ritmul cade mult, oprește-te la 12.'],
  },
};

/** Tuesday's progression, exactly as the slide gives it: "Add 1 rep (up to 5–6 total). Extend reps to 7–8 min. Or
 *  reduce recovery to 60 sec between reps." One step after each full threshold session (Picks.thrStep). */
export const THR_STEPS: Array<{ reps: number; min: number; rest: number }> = [
  { reps: 4, min: 6, rest: 90 }, { reps: 5, min: 6, rest: 90 }, { reps: 6, min: 6, rest: 90 },
  { reps: 6, min: 7, rest: 90 }, { reps: 6, min: 8, rest: 90 }, { reps: 6, min: 8, rest: 60 },
];
/** Wednesday's Engine Builder, as the slide says: "Increase density on conditioning (less rest or more rounds)": the
 *  rest comes down 5 s a session to 30 s, then a round more, up to 10. */
export const ENGINE_STEPS: Array<{ rounds: number; rest: number }> = [
  { rounds: 8, rest: 45 }, { rounds: 8, rest: 40 }, { rounds: 8, rest: 35 }, { rounds: 8, rest: 30 }, { rounds: 9, rest: 30 }, { rounds: 10, rest: 30 },
];

/** Friday's Power Finisher (EMOM, odd minutes Med Ball Chest Throws, even minutes Plyo Push Ups). The Hybrid365 slide
 *  gives no numbers for it ("improve bar speed and efficiency on power movements"), so this ladder is the app's own, at
 *  the user's request (2026-11-20): one step per full session, a rep more on one move at a time, then two more minutes.
 *  The reps stay low on purpose: power is speed, and a set ends when the speed drops. */
export const POWER_STEPS: Array<{ min: number; throws: number; plyo: number }> = [
  { min: 10, throws: 6, plyo: 8 }, { min: 10, throws: 7, plyo: 8 }, { min: 10, throws: 7, plyo: 9 },
  { min: 10, throws: 8, plyo: 9 }, { min: 10, throws: 8, plyo: 10 }, { min: 12, throws: 8, plyo: 10 },
];

/** Threshold pace, the key session. Its reps, their length and the jog between them follow THR_STEPS. */
const THRESHOLD: Block = {
  id: 'tue-thr', kind: 'rounds', name: 'Threshold Run', dose: '4 × 6 min', line: '4 × 6 min @ Threshold Pace, 90 s easy jog', rounds: 4, work: 360, restSec: 90, hiit: true, thr: true,
  tip: 'Sesiunea-cheie a săptămânii: repetări în ritm de prag, cu jogging ușor între ele. Îmbunătățește pragul de lactat: ții un ritm mai rapid pentru mai mult timp. Progresia Hybrid365: o repetare în plus până la 6, apoi repetări de 7–8 minute, apoi pauză de 60 s.',
  cues: ['Ritm controlat și puternic la fiecare repetare, nu sprint.', 'Relaxat: nu forța efortul.', 'Splituri egale: ultima repetare la fel de rapidă ca prima.', 'Calitate peste cantitate.'],
};

const EASY_CUES = ['Alergarea rămâne UȘOARĂ: zona 2, poți vorbi în propoziții întregi.', 'Dacă pulsul iese din zonă, încetinești sau mergi până coboară.', 'Pași scurți și relaxați, umerii jos.'];

export const WEEK: Day[] = [
  {
    idx: 0,
    title: 'Easy Run + Upper',
    blocks: [
      { id: 'mon-run', kind: 'run', name: 'Easy Run (Zone 2)', dose: '30 min', min: 30, alt: 'aero', grow: { base: 30, step: 5, cap: 45 },
        tip: 'Session 1: 30–45 min în zona 2 (aerob). Construiește baza aerobă și rezistența și ajută recuperarea. Crește cu 5 minute la fiecare sesiune făcută, până la 45.',
        cues: [...EASY_CUES, 'Începi săptămâna construind elan, nu oboseală.'] },
      { id: 'mon-upper', kind: 'workout', name: 'Upper Body (Strength)', dose: '55 min', line: '55 min Upper Body: DB Bench Press, Pull Up, Incline DB Press, Row, Raises, Arms', workout: 'upper', min: 55,
        tip: 'Session 2: forță pentru partea de sus. Tempo controlat și amplitudine completă la fiecare repetare. Pauză 60–90 s între serii. Progresezi întâi prin repetări, apoi prin greutate.' },
      { id: 'mon-core', kind: 'workout', name: 'Core (Circuits)', dose: '9 min', line: '9 min Core: Sit-ups, Hanging Knee Raises, Plank', workout: 'core', min: 9,
        tip: 'În plus față de Hybrid365, la cererea ta (2026-11-20): abdomenul pentru circuite (60 și 40 de abdomene, atârnatul de 90 s). Sit-ups la maxim, ridicări de genunchi atârnat (și priza pentru atârnat), plank. Ultimul, ca să nu obosească trunchiul înainte de forță.' },
    ],
  },
  {
    idx: 1,
    title: 'Threshold Run',
    blocks: [
      { id: 'tue-wu', kind: 'run', name: 'Warm Up: Easy Run + Drills', dose: '12 min', min: 12,
        tip: '10–15 minute de alergare ușoară, apoi câteva exerciții de alergare (genunchi sus din mers, pendulări, 2–3 accelerări scurte). Te pregătește pentru ritmul de prag.' },
      THRESHOLD,
      { id: 'tue-cd', kind: 'run', name: 'Cool Down: Easy Run', dose: '10 min', min: 10, tip: '10 minute de alergare ușoară: pulsul coboară, picioarele se descarcă.' },
    ],
  },
  {
    idx: 2,
    title: 'Upper + Conditioning',
    blocks: [
      { id: 'wed-upper', kind: 'workout', name: 'Upper Body (Strength)', dose: '60 min', line: '60 min Upper Body: Weighted Pull Up, DB Press, Row, Overhead Press, Face Pull, Raises, Arms', workout: 'upper2', min: 60,
        tip: 'Session 1: greu, cu intenție. Lași 1–2 repetări în rezervă la exercițiile principale, repetări de calitate și amplitudine completă. Pauză 60–90 s.' },
      { id: 'wed-cond', kind: 'row', name: 'Engine Builder (Ski/Row)', dose: '8 × 250 m', line: 'Conditioning: Engine Builder 8 × 250 m Row, 45 s rest', alt: 'cond', rowCh: 'd', min: 14,
        tip: 'Session 2, Option A: 8 runde pe timp de 250 m pe vâslitor (sau SkiErg), cu 45 s pauză. Provocator, nu maximal. 2–3 minute de pauză după forță, înainte să începi.',
        cues: ['Condiționarea trebuie să fie provocatoare, nu maximală.', 'Construiești forță și capacitate de lucru.', 'Notezi timpul și încerci să-l bați.'] },
    ],
  },
  {
    idx: 3,
    title: 'Easy Run + Lower',
    blocks: [
      { id: 'thu-run', kind: 'run', name: 'Easy Run (Zone 2)', dose: '30 min', min: 30, alt: 'aero', grow: { base: 30, step: 5, cap: 40 },
        tip: 'Session 1: 30–40 min în zona 2. Ajută recuperarea, crește baza aerobă și pregătește picioarele pentru forță. E o sesiune de „flush”, nu un antrenament.',
        cues: EASY_CUES },
      { id: 'thu-lower', kind: 'workout', name: 'Lower Body (Strength)', dose: '55 min', line: '55 min Lower Body: Hack Squat, RDL, Walking Lunge, Hip Thrust, Leg Press, Hamstring Curl, Calf Raise', workout: 'lower', min: 55,
        tip: 'Session 2: forță și calitate, nu volum. 1–2 repetări în rezervă la exercițiile compuse. Pui greutate când ai făcut toate seriile și repetările. Te miști bine, ridici puternic, te recuperezi inteligent.' },
    ],
  },
  {
    idx: 4,
    title: 'Upper Strength + Power',
    blocks: [
      { id: 'fri-upper', kind: 'workout', name: 'Upper Body (Strength + Power)', dose: '65 min', line: '65 min Upper Body: DB Bench Press 5 × 3–5, Weighted Pull Up, Push Press, Arms', workout: 'power', min: 65,
        tip: 'Session 1: forță maximă plus putere explozivă. Intenție grea și explozivă la exercițiile principale, amplitudine completă, pauză 90 s. Pui greutate săptămânal și încerci să bați seria de top de săptămâna trecută.' },
      { id: 'fri-emom', kind: 'routine', name: 'Power Finisher', dose: 'EMOM × 10 min', line: 'Power Finisher: EMOM × 10 min (Med Ball Chest Throws / Plyo Push Ups)', routine: 'emom-power', min: 10,
        tip: 'Session 2: EMOM 10 minute, alternant. Minutele impare: 6 Med Ball Chest Throws. Minutele pare: 8 Plyo Push Ups. Ce rămâne din minut e pauză. Viteza contează, nu oboseala.' },
      { id: 'fri-core', kind: 'workout', name: 'Core (Circuits)', dose: '9 min', line: '9 min Core: Sit-ups, Hanging Knee Raises, Plank', workout: 'core', min: 9,
        tip: 'În plus față de Hybrid365, la cererea ta (2026-11-20): abdomenul pentru circuite (60 și 40 de abdomene, atârnatul de 90 s). Sit-ups la maxim, ridicări de genunchi atârnat (și priza pentru atârnat), plank. Ultimul, ca să nu obosească trunchiul înainte de forță și înainte de finisherul de putere.' },
    ],
  },
  {
    idx: 5,
    title: 'Long Run',
    blocks: [
      { id: 'sat-long', kind: 'run', name: 'Long Run (Endurance)', dose: '60 min', min: 60, alt: 'aero', grow: { base: 60, step: 5, cap: 90 },
        tip: '60–90 min în zona 2: 10–15 min încălzire ușoară, 45–60 min alergare constantă în ritm de conversație, 5–10 min revenire ușoară. Crește cu 5 minute la fiecare sesiune făcută, până la 90.',
        cues: ['Pulsul în zona 2.', 'Respirație relaxată, ritm lin.', 'Constant: nu urmări ritmul și nu o transforma în tempo.', 'Hidratează-te înainte și după.', 'Termini simțindu-te mai bine decât ai început.'] },
    ],
  },
  {
    idx: 6,
    title: 'Recovery & Mobility',
    blocks: [
      { id: 'sun-walk', kind: 'cardio', name: 'Light Walk / Easy Bike', dose: '8 min', min: 8, tip: '5–10 minute de mers ușor sau bicicletă ușoară: sângele circulă, corpul se încălzește pentru mobilitate.' },
      { id: 'sun-flow', kind: 'routine', name: 'Mobility Flow (Full Body)', dose: '12 min', routine: 'flow', min: 12, tip: '10–15 minute de mobilitate pe tot corpul. Te miști cu intenție, nu cu intensitate. Insiști pe zonele tensionate sau febrile.' },
      { id: 'sun-stretch', kind: 'routine', name: 'Stretching', dose: '12 min', routine: 'stretch', min: 12, tip: '10–15 minute de întinderi, fiecare ținută 45–60 de secunde.' },
      { id: 'sun-foam', kind: 'routine', name: 'Foam Roll / Trigger Point', dose: '6 min', routine: 'foam', min: 6, tip: 'După nevoie: rola sau mingea pe zonele încărcate ale săptămânii.' },
      { id: 'sun-breath', kind: 'breath', name: 'Deep Breathing / Mindset Reset', dose: '5 min', min: 5, tip: 'Aici te faci mai bun: nu sări peste ea. Respirație lentă, apoi te gândești la săptămâna care vine. Hidratează-te, mănâncă bine și prioritizează somnul.' },
    ],
  },
];

export const ALL_BLOCKS: Block[] = WEEK.flatMap((d) => d.blocks);

export function blockById(id: string): Block | undefined {
  return ALL_BLOCKS.find((b) => b.id === id);
}

export function dayOfBlock(id: string): Day | undefined {
  return WEEK.find((d) => d.blocks.some((b) => b.id === id));
}

/** The block as it runs this week: the emphasis of the loop, grown minutes, then the user's picks. Same id either way. */
export function resolveBlock(b: Block, p: Picks): Block {
  let r = b;
  const v = p.cycle ? b.cycle?.[p.cycle] : undefined;
  if (v) r = { ...r, ...v };
  const ev = p.cycle && p.cycleWeek && p.cycleWeek % 2 === 0 ? b.cycleEven?.[p.cycle] : undefined;
  if (ev) r = { ...r, ...ev };
  if (b.id === 'tue-thr') {
    const s = THR_STEPS[Math.min(THR_STEPS.length - 1, Math.max(0, p.thrStep ?? 0))]!;
    r = { ...r, rounds: s.reps, work: s.min * 60, restSec: s.rest, dose: `${s.reps} × ${s.min} min`, line: `${s.reps} × ${s.min} min @ Threshold Pace, ${s.rest} s easy jog` };
  }
  if (b.id === 'wed-cond' && (!p.wedCond || p.wedCond === 'a')) {
    const s = ENGINE_STEPS[Math.min(ENGINE_STEPS.length - 1, Math.max(0, p.engStep ?? 0))]!;
    r = { ...r, rowDose: { reps: s.rounds, rest: s.rest }, dose: `${s.rounds} × 250 m`, line: `Conditioning: Engine Builder ${s.rounds} × 250 m Row, ${s.rest} s rest`,
      tip: `Session 2, Option A: ${s.rounds} runde pe timp de 250 m pe vâslitor (sau SkiErg), cu ${s.rest} s pauză. Provocator, nu maximal. Progresia Hybrid365: densitate mai mare (pauza scade cu 5 s până la 30 s, apoi o rundă în plus), notezi timpul și încerci să-l bați.` };
  }
  if (b.id === 'fri-emom') {
    const s = POWER_STEPS[Math.min(POWER_STEPS.length - 1, Math.max(0, p.powStep ?? 0))]!;
    r = { ...r, min: s.min, dose: `EMOM × ${s.min} min`, line: `Power Finisher: EMOM × ${s.min} min (${s.throws} Med Ball Chest Throws / ${s.plyo} Plyo Push Ups)`,
      tip: `Session 2: EMOM ${s.min} minute, alternant. Minutele impare: ${s.throws} Med Ball Chest Throws. Minutele pare: ${s.plyo} Plyo Push Ups. Ce rămâne din minut e pauză. Viteza contează, nu oboseala: dacă repetările încetinesc, te oprești.` };
  }
  const grown = b.grow ? p.grown?.[b.id] : undefined;
  if (grown && grown !== b.min) r = { ...r, min: grown, dose: `${grown} min` };
  if (r.legSwap) return { ...r, name: p.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit' };
  if (r.alt === 'aero' && p.aero === 'row') {
    return {
      ...r, kind: 'cardio', name: r.name.replace('Run', 'Row'),
      tip: `${r.tip} Azi pe vâslitor, aceeași durată și aceeași zonă 2: cruță genunchii.`,
      cues: ['Ții pulsul în zona 2 de pe centură; dacă trece de ea, tragi mai ușor.', 'Împingi din picioare, apoi spatele, apoi brațele; revii în ordine inversă.'],
    };
  }
  if (r.alt === 'cond' && p.wedCond && COND[p.wedCond]) return { ...r, ...COND[p.wedCond], rowCh: undefined };
  if (r.alt === 'cond' && p.wedCond === 'b') {
    return {
      ...r, kind: 'amrap', name: 'Hybrid Circuit (10 Min AMRAP)', dose: '10 min AMRAP', line: 'Conditioning: Hybrid Circuit, 10 Min AMRAP', min: 10, rowCh: undefined,
      circuit: { moves: ['Wall Balls', 'Burpee Broad Jumps', 'Kettlebell Swings', 'Push Ups'], reps: [10, 10, 10, 10] },
      tip: 'Session 2, Option B: 10 minute, cât mai multe runde din 10 Wall Balls, 10 Burpee Broad Jumps, 10 Kettlebell Swings, 10 Push Ups. Provocator, nu maximal. 2–3 minute de pauză după forță.',
    };
  }
  return r;
}

/** The plan-page line for a block, e.g. "5 × 3 min Shadow Kickboxing". */
export function blockLine(b: Block, p: Picks): string {
  const r = resolveBlock(b, p);
  if (r.kind === 'row') return `${r.name}, ${r.dose}`;
  if (r.line && (r === b || r.line !== b.line)) return r.line;
  return `${r.dose} ${r.name}`;
}

/** The block's name as the user's choices make it. */
export function blockName(b: Block, p: Picks): string {
  return resolveBlock(b, p).name;
}
