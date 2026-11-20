// Strength sessions since 2026-11-20: the four lifting sessions of the Hybrid365 run-focused split (Monday Upper
// Strength, Wednesday Upper Strength, Thursday Lower Strength, Friday Upper Strength + Power), exercise for exercise,
// sets x reps and rests as on the slides. Kept from before: the Back Squat is a Hack
// Squat (the user does not squat with the bar). Ids shared with the old plan (curls, hacksq, rdl, hipthrust, calf)
// keep their variations, so the last session and the kg carry over. Exercise names stay in English; cues are Romanian.


/** reps / time: logged numbers. max: one all-out set. emom: the pull-up clock. ytw and done: sets you tick off. */
export type ExType = 'reps' | 'time' | 'max' | 'emom' | 'ytw' | 'done';

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
  /** Weight is noted on every variation, not only the hardest: kg of one dumbbell, no ceiling (since 2026-11-20). */
  load?: boolean;
  /** Loaded with the barbell: kg include the bar, and there is no dumbbell ceiling. */
  bar?: boolean;
  /** On a machine: kg as the machine shows them, no dumbbell ceiling. */
  machine?: boolean;
  /** For sets you tick off: what one set is. */
  label?: string;
  /** The same movement on another day (2026-11-20, the user: what I lifted on Monday shows the next day, with the
   *  weight to use): the newest session of any exercise in the group sets today's weight. */
  same?: string;
  /** Friday's main lifts (Hybrid365: "Add load to main lifts weekly"): more weight every week once all the sets were
   *  done inside the range, not only at its top. */
  weekly?: boolean;
}

export interface Workout {
  id: 'upper' | 'upper2' | 'lower' | 'power';
  name: string;
  /** About how long it takes, rests included. */
  min: number;
  ex: Exercise[];
}

