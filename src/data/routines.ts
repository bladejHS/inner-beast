// Guided, timed routines. "sides" moves get a beep and a "switch sides" call at half time.

export interface Move {
  name: string;
  sec: number;
  cue: string;
  sides?: boolean;
  /** Taken from Alex Hanma's own mobility work. */
  alex?: boolean;
}

export interface Routine {
  id: 'stretch-push' | 'stretch-pull' | 'mobility' | 'daily' | 'dagestan' | 'peekaboo' | 'abs' | 'splits' | 'homebox';
  name: string;
  intro: string;
  moves: Move[];
}

function stretch(kind: 'push' | 'pull'): Move[] {
  const push = kind === 'push';
  return [
    { name: 'Jumping Jacks', sec: 30, cue: 'Ridici pulsul și temperatura corpului.' },
    { name: 'Arm Circles', sec: 60, cue: '30 de secunde înainte, 30 înapoi. Cercuri mari, relaxate.', alex: true },
    { name: 'Shoulder Rolls', sec: 45, cue: 'Rotiri ample ale umerilor, înainte și înapoi.' },
    { name: 'Shoulder Dislocates', sec: 60, cue: 'Cu un prosop sau o bandă: brațele întinse trec peste cap, în spate, și revin.' },
    push
      ? { name: 'Scapular Push-ups', sec: 45, cue: 'În poziție de flotare, cu brațele întinse: mișți doar omoplații.' }
      : { name: 'Scapular Pulls', sec: 45, cue: 'Atârnat de bară, cu brațele întinse: tragi doar din omoplați.' },
    { name: 'Cross-body Shoulder Stretch', sec: 60, sides: true, cue: 'Tragi brațul peste piept și ții.' },
    push
      ? { name: 'Doorway Chest Stretch', sec: 60, cue: 'Antebrațul pe tocul ușii, pășești înainte până simți pieptul.' }
      : { name: 'Lat Stretch', sec: 60, sides: true, cue: 'Te ții de tocul ușii și împingi șoldul în spate: se întinde dorsalul.' },
    { name: 'Overhead Triceps Stretch', sec: 60, sides: true, cue: 'Cotul sus, palma coboară pe spate.' },
    { name: 'Wrist Circles', sec: 45, cue: push ? 'Încheieturile pregătite pentru flotări.' : 'Încheieturile și antebrațele pregătite pentru bară.' },
    { name: 'Neck Mobility', sec: 45, cue: 'Înclini capul lent stânga-dreapta și înainte, fără rotiri forțate.' },
    { name: 'Cat-Cow', sec: 60, cue: 'În patru labe: arcuiești și rotunjești spatele odată cu respirația.' },
    { name: 'Thoracic Rotations', sec: 60, sides: true, cue: 'În patru labe, cu mâna la ceafă: deschizi cotul spre tavan.' },
    { name: "World's Greatest Stretch", sec: 90, sides: true, cue: 'Fandare adâncă, cotul spre sol, apoi rotești brațul spre tavan.' },
    { name: 'Hip Flexor Stretch', sec: 60, sides: true, cue: 'Genunchiul din spate pe sol, împingi șoldul înainte.' },
    { name: 'Hamstring Stretch', sec: 60, cue: 'Picioarele întinse, cobori din șold cu spatele drept.' },
    { name: 'Deep Squat Hold', sec: 60, cue: 'Ghemuit adânc, călcâiele pe sol, coatele împing genunchii în afară.' },
  ];
}

