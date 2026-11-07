// Strength sessions for PUSH (Tue), PULL (Fri), LEGS (Sat), UPPER (Mon in cycle A) and the 10-minute bodyweight block (Mon).
// Base from the e-book (push-up variations + dips, pull-up variations, legs), filled out with Alex Hanma's own training
// (pull-up EMOM, rear shoulders, explosive work) and reworked on 2026-11-07 after the research: explosive work first,
// strength sets 1-3 reps short of failure, longer rests on heavy moves, a second leg dose on Tuesday, sprints,
// throws and loaded single-leg work on Saturday, carries on Friday.
// Fitted to the user on 2026-11-07: jumps hurt the knees at the current body weight, so Saturday's power work starts
// with medicine ball throws and hill sprints, and the jumps come back as later variations. Equipment: an Olympic bar
// (no squats with it), dumbbells up to 30 kg, a medicine ball, a partner now and then.
// The user approved on 2026-11-07 a second strength dose for pulling and pressing: in the strength emphasis (cycle A)
// Monday's AMRAP becomes Upper Strength, short heavy sets of pull-ups and dips.
// Exercise names stay in English; cues are Romanian.

/** The heaviest dumbbells the user owns: past this the weight can't go up, the variation or the tempo does. */
export const DB_MAX_KG = 30;

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
  /** Weight is noted on every variation, not only the hardest: kg of one dumbbell, capped at DB_MAX_KG. */
  load?: boolean;
  /** Loaded with the barbell: kg include the bar, and there is no dumbbell ceiling. */
  bar?: boolean;
  /** For sets you tick off: what one set is. */
  label?: string;
}

export interface Workout {
  id: 'push' | 'pull' | 'legs' | 'upper' | 'knee';
  name: string;
  /** About how long it takes, rests included. */
  min: number;
  ex: Exercise[];
}

