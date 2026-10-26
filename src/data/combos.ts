// Combinations and drills taken from Alex Hanma's TikTok (@alexhanma___), read frame by frame from his videos.
// Punch and drill names stay in English (as he labels them); notes are Romanian.

export type ComboCat = 'basics' | 'combo' | 'power' | 'defense' | 'counter' | 'footwork';

export interface Combo {
  id: string;
  name: string;
  seq: string[];
  /** Short line for the voice caller (English). */
  call: string;
  cat: ComboCat;
  note: string;
  /** TikTok video id on @alexhanma___ (none for the basics). */
  vid?: string;
  src?: string;
}

export const COMBOS: Combo[] = [
  {
    id: 'jab', name: 'The Jab', seq: ['Jab'], call: 'Jab', cat: 'basics',
    note: 'Rotești umărul și șoldul în lovitură: doar din braț, jabul are o fracțiune din putere. Umărul urcă și acoperă bărbia, mâna din spate stă la față, brațul se întinde complet și revine imediat.',
    vid: '7688859858728176928', src: 'How to throw the jab right',
  },
  {
    id: 'double-jab', name: 'Double Jab', seq: ['Jab', 'Jab'], call: 'Double jab', cat: 'basics',
    note: 'Al doilea jab pe toată distanța, nu pe jumătate. Alex: bazele lucrate perfect bat combinațiile complicate.',
  },
  {
    id: 'one-two', name: 'Jab – Cross', seq: ['Jab', 'Cross'], call: 'Jab, cross', cat: 'basics',
    note: 'Lovituri lungi, pe toată distanța. Crossul pleacă din piciorul din spate și din șold.',
  },
  {
    id: 'jab-out', name: 'Jab – Step Out', seq: ['Jab', 'Step out'], call: 'Jab, step out', cat: 'basics',
    note: 'Lovești și ieși imediat din linie. Garda rămâne sus după fiecare pumn.',
  },
  {
    id: 'body-body-head', name: 'Body, Body, Head', seq: ['Jab (body)', 'Jab (body)', 'Overhand Right (head)'], call: 'Jab body, jab body, overhand', cat: 'combo',
    note: 'Două jaburi la corp îl fac să coboare garda, apoi overhand-ul vine peste. E capcana din KO-ul de amatori arătat de Alex.',
    vid: '7677280053775895841', src: 'BODY BODY HEAD WORKS ALL THE TIME',
  },
  {
    id: 'body-head', name: 'Body → Head', seq: ['Cross (body)', 'Lead Hook (head)'], call: 'Cross body, hook head', cat: 'combo',
    note: 'Întâi atacă corpul, apoi capul. Cobori din genunchi pentru lovitura la corp, nu din spate.',
    vid: '7691752980223151392', src: 'Try this combination',
  },
  {
    id: 'liver', name: 'Jab – Cross – Hook – Liver Hook', seq: ['Jab', 'Cross', 'Lead Hook (head)', 'Lead Hook (liver)'], call: 'Jab, cross, hook head, hook liver', cat: 'combo',
    note: 'Al doilea croșeu coboară la ficat, pe partea dreaptă a adversarului. Schimbi nivelul din picioare.',
    vid: '7675065624858529056', src: 'TRY THIS',
  },
  {
    id: 'tyson-huh', name: 'Tyson: Hook – Uppercut – Hook', seq: ['Bob & Weave', 'Hook', 'Uppercut', 'Hook', 'Roll'], call: 'Weave, hook, uppercut, hook, roll', cat: 'combo',
    note: 'Peek-a-boo: mâinile lipite de față, genunchii îndoiți, capul se mișcă stânga-dreapta ca un pendul. Termini cu un roll, nu rămâi în fața lui.',
    vid: '7663910698841345312', src: 'Mike Tyson combinations',
  },
  {
    id: 'tyson-slip', name: 'Tyson: Slip – Slip – Roll – Roll – Hook – Uppercut', seq: ['Slip', 'Slip', 'Roll', 'Roll', 'Hook', 'Uppercut'], call: 'Slip, slip, roll, roll, hook, uppercut', cat: 'combo',
    note: 'Întâi te aperi, apoi răspunzi. Roll-ul te duce direct în poziția de croșeu.',
    vid: '7663910698841345312', src: 'Mike Tyson combinations',
  },
  {
    id: 'tyson-killer', name: 'Mike Tyson Killer Combo',
    seq: ['Body', 'Body', 'Body', 'Right Hook (head)', 'Switch to the side', 'Left Uppercut', 'Right Cross', 'Switch to the other side', 'Right Hook (body)', 'Right Hook (head)'],
    call: 'Body, body, body, right hook head. Switch. Left uppercut, right cross. Switch. Right hook body, right hook head', cat: 'power',
    note: 'Combinație lungă pentru sac, cu două schimbări de unghi. Lucreaz-o întâi încet, pe bucăți, apoi legată.',
    vid: '7670563696623537441', src: 'Mike Tyson crazy combination',
  },
  {
    id: 'angle-finish', name: 'Jab – Cross – Hook, Switch, Uppercut – Hook', seq: ['Jab', 'Cross', 'Hook', 'Switch to the side', 'Uppercut', 'Hook'], call: 'Jab, cross, hook. Switch. Uppercut, hook', cat: 'power',
    note: 'Un 1-2-3 clasic, apoi un pas în lateral ca să schimbi unghiul și continui cu uppercut și croșeu din noua poziție. În clip vine după mișcări de stradă (cap, lovituri ținând adversarul), interzise în sport și scoase de aici.',
    vid: '7695059682024639776', src: 'Streetfight combination 9',
  },
  {
    id: 'gazelle', name: 'Hooks → Gazelle Punch', seq: ['Bodyshot', 'Left Hook (head)', 'Switch Hook (body)', 'Right Hook (head)', 'Left Hook (body)', 'Left Hook (head)', 'Gazelle Punch'], call: 'Body, hook head, switch hook body, right hook head, left hook body, left hook head, gazelle punch', cat: 'power',
    note: 'Secvența lui Alex la sac: alternezi corpul și capul, schimbi garda pentru croșeul la corp și închei cu un Gazelle Punch, pornit din genunchi îndoiți cu împingere puternică din picioare.',
    vid: '7662284513959071008', src: 'Heavy bag combination',
  },
  {
    id: 'hooks-liver', name: 'Right Hook – Left Hook – Liver', seq: ['Right Hook', 'Left Hook (head)', 'Left Hook (liver)'], call: 'Right hook, left hook, liver', cat: 'power',
    note: 'Partea de pumni dintr-o combinație de stradă a lui Alex: două croșee la cap, apoi al doilea croșeu de stânga coboară la ficat. Începutul clipului (apucat de gât, lovitură cu capul) nu e inclus.',
    vid: '7672465161881521441', src: 'Street combination',
  },
  {
    id: 'step-overhand', name: 'Step to the Side → Overhand', seq: ['Step to the side', 'Overhand (head)'], call: 'Step to the side, overhand', cat: 'counter',
    note: 'Întâi pasul în lateral, cu garda sus, ca să ieși de pe linia lui. Abia apoi overhand-ul la cap, în arc peste gardă. Așa explică Alex KO-ul din clip.',
    vid: '7691018706457038112', src: 'Step to the side + overhand',
  },
  {
    id: 'duck-counter', name: 'Duck Under → Right Hand', seq: ['Duck under', 'Right Hand (head)'], call: 'Duck, right hand', cat: 'counter',
    note: 'Când adversarul se aruncă cu o lovitură largă, cobori sub ea îndoind mult genunchii (Alex îi marchează cu roșu) și urci imediat cu dreapta la cap. Mâna cealaltă stă la bărbie.',
    vid: '7698054696329596193', src: 'Monster KO',
  },
  {
    id: 'off-ropes', name: 'Off the Ropes', seq: ['Push off', 'Right Hook', 'Left Hook'], call: 'Push off, right hook, left hook', cat: 'power',
    note: 'Când atingi peretele sau corzile, te împingi înapoi și ieși cu două croșee. Nu rămâi lipit acolo.',
    vid: '7695784903249562912', src: 'This was really fast',
  },
  {
    id: 'pull-counter', name: 'Pull Counter', seq: ['Lean back', 'Small step back', 'Right Cross'], call: 'Pull back, cross', cat: 'counter',
    note: 'Te lași pe piciorul din spate ca jabul lui să treacă pe lângă, eventual cu un pas mic înapoi, încarci dreapta și contrezi.',
    vid: '7662021505760464160', src: 'Pull counter tutorial',
  },
  {
    id: 'ghost-step', name: 'Ghost Step', seq: ['Push off back foot', 'Push front foot back'], call: 'Ghost step', cat: 'footwork',
    note: 'Nu sări. Împingi din piciorul din spate, apoi împingi piciorul din față înapoi. Pași mici, rapizi, aproape de sol.',
    vid: '7667213156602662177', src: 'Ghost step tutorial',
  },
  {
    id: 'peekaboo', name: 'Peek-a-boo Head Movement', seq: ['Bob', 'Weave', 'Bob', 'Weave'], call: 'Peek a boo, move your head', cat: 'defense',
    note: 'Ca Tyson: mănușile la obraji, genunchii îndoiți, capul pendulează stânga-dreapta pe un arc în formă de U. Mișcarea vine din genunchi, nu din spate.',
    vid: '7663910698841345312', src: 'Mike Tyson combinations',
  },
  {
    id: 'guard-reset', name: 'Punch & Back to Guard', seq: ['Straight (head)', 'Level change', 'Straight (body)', 'Back to guard'], call: 'Head, body, guard', cat: 'basics',
    note: 'Răspunsul lui Alex celor care zic că garda te face rigid: din poziția de luptă lovești la cap, cobori din genunchi și lovești la corp, apoi revii imediat în gardă înaltă.',
    vid: '7696952330083732769', src: 'Why you need a guard',
  },
  {
    id: 'alphabet', name: 'Defense Alphabet', seq: ['S', 'T', 'U', 'V', 'W', 'U', 'Z'], call: 'Defense alphabet: S, T, U, V, W, U, Z', cat: 'defense',
    note: 'Desenezi literele cu capul, cu garda sus: S din slip-uri, U pe sub, ca un roll, W din două roll-uri, Z în zigzag. Video-ul cu cele mai multe vizualizări din lista lui de tehnici.',
    vid: '7670899488076221729', src: 'Learn some defences in boxing',
  },
];

