// The weekly plan. Built on "Unleash Your Inner Beast" (pages 15-16) and reworked on 2026-11-07 for an all-round
// athlete (strength, power, speed, endurance, mobility and fighting), after the research in research_notes/.
// Inside a day: skill and power first, then strength, then conditioning, and long static stretching last.
// Session and exercise names stay in English, as in the e-book; tips are in Romanian.
// Block ids are stable keys in saved logs and in Beast Nutrition, so they do not name the weekday:
// sun-legs and sun-lunges are on Saturday, sat-mob, sat-med and sat-breath on Sunday.

import { rowChallenge, rowTotal } from './row.ts';

export type BlockKind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'shower' | 'wimhof' | 'breath' | 'row' | 'cardio';
export type ComboFocus = 'jab' | 'move' | 'combo' | 'power' | 'slow' | 'distance' | 'rope' | 'ladder' | 'legs' | 'week';
export type RestKey = 'r3' | 'r1' | 'none';
/** The three emphases of the 12-week loop: strength + aerobic base, power + speed, capacity. */
export type CycleId = 'A' | 'B' | 'C';

/** A punch-out round: 14 × (3 s all-out, 10 s easy) = 182 s, the tested protocol (Kamandulis 2018, Herrera-Valenzuela 2020). */
export const BURST = { on: 3, off: 10, reps: 14 };
export const BURST_SEC = BURST.reps * (BURST.on + BURST.off);

/** What a block becomes in one emphasis of the loop. */
type CycleVariant = Partial<Pick<Block, 'dose' | 'line' | 'rounds' | 'burstFrom' | 'tip'>>;

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
  workout?: 'push' | 'pull' | 'legs';
  routine?: 'stretch-push' | 'stretch-pull' | 'mobility' | 'legwarm' | 'cooldown';
  min?: number;
  /** Quick-timer block: Wall Sit or Jumping Squats, as the user picks. */
  legSwap?: boolean;
  /** What to focus on during the block, a few short cues (Romanian). */
  cues?: string[];
  /** A slot with two alternatives the user picks from (Thursday): see resolveBlock. */
  alt?: 'feet' | 'main' | 'partner';
  /** First boxing block of the day: offers the warm-up before round 1. */
  warmup?: boolean;
  /** From this round on (1-based), every round is a punch-out (see BURST). */
  burstFrom?: number;
  /** Needs the bag: becomes the same protocol in shadow boxing when Thursday's main slot is the rowing machine. */
  bagOnly?: boolean;
  /** Changes in one emphasis of the 12-week loop. */
  cycle?: Partial<Record<CycleId, CycleVariant>>;
  /** Minutes that grow by `step` after each completed session, from `base` to `cap` (easy aerobic work). */
  grow?: { base: number; step: number; cap: number };
}

/** 6-minute warm-up before the first boxing block (Monday, Thursday). */
export const WARMUP: Array<{ name: string; sec: number; cue: string }> = [
  { name: 'Arm Circles', sec: 45, cue: 'Cercuri mari cu brațele, înainte, apoi înapoi.' },
  { name: 'Shoulder Rolls', sec: 45, cue: 'Umerii rotiți larg, apoi mâinile în gardă și înapoi.' },
  { name: 'Torso Twists', sec: 45, cue: 'Rotești trunchiul stânga-dreapta, șoldurile urmează.' },
  { name: 'Hip Circles', sec: 45, cue: 'Mâinile pe șolduri, cercuri largi în ambele sensuri.' },
  { name: 'Leg Swings', sec: 60, cue: 'Balansezi piciorul înainte-înapoi, 30 s pe fiecare.' },
  { name: 'Light Bounce', sec: 60, cue: 'Țopăi ușor pe vârfuri, schimbi garda, scuturi brațele.' },
  { name: 'Easy Shadow', sec: 60, cue: 'Shadow la 50%: jab, cross, pași. Doar ca să pornească motorul.' },
];

export const WARMUP_SEC = WARMUP.reduce((s, m) => s + m.sec, 0);

/** The user's picks for the swappable blocks, plus what the calendar and the log decide this week. */
export interface Picks {
  legMode: 'wall' | 'jump';
  thuFeet: 'rope' | 'ladder';
  thuMain: 'bag' | 'row';
  thuPartner?: 'shadow' | 'spar';
  rowCh: string;
  /** The emphasis running this week, if the loop has started. */
  cycle?: CycleId;
  /** Today's minutes for the blocks that grow (see Block.grow). */
  grown?: Record<string, number>;
}

export interface Day {
  idx: number;
  title: string;
  blocks: Block[];
}

const WRAPS = 'Bandaje și mănuși la fiecare sesiune de sac: mâna e zona cel mai des accidentată la boxeri.';

