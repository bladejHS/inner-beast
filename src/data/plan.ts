// The weekly plan from "Unleash Your Inner Beast" (pages 15-16).
// Session and exercise names stay in English, as in the e-book; tips are in Romanian.

import { rowChallenge, rowTotal } from './row.ts';

export type BlockKind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'shower' | 'wimhof' | 'breath' | 'row';
export type ComboFocus = 'jab' | 'move' | 'combo' | 'power' | 'slow' | 'distance' | 'rope' | 'ladder' | 'legs' | 'week';
export type RestKey = 'r3' | 'r1' | 'none';

export interface Block {
  id: string;
  kind: BlockKind;
  name: string;
  /** Short dose line, e.g. "5 × 3 min". */
  dose: string;
  /** The line as the e-book's plan page prints it, when it differs from "dose name". */
  line?: string;
  /** The e-book's tip for this block, in Romanian. */
  tip: string;
  rounds?: number;
  work?: number;
  rest?: RestKey;
  focus?: ComboFocus;
  workout?: 'push' | 'pull' | 'legs';
  routine?: 'stretch-push' | 'stretch-pull' | 'mobility';
  min?: number;
  /** Sunday block: Wall Sit while starting out, Jumping Squats later. */
  legSwap?: boolean;
  /** What to focus on during the block, a few short cues (Romanian). */
  cues?: string[];
  /** A slot with two alternatives the user picks from (Thursday): see resolveBlock. */
  alt?: 'feet' | 'main';
  /** First boxing block of the day: offers the warm-up before round 1. */
  warmup?: boolean;
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

/** The user's picks for the swappable blocks (a subset of the settings). */
export interface Picks {
  legMode: 'wall' | 'jump';
  thuFeet: 'rope' | 'ladder';
  thuMain: 'bag' | 'row';
  rowCh: string;
}

export interface Day {
  idx: number;
  title: string;
  blocks: Block[];
}

export const WEEK: Day[] = [
  {
    idx: 0,
    title: 'Combat Training',
    blocks: [
      { id: 'mon-shadow', kind: 'rounds', name: 'Shadow Boxing', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'jab', warmup: true, tip: 'Jab & Footwork: jabul e arma principală, picioarele îl duc în distanță.',
        cues: ['Variezi jabul: simplu, dublu, la corp, din pas înainte și din retragere.', 'Te miști imediat după pumn: înainte, înapoi, lateral. Nu rămâi pe loc.', 'Pașii mici și preciși, distanța dintre tălpi rămâne aceeași.', 'Controlezi distanța cu mâna din față; după fiecare secvență revii în gardă, echilibrat.'] },
      { id: 'mon-bw', kind: 'amrap', name: 'Bodyweight Workout', dose: '10 min', min: 10, tip: 'Squats, push-ups și pull-ups, cât mai multe runde în 10 minute.' },
      { id: 'mon-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'move', tip: 'Punches & Movement: pumni curați legați de jocul de picioare.',
        cues: ['Prioritate la loviturile drepte: jab și cross, întinse complet.', 'Intri în distanță, lovești, ieși: pas lateral sau schimbare de unghi după fiecare combinație.', 'Nu lovi din loc și nu urmări doar puterea: tehnica și poziția primează.'] },
    ],
  },
  {
    idx: 1,
    title: 'Push Training',
    blocks: [
      { id: 'tue-stretch', kind: 'routine', name: 'Full Body Stretching', dose: '15 min', routine: 'stretch-push', min: 15, tip: 'Încălzirea umerilor înainte de flotări.' },
      { id: 'tue-cal', kind: 'workout', name: 'Calisthenics: Chest, Shoulders, Triceps', dose: '60 min', line: '60 min Calisthenics (Chest, Shoulders, Triceps)', workout: 'push', min: 60, tip: 'Push-ups (variante) și dips.' },
      { id: 'tue-easy', kind: 'rounds', name: 'Easy Shadow Boxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'slow', tip: 'Slow, Clean Strikes: fiecare lovitură lentă, precisă, deliberată.',
        cues: ['Calitatea bate viteza, volumul și puterea. Nu grăbi combinațiile.', 'Aliniere corectă: pumnul, cotul și umărul pe aceeași linie, brațul întins complet.', 'Greutatea se mută controlat, din picior și șold; rămâi în echilibru.', 'Mâna revine la bărbie după fiecare lovitură, garda nu cade.'] },
    ],
  },
  {
    idx: 2,
    title: 'Off Day',
    blocks: [
      { id: 'wed-walk', kind: 'walk', name: 'Walk (10K Steps)', dose: '10.000 de pași', line: 'Going for a Walk (10K Steps)', tip: 'Mergi prin natură.' },
      { id: 'wed-shower', kind: 'shower', name: 'Cold & Warm Showers', dose: '1 min rece, 1 min cald', line: 'Cold & Warm Showers', tip: 'Recuperare la rece: frigul călește corpul, imunitatea și mintea.' },
      { id: 'wed-med', kind: 'wimhof', name: 'Meditation', dose: 'Wim Hof', line: 'Meditation', tip: 'Găsește un loc liniștit.' },
    ],
  },
  {
    idx: 3,
    title: 'Combat Training II',
    blocks: [
      { id: 'thu-rope', kind: 'rounds', name: 'Jumping Rope', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'rope', alt: 'feet', warmup: true, tip: 'Concentrează-te pe un joc de picioare ușor.' },
      { id: 'thu-shadow', kind: 'rounds', name: 'Shadow Boxing', dose: '3 × 3 min', rounds: 3, work: 180, rest: 'r3', focus: 'combo', tip: 'Combinations: combinații cu pregătire, ordine clară și ieșire controlată.',
        cues: ['Fiecare combinație are un scop: o pregătești cu jabul sau o fentă.', 'Loviturile curg una din alta, fără pauze, fără să pierzi echilibrul.', 'Lucrezi și de la distanță lungă, și combinații care se termină într-un unghi nou.', 'Garda rămâne sus: nu arunca pumni izolați, fără sens.'] },
      { id: 'thu-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '10 × 3 min', rounds: 10, work: 180, rest: 'r3', focus: 'power', alt: 'main', tip: 'Angle Changes & Power: putere reală, fără să strici tehnica.',
        cues: ['Ieși de pe linia centrală înainte sau după combinație: pas lateral, pivot, repoziționare.', 'Combinațiile se termină cu un unghi nou sau o ieșire controlată.', 'Puterea vine din transferul greutății: picior, șold, umăr. Rămâi în echilibru.', 'Nicio lovitură puternică pe tehnică proastă sau din poziție greșită.'] },
    ],
  },
  {
    idx: 4,
    title: 'Pull Training',
    blocks: [
      { id: 'fri-stretch', kind: 'routine', name: 'Full Body Stretching', dose: '15 min', routine: 'stretch-pull', min: 15, tip: 'Încălzirea umerilor înainte de tracțiuni.' },
      { id: 'fri-cal', kind: 'workout', name: 'Calisthenics: Back, Biceps, Shoulders', dose: '60 min', line: '60 min Calisthenics (Back, Biceps, Shoulders)', workout: 'pull', min: 60, tip: 'Pull-ups (variante).' },
      { id: 'fri-easy', kind: 'rounds', name: 'Easy Shadow Boxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'distance', tip: 'Distance Work: controlul distanței e obiectivul principal.',
        cues: ['Stai la capătul jabului: găsești distanța exactă de lovit și o păstrezi.', 'Intri și ieși din distanță: înainte, înapoi, lateral.', 'Leagă distanța de momentul combinației: știi când angajezi și când rămâi afară.', 'După ce lovești, recuperezi distanța imediat.'] },
    ],
  },
  {
    idx: 5,
    title: 'Mobility & Meditation Day',
    blocks: [
      { id: 'sat-mob', kind: 'routine', name: 'Mobility Training', dose: '30 min', routine: 'mobility', min: 30, tip: 'Stretching pentru picioare, șolduri și partea de sus a corpului.' },
      { id: 'sat-med', kind: 'wimhof', name: 'Meditation', dose: '10 min', min: 10, tip: 'Respirația Wim Hof, apoi liniște.' },
      { id: 'sat-breath', kind: 'breath', name: 'Breathing Exercises', dose: '10 min', min: 10, tip: 'Metoda de respirație 4-7-8.' },
    ],
  },
  {
    idx: 6,
    title: 'Leg Day',
    blocks: [
      { id: 'sun-jog', kind: 'run', name: 'Jogging', dose: '20 min', min: 20, tip: 'Începe încet, respiră calm, crește viteza încet și constant.' },
      { id: 'sun-legs', kind: 'rounds', name: 'Wall Sit', dose: '10 × 1 min', rounds: 10, work: 60, rest: 'r1', focus: 'legs', legSwap: true, tip: 'Începi cu Wall Sit. Treci la Jumping Squats când ești pregătit.' },
      { id: 'sun-lunges', kind: 'workout', name: 'Lunges', dose: '4 × 15 pe parte', line: '4 × 15 Lunges (each side)', workout: 'legs', tip: '4 serii × 15 pe fiecare picior.' },
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

/** The alternatives of a swappable slot, as the user picked them. Same id, so either one checks off the slot. */
export function resolveBlock(b: Block, p: Picks): Block {
  if (b.legSwap) return { ...b, name: p.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit' };
  if (b.alt === 'feet' && p.thuFeet === 'ladder') {
    return { ...b, name: 'Agility Ladder', focus: 'ladder', tip: 'Pași rapizi și preciși prin scară, pe vârfuri, cu garda sus.', cues: undefined };
  }
  if (b.alt === 'main' && p.thuMain === 'row') {
    const c = rowChallenge(p.rowCh);
    return {
      ...b, kind: 'row', name: 'Machine Row', dose: `${c.name}: ${c.label}`, rounds: undefined, work: undefined, rest: undefined, focus: undefined, cues: undefined, min: c.min,
      tip: c.reps > 1 ? `${c.reps} intervale de ${c.meters} m (${rowTotal(c)} m), ${c.rest} s pauză între ele.` : `${c.label} continuu, într-un ritm pe care îl poți ține.`,
    };
  }
  return b;
}

/** The plan-page line for a block, e.g. "5 × 3 min Shadow Boxing". */
export function blockLine(b: Block, p: Picks): string {
  const r = resolveBlock(b, p);
  if (r !== b) return `${r.kind === 'row' ? '' : `${r.dose} `}${r.name}${r.kind === 'row' ? `, ${r.dose}` : ''}`;
  return b.line ?? `${b.dose} ${b.name}`;
}

/** The Sunday leg block and the Thursday slots follow the user's choices. */
export function blockName(b: Block, p: Picks): string {
  return resolveBlock(b, p).name;
}