export const WORKOUTS: Workout[] = [
  {
    // Monday, Session 2: Upper Body (Strength). Rest 60-90 s.
    id: 'upper',
    name: 'Upper Body (Strength)',
    min: 55,
    ex: [
      {
        // the user swapped the barbell for dumbbells (2026-11-20): "Barbell Bench Press îl înlocuiesc cu DB Bench Press"
        id: 'bench', same: 'bench', name: 'DB Bench Press', vars: ['Dumbbell Bench Press'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 8, rest: 90, load: true, muscles: 'piept, umeri, triceps',
        cue: 'Înainte de serii: 1–2 serii ușoare de încălzire. Omoplații strânși, tălpile pe sol, ganterele coboară controlat lângă piept și urcă puternic. Tempo controlat, amplitudine completă. Kg: o singură ganteră.',
      },
      {
        id: 'pullup', name: 'Pull Up / Lat Pulldown', vars: ['Lat Pulldown', 'Band-assisted Pull-ups', 'Pull-ups'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 10, rest: 90, load: true, machine: true, muscles: 'spate, biceps',
        cue: 'Pieptul sus, tragi coatele în jos spre coaste, până când bara ajunge la piept sau bărbia trece de bară. Cobori complet, controlat. Kg: greutatea de pe aparat; la tracțiuni, greutatea adăugată (0 fără).',
      },
      {
        id: 'incline', same: 'incline', name: 'Incline Dumbbell Press', vars: ['Incline Dumbbell Press'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 10, rest: 75, load: true, muscles: 'pieptul de sus, umeri',
        cue: 'Banca la 30°. Ganterele coboară lateral de piept, coatele la 45–60°, apoi împingi în sus și ușor spre interior. Kg: o singură ganteră.',
      },
      {
        id: 'csrow', same: 'csrow', name: 'Chest Supported Row', vars: ['Chest Supported Dumbbell Row', 'Chest Supported Machine Row'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 10, rest: 75, load: true, muscles: 'spatele de mijloc, dorsali',
        cue: 'Cu pieptul pe banca înclinată: tragi coatele înapoi și strângi omoplații o secundă, cobori până la brațe întinse. Pieptul nu se ridică de pe bancă.',
      },
      {
        id: 'latraise', same: 'latraise', name: 'Lateral Raise', vars: ['Dumbbell Lateral Raise'], start: 0,
        type: 'reps', sets: 3, lo: 12, hi: 15, rest: 60, load: true, muscles: 'umeri (deltoidul lateral)',
        cue: 'Brațele ușor îndoite, urci lateral până la nivelul umerilor, fără balans. Cobori în 2–3 secunde.',
      },
      {
        id: 'tripush', name: 'Tricep Pushdown', vars: ['Band Tricep Pushdown', 'Cable Tricep Pushdown'], start: 1,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 60, load: true, machine: true, muscles: 'triceps',
        cue: 'Coatele lipite de corp, nemișcate. Împingi până la brațe întinse, strângi tricepsul, revii controlat până la 90°.',
      },
      {
        id: 'curls', name: 'Bicep Curl', vars: ['Bodyweight Biceps Curls', 'Band Hammer Curls', 'Dumbbell Hammer Curls', 'Dumbbell Biceps Curls'], start: 3,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 60, load: true, muscles: 'biceps, antebrațe',
        cue: 'Coatele lipite de corp, fără balans din spate: urci în 1 secundă, cobori în 2–3.',
      },
    ],
  },
  {
    // Wednesday, Session 1: Upper Body (Strength). Rest 60-90 s, 1-2 reps in reserve on the main lifts.
    id: 'upper2',
    name: 'Upper Body (Strength)',
    min: 60,
    ex: [
      {
        id: 'wpull', name: 'Weighted Pull Up', vars: ['Lat Pulldown (heavy)', 'Band-assisted Pull-ups', 'Pull-ups', 'Weighted Pull-ups'], start: 0,
        type: 'reps', sets: 4, lo: 5, hi: 8, rest: 90, load: true, machine: true, muscles: 'spate, biceps',
        cue: 'Greu, cu 1–2 repetări în rezervă. Până ajungi la tracțiuni cu greutate, varianta grea de pe aparat. Kg: greutatea de pe aparat sau cea adăugată la centură.',
      },
      {
        id: 'dbpress', same: 'bench', name: 'Flat Dumbbell Press', vars: ['Flat Dumbbell Press'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 8, rest: 90, load: true, muscles: 'piept, umeri, triceps',
        cue: 'Pe banca dreaptă: ganterele coboară lângă piept, omoplații strânși, apoi împingi în sus. 1–2 repetări în rezervă. Kg: o singură ganteră.',
      },
      {
        id: 'csrow-w', same: 'csrow', name: 'Chest Supported Row', vars: ['Chest Supported Dumbbell Row', 'Chest Supported Machine Row'], start: 0,
        type: 'reps', sets: 4, lo: 8, hi: 10, rest: 75, load: true, muscles: 'spatele de mijloc, dorsali',
        cue: 'Cu pieptul pe banca înclinată: tragi coatele înapoi și strângi omoplații o secundă, cobori până la brațe întinse.',
      },
      {
        id: 'ohp', name: 'Seated Overhead Press', vars: ['Seated Dumbbell Overhead Press'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 10, rest: 75, load: true, muscles: 'umeri, triceps',
        cue: 'Așezat, cu spătarul drept: ganterele pornesc la nivelul urechilor și urcă deasupra capului fără să arcuiești spatele.',
      },
      {
        id: 'facepull', name: 'Cable Face Pull', vars: ['Band Face Pulls', 'Cable Face Pulls'], start: 1,
        type: 'reps', sets: 3, lo: 12, hi: 15, rest: 60, load: true, machine: true, muscles: 'umărul posterior, omoplați',
        cue: 'Coarda la nivelul feței: tragi spre frunte, cu coatele sus și mâinile depărtându-se la final. Ții o secundă.',
      },
      {
        id: 'latraise-w', same: 'latraise', name: 'Dumbbell Lateral Raise', vars: ['Dumbbell Lateral Raise'], start: 0,
        type: 'reps', sets: 3, lo: 12, hi: 15, rest: 60, load: true, muscles: 'umeri (deltoidul lateral)',
        cue: 'Brațele ușor îndoite, urci lateral până la nivelul umerilor, fără balans. Cobori în 2–3 secunde.',
      },
      {
        id: 'rope', name: 'Tricep Rope Pushdown', vars: ['Band Tricep Pushdown', 'Cable Rope Pushdown'], start: 1,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 60, load: true, machine: true, muscles: 'triceps',
        cue: 'Coatele lipite de corp. Jos desfaci capetele corzii spre exterior și strângi tricepsul.',
      },
      {
        id: 'altcurl', name: 'Alternating Dumbbell Curl', vars: ['Alternating Dumbbell Curl'], start: 0,
        type: 'reps', sets: 3, lo: 10, hi: 12, perSide: true, rest: 60, load: true, muscles: 'biceps',
        cue: 'Un braț pe rând, palma se rotește în sus pe drum. Coatele stau lângă corp, fără balans.',
      },
    ],
  },
  {
    // Thursday, Session 2: Lower Body (Strength). Rest 60-90 s, 1-2 reps in reserve on the compounds.
    id: 'lower',
    name: 'Lower Body (Strength)',
    min: 55,
    ex: [
      {
        id: 'hacksq', name: 'Hack Squat', vars: ['Hack Squat (partial range)', 'Hack Squat'], start: 0,
        type: 'reps', sets: 4, lo: 4, hi: 6, rest: 120, load: true, machine: true, muscles: 'cvadricepși, fesieri',
        cue: 'În Hybrid365 aici e Back Squat 4 × 4–6; la tine Hack Squat, fiindcă nu vrei genuflexiuni cu bara. 1–2 serii de încălzire, apoi greu, cu 1–2 repetări în rezervă. Spatele lipit de spătar, cobori în 2–3 secunde, urci fără să blochezi genunchii.',
      },
      {
        id: 'rdl', name: 'Romanian Deadlift', vars: ['Barbell Romanian Deadlift'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 8, rest: 120, load: true, bar: true, muscles: 'ischiogambieri, fesieri, spate',
        cue: 'Șoldul pleacă înapoi, bara alunecă pe coapse până sub genunchi, spatele rămâne drept, genunchii ușor îndoiți. 1–2 repetări în rezervă.',
      },
      {
        id: 'wlunge', name: 'Walking Lunge', vars: ['Walking Lunge', 'Dumbbell Walking Lunge'], start: 1,
        type: 'reps', sets: 3, lo: 8, hi: 10, perSide: true, rest: 90, load: true, muscles: 'cvadricepși, fesieri',
        cue: 'Pas lung, genunchiul din spate coboară aproape de sol, trunchiul drept. Împingi prin călcâiul din față și treci în pasul următor. Kg: o ganteră în fiecare mână.',
      },
      {
        id: 'hipthrust', name: 'Hip Thrust', vars: ['Glute Bridge', 'Barbell Glute Bridge', 'Barbell Hip Thrust'], start: 2,
        type: 'reps', sets: 3, lo: 8, hi: 10, rest: 90, load: true, bar: true, muscles: 'fesieri, ischiogambieri',
        cue: 'Bara pe șold, cu un prosop sub ea. Împingi prin călcâie până când corpul e drept de la umeri la genunchi, strângi fesierii o secundă sus.',
      },
      {
        id: 'legpress', name: 'Leg Press', vars: ['Leg Press'], start: 0,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 90, load: true, machine: true, muscles: 'cvadricepși, fesieri',
        cue: 'Picioarele la lățimea umerilor pe platformă. Cobori până când genunchii sunt la aproximativ 90°, fără ca bazinul să se ridice de pe spătar.',
      },
      {
        id: 'hamcurl', name: 'Hamstring Curl', vars: ['Lying Hamstring Curl', 'Seated Hamstring Curl'], start: 0,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 60, load: true, machine: true, muscles: 'ischiogambieri',
        cue: 'Tragi călcâiele spre fesieri, ții o secundă, cobori în 2–3 secunde. Șoldul rămâne lipit de aparat.',
      },
      {
        id: 'calf', name: 'Calf Raise', vars: ['Calf Raises', 'Single-leg Calf Raises'], start: 1,
        type: 'reps', sets: 3, lo: 12, hi: 15, perSide: true, rest: 60, load: true, muscles: 'gambe, tendonul lui Ahile',
        cue: 'Urci pe vârfuri, ții o secundă sus, cobori lent sub nivelul treptei. Gambe puternice, alergare mai ușoară.',
      },
    ],
  },
  {
    // Friday, Session 1: Upper Body (Strength + Power). Rest 90 s.
    id: 'power',
    name: 'Upper Body (Strength + Power)',
    min: 65,
    ex: [
      {
        id: 'bench-h', weekly: true, same: 'bench', name: 'DB Bench Press', vars: ['Dumbbell Bench Press'], start: 0,
        type: 'reps', sets: 5, lo: 3, hi: 5, rest: 120, load: true, muscles: 'piept, umeri, triceps',
        cue: 'Greu și exploziv: 2–3 serii de încălzire, apoi ganterele coboară controlat și urcă cât de repede poți. Ținta e să bați seria de top de săptămâna trecută. Kg: o singură ganteră.',
      },
      {
        id: 'wpull-h', weekly: true, name: 'Weighted Pull Up', vars: ['Lat Pulldown (heavy)', 'Band-assisted Pull-ups', 'Pull-ups', 'Weighted Pull-ups'], start: 0,
        type: 'reps', sets: 4, lo: 4, hi: 6, rest: 120, load: true, machine: true, muscles: 'spate, biceps',
        cue: 'Greu, cu intenție explozivă la urcare, coborâre controlată. Kg: greutatea de pe aparat sau cea de la centură.',
      },
      {
        id: 'incline-h', weekly: true, same: 'incline', name: 'Incline Dumbbell Press', vars: ['Incline Dumbbell Press'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 8, rest: 90, load: true, muscles: 'pieptul de sus, umeri',
        cue: 'Banca la 30°, ganterele coboară controlat și urcă puternic. Kg: o singură ganteră.',
      },
      {
        id: 'csrow-h', weekly: true, same: 'csrow', name: 'Chest Supported Row', vars: ['Chest Supported Dumbbell Row', 'Chest Supported Machine Row'], start: 0,
        type: 'reps', sets: 4, lo: 6, hi: 8, rest: 90, load: true, muscles: 'spatele de mijloc, dorsali',
        cue: 'Mai greu decât miercuri: tragi exploziv, cobori controlat, pieptul rămâne pe bancă.',
      },
      {
        id: 'pushpress', weekly: true, name: 'Push Press', vars: ['Dumbbell Push Press', 'Barbell Push Press'], start: 1,
        type: 'reps', sets: 4, lo: 3, hi: 5, rest: 120, load: true, bar: true, muscles: 'umeri, triceps, picioare',
        cue: 'O mică flexie din genunchi și împingi bara deasupra capului folosind impulsul picioarelor. Bara pleacă exploziv, aterizează controlat pe umeri.',
      },
      {
        id: 'cgbench', name: 'Close Grip Bench Press', vars: ['Close Grip Bench Press'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 10, rest: 90, load: true, bar: true, muscles: 'triceps, piept',
        cue: 'Priza la lățimea umerilor, coatele aproape de corp. Bara coboară pe partea de jos a pieptului.',
      },
      {
        id: 'bbcurl', name: 'Barbell Curl', vars: ['Barbell Curl'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 10, rest: 60, load: true, bar: true, muscles: 'biceps',
        cue: 'Coatele fixe lângă corp, fără balans din șold. Urci în 1 secundă, cobori în 2–3.',
      },
      {
        id: 'ohext', name: 'Tricep Overhead Extension', vars: ['Dumbbell Overhead Extension', 'Cable Overhead Extension'], start: 0,
        type: 'reps', sets: 3, lo: 10, hi: 12, rest: 60, load: true, muscles: 'triceps (capul lung)',
        cue: 'Gantera ținută cu ambele mâini deasupra capului: cobori în spatele capului cu coatele spre tavan, apoi întinzi brațele.',
      },
    ],
  },
];

/** Where records count: the strength days, bodyweight sets only (reps or seconds, no weight noted). */
export const RECORD_WIDS = ['upper', 'upper2', 'lower', 'power'];

export const recordable = (ex: Exercise): boolean => (ex.type === 'reps' || ex.type === 'time' || ex.type === 'max') && !ex.bar && (!ex.load || !!ex.machine);

export function workoutById(id: string): Workout {
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}

export function exerciseById(id: string): Exercise | undefined {
  for (const w of WORKOUTS) for (const e of w.ex) if (e.id === id) return e;
  return undefined;
}

/** Monday's 10-minute bodyweight block: as many rounds as possible. */
export const BW_MOVES = ['Pull-ups', 'Push-ups', 'Squats'];
/** `up`: full rounds, twice in a row, that earn the next scheme. */
export const BW_SCHEMES: Array<{ name: string; reps: number[]; up?: number }> = [
  { name: 'Ușor', reps: [3, 6, 9], up: 8 },
  { name: 'Standard', reps: [5, 10, 15], up: 7 },
  { name: 'Greu', reps: [7, 14, 21] },
];

/** Pull-up EMOM: where you start, and where the climb stops before the next variation. */
export const EMOM_START = { min: 10, reps: 3 };
export const EMOM_GOAL = { min: 15, reps: 8 };
