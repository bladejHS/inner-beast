// Race simulations for the Challenge tab, each on five levels. Distances are the usual public race formats,
// scaled down for the lower levels. These are training simulations, not official events.

export interface Seg {
  name: string;
  detail?: string;
  /** Without the equipment: what to do instead. */
  alt?: string;
  /** Timed segment: moves on by itself. Without it, you tap when it's done. */
  sec?: number;
  rest?: boolean;
}

export interface RaceLevel {
  name: string;
  /** Rough finishing time for a prepared athlete at this level, in minutes. */
  est: number;
  segs: Seg[];
}

export interface Race {
  id: string;
  name: string;
  sub: string;
  icon: string;
  note: string;
  levels: RaceLevel[];
}

export const LEVEL_NAMES = ['Începător', 'Intermediar', 'Avansat', 'Pro', 'Elită'];

const km = (v: number): string => (v < 1 ? `${Math.round(v * 1000)} m` : `${String(v).replace('.', ',')} km`);

function tri(swim: number, bike: number, run: number): Seg[] {
  return [
    { name: 'Swim', detail: km(swim), alt: `Fără piscină: Machine Row ${km(swim * 4)}` },
    { name: 'T1', detail: 'Schimbi echipamentul, fără pauză' },
    { name: 'Bike', detail: km(bike), alt: `Fără bicicletă: mers alert sau bandă, ${km(bike / 4)}` },
    { name: 'T2', detail: 'Schimbi echipamentul, fără pauză' },
    { name: 'Run', detail: km(run), alt: 'Fără alergare: mers alert, aceeași distanță' },
  ];
}

interface Station {
  name: string;
  unit: string;
  full: number;
  alt: string;
}

const STATIONS: Station[] = [
  { name: 'Ski Erg', unit: 'm', full: 1000, alt: 'Fără aparat: Burpees, 1 repetare la 20 m' },
  { name: 'Sled Push', unit: 'm', full: 50, alt: 'Fără sanie: Bear Crawl, aceeași distanță' },
  { name: 'Sled Pull', unit: 'm', full: 50, alt: 'Fără sanie: Inverted Rows, 1 repetare la 2 m' },
  { name: 'Burpee Broad Jumps', unit: 'm', full: 80, alt: 'Fără spațiu: Burpees, 1 repetare la 2 m' },
  { name: 'Row', unit: 'm', full: 1000, alt: 'Fără aparat: Jumping Jacks, 1 repetare la 5 m' },
  { name: 'Farmers Carry', unit: 'm', full: 200, alt: 'Fără greutăți: rucsac plin ținut în mâini' },
  { name: 'Sandbag Lunges', unit: 'm', full: 100, alt: 'Fără sac: Walking Lunges cu rucsac' },
  { name: 'Wall Balls', unit: 'rep', full: 100, alt: 'Fără minge: Jumping Squats' },
];

function hyrox(runM: number, scale: number): Seg[] {
  return STATIONS.flatMap((s, i) => [
    { name: `Run ${i + 1} din 8`, detail: `${runM} m` },
    { name: s.name, detail: `${Math.round((s.full * scale) / 5) * 5} ${s.unit === 'rep' ? 'repetări' : 'm'}`, alt: s.alt },
  ]);
}

const OBSTACLES: Array<[string, string]> = [
  ['Burpees', '30 de repetări, penalizarea clasică'],
  ['Bear Crawl', '30 m'],
  ['Pull-ups', '10 repetări sau Negative Pull-ups'],
  ['Farmers Carry', '100 m cu ce greutate ai'],
  ['Walking Lunges', '40 de pași'],
  ['Dead Hang', 'Cât poți, minimum 30 s'],
  ['Inverted Rows', '15 repetări'],
  ['Squats', '40 de repetări'],
];

function spartan(totalKm: number, obstacles: number): Seg[] {
  const leg = Math.round((totalKm / obstacles) * 100) / 100;
  return Array.from({ length: obstacles }, (_, i) => {
    const [name, detail] = OBSTACLES[i % OBSTACLES.length];
    return [
      { name: `Run ${i + 1} din ${obstacles}`, detail: km(leg), alt: 'Pe teren variat, dacă poți' },
      { name, detail: `Obstacolul ${i + 1}. ${detail}` },
    ];
  }).flat();
}

function run(dist: number): Seg[] {
  const half = Math.round((dist / 2) * 100) / 100;
  return [
    { name: 'Prima jumătate', detail: km(half), alt: 'Fără alergare: mers alert' },
    { name: 'A doua jumătate', detail: km(half), alt: 'Ținta: la fel de repede ca prima' },
  ];
}

function fight(rounds: number, min: number, bout = ''): Seg[] {
  const focus = ['Jab, teep și distanță', 'Pumni, apoi piciorul', 'La corp: body kick și genunchi', 'Check, contră și ieșiri în cerc', 'Putere: combinațiile tale cele mai bune'];
  return Array.from({ length: rounds }, (_, i) => [
    { name: `${bout}Runda ${i + 1} din ${rounds}`, detail: focus[i % focus.length], alt: 'Shadow Kickboxing sau sac', sec: min * 60 },
    ...(i < rounds - 1 ? [{ name: 'Pauză', detail: 'Respiră adânc, bei apă', sec: 60, rest: true }] : []),
  ]).flat();
}

