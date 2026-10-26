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
    id: 'jab-cross-hook', name: 'Jab – Cross – Lead Hook', seq: ['Jab', 'Cross', 'Lead Hook'], call: 'Jab, cross, hook', cat: 'basics',
    note: 'Alex o arată greșit și corect: greșit e cu capul în față și mâna din spate plecată de la bărbie. Corect: garda strânsă, mâna care nu lovește lipită de față, croșeul scurt.',
    vid: '7552631237718838550', src: 'JAB-CROSS-LEADHOOK',
  },
  {
    id: 'jab-upper-roll', name: 'Jab – Uppercut – Roll – Cross', seq: ['Jab', 'Uppercut', 'Roll under', 'Cross', 'Back to guard'], call: 'Jab, uppercut, roll, cross', cat: 'combo',
    note: 'Combinația de bază a lui Alex, „keep it simple”: jab, uppercut, treci pe sub lovitura lui cu un roll, cross, apoi înapoi în poziția de luptă.',
    vid: '7328020214057078048', src: 'Basic combination',
  },
  {
    id: 'beginner-defense', name: 'Jab – Cross, Slip, Duck, Step', seq: ['Jab', 'Cross', 'Slip', 'Slip', 'Duck', 'Step', 'Step'], call: 'Jab, cross. Slip, slip. Duck. Step, step', cat: 'defense',
    note: '„Învață asta ca începător”: un 1-2, două eschive laterale, o aplecare din genunchi, doi pași. Alex o face întâi în ritm, apoi lent. Lucreaz-o lent până iese curat.',
    vid: '7605733380629499159', src: 'Lerne DAS als Anfänger',
  },
  {
    id: 'simple-body', name: 'Jab – Cross Body – Lead Hook Head', seq: ['Jab', 'Cross (body)', 'Lead Hook (head)'], call: 'Jab, cross body, hook head', cat: 'basics',
    note: '„Simple boxing combination”. Greșit, după Alex: drept în picioare, cu garda jos. Corect: genunchii îndoiți, garda strânsă, cobori pentru cross la corp și urci cu croșeul la cap.',
    vid: '7224921223979896090', src: 'Simple boxing combination',
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
    id: 'tyson-uppercuts', name: 'Tyson: 4 Uppercuts – Hook – Cross', seq: ['Uppercut', 'Uppercut', 'Uppercut', 'Uppercut', 'Lead Hook', 'Cross'], call: 'Four uppercuts, hook, cross', cat: 'combo',
    note: 'Din garda peek-a-boo, patru uppercut-uri scurte alternate, apoi croșeu de stânga și cross. Așa o lucrează Alex la mănuși, cu un partener.',
    vid: '7285276631298624800', src: 'Mike Tyson combo',
  },
  {
    id: 'tyson-body-head', name: 'Tyson: Right Hook Body → Uppercut', seq: ['Level change', 'Right Hook (body)', 'Right Uppercut (head)'], call: 'Right hook body, right uppercut', cat: 'combo',
    note: 'Combinația-semnătură a lui Tyson, refăcută de Alex: cobori din genunchi (îi marchează cu roșu), croșeu de dreapta la corp, apoi aceeași mână urcă în uppercut la cap. Loviturile nu sunt scrise pe ecran; le-am citit din cadre.',
    vid: '7622988396671159585', src: 'Mike Tyson body + head',
  },
  {
    id: 'peekaboo-killer', name: 'Peek-a-boo Killer Combo', seq: ['Bodyshot', 'Bodyshot', 'Left Hook (head)', 'Right Hook (head)', 'Move to the side', 'Left Uppercut', 'Right Cross'], call: 'Body, body, left hook head, right hook head. Move. Left uppercut, right cross', cat: 'power',
    note: 'Două lovituri la corp, două croșee la cap, ieși în lateral și închei cu uppercut de stânga și cross de dreapta.',
    vid: '7660508755091606817', src: 'Peakabo killer combo',
  },
  {
    id: 'close-range', name: 'Close the Range, Step Out', seq: ['Jab', 'Cross', 'Lead Hook', 'Right Hook', 'Close the range', 'Body', 'Back to the head', 'Step out of the range', 'Cross'], call: 'Jab, cross, hook, hook. Close the range. Body, head. Step out, cross', cat: 'power',
    note: 'Combinația de la sac a lui Alex: 1-2, două croșee, intri aproape, ataci corpul, revii la cap, ieși din distanță și închei cu un cross.',
    vid: '7640532414586031392', src: 'Street fight combo',
  },
  {
    id: 'liver-cross', name: 'Liver Shot: Cross – Hook – Hook', seq: ['Cross', 'Hook (head)', 'Hook (body)'], call: 'Cross, hook head, hook body', cat: 'power',
    note: 'A doua dintre cele 3 variante de liver shot: cross, croșeu la cap, apoi același braț coboară la ficat.',
    vid: '7627958008730914081', src: '3 Livershot combos',
  },
  {
    id: 'liver-move', name: 'Liver Shot: Jab – Hook – Hook, Move', seq: ['Jab', 'Hook (head)', 'Hook (body)', 'Move to the side'], call: 'Jab, hook head, hook body, move', cat: 'power',
    note: 'A treia variantă: jab, croșeu la cap, croșeu la ficat și ieși în lateral. În clip mai apare și controlul capului, interzis în box și scos de aici.',
    vid: '7627958008730914081', src: '3 Livershot combos',
  },
  {
    id: 'liver-setup', name: 'Head First, Then the Liver', seq: ['Jab (head)', 'Hook (head)', 'Step over', 'Lead Hook (liver)'], call: 'Jab, hook head, step, liver', cat: 'combo',
    note: 'Un adversar bun își apără mijlocul. Întâi ataci capul ca să ridice garda, te poziționezi, încarci și abia atunci croșeul scurt și exploziv sub coaste. Dacă nu e liber, ieși și o iei de la capăt.',
    vid: '7494379943447547158', src: 'Der perfekte Leberhaken',
  },
  {
    id: 'ko-combo', name: 'Jab – Jab – Loaded Right Hook – Lead Hook', seq: ['Jab', 'Jab', 'Loaded Right Hook', 'Lead Hook'], call: 'Jab, jab, right hook, lead hook', cat: 'power',
    note: '„Knockout combination”: două jaburi, un croșeu de dreapta încărcat din șold, apoi croșeul de stânga.',
    vid: '7234248748321525018', src: 'Knockout combination',
  },
  {
    id: 'tyson-switch', name: 'Tyson: Uppercut – Hook, Switch Step', seq: ['Right Uppercut', 'Left Hook', 'Switch step', 'Left Uppercut', 'Right Hook'], call: 'Right uppercut, left hook. Switch. Left uppercut, right hook', cat: 'combo',
    note: 'Uppercut de dreapta și croșeu de stânga, schimbi garda dintr-un pas, apoi oglinda: uppercut de stânga și croșeu de dreapta. Repeți în ritm.',
    vid: '7237522682407832858', src: 'Mike Tyson combination',
  },
  {
    id: 'combo-of-day', name: 'Jab – Cross, Move, Uppercut – Cross, Move, Uppercut – Hook', seq: ['Jab', 'Cross', 'Move to the side', 'Uppercut', 'Cross', 'Move to the other side', 'Uppercut', 'Right Hook'], call: 'Jab, cross. Move. Uppercut, cross. Move. Uppercut, right hook', cat: 'combo',
    note: 'Combinația zilei de la Alex: după fiecare pereche de lovituri schimbi partea, ca să nu rămâi în fața lui.',
    vid: '7229638724781477146', src: 'Combination for today',
  },
  {
    id: 'four-punch', name: 'Jab – Cross – Hook – Bodyshot', seq: ['Jab', 'Cross', 'Hook', 'Bodyshot'], call: 'Jab, cross, hook, body', cat: 'combo',
    note: 'Combinația lui Alex la sacul greu: trei lovituri la cap, apoi cobori din genunchi pentru lovitura la corp.',
    vid: '7211995471269678342', src: 'Boxing combo',
  },
  {
    id: 'favorite', name: 'Jab – Hook – Body – Right Hook', seq: ['Jab', 'Hook', 'Body', 'Right Hook'], call: 'Jab, hook, body, right hook', cat: 'combo',
    note: 'Una dintre combinațiile preferate ale lui Alex: jab, croșeu la cap, cobori la corp și închei cu croșeul de dreapta.',
    vid: '7223053215246421254', src: 'One of my favorite combos',
  },
  {
    id: 'tap-uppercut', name: 'Tap → Uppercut', seq: ['Tap (jab)', 'Uppercut'], call: 'Tap, uppercut', cat: 'power',
    note: 'Cum exersează Alex uppercut-ul de KO la sacul pară: un tap scurt cu mâna din față, iar când sacul (sau adversarul) vine spre tine, uppercut. Apoi le amesteci cu alte lovituri.',
    vid: '7225625296991440155', src: 'Knockout uppercut',
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
    id: 'feint-liver', name: 'Feint – Liver – Head (2-punch KO)', seq: ['Feint (lean to the side)', 'Lead Hook (liver)', 'Lead Hook (head)'], call: 'Feint, liver, head', cat: 'counter',
    note: 'Înclini trunchiul într-o parte ca să-l păcălești, lovești cu stânga la ficat, iar când își coboară mâinile urmează imediat al doilea croșeu, la cap.',
    vid: '7322852075858070816', src: 'KO mit 2 Schlägen',
  },
  {
    id: 'hook-setup', name: 'Jab – Jab → Hook Around the Parry', seq: ['Jab', 'Jab', 'Hop', 'Lead Hook'], call: 'Jab, jab, hook', cat: 'counter',
    note: 'Alex: arunci jaburi și te uiți la reacție. Când adversarul începe să pareze jabul, fentezi jabul și vii cu croșeul pe după mâna lui.',
    vid: '7229063556732341531', src: 'Lead hook KO set up',
  },
  {
    id: 'check-hook', name: 'Check Hook', seq: ['Lead Hook', 'Pivot out'], call: 'Check hook', cat: 'counter',
    note: 'Contra pentru cine intră peste tine: croșeu de stânga în timp ce pivotezi pe piciorul din față și ieși din linia lui. Îl contrezi și ajungi să-l ataci din alt unghi.',
    vid: '7598303462463393046', src: 'Check hook sauber ausführen',
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
  jab: ['jab', 'double-jab', 'one-two', 'jab-out', 'body-body-head', 'ghost-step', 'pull-counter', 'guard-reset', 'jab-cross-hook', 'beginner-defense', 'simple-body'],
  move: ['body-head', 'liver', 'body-body-head', 'off-ropes', 'ghost-step', 'one-two', 'step-overhand', 'hooks-liver', 'close-range', 'liver-move', 'check-hook'],
  combo: ['liver', 'tyson-huh', 'tyson-slip', 'body-head', 'body-body-head', 'pull-counter', 'angle-finish', 'duck-counter', 'step-overhand', 'jab-upper-roll', 'tyson-uppercuts', 'tyson-body-head', 'liver-setup', 'feint-liver', 'check-hook', 'tyson-switch', 'combo-of-day', 'hook-setup', 'favorite', 'four-punch'],
  power: ['tyson-killer', 'angle-finish', 'off-ropes', 'liver', 'body-head', 'body-body-head', 'gazelle', 'hooks-liver', 'peekaboo-killer', 'close-range', 'liver-cross', 'liver-move', 'ko-combo', 'tap-uppercut'],
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
