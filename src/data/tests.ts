// The test battery for an all-round athlete, run alone with a phone, a tape and a timer.
// Done early in the lighter week (the 4th of every emphasis), power first and aerobic last.
// Only three tests have published reference values here (men 20–29, the user is 23); the rest are measured against
// your own baseline. The jump tests wait until the jumps are back in Leg Day; the throw stands in for them until then.

export type TestUnit = 'cm' | 'reps' | 's' | 'time' | 'punches';

export interface FitTest {
  id: string;
  name: string;
  /** The quality it measures. */
  what: string;
  unit: TestUnit;
  /** True when a bigger number is better. */
  higher: boolean;
  how: string;
  /** A published reference, with its source. */
  ref?: string;
  every: string;
}

export const TESTS: FitTest[] = [
  {
    id: 'scoop', name: 'Medicine Ball Scoop Toss', what: 'Putere de șold, fără aterizare', unit: 'cm', higher: true, every: 'În săptămâna ușoară',
    how: 'Afară, cu aceeași minge de fiecare dată: 3 aruncări din șold, înainte și în sus, cu pauză completă. Măsori de la linia de start până unde atinge mingea prima dată solul și notezi cea mai lungă.',
  },
  {
    id: 'cmj', name: 'Countermovement Jump', what: 'Putere de picioare', unit: 'cm', higher: true, every: 'În săptămâna ușoară',
    how: 'Doar după ce săriturile au revenit în Leg Day. Cu o aplicație de măsurat săritura (de exemplu My Jump): 3 sărituri cu mâinile pe șolduri, la 30 de secunde una de alta. Notezi media.',
    ref: 'Boxeri antrenați: 32–37 cm (Pinto 2026, Han 2025).',
  },
  {
    id: 'broad', name: 'Broad Jump', what: 'Putere pe orizontală', unit: 'cm', higher: true, every: 'În săptămâna ușoară',
    how: 'Doar după ce săriturile au revenit în Leg Day. 3 sărituri în lungime cu aterizare fixă. Notezi cea mai lungă, de la linia de start la călcâiul din spate.',
  },
  {
    id: 'pushups', name: 'Max Push-ups', what: 'Rezistența mușchilor de împins', unit: 'reps', higher: true, every: 'În săptămâna ușoară',
    how: 'Odihnit, primul lucru din zi: pieptul la un pumn de sol, brațele întinse complet, fără pauze mai lungi de 2 secunde.',
    ref: 'Standarde de poliție după normele Cooper, bărbați 20–29 de ani: 26 de flotări la percentila 30, 41 la percentila 70.',
  },
  {
    id: 'pullups', name: 'Max Pull-ups', what: 'Forța relativă de tracțiune', unit: 'reps', higher: true, every: 'În săptămâna ușoară',
    how: 'Din atârnat complet, bărbia peste bară, fără balans. La 5 minute după flotări.',
    ref: 'Baremul SRI, Brigada Antitero (bărbați): 14 tracțiuni = nota 10, 13 = 9, 9 = 5, 5 = 1.',
  },
  {
    id: 'sprint50', name: '50 m Sprint', what: 'Viteză, proba SRI', unit: 's', higher: false, every: 'În săptămâna ușoară',
    how: 'Pe pistă sau pe asfalt plat, 50 m măsurați, după încălzire și două accelerări. Start din picioare, cronometrat de un partener sau filmat; cel mai bun din 2, cu pauză completă. Zecimala contează.',
    ref: 'Baremul SRI, Brigada Antitero (bărbați): 6,8 s = nota 10, 6,9 = 9, 7,3 = 5, 7,7 = 1.',
  },
  {
    id: 'run1000', name: '1000 m Run', what: 'Rezistență, proba SRI', unit: 'time', higher: false, every: 'La 8 săptămâni',
    how: 'Pe pistă (2,5 ture) sau pe o buclă măsurată, după 10 minute de încălzire. Primii 400 m puțin sub ritmul-țintă, apoi ții. Se face în altă zi decât 2,4 km.',
    ref: 'Baremul SRI, Brigada Antitero (bărbați): 3:20 = nota 10, 3:25 = 9, 3:45 = 5, 4:05 = 1.',
  },
  {
    id: 'plank', name: 'Forearm Plank', what: 'Rezistența trunchiului', unit: 's', higher: true, every: 'În săptămâna ușoară',
    how: 'Pe antebrațe, corpul drept. Te oprești la prima lăsare a șoldurilor.',
  },
  {
    id: 'sideplank', name: 'Side Plank', what: 'Trunchiul lateral', unit: 's', higher: true, every: 'În săptămâna ușoară',
    how: 'Pe fiecare parte; notezi partea mai slabă. Diferențele mari între părți merită lucrate.',
  },
  {
    id: 'punchout', name: 'Punch-out Test', what: 'Capacitate anaerobă, specifică sporturilor de lovire', unit: 'punches', higher: true, every: 'În săptămâna ușoară',
    how: 'O singură rundă de punch-out (14 × 3 s) filmată. Numeri loviturile din toate exploziile și urmărești dacă ultimele trei sunt mult sub primele trei.',
  },
  {
    id: 'bss', name: 'Split Squat Reps', what: 'Forța picioarelor', unit: 'reps', higher: true, every: 'La 8 săptămâni',
    how: 'Cu cele mai grele gantere, aceleași de fiecare dată: repetări pe piciorul mai slab, oprindu-te cu o repetare înainte de limită.',
  },
  {
    id: 'hang', name: 'Dead Hang', what: 'Priză', unit: 's', higher: true, every: 'La 8 săptămâni',
    how: 'Atârnat de bară, cu palmele în față, cât poți. Doar în ziua de test: în antrenament te dai jos înainte de limită.',
  },
  {
    id: 'kickh', name: 'Kick Height', what: 'Mobilitatea șoldului pentru kick-uri', unit: 'cm', higher: true, every: 'La 8 săptămâni',
    how: 'Încălzit, lângă un perete sau un sac: un roundhouse controlat cu piciorul din spate, cu pivot, și atingi cu tibia punctul cel mai înalt la care ajungi curat, fără să cazi pe spate și fără săritură. Un partener marchează sau filmezi; măsori de la sol până la punct. Cel mai bun din 3. Dacă genunchiul e peste 3 din 10, îl amâni. Te compari doar cu tine: la 2 m, alt reper n-are sens.',
  },
  {
    id: 'run24', name: '2,4 km Run', what: 'Capacitate aerobă', unit: 'time', higher: false, every: 'La 8 săptămâni',
    how: 'Pe un traseu plat sau pe o buclă măsurată, după 10 minute de încălzire. Ritm constant, tot ce poți. Îl faci în locul alergării ușoare de duminică.',
    ref: 'Standarde de poliție după normele Cooper, bărbați 20–29 de ani: 13:16 la percentila 30, 10:59 la percentila 70.',
  },
];

export function testById(id: string): FitTest | undefined {
  return TESTS.find((t) => t.id === id);
}

export const UNIT_LABEL: Record<TestUnit, string> = { cm: 'cm', reps: 'repetări', s: 's', time: 'mm:ss', punches: 'lovituri' };

/** The best result so far (highest, or lowest for timed runs). */
export function bestOf(t: FitTest, rows: Array<{ d: string; v: number }>): number | undefined {
  if (!rows.length) return undefined;
  return t.higher ? Math.max(...rows.map((r) => r.v)) : Math.min(...rows.map((r) => r.v));
}