/** A K-1 tournament night: the same fighter goes 3 × 3 min up to three times, with a break between the bouts. */
function tournament(bouts: number): Seg[] {
  const names = bouts === 2 ? ['Semifinala', 'Finala'] : ['Sfertul de finală', 'Semifinala', 'Finala'];
  return names.flatMap((n, i) => [
    ...fight(3, 3, `${n}, `),
    ...(i < names.length - 1 ? [{ name: 'Pauză între meciuri', detail: 'Te miști ușor, bei apă, rămâi cald', sec: 300, rest: true }] : []),
  ]);
}

function murph(mile: number, pull: number, push: number, squat: number): Seg[] {
  return [
    { name: 'Run', detail: km(mile) },
    { name: 'Pull-ups', detail: `${pull} repetări, împărțite cum vrei`, alt: 'Fără bară: TRX Rows sau Inverted Rows' },
    { name: 'Push-ups', detail: `${push} repetări, împărțite cum vrei` },
    { name: 'Squats', detail: `${squat} repetări, împărțite cum vrei` },
    { name: 'Run', detail: km(mile) },
  ];
}

export const RACES: Race[] = [
  {
    id: 'ironman', name: 'Ironman Simulation', sub: 'Înot, bicicletă, alergare', icon: 'bolt',
    note: 'Nivelurile Pro și Elită durează ore întregi: planifică apă și mâncare pe traseu și o zi liberă după. Înotul se face doar într-un loc supravegheat.',
    levels: [
      { name: 'Super Sprint', est: 60, segs: tri(0.4, 10, 2.5) },
      { name: 'Sprint', est: 90, segs: tri(0.75, 20, 5) },
      { name: 'Olympic', est: 165, segs: tri(1.5, 40, 10) },
      { name: 'Half Distance', est: 360, segs: tri(1.9, 90, 21.1) },
      { name: 'Full Distance', est: 780, segs: tri(3.8, 180, 42.2) },
    ],
  },
  {
    id: 'hyrox', name: 'Hyrox Simulation', sub: '8 alergări, 8 stații', icon: 'run',
    note: 'Elită e distanța completă de concurs. Dacă nu ai aparatele, fiecare stație are o variantă de acasă.',
    levels: [
      { name: 'Quarter', est: 35, segs: hyrox(250, 0.25) },
      { name: 'Half', est: 55, segs: hyrox(500, 0.5) },
      { name: 'Three Quarters', est: 75, segs: hyrox(750, 0.75) },
      { name: 'Open', est: 95, segs: hyrox(1000, 1) },
      { name: 'Pro', est: 80, segs: hyrox(1000, 1).map((s, i) => (i % 2 ? { ...s, detail: `${s.detail}, cu greutate mai mare` } : s)) },
    ],
  },
  {
    id: 'spartan', name: 'Spartan Simulation', sub: 'Alergare și obstacole', icon: 'flag',
    note: 'Obstacolele sunt simulate cu exerciții. Dacă ratezi unul, faci 30 de Burpees și mergi mai departe.',
    levels: [
      { name: 'Mini', est: 25, segs: spartan(2, 8) },
      { name: 'Sprint', est: 60, segs: spartan(5, 20) },
      { name: 'Super', est: 120, segs: spartan(10, 25) },
      { name: 'Beast', est: 270, segs: spartan(21, 30) },
      { name: 'Ultra', est: 660, segs: spartan(50, 60) },
    ],
  },
  {
    id: 'run', name: 'Road Race', sub: 'De la 5 km la ultramaraton', icon: 'walk',
    note: 'Pornește mai lent decât crezi. A doua jumătate îți arată dacă ai împărțit bine efortul.',
    levels: [
      { name: '5 km', est: 32, segs: run(5) },
      { name: '10 km', est: 62, segs: run(10) },
      { name: 'Half Marathon', est: 135, segs: run(21.1) },
      { name: 'Marathon', est: 300, segs: run(42.2) },
      { name: 'Ultra 50 km', est: 390, segs: run(50) },
    ],
  },
  {
    id: 'fight', name: 'Fight Night', sub: 'Gala ta de kickboxing, runde cronometrate', icon: 'fight',
    note: 'Rundele trec singure, cu pauză de 1 minut. Ține ritmul până la ultimul gong. Un meci de kickboxing are 3 runde de 3 minute; cel pentru titlu, 5. La turneele K-1, același luptător urca în ring de până la trei ori în aceeași seară.',
    levels: [
      { name: '3 × 2 min', est: 8, segs: fight(3, 2) },
      { name: '3 × 3 min', est: 11, segs: fight(3, 3) },
      { name: '5 × 3 min, titlu', est: 19, segs: fight(5, 3) },
      { name: 'Turneu: 2 meciuri', est: 27, segs: tournament(2) },
      { name: 'Turneu K-1: 3 meciuri', est: 43, segs: tournament(3) },
    ],
  },
  {
    id: 'murph', name: 'Murph', sub: 'Alergare, tracțiuni, flotări, genuflexiuni', icon: 'trophy',
    note: 'Formatul clasic e nivelul Pro; la Elită îl faci cu un rucsac greu de 9 kg.',
    levels: [
      { name: 'Quarter', est: 15, segs: murph(0.4, 25, 50, 75) },
      { name: 'Half', est: 28, segs: murph(0.8, 50, 100, 150) },
      { name: 'Three Quarters', est: 42, segs: murph(1.2, 75, 150, 225) },
      { name: 'Full', est: 55, segs: murph(1.6, 100, 200, 300) },
      { name: 'Full + 9 kg', est: 70, segs: murph(1.6, 100, 200, 300).map((s) => ({ ...s, detail: `${s.detail}, cu rucsac` })) },
    ],
  },
];

export function raceById(id: string): Race | undefined {
  return RACES.find((r) => r.id === id);
}