export const WORKOUTS: Workout[] = [
  {
    id: 'push',
    name: 'Push Training',
    min: 45,
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
    min: 50,
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
    min: 60,
    ex: [
      {
        id: 'sprint', name: 'Sprints', vars: ['Hill Sprints (8–10 s)', 'Accelerations (10–20 m)'], start: 0,
        type: 'done', sets: 4, label: '1 sprint la ~85%', rest: 90, muscles: 'viteză, ischiogambieri',
        cue: 'În pantă impactul și frânarea sunt mai mici decât pe plat, așa că genunchii primesc mai puțin. Urci 8–10 s, cobori mergând. Fără pantă: accelerări de 10–15 m pe iarbă. Efortul urcă de la o săptămână la alta: 85%, 90%, 95%.',
      },
      {
        id: 'cmj', name: 'Lower-body Power', vars: ['Medicine Ball Scoop Toss', 'Box Jump', 'Countermovement Jump'], start: 0,
        type: 'done', sets: 3, label: '3 repetări maxime, pauză completă', rest: 75, muscles: 'putere, șolduri',
        cue: 'Puterea vine din șold, ca la săritură, dar fără aterizare pe genunchi. Săriturile revin pe rând: Box Jump după 3 săptămâni de Leg Day fără durere de genunchi (sub 3 din 10, nici a doua zi), Countermovement Jump după încă 3 săptămâni la fel.',
      },
      {
        id: 'broad', name: 'Total-body Power', vars: ['Medicine Ball Slam', 'Broad Jump'], start: 0,
        type: 'done', sets: 2, label: '3 repetări maxime, pauză completă', rest: 75, muscles: 'putere, trunchi',
        cue: 'Tot corpul trimite mingea în sol, cât de tare poți: te întinzi pe vârfuri cu ea sus, apoi abdomenul și dorsalii o aruncă. Broad Jump revine odată cu Countermovement Jump.',
      },
      {
        id: 'rot', name: 'Rotational Throws', vars: ['Band Rotational Punches', 'Rotational Med Ball Throws'], start: 1,
        type: 'reps', sets: 3, lo: 5, hi: 8, perSide: true, rest: 60, muscles: 'rotație, trunchi, putere',
        cue: 'Rotația pornește din piciorul din spate și din șold, brațele doar o termină. Fiecare repetare la viteză maximă.',
      },
      {
        id: 'splitsq', name: 'Bulgarian Split Squat', vars: ['Split Squats', 'Bulgarian Split Squats', 'Dumbbell Bulgarian Split Squats'], start: 2,
        type: 'reps', sets: 4, lo: 5, hi: 8, perSide: true, rest: 180, load: true, muscles: 'cvadricepși, fesieri',
        cue: 'Cele mai grele gantere pe care le poți controla. Cobori până când genunchiul din spate aproape atinge solul, trunchiul ușor înainte. Te oprești cu 1–2 repetări înainte de limită. Genunchiul din față: până la 3 din 10 durere e acceptabil dacă a doua zi nu e mai rău; altfel alegi varianta mai ușoară.',
      },
      {
        id: 'rdl', name: 'Romanian Deadlift', vars: ['Barbell Romanian Deadlift'], start: 0,
        type: 'reps', sets: 3, lo: 5, hi: 8, rest: 150, load: true, bar: true, muscles: 'ischiogambieri, fesieri, spate',
        cue: 'Cu bara olimpică: șoldul pleacă înapoi, bara alunecă pe coapse până sub genunchi, spatele rămâne drept. Genunchii stau ușor îndoiți și aproape nemișcați, de aceea îi încarcă puțin. Te oprești cu 1–2 repetări înainte de limită.',
      },
      {
        id: 'sldl', name: 'Single-leg Romanian Deadlift', vars: ['Single-leg RDL (bodyweight)', 'Dumbbell Single-leg RDL'], start: 1,
        type: 'reps', sets: 2, lo: 6, hi: 10, perSide: true, rest: 90, load: true, opt: true, muscles: 'ischiogambieri, fesieri, echilibru',
        cue: 'Opțional, după Romanian Deadlift: echilibru pe un picior. Împingi șoldul înapoi, spatele drept, piciorul liber urcă în linie cu trunchiul.',
      },
      {
        id: 'latlunge', name: 'Lateral Lunge', vars: ['Lateral Lunge', 'Dumbbell Lateral Lunge'], start: 1,
        type: 'reps', sets: 3, lo: 6, hi: 10, perSide: true, rest: 90, load: true, muscles: 'adductori, fesieri, lateral',
        cue: 'Pas larg lateral, te așezi pe piciorul care pășește, celălalt rămâne întins. Forța laterală de care ai nevoie în ring. Cobori doar cât genunchiul nu protestează.',
      },
      {
        id: 'calf', name: 'Calf Raises', vars: ['Calf Raises', 'Single-leg Calf Raises'], start: 1,
        type: 'reps', sets: 3, lo: 8, hi: 12, perSide: true, rest: 60, load: true, muscles: 'gambe, tendonul lui Ahile',
        cue: 'Urci pe vârfuri, ții o secundă sus, cobori lent în 3 secunde. Gleznele puternice ajută la coardă, sprint și în ring.',
      },
      {
        id: 'cossack', name: 'Cossack Squats', vars: ['Assisted Cossack Squats', 'Cossack Squats'], start: 0,
        type: 'reps', sets: 2, lo: 6, hi: 8, perSide: true, rest: 45, opt: true, muscles: 'șolduri, adductori',
        cue: 'Te muți de pe un picior pe altul, cu piciorul întins pe vârf. Doar cât de jos merge fără durere de genunchi.',
        alex: 'Mobilitate de șold ca în rutina lui „Dagestan”.',
      },
      {
        id: 'wallsit', name: 'Wall Sit', vars: ['Wall Sit'], start: 0,
        type: 'time', sets: 2, lo: 45, hi: 60, rest: 60, opt: true, muscles: 'cvadricepși',
        cue: 'Opțional, la final. Spatele lipit de perete, genunchii la 90°, respiri calm. Ținutele fără mișcare sunt de obicei bine tolerate de genunchi.',
      },
    ],
  },
  {
    // The second strength dose of the week for pulling and pressing, on Monday in the strength emphasis (cycle A):
    // strength grows better with two sessions a week than with one. Short heavy sets, 2 reps in reserve.
    id: 'upper',
    name: 'Upper Strength',
    min: 15,
    ex: [
      {
        id: 'pull-str', name: 'Pull-ups', vars: ['Negative Pull-ups', 'Band-assisted Pull-ups', 'Pull-ups', 'Weighted Pull-ups'], start: 2,
        type: 'reps', sets: 3, lo: 3, hi: 5, rest: 150, muscles: 'spate, biceps',
        cue: 'Serii scurte și grele, cu 2 repetări în rezervă: nu e EMOM-ul de vineri, e forță. Când faci 3 × 5 curat, treci la Weighted Pull-ups, cu un rucsac sau o ganteră între picioare.',
      },
      {
        id: 'dips-str', name: 'Dips', vars: ['Negative Dips', 'Parallel Bar Dips', 'Weighted Dips'], start: 1,
        type: 'reps', sets: 3, lo: 3, hi: 5, rest: 150, muscles: 'piept, triceps',
        cue: 'La fel: serii scurte, grele, cu 2 repetări în rezervă. Umerii jos, cotul la 90°. La 3 × 5 curat adaugi greutate.',
      },
    ],
  },
  {
    // Eight minutes for the knees, after Tuesday's push session and after Leg Day, while jumps hurt them.
    // Isometric holds ease tendon pain for a while (Rio 2015; later trials are mixed), slow loaded work builds the
    // tendon (heavy slow resistance, Kongsgaard 2009), and the front of the shin takes part of the braking.
    id: 'knee',
    name: 'Knee Armor',
    min: 8,
    ex: [
      {
        id: 'knee-iso', name: 'Isometric Hold', vars: ['Wall Sit Hold', 'Spanish Squat Hold'], start: 0,
        type: 'time', sets: 4, lo: 30, hi: 45, rest: 45, muscles: 'cvadriceps, tendonul rotulian',
        cue: 'Cobori până unde durerea e cel mult 3 din 10, nu mai jos de 90°, și ții. Spanish Squat: o bandă groasă în spatele genunchilor, prinsă de un stâlp; te lași pe spate cu tibiile verticale.',
      },
      {
        id: 'knee-step', name: 'Slow Step-downs', vars: ['Step-down (low step)', 'Step-down (high step)', 'Weighted Step-down'], start: 0,
        type: 'reps', sets: 2, lo: 6, hi: 10, perSide: true, rest: 45, muscles: 'cvadriceps, controlul genunchiului',
        cue: 'Pe un picior, cobori în 3 secunde până când călcâiul celuilalt atinge ușor solul, apoi urci. Genunchiul merge în linie cu degetele, nu spre interior.',
      },
      {
        id: 'tib', name: 'Tibialis Raises', vars: ['Wall Tibialis Raises'], start: 0,
        type: 'reps', sets: 2, lo: 15, hi: 25, rest: 30, muscles: 'tibia anterioară',
        cue: 'Spatele la perete, călcâiele la o palmă de el: ridici vârfurile cât de sus poți și cobori lent. Arde pe față, e normal.',
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