export const CAT_NAMES: Record<ComboCat, string> = {
  basics: 'Bazele',
  combo: 'Combinații',
  power: 'Putere și unghiuri',
  defense: 'Apărare',
  counter: 'Contre',
  footwork: 'Joc de picioare',
};

/** Jump rope moves for "focus on light footwork". */
export const ROPE_MOVES = [
  { name: 'Basic Bounce', call: 'Basic bounce', note: 'Sărituri mici, pe vârfuri, încheieturile fac munca.' },
  { name: 'Boxer Step', call: 'Boxer step', note: 'Transferi greutatea de pe un picior pe altul, relaxat.' },
  { name: 'Alternate Feet', call: 'Alternate feet', note: 'Ca o alergare pe loc, la fiecare rotație alt picior.' },
  { name: 'Side to Side', call: 'Side to side', note: 'Sari stânga-dreapta, pași mici.' },
  { name: 'High Knees', call: 'High knees', note: 'Genunchii sus, ritm alert, 20–30 de secunde.' },
  { name: 'Front-Back', call: 'Front back', note: 'Sari înainte-înapoi, ca la intrarea și ieșirea din distanță.' },
];

/** Which combos the caller uses in each block. */
const FOCUS: Record<string, string[]> = {
  jab: ['jab', 'double-jab', 'one-two', 'jab-out', 'body-body-head', 'ghost-step', 'pull-counter', 'guard-reset'],
  move: ['body-head', 'liver', 'body-body-head', 'off-ropes', 'ghost-step', 'one-two', 'step-overhand', 'hooks-liver'],
  combo: ['liver', 'tyson-huh', 'tyson-slip', 'body-head', 'body-body-head', 'pull-counter', 'angle-finish', 'duck-counter', 'step-overhand'],
  power: ['tyson-killer', 'angle-finish', 'off-ropes', 'liver', 'body-head', 'body-body-head', 'gazelle', 'hooks-liver'],
  slow: ['jab', 'one-two', 'liver', 'alphabet', 'tyson-huh', 'peekaboo', 'guard-reset'],
  distance: ['jab', 'double-jab', 'jab-out', 'pull-counter', 'ghost-step', 'one-two', 'step-overhand'],
};

export function focusCombos(focus: string | undefined): Combo[] {
  const ids = FOCUS[focus ?? ''] ?? [];
  return ids.map((id) => COMBOS.find((c) => c.id === id)).filter((c): c is Combo => !!c);
}

export function tiktokUrl(vid: string): string {
  return `https://www.tiktok.com/@alexhanma___/video/${vid}`;
}

export const FOCUS_LINE: Record<string, string> = {
  jab: 'Jab și joc de picioare',
  move: 'Mișcare și pumni',
  combo: 'Combinații',
  power: 'Unghiuri și putere',
  slow: 'Lent și curat',
  distance: 'Lucru pe distanță',
  rope: 'Joc de picioare ușor',
  legs: '',
};
