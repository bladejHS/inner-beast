// The weekly plan. Built on "Unleash Your Inner Beast" (pages 15-16) and reworked on 2026-11-07 for an all-round
// athlete (strength, power, speed, endurance, mobility and fighting), after the research in research_notes/.
// Inside a day: skill and power first, then strength, then conditioning, and long static stretching last.
// While jumps hurt the user's knees (2026-11-07), the power work has no landings: see the legs workout.
// The fighting blocks are kickboxing since 2026-11-07, for the user's 2 m (see data/combos.ts): block ids, rounds and
// rests are the e-book's, the names, tips and cues are kickboxing ones.
// Session and exercise names stay in English, as in the e-book; tips are in Romanian.
// Block ids are stable keys in saved logs and in Beast Nutrition, so they do not name the weekday:
// sun-legs and sun-lunges are on Saturday, sat-mob, sat-med and sat-breath on Sunday.

import { rowChallenge, rowTotal } from './row.ts';

export type BlockKind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'shower' | 'wimhof' | 'breath' | 'row' | 'cardio';
export type ComboFocus = 'jab' | 'move' | 'combo' | 'power' | 'slow' | 'distance' | 'rope' | 'ladder' | 'legs' | 'week' | 'pads';
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
  workout?: 'push' | 'pull' | 'legs' | 'upper' | 'knee' | 'kick';
  routine?: 'stretch-push' | 'stretch-pull' | 'mobility' | 'legwarm' | 'cooldown';
  min?: number;
  /** Quick-timer block: Wall Sit or Jumping Squats, as the user picks. */
  legSwap?: boolean;
  /** What to focus on during the block, a few short cues (Romanian). */
  cues?: string[];
  /** A slot with two alternatives the user picks from (Thursday, Sunday): see resolveBlock. */
  alt?: 'feet' | 'main' | 'partner' | 'aero';
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
  thuFeet: 'rope' | 'ladder';
  thuMain: 'bag' | 'row';
  thuPartner?: 'shadow' | 'spar';
  rowCh: string;
  /** The emphasis running this week, if the loop has started, and its week (1-4). */
  cycle?: CycleId;
  cycleWeek?: number;
  /** Sunday's easy aerobic slot: run, or row (kinder to the knees). */
  sunAero?: 'run' | 'row';
  /** Today's minutes for the blocks that grow (see Block.grow). */
  grown?: Record<string, number>;
}

export interface Day {
  idx: number;
  title: string;
  blocks: Block[];
}

const WRAPS = 'Bandaje și mănuși la fiecare sesiune de sac. Tibia se obișnuiește treptat: primele săptămâni lovești ușor cu picioarele, apoi crești puterea de la o săptămână la alta.';
/** The knee rule for every kick (FightCamp; the pivot foot carries the risk, JSSM 2021). */
const PIVOT = 'La fiecare kick: pivot pe vârful piciorului de sprijin, până când călcâiul ajunge spre țintă. Pe o talpă care se agață (adidași, cauciuc) genunchiul se răsucește: lovești desculț, pe o suprafață pe care piciorul se poate roti.';

/** Eight minutes for the knees, after Tuesday's push session and after Leg Day, while jumps hurt them. */
const KNEE_ARMOR = (id: string): Block => ({
  id, kind: 'workout', name: 'Knee Armor', dose: '8 min', line: '8 min Knee Armor: Isometric Hold, Step-downs, Tibialis', workout: 'knee', min: 8,
  tip: 'Pentru genunchi: ținute izometrice, coborâri lente de pe treaptă și tibia. Durerea poate fi cel mult 3 din 10; dacă trece, cobori mai puțin.',
});

/** Ten minutes for kicking, on Friday: the adductors, the hip that keeps the knee in line, the supporting leg. */
const KICK_ARMOR: Block = {
  id: 'kick-fri', kind: 'workout', name: 'Kick Armor', dose: '10 min', line: '10 min Kick Armor: Copenhagen Plank, Side Plank, Hip Airplane', workout: 'kick', min: 10,
  tip: 'Pentru kick-uri: adductorii, care lucrează la fiecare kick și check (un program construit pe Copenhagen Plank a scăzut cu 41% problemele inghinale la fotbaliști), fesierul mijlociu, care ține genunchiul aliniat când pivotezi, și piciorul de sprijin.',
};

