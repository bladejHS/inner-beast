// Strength sessions for PUSH (Tue), PULL (Fri), LEGS (Sat) and the 10-minute bodyweight block (Mon).
// Base from the e-book (push-up variations + dips, pull-up variations, legs), filled out with Alex Hanma's own training
// (pull-up EMOM, rear shoulders, explosive work) and reworked on 2026-11-07 after the research: explosive work first,
// strength sets 1-3 reps short of failure, longer rests on heavy moves, a second leg dose on Tuesday, sprints, jumps,
// throws and loaded single-leg work on Saturday, carries on Friday.
// Exercise names stay in English; cues are Romanian.

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
  /** Weight is noted on every variation, not only the hardest (dumbbell work). */
  load?: boolean;
  /** For sets you tick off: what one set is. */
  label?: string;
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
        type: 'reps', sets: 3, lo: 3, hi: 5, rest: 120, muscles: 'piept, triceps, putere',
        cue: 'Cobori controlat, împingi cât de exploziv poți. Seria se termină când o repetare încetinește, nu când nu mai poți.',
        alex: 'Antrenează mușchii și pentru viteză, nu doar pentru forță. Le faci primele, cât ești proaspăt.',
      },
      {
        id: 'splitsq-tue', name: 'Bulgarian Split Squat', vars: ['Split Squats', 'Bulgarian Split Squats', 'Dumbbell Bulgarian Split Squats'], start: 2,
        type: 'reps', sets: 3, lo: 5, hi: 5, perSide: true, rest: 90, load: true, muscles: 'cvadricepși, fesieri',
        cue: 'A doua doză de picioare a săptămânii, scurtă: te oprești cu 2–3 repetări înainte de limită. Dacă picioarele sunt încă febrile de luni, o sari.',
      },
      {
        id: 'dips', name: 'Dips', vars: ['Bench Dips', 'Negative Dips', 'Parallel Bar Dips', 'Weighted Dips'], start: 0,
        type: 'reps', sets: 3, lo: 5, hi: 8, rest: 165, muscles: 'piept, triceps',
        cue: 'Umerii jos, departe de urechi. Cobori până când cotul ajunge la 90°. Ajungi la 3 × 8 curat, apoi adaugi greutate.',
      },
      {
        id: 'pushups', name: 'Push-ups', vars: ['Incline Push-ups', 'Push-ups', 'Decline Push-ups', 'Archer Push-ups', 'Pseudo Planche Push-ups'], start: 1,
        type: 'reps', sets: 3, lo: 6, hi: 12, rest: 90, muscles: 'piept, umeri, triceps',
        cue: 'Corpul drept din cap până în călcâie, coatele la aproximativ 45°, pieptul aproape de sol. Te oprești cu 1–2 repetări înainte de eșec.',
      },
      {
        id: 'pallof', name: 'Pallof Press', vars: ['Band Pallof Press', 'Band Pallof Press (split stance)'], start: 0,
        type: 'reps', sets: 3, lo: 8, hi: 12, perSide: true, rest: 60, muscles: 'trunchi, anti-rotație',
        cue: 'Banda trage lateral; tu împingi mâinile în față și nu lași trunchiul să se rotească. Ții o secundă cu brațele întinse.',
      },
      {
        id: 'pike', name: 'Pike Push-ups', vars: ['Pike Push-ups', 'Elevated Pike Push-ups', 'Wall Handstand Push-up Negatives', 'Wall Handstand Push-ups'], start: 0,
        type: 'reps', sets: 3, lo: 6, hi: 10, rest: 120, muscles: 'umeri',
        cue: 'Șoldurile sus, capul coboară în fața mâinilor. Toată munca e în umeri.',
      },
      {
        id: 'hollow', name: 'Hollow Body Hold', vars: ['Tuck Hollow Hold', 'Hollow Body Hold', 'Hollow Body Rocks'], start: 0,
        type: 'time', sets: 3, lo: 20, hi: 45, rest: 45, muscles: 'abdomen',
        cue: 'Zona lombară lipită de sol, abdomenul strâns, respiri scurt.',
        alex: 'Când folosești core-ul, pumnii au mult mai multă forță.',
      },
      {
        id: 'diamond', name: 'Diamond Push-ups', vars: ['Incline Diamond Push-ups', 'Diamond Push-ups', 'Decline Diamond Push-ups'], start: 0,
        type: 'reps', sets: 2, lo: 8, hi: 15, rest: 60, opt: true, muscles: 'triceps',
        cue: 'Opțional, primul de tăiat când timpul e scurt. Mâinile formează un romb sub piept, coatele rămân lângă corp.',
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
        cue: 'La începutul fiecărui minut faci repetările. Ce rămâne din minut e pauză. Ținta crește doar după două sesiuni complete la rând.',
        alex: 'Își începe ziua de spate cu 30 × 10. Aplicația urcă doar până la 15 × 8, apoi trece la tracțiuni cu greutate: volumul acela ar urca de zece ori în câteva luni.',
      },
      {
        id: 'rows', name: 'Inverted Rows', vars: ['Inverted Rows (high bar)', 'Inverted Rows', 'Feet-elevated Inverted Rows', 'Archer Rows'], start: 1,
        type: 'reps', sets: 3, lo: 8, hi: 12, rest: 75, muscles: 'spate',
        cue: 'Corpul drept, tragi pieptul la bară și strângi omoplații. Merge și la TRX: cu cât ești mai orizontal, cu atât e mai greu.',
        alex: 'Ramat 4 × 10–12, ca în ziua lui de spate.',
      },
      {
        id: 'face', name: 'Face Pulls', vars: ['Band Pull-Aparts', 'Band Face Pulls', 'TRX Face Pulls', 'TRX Rear Delt Flys'], start: 2,
        type: 'reps', sets: 3, lo: 12, hi: 15, rest: 60, muscles: 'umeri posteriori',
        cue: 'Coatele sus, tragi spre față și strângi spatele umerilor. La TRX: cu cât picioarele sunt mai în față, cu atât e mai greu.',
        alex: 'Își încheie ziua de spate cu umărul posterior, 4 × 10–12.',
      },
      {
        id: 'chin', name: 'Chin-ups', vars: ['Negative Chin-ups', 'Band-assisted Chin-ups', 'Chin-ups', 'Weighted Chin-ups'], start: 2,
        type: 'reps', sets: 2, lo: 3, hi: 6, rest: 120, opt: true, muscles: 'biceps, spate',
        cue: 'Doar dacă EMOM-ul n-a fost greu. Palmele spre tine, pieptul spre bară, te oprești cu 2 repetări înainte de limită.',
      },
      {
        id: 'carry', name: "Farmer's Carry", vars: ["Farmer's Carry", 'Suitcase Carry'], start: 0,
        type: 'time', sets: 4, lo: 30, hi: 45, rest: 75, load: true, muscles: 'priză, trunchi, umeri',
        cue: 'Cele mai grele gantere pe care le ții drept. Umerii jos, pași scurți și controlați, respiri. La Suitcase Carry ții doar într-o mână și nu te lași într-o parte.',
      },
      {
        id: 'core', name: 'Hanging Knee Raises', vars: ['Lying Leg Raises', 'Hanging Knee Raises', 'Hanging Leg Raises', 'Toes-to-Bar'], start: 1,
        type: 'reps', sets: 3, lo: 8, hi: 12, rest: 60, muscles: 'abdomen',
        cue: 'Fără balans: ridici din abdomen și cobori lent. După un EMOM lung, alege Lying Leg Raises.',
      },
      {
        id: 'hang', name: 'Dead Hang', vars: ['Dead Hang', 'Active Hang', 'One-arm Assisted Hang'], start: 0,
        type: 'time', sets: 2, lo: 20, hi: 40, rest: 60, opt: true, muscles: 'priză, umeri',
        cue: 'Atârni relaxat și te dai jos înainte să cedeze priza. Testul de maxim îl faci doar în săptămâna de teste.',
      },
      {
        id: 'curls', name: 'Hammer Curls', vars: ['Bodyweight Biceps Curls', 'Band Hammer Curls', 'Dumbbell Hammer Curls'], start: 0,
        type: 'reps', sets: 2, lo: 10, hi: 12, rest: 60, opt: true, muscles: 'biceps, antebrațe',
        cue: 'Opțional. Coatele lipite de corp, fără balans.',
        alex: 'Face hammer curls și biceps curls, 4 × 10–12 fiecare.',
      },
      {
        id: 'ytw', name: 'Y-T-W Raises', vars: ['Band Y-T-W Raises', 'TRX Y-T-W Raises'], start: 1,
        type: 'ytw', sets: 3, rest: 60, opt: true, muscles: 'umeri posteriori',
        cue: 'Opțional. O serie înseamnă 5 repetări cu brațele în Y, 5 în T și 5 în W, fără pauză.',
        alex: 'Face 4 × 5-5-5 la TRX: umerii din spate trebuie întăriți ca să nu ajungi cu „umeri de boxer”, aduși în față.',
      },
    ],
  },
  {
    id: 'legs',
    name: 'Leg Day',
    ex: [
      {
        id: 'sprint', name: 'Accelerations', vars: ['Accelerations (10–20 m)', 'Hill Sprints (8–10 s)'], start: 0,
        type: 'done', sets: 4, label: '1 sprint la ~85%', rest: 90, muscles: 'viteză, ischiogambieri',
        cue: 'Pornești din picioare și accelerezi progresiv pe 10–20 m, apoi te întorci mergând. Efortul urcă de la o săptămână la alta: 85%, 90%, 95%.',
      },
      {
        id: 'cmj', name: 'Countermovement Jump', vars: ['Countermovement Jump'], start: 0,
        type: 'done', sets: 3, label: '3 sărituri, pauză completă', rest: 75, muscles: 'putere',
        cue: 'Mâinile pe șolduri sau libere, cobori scurt și sari cât de sus poți. Aterizezi moale și te reașezi înainte de următoarea.',
      },
      {
        id: 'broad', name: 'Broad Jump', vars: ['Broad Jump'], start: 0,
        type: 'done', sets: 2, label: '3 sărituri, aterizare fixă', rest: 75, muscles: 'putere',
        cue: 'Sari în lungime cu brațele, aterizezi pe ambele picioare și ții poziția o secundă. Fiecare săritură e maximă.',
      },
      {
        id: 'rot', name: 'Rotational Throws', vars: ['Band Rotational Punches', 'Rotational Med Ball Throws'], start: 0,
        type: 'reps', sets: 3, lo: 5, hi: 8, perSide: true, rest: 60, muscles: 'rotație, trunchi, putere',
        cue: 'Rotația pornește din piciorul din spate și din șold, brațele doar o termină. Fiecare repetare la viteză maximă.',
      },
      {
        id: 'splitsq', name: 'Bulgarian Split Squat', vars: ['Split Squats', 'Bulgarian Split Squats', 'Dumbbell Bulgarian Split Squats'], start: 2,
        type: 'reps', sets: 4, lo: 5, hi: 8, perSide: true, rest: 180, load: true, muscles: 'cvadricepși, fesieri',
        cue: 'Cele mai grele gantere pe care le poți controla. Cobori până când genunchiul din spate aproape atinge solul, trunchiul ușor înainte. Te oprești cu 1–2 repetări înainte de limită.',
      },
      {
        id: 'sldl', name: 'Single-leg Romanian Deadlift', vars: ['Single-leg RDL (bodyweight)', 'Dumbbell Single-leg RDL'], start: 1,
        type: 'reps', sets: 3, lo: 6, hi: 10, perSide: true, rest: 120, load: true, muscles: 'ischiogambieri, fesieri',
        cue: 'Împingi șoldul înapoi, spatele drept, piciorul liber urcă în linie cu trunchiul. Simți întinderea în spatele coapsei.',
      },
      {
        id: 'latlunge', name: 'Lateral Lunge', vars: ['Lateral Lunge', 'Dumbbell Lateral Lunge'], start: 1,
        type: 'reps', sets: 3, lo: 6, hi: 10, perSide: true, rest: 90, load: true, muscles: 'adductori, fesieri, lateral',
        cue: 'Pas larg lateral, te așezi pe piciorul care pășește, celălalt rămâne întins. Forța laterală de care ai nevoie în ring.',
      },
      {
        id: 'calf', name: 'Calf Raises', vars: ['Calf Raises', 'Single-leg Calf Raises'], start: 1,
        type: 'reps', sets: 3, lo: 8, hi: 12, perSide: true, rest: 60, load: true, muscles: 'gambe, tendonul lui Ahile',
        cue: 'Urci pe vârfuri, ții o secundă sus, cobori lent în 3 secunde. Gleznele puternice ajută la coardă, sprint și în ring.',
      },
      {
        id: 'cossack', name: 'Cossack Squats', vars: ['Assisted Cossack Squats', 'Cossack Squats'], start: 0,
        type: 'reps', sets: 2, lo: 6, hi: 8, perSide: true, rest: 45, opt: true, muscles: 'șolduri, adductori',
        cue: 'Te muți de pe un picior pe altul, cu piciorul întins pe vârf.',
        alex: 'Mobilitate de șold ca în rutina lui „Dagestan”.',
      },
      {
        id: 'wallsit', name: 'Wall Sit', vars: ['Wall Sit'], start: 0,
        type: 'time', sets: 2, lo: 45, hi: 60, rest: 60, opt: true, muscles: 'cvadricepși',
        cue: 'Opțional, la final. Spatele lipit de perete, genunchii la 90°, respiri calm.',
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
/** `up`: full rounds, twice in a row, that earn the next scheme. */
export const BW_SCHEMES: Array<{ name: string; reps: number[]; up?: number }> = [
  { name: 'Ușor', reps: [3, 6, 9], up: 8 },
  { name: 'Standard', reps: [5, 10, 15], up: 7 },
  { name: 'Greu', reps: [7, 14, 21] },
];

/** Pull-up EMOM: where you start, and where the climb stops before the next variation. */
export const EMOM_START = { min: 10, reps: 3 };
export const EMOM_GOAL = { min: 15, reps: 8 };