export const ROUTINES: Routine[] = [
  {
    id: 'stretch-push',
    name: 'Full Body Stretching',
    intro: 'Încălzirea umerilor pentru ziua de push: 15 minute, fiecare exercițiu are timerul lui.',
    moves: stretch('push'),
  },
  {
    id: 'stretch-pull',
    name: 'Full Body Stretching',
    intro: 'Încălzirea umerilor pentru ziua de pull: 15 minute, fiecare exercițiu are timerul lui.',
    moves: stretch('pull'),
  },
  {
    id: 'mobility',
    name: 'Mobility Training',
    intro: '30 de minute: picioare, șolduri și partea de sus a corpului. Respiră lent în fiecare poziție.',
    moves: [
      { name: 'Leg Swings (front-back)', sec: 60, sides: true, cue: 'Te ții de perete și balansezi piciorul înainte-înapoi.' },
      { name: 'Leg Swings (side)', sec: 60, sides: true, cue: 'Balans lateral, prin fața corpului.' },
      { name: 'Hip Circles', sec: 60, cue: 'Mâinile pe șolduri, cercuri mari în ambele sensuri.' },
      { name: '90/90 Hip Switches', sec: 90, cue: 'Așezat, cu ambii genunchi la 90°: rotești genunchii dintr-o parte în alta.' },
      { name: 'Pigeon Stretch', sec: 120, sides: true, cue: 'Gamba în fața ta, piciorul din spate întins. Respiri și cobori.' },
      { name: 'Couch Stretch', sec: 120, sides: true, cue: 'Genunchiul lângă perete, laba sus pe perete: se întind coapsa și flexorii șoldului.' },
      { name: 'Lizard Stretch', sec: 90, sides: true, cue: 'Fandare adâncă, cu ambele mâini în interiorul piciorului din față.' },
      { name: 'Frog Stretch', sec: 90, cue: 'În patru labe, cu genunchii larg: împingi șoldurile în spate.' },
      { name: 'Cossack Squats', sec: 90, cue: 'Te muți lent de pe un picior pe altul, cu piciorul întins pe călcâi.' },
      { name: 'Dagestan Hip Shifts', sec: 90, alex: true, cue: 'Din poziție largă, cu mâinile pe sol, muți șoldurile dintr-o parte în alta, ca în rutina „Dagestan” de la Alex.' },
      { name: 'Straddle Sink', sec: 90, alex: true, cue: 'Picioarele foarte depărtate, mâinile în față: cobori șoldurile spre sol și respiri.' },
      { name: 'Seated Hamstring Stretch', sec: 90, cue: 'Picioarele întinse în față, cobori pieptul spre genunchi cu spatele drept.' },
      { name: 'Butterfly Stretch', sec: 60, cue: 'Tălpile lipite, genunchii cad spre sol.' },
      { name: 'Calf Stretch', sec: 60, sides: true, cue: 'Mâinile pe perete, piciorul din spate întins, călcâiul pe sol.' },
      { name: 'Deep Squat Hold', sec: 90, cue: 'Ghemuit adânc, călcâiele jos, pieptul sus.' },
      { name: 'Arm Circles', sec: 60, alex: true, cue: 'Cercuri mari cu brațele: Alex le face zilnic ca să rămână mobil și rapid.' },
      { name: 'Thread the Needle', sec: 90, sides: true, cue: 'În patru labe, strecori un braț pe sub corp și rotești toracele.' },
      { name: 'Open Book Stretch', sec: 90, sides: true, cue: 'Întins pe o parte, cu genunchii la 90°: deschizi brațul de sus ca pe o carte.' },
      { name: "Child's Pose", sec: 60, cue: 'Stai pe călcâie, brațele întinse înainte, fruntea jos.' },
      { name: 'Cobra Stretch', sec: 60, cue: 'Pe burtă, împingi pieptul sus, șoldurile rămân pe sol.' },
      { name: 'Doorway Chest Stretch', sec: 60, cue: 'Antebrațul pe tocul ușii, pășești înainte.' },
      { name: 'Sleeper Stretch', sec: 60, sides: true, cue: 'Întins pe o parte, brațul de jos la 90°: împingi ușor palma spre sol.' },
      { name: 'Neck Stretch', sec: 60, sides: true, cue: 'Urechea spre umăr, umărul opus coboară.' },
    ],
  },
  {
    id: 'daily',
    name: 'Daily Mobility',
    intro: 'Alex face mobilitate 10–15 minute în fiecare zi, ca forța să nu-l facă rigid. Opțional, în orice zi.',
    moves: [
      { name: 'Arm Circles', sec: 60, alex: true, cue: 'Cercuri mari, în ambele sensuri. Așa începe Alex.' },
      { name: 'Shoulder Dislocates', sec: 60, cue: 'Cu un prosop sau o bandă, brațele întinse trec peste cap.' },
      { name: 'Torso Twists', sec: 60, cue: 'Rotiri relaxate ale trunchiului, brațele libere.' },
      { name: 'Hip Circles', sec: 60, cue: 'Cercuri mari cu șoldurile, în ambele sensuri.' },
      { name: 'Leg Swings', sec: 60, sides: true, cue: 'Balans înainte-înapoi, te ții de perete.' },
      { name: 'Dagestan Hip Shifts', sec: 90, alex: true, cue: 'Poziție largă, mâinile pe sol, muți șoldurile dintr-o parte în alta.' },
      { name: 'Deep Squat Hold', sec: 60, cue: 'Ghemuit adânc, călcâiele pe sol.' },
      { name: 'Wrist & Ankle Circles', sec: 60, cue: 'Încheieturile și gleznele, în ambele sensuri.' },
      { name: 'Neck Mobility', sec: 30, cue: 'Lent, fără rotiri forțate.' },
      { name: 'Loose Shadow Boxing', sec: 60, alex: true, cue: 'Pumni relaxați, brațul întins complet. De la lejer la tare.' },
    ],
  },
  {
    id: 'dagestan',
    name: 'Dagestan Mobility',
    intro: 'Rutina de mobilitate pentru șolduri și adductori pe care Alex o lucrează după clipul „Dagestan Mobility Routine”. Recunoaște singur că mai are de lucrat la ea: mergi doar până unde poți, fără durere.',
    moves: [
      { name: 'Dagestan Hip Shifts', sec: 90, alex: true, cue: 'Picioarele larg, mâinile pe sol: muți greutatea dintr-o parte în alta, piciorul opus rămâne întins.' },
      { name: 'Straddle Dive', sec: 60, alex: true, cue: 'Din șoldurile sus, pieptul trece printre mâini și bazinul coboară spre sol.' },
      { name: 'Straddle Sink', sec: 90, alex: true, cue: 'Picioarele foarte depărtate, cobori șoldurile la fiecare expirație.' },
      { name: 'Middle Split Reach', sec: 90, alex: true, cue: 'În sfoară laterală, întinzi pe rând câte o mână cât mai departe înainte.' },
      { name: 'Straddle Side Bend', sec: 90, sides: true, alex: true, cue: 'Din sfoară, cobori trunchiul peste un picior, apoi peste celălalt.' },
      { name: 'Frog Stretch', sec: 60, cue: 'În patru labe, genunchii larg: împingi șoldurile în spate.' },
      { name: 'Butterfly Stretch', sec: 60, cue: 'Tălpile lipite, genunchii cad spre sol.' },
    ],
  },
  {
    id: 'peekaboo',
    name: 'Peekaboo Workout',
    intro: 'Cele 7 exerciții de peek-a-boo arătate de Alex, cu timpii scriși pe ecran: 2 serii din fiecare. Garda lipită de față tot timpul, mișcarea vine din genunchi. La Twist 180 Alex nu dă timpul; aici are 30 de secunde.',
    moves: [
      { name: 'Zig-Zag Slips', sec: 20, alex: true, cue: 'Seria 1: eschive stânga-dreapta în timp ce avansezi în zigzag.' },
      { name: 'Zig-Zag Slips', sec: 20, alex: true, cue: 'Seria 2.' },
      { name: 'Weaves', sec: 20, alex: true, cue: 'Seria 1: treci cu capul pe sub o lovitură imaginară, în U, dintr-o parte în alta.' },
      { name: 'Weaves', sec: 20, alex: true, cue: 'Seria 2.' },
      { name: 'Slip-Roll Uppercut', sec: 30, alex: true, cue: 'Seria 1: slip, roll pe sub, apoi uppercut din partea în care ai ieșit.' },
      { name: 'Slip-Roll Uppercut', sec: 30, alex: true, cue: 'Seria 2.' },
      { name: 'Weave + Hook', sec: 20, alex: true, cue: 'Seria 1: weave, iar când urci, croșeu din partea respectivă.' },
      { name: 'Weave + Hook', sec: 20, alex: true, cue: 'Seria 2.' },
      { name: 'Slip In Slip Out', sec: 30, alex: true, cue: 'Seria 1: intri cu un slip, ieși cu un slip, garda strânsă.' },
      { name: 'Slip In Slip Out', sec: 30, alex: true, cue: 'Seria 2.' },
      { name: 'Leg Switch', sec: 20, alex: true, cue: 'Seria 1: schimbi garda dintr-un salt mic, stânga-dreapta.' },
      { name: 'Leg Switch', sec: 20, alex: true, cue: 'Seria 2.' },
      { name: 'Twist 180 + Punching', sec: 30, alex: true, cue: 'Pivotezi la 180° și lovești imediat din noua direcție.' },
    ],
  },
  {
    id: 'abs',
    name: 'Abs Workout',
    intro: 'Abdomenul lui Alex, „fără pauză”: exercițiile și timpii sunt cei de pe ecran. Pentru cele cu minge îți ajunge o minge medicinală, o gantere sau o sticlă plină.',
    moves: [
      { name: 'Seated Leg Raises', sec: 30, alex: true, cue: 'Așezat, sprijinit în mâini, ridici și cobori picioarele întinse.' },
      { name: 'Touch Your Foot', sec: 30, alex: true, cue: 'Din V, atingi pe rând cu mâna piciorul opus.' },
      { name: 'Ball Twists', sec: 30, alex: true, cue: 'Cu mingea la piept, picioarele sus, rotești trunchiul stânga-dreapta.' },
      { name: 'Ball Sit-up Press', sec: 30, alex: true, cue: 'Urci din abdomen și împingi mingea deasupra capului.' },
      { name: 'Leg Raises with Ball', sec: 30, alex: true, cue: 'Mingea între tălpi, ridici și cobori picioarele.' },
      { name: 'Legs Over Ball', sec: 30, alex: true, cue: 'Așezat, sprijinit în mâini: treci picioarele pe deasupra mingii, dintr-o parte în alta.' },
      { name: 'Plank', sec: 60, alex: true, cue: 'Pe antebrațe, corpul drept, abdomenul strâns.' },
      { name: 'High Plank', sec: 30, alex: true, cue: 'Pe palme, brațele întinse, corpul drept.' },
      { name: 'Seated Weight Hold', sec: 60, alex: true, cue: 'Ultimul: așezat, picioarele sus, ții greutatea la piept și o împingi peste cap.' },
    ],
  },
  {
    id: 'splits',
    name: 'Split Routine',
    intro: 'Cum lucrează Alex sfoara laterală: încălzire, apoi 5 runde de 2 minute în sfoară și 1 minut ținut în aer. Dacă e prea mult, fă 1 minut și 30 de secunde: adaptează nivelul. Fără mișcări bruște.',
    moves: [
      { name: 'Wide Stance Hold', sec: 60, alex: true, cue: 'Picioarele foarte depărtate, coborât, spatele drept: ții, ca să te încălzești.' },
      { name: 'Side-to-Side Shifts', sec: 60, alex: true, cue: 'Din poziția largă, te muți dreapta-stânga, tot mai relaxat.' },
      { name: 'Middle Split Lean', sec: 120, alex: true, cue: 'Runda 1 din 5: în sfoară, cât de jos poți, pieptul înainte. Respiri.' },
      { name: 'Split Push-up Hold', sec: 60, alex: true, cue: 'Mâinile pe sol, împingi și ții corpul în aer, tot în sfoară.' },
      { name: 'Middle Split Lean', sec: 120, alex: true, cue: 'Runda 2 din 5: în sfoară, cât de jos poți, pieptul înainte. Respiri.' },
      { name: 'Split Push-up Hold', sec: 60, alex: true, cue: 'Mâinile pe sol, împingi și ții corpul în aer, tot în sfoară.' },
      { name: 'Middle Split Lean', sec: 120, alex: true, cue: 'Runda 3 din 5: în sfoară, cât de jos poți, pieptul înainte. Respiri.' },
      { name: 'Split Push-up Hold', sec: 60, alex: true, cue: 'Mâinile pe sol, împingi și ții corpul în aer, tot în sfoară.' },
      { name: 'Middle Split Lean', sec: 120, alex: true, cue: 'Runda 4 din 5: în sfoară, cât de jos poți, pieptul înainte. Respiri.' },
      { name: 'Split Push-up Hold', sec: 60, alex: true, cue: 'Mâinile pe sol, împingi și ții corpul în aer, tot în sfoară.' },
      { name: 'Middle Split Lean', sec: 120, alex: true, cue: 'Runda 5 din 5: în sfoară, cât de jos poți, pieptul înainte. Respiri.' },
      { name: 'Split Push-up Hold', sec: 60, alex: true, cue: 'Mâinile pe sol, împingi și ții corpul în aer, tot în sfoară.' },
    ],
  },
  {
    id: 'homebox',
    name: 'Home Boxing Rounds',
    intro: 'Box acasă, fără echipament, cum îl arată Alex: o rundă de 3 minute are 1 minut de jaburi cu eschive, 1 minut de pași, 1 minut de lovituri drepte. El face 3–6 runde; aici sunt 3.',
    moves: [
      { name: 'Jabs with Slips & Pulls', sec: 60, alex: true, cue: 'Runda 1: jab, slip sau pull, jab.' },
      { name: 'Two Steps Forward, Two Back', sec: 60, alex: true, cue: 'Doi pași înainte, doi înapoi, în gardă.' },
      { name: 'Four Straight Punches', sec: 60, alex: true, cue: 'Câte patru lovituri drepte, apoi gardă.' },
      { name: 'Jabs with Slips & Pulls', sec: 60, alex: true, cue: 'Runda 2: jab, slip sau pull, jab.' },
      { name: 'Two Steps Forward, Two Back', sec: 60, alex: true, cue: 'Doi pași înainte, doi înapoi, în gardă.' },
      { name: 'Four Straight Punches', sec: 60, alex: true, cue: 'Câte patru lovituri drepte, apoi gardă.' },
      { name: 'Jabs with Slips & Pulls', sec: 60, alex: true, cue: 'Runda 3: jab, slip sau pull, jab.' },
      { name: 'Two Steps Forward, Two Back', sec: 60, alex: true, cue: 'Doi pași înainte, doi înapoi, în gardă.' },
      { name: 'Four Straight Punches', sec: 60, alex: true, cue: 'Câte patru lovituri drepte, apoi gardă.' },
    ],
  },
];

export function routineById(id: string): Routine {
  return ROUTINES.find((r) => r.id === id) ?? ROUTINES[0];
}

export function routineSeconds(r: Routine): number {
  return r.moves.reduce((s, m) => s + m.sec, 0);
}