/** Hard intervals on the rower: 4 × 4 min at 85–95 % of the maximum heart rate, 3 min easy between. */
const ROWER_4X4: CycleVariant = {
  kind: 'rounds', name: 'Rower Intervals', dose: '4 × 4 min', line: '4 × 4 min Rower Intervals, 3 min ușor între ele', rounds: 4, work: 240, restSec: 180, hiit: true,
  tip: 'VO2max: patru intervale de 4 minute, tare dar egal, la 85–95% din pulsul maxim, cu 3 minute de vâslit ușor între ele. Pe vâslitor genunchii nu iau impact.',
  cues: ['Primul interval mai temperat: pulsul urcă abia în minutul doi.', 'Tragi cu picioarele, apoi spatele, apoi brațele; ritm egal, nu sprint.', 'În pauză nu te oprești: vâslești ușor, pulsul coboară.'],
};

export const WEEK: Day[] = [
  {
    idx: 0,
    title: 'Combat Training',
    blocks: [
      { id: 'mon-shadow', kind: 'rounds', name: 'Shadow Kickboxing', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'jab', warmup: true, tip: 'Jab, Teep & Footwork: jabul și teep-ul țin distanța, picioarele te duc unde vrei. Pentru omul mai lung, loviturile drepte sunt regele.',
        cues: ['Variezi jabul și teep-ul: simplu, dublu, la corp, din pas înainte și din retragere.', 'Teep când îți imaginezi că intră: îl oprești la capătul piciorului tău.', 'După fiecare serie ieși în cerc sau pivotezi; nu te retragi în linie dreaptă.', 'Stai înalt și lovești în jos: nu te apleca ca să-l ajungi.'] },
      { id: 'mon-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'move', tip: 'Strikes & Movement: pumni și low kick-uri legate de jocul de picioare, în ritm moderat.',
        cues: [WRAPS, PIVOT, 'Jab și cross întinse complet, apoi piciorul: 1-2-low kick și ieși în unghi.', 'Nu lovi din loc și nu urmări doar puterea: tehnica și poziția primează.'],
        cycle: {
          B: { dose: '2 × 3 min + 3 punch-out', line: '5 runde Heavy Bag: 2 × 3 min, apoi 3 runde punch-out', burstFrom: 3 },
          C: { dose: '2 × 3 min + 3 punch-out', line: '5 runde Heavy Bag: 2 × 3 min, apoi 3 runde punch-out', burstFrom: 3 },
        } },
      { id: 'mon-bw', kind: 'amrap', name: 'Bodyweight Workout', dose: '10 min', min: 10, tip: 'La final, după kickboxing, ca oboseala să nu strice tehnica. Pull-ups, push-ups și squats, cât mai multe runde în 10 minute.',
        cycle: {
          // the second strength dose for pulling and pressing, in the strength emphasis (approved by the user on 2026-11-07)
          A: { kind: 'workout', workout: 'upper', name: 'Upper Strength', dose: '15 min', line: '15 min Upper Strength: Pull-ups, Dips', min: 15, tip: 'A doua doză de forță a săptămânii pentru tras și împins: tracțiuni și dips, 3 × 3–5 grele, cu 2 repetări în rezervă și 150 s pauză. La final, după kickboxing.' },
        },
        // VO2max on the rower, every other week of the power and capacity emphases (4 × 4 min, Helgerud 2007)
        cycleEven: { B: ROWER_4X4, C: ROWER_4X4 } },
    ],
  },
  {
    idx: 1,
    title: 'Push Training',
    blocks: [
      { id: 'tue-stretch', kind: 'routine', name: 'Dynamic Warm-up', dose: '10 min', routine: 'stretch-push', min: 10, tip: 'Încălzire în mișcare pentru umeri și șolduri. Întinderile lungi vin la final: ținute înainte de exercițiile explozive, scad puterea.' },
      { id: 'tue-cal', kind: 'workout', name: 'Calisthenics: Chest, Shoulders, Triceps', dose: '45 min', line: '45 min Calisthenics (Chest, Shoulders, Triceps) + Split Squat', workout: 'push', min: 45, tip: 'Push-ups (variante) și dips, cu explozivele primele, plus a doua doză de picioare a săptămânii.' },
      KNEE_ARMOR('knee-tue'),
      { id: 'tue-easy', kind: 'rounds', name: 'Easy Shadow Kickboxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'slow', tip: 'Slow, Clean Technique: fiecare lovitură de picior lentă, pe bucăți, ca să-i înveți mecanica.',
        cues: ['Kick-urile la jumătate de viteză: genunchiul sus, pivot pe vârf, șoldul prin țintă, revii în gardă.', 'Echilibrul înaintea vitezei: dacă nu revii stabil, încetinești.', 'Check-ul: genunchiul din față sus, tibia ușor în afară, garda sus.', 'Pumnii întinși complet, iar mâna revine la bărbie după fiecare lovitură.'] },
      { id: 'tue-row', kind: 'cardio', name: 'Easy Row', dose: '20 min', min: 20, grow: { base: 20, step: 5, cap: 30 }, tip: 'Aerob ușor pe vâslitor, în zona 2 de puls: ritm de conversație. Crește cu 5 minute la fiecare sesiune făcută, până la 30.',
        cues: ['Ții pulsul în zona 2 de pe centură; dacă trece de ea, tragi mai ușor.', 'Împingi din picioare, apoi spatele, apoi brațele; revii în ordine inversă.', 'Vine după forță, nu înainte.'] },
      { id: 'tue-cool', kind: 'routine', name: 'Cool-down Stretch', dose: '5 min', routine: 'cooldown', min: 5, tip: 'A doua zi de flexibilitate a săptămânii: piept, dorsali și flexorii șoldului, câte 60 de secunde.' },
    ],
  },
  {
    idx: 2,
    title: 'Off Day',
    blocks: [
      { id: 'wed-walk', kind: 'walk', name: 'Walk (10K Steps)', dose: '10.000 de pași', line: 'Going for a Walk (10K Steps)', tip: 'Mergi prin natură, în ritmul tău. E singura zi liberă: o păstrezi ușoară.' },
      { id: 'wed-shower', kind: 'shower', name: 'Cold & Warm Showers', dose: '1 min rece, 1 min cald', line: 'Cold & Warm Showers', tip: 'Duș alternativ: îți antrenează toleranța la frig și te trezește. Nu e dovedit că grăbește recuperarea. E bine plasat aici, departe de zilele de forță.' },
      { id: 'wed-med', kind: 'wimhof', name: 'Meditation', dose: 'Wim Hof', line: 'Meditation', tip: 'Găsește un loc liniștit. Wim Hof doar așezat sau întins, niciodată în duș, în apă sau la volan.' },
    ],
  },
  {
    idx: 3,
    title: 'Combat Training II',
    blocks: [
      { id: 'thu-rope', kind: 'rounds', name: 'Jumping Rope', dose: '3 × 3 min', rounds: 3, work: 180, rest: 'r3', focus: 'rope', alt: 'feet', warmup: true, tip: 'Încălzire pentru picioare: joc ușor, pe vârfuri, sărituri de 1–2 cm pe o suprafață care amortizează. Dacă simți genunchii, alege Agility Ladder.' },
      { id: 'thu-shadow', kind: 'rounds', name: 'Shadow Kickboxing', dose: '3 × 3 min', rounds: 3, work: 180, rest: 'r3', focus: 'combo', alt: 'partner', tip: 'Combinations: pumni și picioare legate, cu pregătire, ordine clară și ieșire controlată.',
        cues: ['Fiecare combinație are un scop: o pregătești cu jabul, cu teep-ul sau cu o fentă.', 'Stil olandez: pumnii pregătesc, piciorul închide; după kick ieși în unghi.', 'Lovitura de după vine din șoldul pe care l-a încărcat cea dinainte (Ernesto Hoost).', 'Garda rămâne sus și când lovești cu piciorul: o mână e mereu la bărbie.'] },
      { id: 'thu-power', kind: 'rounds', name: 'Punch-out', dose: '3 × 14 × 3 s', line: '3 runde punch-out: 14 × 3 s la maxim, 10 s ușor', rounds: 3, work: BURST_SEC, restSec: 60, focus: 'power', burstFrom: 1, bagOnly: true,
        tip: 'Protocolul testat pe boxeri: 14 explozii de 3 secunde la maxim, cu 10 secunde ușor între ele, de trei ori. Cam 2 minute de efort maxim în total.',
        cues: [WRAPS, 'Lovește prin sac, nu în el: ținta e la o palmă în spatele suprafeței.', 'Mâna pleacă și se întoarce ca un bici; în cele 10 secunde doar respiri și te miști.', 'Dacă exploziile încetinesc vizibil, oprește runda.'] },
      { id: 'thu-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '6 × 3 min', rounds: 6, work: 180, rest: 'r3', focus: 'power', alt: 'main', tip: 'Dutch Combinations & Power: pumnii pregătesc, piciorul închide. Putere tehnică, nu la maxim.',
        cues: [WRAPS, PIVOT, 'Kick-ul trece prin sac, cu tibia, nu cu laba; brațul de pe partea lui coboară, cealaltă mână stă la bărbie.', 'Nicio lovitură puternică pe tehnică proastă sau din poziție greșită.'],
        cycle: { C: { rounds: 8, dose: '8 × 3 min' } } },
    ],
  },
  {
    idx: 4,
    title: 'Pull Training',
    blocks: [
      { id: 'fri-stretch', kind: 'routine', name: 'Dynamic Warm-up', dose: '10 min', routine: 'stretch-pull', min: 10, tip: 'Încălzire în mișcare pentru umeri, omoplați și priză, înainte de tracțiuni.' },
      { id: 'fri-cal', kind: 'workout', name: 'Calisthenics: Back, Biceps, Shoulders', dose: '50 min', line: "50 min Calisthenics (Back, Biceps, Shoulders) + Farmer's Carry", workout: 'pull', min: 50, tip: 'Pull-ups (variante), ramat, umărul posterior, plus cărat greutăți pentru priză și trunchi.' },
      KICK_ARMOR,
      { id: 'fri-easy', kind: 'rounds', name: 'Easy Shadow Kickboxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'distance', tip: 'Distance Work: controlul distanței e obiectivul principal. La 2 m, distanța lungă e a ta.',
        cues: ['Stai la capătul jabului și al teep-ului: tu ajungi la el, el nu ajunge la tine.', 'Pe pasul lui: teep sau low kick exact când pune piciorul jos.', 'Când te presează, ieși în cerc; înapoi în linie dreaptă ajungi la corzi.', 'Dacă ajunge aproape: genunchi, antebrațele pe umerii lui, apoi ieși.'] },
    ],
  },
  {
    idx: 5,
    title: 'Leg Day',
    blocks: [
      { id: 'sun-legs', kind: 'routine', name: 'Leg Day Warm-up', dose: '10 min', routine: 'legwarm', min: 10, tip: 'Ridici pulsul, mobilizezi șoldurile și termini cu accelerări progresive, ca să fii gata de sprinturi și aruncări. Fără sărituri.' },
      { id: 'sun-lunges', kind: 'workout', name: 'Speed, Power & Leg Strength', dose: '60 min', line: '60 min Sprints, Med Ball Power, Leg Strength', workout: 'legs', min: 60, tip: 'Viteza și puterea primele, cât ești proaspăt: sprinturi în pantă și aruncări cu mingea medicinală, fără aterizări pe genunchi. Apoi forța: Bulgarian Split Squat cu gantere și Romanian Deadlift cu bara. Forța de picioare e legată cel mai direct de impactul pumnului.' },
      KNEE_ARMOR('knee-sat'),
    ],
  },
  {
    idx: 6,
    title: 'Mobility & Meditation Day',
    blocks: [
      { id: 'sun-jog', kind: 'run', name: 'Jogging', dose: '20 min', min: 20, alt: 'aero', grow: { base: 20, step: 2, cap: 40 }, tip: 'Ritm de conversație, în zona 2 de puls, fără țintă de ritm: dacă pulsul trece de zonă, încetinești sau mergi până coboară. Crește cu 2 minute la fiecare sesiune făcută, până la 40. Cât timp genunchii se plâng, alegi vâslitul.' },
      { id: 'sat-mob', kind: 'routine', name: 'Mobility Training', dose: '30 min', routine: 'mobility', min: 30, tip: 'Stretching pentru picioare, șolduri și partea de sus a corpului. Crește amplitudinea, nu viteza recuperării.' },
      { id: 'sat-med', kind: 'wimhof', name: 'Meditation', dose: '10 min', min: 10, tip: 'Respirația Wim Hof, așezat sau întins, apoi liniște.' },
      { id: 'sat-breath', kind: 'breath', name: 'Breathing Exercises', dose: '10 min', min: 10, tip: 'Metoda de respirație 4-7-8.' },
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
  const grown = b.grow ? p.grown?.[b.id] : undefined;
  if (grown && grown !== b.min) r = { ...r, min: grown, dose: `${grown} min` };
  if (r.legSwap) return { ...r, name: p.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit' };
  if (r.bagOnly && p.thuMain === 'row') {
    return { ...r, name: 'Punch-out Shadow', tip: 'Fără sac azi: același protocol în shadow, lovituri drepte cât de rapid poți, cu șoldul și trunchiul în fiecare pumn.', cues: ['Brațul se întinde complet, pe toată distanța.', 'În cele 10 secunde doar respiri și te miști.', 'Dacă exploziile încetinesc vizibil, oprește runda.'] };
  }
  if (r.alt === 'feet' && p.thuFeet === 'ladder') {
    return { ...r, name: 'Agility Ladder', focus: 'ladder', tip: 'Pași rapizi și preciși prin scară, pe vârfuri, cu garda sus.', cues: undefined };
  }
  if (r.alt === 'partner' && p.thuPartner === 'spar') {
    return {
      ...r, name: 'Technical Sparring / Pads', focus: 'pads',
      tip: 'Partea pe care niciun timer nu o înlocuiește: reacționezi la un om. Thai pads: partenerul ține, tu lovești, iar în runda a treia atacă el, lent, și tu răspunzi. Aplicația vă strigă amândurora ce urmează. La sparring tehnic oprești combinațiile strigate.',
      cues: ['Tibiere amândoi la exercițiile cu low kick și check; el atacă lent și controlat.', 'Pernele ținute ferm, cu cotul îndoit, aduse puțin în lovitură.', 'Sparring doar cu un antrenor de față, cu cască, proteză și mănuși de sparring.'],
    };
  }
  if (r.alt === 'aero' && (p.sunAero ?? 'row') === 'row') {
    return {
      ...r, kind: 'cardio', name: 'Easy Row',
      tip: 'Aerob ușor pe vâslitor, în zona 2 de puls: ritm de conversație. Cruță genunchii cât timp alergarea îi supără. Crește cu 2 minute la fiecare sesiune făcută, până la 40.',
      cues: ['Ții pulsul în zona 2 de pe centură; dacă trece de ea, tragi mai ușor.', 'Împingi din picioare, apoi spatele, apoi brațele; revii în ordine inversă.'],
    };
  }
  if (r.alt === 'main' && p.thuMain === 'row') {
    const c = rowChallenge(p.rowCh);
    return {
      ...r, kind: 'row', name: 'Machine Row', dose: `${c.name}: ${c.label}`, rounds: undefined, work: undefined, rest: undefined, focus: undefined, cues: undefined, cycle: undefined, min: c.min,
      tip: c.reps > 1 ? `${c.reps} intervale de ${c.meters} m (${rowTotal(c)} m), ${c.rest} s pauză între ele.` : `${c.label} continuu, într-un ritm pe care îl poți ține.`,
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
