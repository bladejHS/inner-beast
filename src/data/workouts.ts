// Calisthenics plans for PUSH (Tue), PULL (Fri), LEGS (Sun) and the 10-minute bodyweight block (Mon).
// Base from the e-book (push-up variations + dips, pull-up variations, lunges 4 × 15, squats/push-ups/pull-ups),
// filled out with Alex Hanma's own training from his channel (pull-up EMOM, rear shoulders, explosive work, core).
// Exercise names stay in English; cues are Romanian.

export type ExType = 'reps' | 'time' | 'max' | 'emom' | 'ytw';

export interface Exercise {
  id: string;
  name: string;
  /** Variations from easier to harder: "Progression is mandatory". */
  vars: string[];
  start: number;
  type: ExType;
  sets: number;
  lo?: number;
  hi?: number;
  perSide?: boolean;
  rest: number;
  muscles: string;
  cue: string;
  alex?: string;
  opt?: boolean;
}

export interface Workout {
  id: 'push' | 'pull' | 'legs';
  name: string;
  ex: Exercise[];
}

export const WORKOUTS: Workout[] = [
  {
    id: 'push',
    name: 'Push Training',
    ex: [
      {
        id: 'explosive', name: 'Explosive Push-ups', vars: ['Incline Explosive Push-ups', 'Explosive Push-ups', 'Clap Push-ups', 'Superman Push-ups'], start: 0,
        type: 'reps', sets: 4, lo: 3, hi: 6, rest: 90, muscles: 'piept, triceps, putere',
        cue: 'Cobori controlat, împingi cât de exploziv poți. Puține repetări, fiecare la viteză maximă.',
        alex: 'Antrenează mușchii și pentru viteză, nu doar pentru forță. Le faci primele, cât ești proaspăt.',
      },
      {
        id: 'pushups', name: 'Push-ups', vars: ['Incline Push-ups', 'Push-ups', 'Decline Push-ups', 'Archer Push-ups', 'Pseudo Planche Push-ups'], start: 1,
        type: 'reps', sets: 4, lo: 8, hi: 15, rest: 90, muscles: 'piept, umeri, triceps',
        cue: 'Corpul drept din cap până în călcâie, coatele la aproximativ 45°, pieptul aproape de sol.',
      },
      {
        id: 'dips', name: 'Dips', vars: ['Bench Dips', 'Negative Dips', 'Parallel Bar Dips', 'Weighted Dips'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 12, rest: 120, muscles: 'piept, triceps',
        cue: 'Umerii jos, departe de urechi. Cobori până când cotul ajunge la 90°.',
      },
      {
        id: 'pike', name: 'Pike Push-ups', vars: ['Pike Push-ups', 'Elevated Pike Push-ups', 'Wall Handstand Push-up Negatives', 'Wall Handstand Push-ups'], start: 0,
        type: 'reps', sets: 3, lo: 6, hi: 10, rest: 90, muscles: 'umeri',
        cue: 'Șoldurile sus, capul coboară în fața mâinilor. Toată munca e în umeri.',
      },
      {
        id: 'diamond', name: 'Diamond Push-ups', vars: ['Incline Diamond Push-ups', 'Diamond Push-ups', 'Decline Diamond Push-ups'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 15, rest: 60, muscles: 'triceps',
        cue: 'Mâinile formează un romb sub piept, coatele rămân lângă corp.',
      },
      {
        id: 'hollow', name: 'Hollow Body Hold', vars: ['Tuck Hollow Hold', 'Hollow Body Hold', 'Hollow Body Rocks'], start: 0,
        type: 'time', sets: 3, lo: 20, hi: 45, rest: 45, muscles: 'abdomen',
        cue: 'Zona lombară lipită de sol, abdomenul strâns, respiri scurt.',
        alex: 'Când folosești core-ul, pumnii au mult mai multă forță.',
      },
      {
        id: 'burnout', name: 'Push-up Burnout', vars: ['Max Push-ups'], start: 0,
        type: 'max', sets: 1, rest: 0, muscles: 'piept, triceps',
        cue: 'O singură serie, până nu mai poți. Notezi numărul și data viitoare îl bați.',
        alex: 'Intensitate peste durată.',
      },
    ],
  },
  {
    id: 'pull',
    name: 'Pull Training',
    ex: [
      {
        id: 'emom', name: 'Pull-up EMOM', vars: ['Negative Pull-ups', 'Band-assisted Pull-ups', 'Pull-ups', 'Weighted Pull-ups'], start: 2,
        type: 'emom', sets: 1, rest: 0, muscles: 'spate, biceps',
        cue: 'La începutul fiecărui minut faci repetările. Ce rămâne din minut e pauză.',
        alex: 'Își începe ziua de spate cu 30 × 10: 30 de minute, câte 10 tracțiuni pe minut. Ajungi acolo treptat.',
      },
      {
        id: 'chin', name: 'Chin-ups', vars: ['Negative Chin-ups', 'Band-assisted Chin-ups', 'Chin-ups', 'Weighted Chin-ups'], start: 2,
        type: 'reps', sets: 3, lo: 6, hi: 12, rest: 120, muscles: 'biceps, spate',
        cue: 'Palmele spre tine, pieptul spre bară, cobori complet la fiecare repetare.',
      },
      {
        id: 'rows', name: 'Inverted Rows', vars: ['Inverted Rows (high bar)', 'Inverted Rows', 'Feet-elevated Inverted Rows', 'Archer Rows'], start: 1,
        type: 'reps', sets: 4, lo: 10, hi: 12, rest: 90, muscles: 'spate',
        cue: 'Corpul drept, tragi pieptul la bară și strângi omoplații.',
        alex: 'Ramat 4 × 10–12, ca în ziua lui de spate.',
      },
      {
        id: 'ytw', name: 'Y-T-W Raises', vars: ['Band Y-T-W Raises', 'TRX Y-T-W Raises'], start: 1,
        type: 'ytw', sets: 4, rest: 60, muscles: 'umeri posteriori',
        cue: 'O serie înseamnă 5 repetări cu brațele în Y, 5 în T și 5 în W, fără pauză.',
        alex: 'Face 4 × 5-5-5 la TRX: umerii din spate trebuie întăriți ca să nu ajungi cu „umeri de boxer”, aduși în față.',
      },
      {
        id: 'trxrow', name: 'TRX Rows', vars: ['TRX Rows (upright)', 'TRX Rows', 'TRX Rows (feet elevated)', 'TRX Single-arm Rows'], start: 1,
        type: 'reps', sets: 3, lo: 10, hi: 15, rest: 60, muscles: 'spate, biceps, umeri posteriori',
        cue: 'Corpul drept ca o scândură, tragi pieptul la mânere și strângi omoplații. Unghiul corpului dă greutatea.',
        alex: 'TRX-ul e unealta lui Alex pentru spate și umăr posterior.',
      },
      {
        id: 'curls', name: 'Hammer Curls', vars: ['Bodyweight Biceps Curls', 'Band Hammer Curls', 'Dumbbell Hammer Curls'], start: 0,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 60, muscles: 'biceps, antebrațe',
        cue: 'Coatele lipite de corp, fără balans. Alege varianta pentru ce ai acasă.',
        alex: 'Face hammer curls și biceps curls, 4 × 10–12 fiecare.',
      },
      {
        id: 'face', name: 'Face Pulls', vars: ['Band Pull-Aparts', 'Band Face Pulls', 'TRX Face Pulls', 'TRX Rear Delt Flys'], start: 2,
        type: 'reps', sets: 3, lo: 12, hi: 15, rest: 60, muscles: 'umeri posteriori',
        cue: 'Coatele sus, tragi spre față și strângi spatele umerilor. La TRX: cu cât picioarele sunt mai în față, cu atât e mai greu.',
        alex: 'Își încheie ziua de spate cu umărul posterior, 4 × 10–12.',
      },
      {
        id: 'core', name: 'Hanging Knee Raises', vars: ['Lying Leg Raises', 'Hanging Knee Raises', 'Hanging Leg Raises', 'Toes-to-Bar'], start: 1,
        type: 'reps', sets: 3, lo: 8, hi: 12, rest: 60, muscles: 'abdomen',
        cue: 'Fără balans: ridici din abdomen și cobori lent.',
      },
      {
        id: 'hang', name: 'Dead Hang', vars: ['Dead Hang', 'Active Hang', 'One-arm Assisted Hang'], start: 0,
        type: 'max', sets: 2, rest: 60, muscles: 'priză, umeri',
        cue: 'Atârni cât poți, relaxat. Notezi secundele.',
      },
    ],
  },
  {
    id: 'legs',
    name: 'Leg Day',
    ex: [
      {
        id: 'lunges', name: 'Lunges', vars: ['Reverse Lunges', 'Forward Lunges', 'Walking Lunges', 'Weighted Walking Lunges'], start: 0,
        type: 'reps', sets: 4, lo: 15, hi: 15, perSide: true, rest: 60, muscles: 'cvadricepși, fesieri',
        cue: 'Pas lung, genunchiul din spate aproape de sol, trunchiul drept. 15 pe fiecare picior.',
      },
      {
        id: 'calf', name: 'Calf Raises', vars: ['Calf Raises', 'Single-leg Calf Raises'], start: 0,
        type: 'reps', sets: 3, lo: 15, hi: 20, rest: 45, opt: true, muscles: 'gambe',
        cue: 'Urci pe vârfuri, ții o secundă sus, cobori lent. Gleznele puternice ajută la coardă și în ring.',
      },
      {
        id: 'cossack', name: 'Cossack Squats', vars: ['Assisted Cossack Squats', 'Cossack Squats'], start: 0,
        type: 'reps', sets: 2, lo: 6, hi: 8, perSide: true, rest: 45, opt: true, muscles: 'șolduri, adductori',
        cue: 'Te muți de pe un picior pe altul, cu piciorul întins pe vârf.',
        alex: 'Mobilitate de șold ca în rutina lui „Dagestan”.',
      },
    ],
  },
];

export function workoutById(id: string): Workout {
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}

export function exerciseById(id: string): Exercise | undefined {
  for (const w of WORKOUTS) for (const e of w.ex) if (e.id === id) return e;
  return undefined;
}

/** Monday's 10-minute bodyweight block: as many rounds as possible. */
export const BW_MOVES = ['Pull-ups', 'Push-ups', 'Squats'];
export const BW_SCHEMES = [
  { name: 'Ușor', reps: [3, 6, 9] },
  { name: 'Standard', reps: [5, 10, 15] },
  { name: 'Greu', reps: [7, 14, 21] },
];

/** Pull-up EMOM: where you start and where Alex is. */
export const EMOM_START = { min: 10, reps: 3 };
export const EMOM_GOAL = { min: 30, reps: 10 };
