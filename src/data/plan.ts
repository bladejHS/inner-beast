// The weekly plan from "Unleash Your Inner Beast" (pages 15-16).
// Session and exercise names stay in English, as in the e-book; tips are in Romanian.

export type BlockKind = 'rounds' | 'amrap' | 'workout' | 'routine' | 'run' | 'walk' | 'shower' | 'wimhof' | 'breath';
export type ComboFocus = 'jab' | 'move' | 'combo' | 'power' | 'slow' | 'distance' | 'rope' | 'legs' | 'week';
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
      { id: 'mon-shadow', kind: 'rounds', name: 'Shadow Boxing', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'jab', tip: 'Concentrează-te pe jab și pe jocul de picioare.' },
      { id: 'mon-bw', kind: 'amrap', name: 'Bodyweight Workout', dose: '10 min', min: 10, tip: 'Squats, push-ups și pull-ups, cât mai multe runde în 10 minute.' },
      { id: 'mon-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'move', tip: 'Mișcare și pumni: nu sta pe loc în fața sacului.' },
    ],
  },
  {
    idx: 1,
    title: 'Push Training',
    blocks: [
      { id: 'tue-stretch', kind: 'routine', name: 'Full Body Stretching', dose: '15 min', routine: 'stretch-push', min: 15, tip: 'Încălzirea umerilor înainte de flotări.' },
      { id: 'tue-cal', kind: 'workout', name: 'Calisthenics: Chest, Shoulders, Triceps', dose: '60 min', line: '60 min Calisthenics (Chest, Shoulders, Triceps)', workout: 'push', min: 60, tip: 'Push-ups (variante) și dips.' },
      { id: 'tue-easy', kind: 'rounds', name: 'Easy Shadow Boxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'slow', tip: 'Mișcări lente și curate.' },
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
      { id: 'thu-rope', kind: 'rounds', name: 'Jumping Rope', dose: '5 × 3 min', rounds: 5, work: 180, rest: 'r3', focus: 'rope', tip: 'Concentrează-te pe un joc de picioare ușor.' },
      { id: 'thu-shadow', kind: 'rounds', name: 'Shadow Boxing', dose: '3 × 3 min', rounds: 3, work: 180, rest: 'r3', focus: 'combo', tip: 'Concentrează-te pe combinații.' },
      { id: 'thu-bag', kind: 'rounds', name: 'Heavy Bag Training', dose: '10 × 3 min', rounds: 10, work: 180, rest: 'r3', focus: 'power', tip: 'Schimbări de unghi și putere.' },
    ],
  },
  {
    idx: 4,
    title: 'Pull Training',
    blocks: [
      { id: 'fri-stretch', kind: 'routine', name: 'Full Body Stretching', dose: '15 min', routine: 'stretch-pull', min: 15, tip: 'Încălzirea umerilor înainte de tracțiuni.' },
      { id: 'fri-cal', kind: 'workout', name: 'Calisthenics: Back, Biceps, Shoulders', dose: '60 min', line: '60 min Calisthenics (Back, Biceps, Shoulders)', workout: 'pull', min: 60, tip: 'Pull-ups (variante).' },
      { id: 'fri-easy', kind: 'rounds', name: 'Easy Shadow Boxing', dose: '10 min', rounds: 1, work: 600, rest: 'none', focus: 'distance', tip: 'Lucru pe distanță.' },
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

/** The plan-page line for a block, e.g. "5 × 3 min Shadow Boxing". */
export function blockLine(b: Block, legMode: 'wall' | 'jump'): string {
  if (b.legSwap) return `${b.dose} ${blockName(b, legMode)}`;
  return b.line ?? `${b.dose} ${b.name}`;
}

/** The Sunday leg block follows the user's choice in Settings. */
export function blockName(b: Block, legMode: 'wall' | 'jump'): string {
  if (b.legSwap) return legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit';
  return b.name;
}