export const WEEK: Day[] = [
  {
    idx: 0,
    title: 'Combat Training',
    blocks: [
      { id: 'mon-shadow', kind: 'rounds', name: 'Shadow Boxing', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'jab', warmup: true, tip: 'Jab & Footwork: jabul e arma principală, picioarele îl duc în distanță.',
        cues: ['Variezi jabul: simplu, dublu, la corp, din pas înainte și din retragere.', 'Te miști imediat după pumn: înainte, înapoi, lateral. Nu rămâi pe loc.', 'După fiecare serie ieși lateral din linie, cu un pas sau un pivot.', 'Controlezi distanța cu mâna din față; după fiecare secvență revii în gardă, echilibrat.'] },
      { id: 'mon-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'move', tip: 'Punches & Movement: pumni curați legați de jocul de picioare, în ritm moderat.',
        cues: [WRAPS, 'Prioritate la loviturile drepte: jab și cross, întinse complet.', 'Intri în distanță, lovești, ieși: pas lateral sau schimbare de unghi după fiecare combinație.', 'Nu lovi din loc și nu urmări doar puterea: tehnica și poziția primează.'],
        cycle: {
          B: { dose: '2 × 3 min + 3 punch-out', line: '5 runde Heavy Bag: 2 × 3 min, apoi 3 runde punch-out', burstFrom: 3 },
          C: { dose: '2 × 3 min + 3 punch-out', line: '5 runde Heavy Bag: 2 × 3 min, apoi 3 runde punch-out', burstFrom: 3 },
        } },
      { id: 'mon-bw', kind: 'amrap', name: 'Bodyweight Workout', dose: '10 min', min: 10, tip: 'La final, după box, ca oboseala să nu strice tehnica. Pull-ups, push-ups și squats, cât mai multe runde în 10 minute.' },
    ],
  },
  {
    idx: 1,
    title: 'Push Training',
    blocks: [
      { id: 'tue-stretch', kind: 'routine', name: 'Dynamic Warm-up', dose: '10 min', routine: 'stretch-push', min: 10, tip: 'Încălzire în mișcare pentru umeri și șolduri. Întinderile lungi vin la final: ținute înainte de exercițiile explozive, scad puterea.' },
      { id: 'tue-cal', kind: 'workout', name: 'Calisthenics: Chest, Shoulders, Triceps', dose: '45 min', line: '45 min Calisthenics (Chest, Shoulders, Triceps) + Split Squat', workout: 'push', min: 45, tip: 'Push-ups (variante) și dips, cu explozivele primele, plus a doua doză de picioare a săptămânii.' },
      { id: 'tue-easy', kind: 'rounds', name: 'Easy Shadow Boxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'slow', tip: 'Slow, Clean Strikes: fiecare lovitură lentă, precisă, deliberată.',
        cues: ['Calitatea bate viteza, volumul și puterea. Nu grăbi combinațiile.', 'Aliniere corectă: pumnul, cotul și umărul pe aceeași linie, brațul întins complet.', 'Greutatea se mută controlat, din picior și șold; rămâi în echilibru.', 'Mâna revine la bărbie după fiecare lovitură, garda nu cade.'] },
      { id: 'tue-row', kind: 'cardio', name: 'Easy Row', dose: '20 min', min: 20, grow: { base: 20, step: 5, cap: 30 }, tip: 'Aerob ușor, în ritm de conversație. Fără aparat: bicicletă sau alergare ușoară. Crește cu 5 minute la fiecare sesiune făcută, până la 30.',
        cues: ['Poți vorbi în propoziții tot timpul. Dacă nu, încetinește.', 'Împingi din picioare, apoi spatele, apoi brațele; revii în ordine inversă.', 'Vine după forță, nu înainte.'] },
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
      { id: 'thu-rope', kind: 'rounds', name: 'Jumping Rope', dose: '3 × 3 min', rounds: 3, work: 180, rest: 'r3', focus: 'rope', alt: 'feet', warmup: true, tip: 'Încălzire pentru picioare: joc ușor, pe vârfuri. Puterea vine după, cât ești proaspăt.' },
      { id: 'thu-shadow', kind: 'rounds', name: 'Shadow Boxing', dose: '3 × 3 min', rounds: 3, work: 180, rest: 'r3', focus: 'combo', alt: 'partner', tip: 'Combinations: combinații cu pregătire, ordine clară și ieșire controlată.',
        cues: ['Fiecare combinație are un scop: o pregătești cu jabul sau o fentă.', 'Loviturile curg una din alta, fără pauze, fără să pierzi echilibrul.', 'Lucrezi și de la distanță lungă, și combinații care se termină într-un unghi nou.', 'Garda rămâne sus: nu arunca pumni izolați, fără sens.'] },
      { id: 'thu-power', kind: 'rounds', name: 'Punch-out', dose: '3 × 14 × 3 s', line: '3 runde punch-out: 14 × 3 s la maxim, 10 s ușor', rounds: 3, work: BURST_SEC, restSec: 60, focus: 'power', burstFrom: 1, bagOnly: true,
        tip: 'Protocolul testat pe boxeri: 14 explozii de 3 secunde la maxim, cu 10 secunde ușor între ele, de trei ori. Cam 2 minute de efort maxim în total.',
        cues: [WRAPS, 'Lovește prin sac, nu în el: ținta e la o palmă în spatele suprafeței.', 'Mâna pleacă și se întoarce ca un bici; în cele 10 secunde doar respiri și te miști.', 'Dacă exploziile încetinesc vizibil, oprește runda.'] },
      { id: 'thu-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '6 × 3 min', rounds: 6, work: 180, rest: 'r3', focus: 'power', alt: 'main', tip: 'Angle Changes & Power: unghiuri și putere tehnică, nu la maxim.',
        cues: [WRAPS, 'Ieși de pe linia centrală înainte sau după combinație: pas lateral, pivot, repoziționare.', 'Împinge podeaua cu piciorul din spate și trimite pumnul prin sac.', 'Nicio lovitură puternică pe tehnică proastă sau din poziție greșită.'],
        cycle: { C: { rounds: 8, dose: '8 × 3 min' } } },
    ],
  },
  {
    idx: 4,
    title: 'Pull Training',
    blocks: [
      { id: 'fri-stretch', kind: 'routine', name: 'Dynamic Warm-up', dose: '10 min', routine: 'stretch-pull', min: 10, tip: 'Încălzire în mișcare pentru umeri, omoplați și priză, înainte de tracțiuni.' },
      { id: 'fri-cal', kind: 'workout', name: 'Calisthenics: Back, Biceps, Shoulders', dose: '50 min', line: "50 min Calisthenics (Back, Biceps, Shoulders) + Farmer's Carry", workout: 'pull', min: 50, tip: 'Pull-ups (variante), ramat, umărul posterior, plus cărat greutăți pentru priză și trunchi.' },
      { id: 'fri-easy', kind: 'rounds', name: 'Easy Shadow Boxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'distance', tip: 'Distance Work: controlul distanței e obiectivul principal.',
        cues: ['Stai la capătul jabului: găsești distanța exactă de lovit și o păstrezi.', 'Intri și ieși din distanță: înainte, înapoi, lateral.', 'Leagă distanța de momentul combinației: știi când angajezi și când rămâi afară.', 'După ce lovești, recuperezi distanța imediat.'] },
    ],
  },
  {
    idx: 5,
    title: 'Leg Day',
    blocks: [
      { id: 'sun-legs', kind: 'routine', name: 'Leg Day Warm-up', dose: '10 min', routine: 'legwarm', min: 10, tip: 'Ridici pulsul, mobilizezi șoldurile și termini cu accelerări progresive, ca să fii gata de sprint și sărituri.' },
      { id: 'sun-lunges', kind: 'workout', name: 'Speed, Power & Leg Strength', dose: '60 min', line: '60 min Sprints, Jumps, Throws, Leg Strength', workout: 'legs', min: 60, tip: 'Viteza și săriturile primele, cât ești proaspăt, apoi forța cu greutate. Forța de picioare e legată cel mai direct de impactul pumnului.' },
    ],
  },
  {
    idx: 6,
    title: 'Mobility & Meditation Day',
    blocks: [
      { id: 'sun-jog', kind: 'run', name: 'Jogging', dose: '20 min', min: 20, grow: { base: 20, step: 2, cap: 30 }, tip: 'Ritm de conversație, fără țintă de ritm. Crește cu 2 minute la fiecare alergare făcută, până la 30.' },
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
  const grown = b.grow ? p.grown?.[b.id] : undefined;
  if (grown && grown !== b.min) r = { ...r, min: grown, dose: `${grown} min` };
  if (r.legSwap) return { ...r, name: p.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit' };
  if (r.bagOnly && p.thuMain === 'row') {
    return { ...r, name: 'Punch-out Shadow', tip: 'Fără sac azi: același protocol în shadow boxing, lovituri drepte cât de rapid poți, cu șoldul și trunchiul în fiecare pumn.', cues: ['Brațul se întinde complet, pe toată distanța.', 'În cele 10 secunde doar respiri și te miști.', 'Dacă exploziile încetinesc vizibil, oprește runda.'] };
  }
  if (r.alt === 'feet' && p.thuFeet === 'ladder') {
    return { ...r, name: 'Agility Ladder', focus: 'ladder', tip: 'Pași rapizi și preciși prin scară, pe vârfuri, cu garda sus.', cues: undefined };
  }
  if (r.alt === 'partner' && p.thuPartner === 'spar') {
    return {
      ...r, name: 'Technical Sparring / Pads', focus: undefined,
      tip: 'Partea pe care niciun timer nu o înlocuiește: reacționezi la un om. Mănuși cu antrenorul sau sparring tehnic, controlat.',
      cues: ['Cu un antrenor de față, cască, proteză și mănuși de sparring.', 'Tehnic, nu la KO: dacă ritmul crește, vă opriți și reluați.', 'Lucrezi la distanța ta: jab, ieșire, unghi.'],
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

/** The plan-page line for a block, e.g. "5 × 3 min Shadow Boxing". */
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
