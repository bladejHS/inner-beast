// The combat material. Since 2026-11-07 the fighting part is kickboxing, built for the user's 2 m: long range first
// (jab, teep, inside low kick), the Dutch rule that punches set up a kick, knees for whoever gets close, and checks for
// the long lead leg a shorter fighter goes after. Sources, each linked on its combination: Ernesto Hoost's combinations
// (Dynamic Striking), Semmy Schilt's fights (Sherdog, a 2010 analysis of his final with Peter Aerts), Ubud Muay Thai on
// beating smaller opponents, FightCamp on the roundhouse kick, and Jack Slack on reach. No jumping techniques (no
// flying knees, no hop switch kicks) while jumps hurt the user's knees.
// Alex Hanma's boxing combinations (@alexhanma___ on TikTok, read frame by frame) stay in the library, and they are
// what the caller uses on a day the knee notes say no kicks. Strike names stay in English; notes are Romanian.

import { daysBetween, dayKey, weekStart } from '../logic/util.ts';

export type ComboCat = 'kicks' | 'basics' | 'combo' | 'power' | 'defense' | 'counter' | 'footwork';

/** Where a kickboxing item comes from: a label, and a link when there is one. */
export interface Ref {
  t: string;
  url?: string;
}

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
  /** Kickboxing material (not Alex's): its source. */
  kb?: Ref;
}

const HOOST: Ref = { t: 'Ernesto Hoost, Dynamic Striking', url: 'https://dynamicstriking.com/blogs/news/combining-our-punches-kicks-with-ernesto-hoost' };
const SCHILT: Ref = { t: 'Schilt – Aerts, analiză', url: 'https://themeparkatitsdarkest.com/2010/09/08/fighting-as-a-taller-fighter/' };
const SHERDOG: Ref = { t: 'Sherdog despre Semmy Schilt', url: 'https://sherdog.com/news/articles/5/Sherdogs-Top-10-Greatest-Combat-Athletes-190359' };
const TALL: Ref = { t: 'Ubud Muay Thai: adversari mai scunzi', url: 'https://www.ubudmuaythai.com/blog/how-to-beat-smaller-opponents-muay-thai' };
const KICK: Ref = { t: 'FightCamp: greșelile la roundhouse', url: 'https://blog.joinfightcamp.com/training/5-common-mistakes-to-avoid-when-doing-a-roundhouse-kick/' };
const SLACK: Ref = { t: 'Jack Slack: reach și distanță', url: 'https://www.vice.com/en/article/yp8zew/on-the-point-of-a-spear-the-game-of-reach-and-range' };
const BASE: Ref = { t: 'Baza kickboxingului' };

/** Kickboxing for a tall fighter: the single techniques first, then combinations, then defence and counters. */
const KB: Combo[] = [
  {
    id: 'kb-teep', name: 'Lead Teep', seq: ['Lead Teep'], call: 'Teep', cat: 'kicks', kb: TALL,
    note: 'Jabul picioarelor și arma ta principală de distanță. Genunchiul din față urcă spre piept, apoi împingi talpa prin pieptul sau șoldul lui și duci șoldul înainte. Îl dai când pășește spre tine: la piept îl împinge înapoi, la șold îi strică echilibrul. Piciorul se întoarce pe același drum.',
  },
  {
    id: 'kb-low', name: 'Rear Low Kick', seq: ['Rear Low Kick'], call: 'Low kick', cat: 'kicks', kb: KICK,
    note: 'Pas mic în afară cu piciorul din față, apoi pivot pe vârful piciorului de sprijin până când călcâiul ajunge spre el: așa genunchiul nu se răsucește. Șoldul se rotește prin țintă și lovești cu tibia, nu cu laba, în exteriorul coapsei. Revii imediat în gardă.',
  },
  {
    id: 'kb-inside', name: 'Inside Low Kick', seq: ['Lead Inside Low Kick'], call: 'Inside low kick', cat: 'kicks', kb: BASE,
    note: 'Scurtă și rapidă, cu piciorul din față, în interiorul coapsei sau al gambei lui. De la distanța ta lungă îi strică pasul și echilibrul. Nu e o lovitură de KO, e una care îl deranjează mereu.',
  },
  {
    id: 'kb-body', name: 'Rear Body Kick', seq: ['Rear Body Kick'], call: 'Body kick', cat: 'kicks', kb: TALL,
    note: 'Aceeași mecanică ca low kick-ul, cu pivotul complet, dar ținta sunt coastele. La un adversar mai scund, corpul lui e cam la înălțimea șoldului tău: ajungi acolo cu mai puțină mobilitate decât îi trebuie lui pentru corpul tău. Loviturile la corp îi taie respirația și elanul.',
  },
  {
    id: 'kb-knee', name: 'Rear Knee', seq: ['Rear Knee'], call: 'Knee', cat: 'kicks', kb: SCHILT,
    note: 'Când intră sau se apleacă: împingi șoldul înainte și duci genunchiul din spate drept în corpul lui, ridicat pe vârful piciorului de sprijin. Te lași puțin pe spate, ca să-ți scoți capul din linie: așa îi oprea Semmy Schilt (2,12 m) pe cei care ajungeau aproape. Fără săritură.',
  },
  {
    id: 'kb-check', name: 'Check', seq: ['Check'], call: 'Check', cat: 'kicks', kb: BASE,
    note: 'Apărarea de bază a unui om înalt: piciorul tău lung din față e ținta preferată a celor mai scunzi. Ridici genunchiul din față, ușor în afară, ca lovitura lui să se oprească în tibia ta, cu garda sus. Pui piciorul jos și răspunzi imediat.',
  },
  {
    id: 'kb-rear-teep', name: 'Rear Teep', seq: ['Rear Teep'], call: 'Rear teep', cat: 'kicks', kb: BASE,
    note: 'Teep cu piciorul din spate: pleacă mai încet, dar împinge mult mai tare. Îl folosești când l-ai dezechilibrat deja sau când vrei să-l trimiți spre corzi.',
  },
  {
    id: 'kb-jab-teep', name: 'Jab – Teep', seq: ['Jab', 'Lead Teep'], call: 'Jab, teep', cat: 'basics', kb: TALL,
    note: 'Cele două arme lungi, una după alta. Jabul măsoară distanța și îi ia privirea, teep-ul îl împinge înapoi la capătul picioarelor tale. Rămâi acolo unde tu ajungi la el și el nu ajunge la tine.',
  },
  {
    id: 'kb-jab-inside', name: 'Jab – Inside Low Kick', seq: ['Jab', 'Lead Inside Low Kick'], call: 'Jab, inside low kick', cat: 'basics', kb: BASE,
    note: 'Cel mai sigur atac de la distanță lungă. Jabul îi ține privirea sus, iar low kick-ul pe interior vine imediat după, tot cu partea din față. Garda nu se deschide deloc.',
  },
  {
    id: 'kb-12-low', name: 'Jab – Cross – Low Kick – Pivot', seq: ['Jab', 'Cross', 'Rear Low Kick', 'Pivot out'], call: 'Jab, cross, low kick, pivot', cat: 'combo', kb: TALL,
    note: 'Combinația de bază a kickboxingului: pumnii ridică garda și privirea, piciorul închide. După kick pivotezi sau ieși în unghi, ca să nu-i rămâi în față pentru contră.',
  },
  {
    id: 'kb-123-low', name: 'Jab – Cross – Hook – Low Kick', seq: ['Jab', 'Cross', 'Lead Hook', 'Rear Low Kick'], call: 'Jab, cross, hook, low kick', cat: 'power', kb: HOOST,
    note: 'Clasicul olandez. Croșeul de stânga îți încarcă șoldul pentru low kick-ul de dreapta: după o lovitură, șoldul e deja rotit pentru următoarea (Ernesto Hoost). Croșeul îl dai doar dacă 1-2 te-a adus în distanță.',
  },
  {
    id: 'kb-hook-body', name: 'Lead Hook – Body Kick', seq: ['Lead Hook', 'Rear Body Kick'], call: 'Hook, body kick', cat: 'power', kb: HOOST,
    note: 'Din lista lui Ernesto Hoost: croșeul îl face să-și strângă garda la cap, iar coastele rămân libere pentru kick. Fiecare atac îi cere o apărare, iar apărarea deschide altă țintă.',
  },
  {
    id: 'kb-cross-lbody', name: 'Cross – Lead Body Kick', seq: ['Cross', 'Lead Body Kick'], call: 'Cross, lead body kick', cat: 'power', kb: HOOST,
    note: 'Tot de la Hoost: după cross, șoldul s-a rotit și piciorul din față e încărcat, iar kick-ul cu el ajunge la ficat. Fără săritură: piciorul pleacă din loc sau după un pas mic în afară.',
  },
  {
    id: 'kb-double-jab-low', name: 'Double Jab – Low Kick', seq: ['Jab', 'Jab', 'Rear Low Kick'], call: 'Double jab, low kick', cat: 'combo', kb: BASE,
    note: 'Jaburile îi acoperă privirea și îl țin pe loc, iar low kick-ul vine pe sub ele. La 2 m, jabul tău ajunge de departe, deci și kick-ul de după el.',
  },
  {
    id: 'kb-inside-cross', name: 'Inside Low Kick – Cross', seq: ['Lead Inside Low Kick', 'Cross'], call: 'Inside low kick, cross', cat: 'combo', kb: BASE,
    note: 'Low kick-ul pe interior îi duce greutatea și privirea în jos, iar cross-ul vine pe mijloc în timp ce piciorul tău se pune jos înainte. Kick-ul și pasul înainte sunt o singură mișcare.',
  },
  {
    id: 'kb-12-teep', name: 'Jab – Cross – Teep', seq: ['Jab', 'Cross', 'Lead Teep'], call: 'Jab, cross, teep', cat: 'footwork', kb: SLACK,
    note: 'Pentru omul mai lung, loviturile drepte sunt regele. După 1-2 vrea să-ți răspundă; teep-ul îl împinge înapoi înaintea contrei lui și te pune din nou la distanța ta.',
  },
  {
    id: 'kb-fake-teep-low', name: 'Fake Teep – Low Kick', seq: ['Fake teep', 'Rear Low Kick'], call: 'Fake teep, low kick', cat: 'combo', kb: BASE,
    note: 'Ridici genunchiul din față ca pentru teep, iar el se oprește sau coboară mâna să-l prindă. Pui piciorul jos în față și tragi low kick-ul. Fenta merge doar dacă teep-ul tău adevărat l-a durut înainte.',
  },
  {
    id: 'kb-jab-knee', name: 'Jab – Knee', seq: ['Jab', 'Rear Knee'], call: 'Jab, knee', cat: 'combo', kb: SHERDOG,
    note: 'Jabul îl face să se aplece sau să intre pe sub el, iar genunchiul îl așteaptă. Unui adversar mai scund care intră aplecat, genunchiul tău îi ajunge înaintea pumnilor lui. Despre Schilt se scria că, dacă ajungeai prea aproape, genunchii lui erau copleșitori.',
  },
  {
    id: 'kb-hoost-chain', name: 'Hoost Chain', seq: ['Cross', 'Lead Hook', 'Rear Low Kick', 'Lead Hook', 'Cross', 'Lead Body Kick'], call: 'Cross, hook, low kick. Hook, cross, lead body kick', cat: 'power', kb: HOOST,
    note: 'Lanțul lui Ernesto Hoost, de patru ori campion K-1: pumn, pumn, kick, de două ori la rând. Fiecare lovitură o încarcă pe următoarea. La sac îl lucrezi întâi lent, pe bucăți, apoi legat.',
  },
  {
    id: 'kb-body-high', name: 'Body Kick – Jab – High Kick', seq: ['Rear Body Kick', 'Jab', 'Rear High Kick'], call: 'Body kick, jab, high kick', cat: 'power', kb: HOOST,
    note: 'După câteva body kick-uri își coboară cotul ca să-și apere coastele, iar același kick urcă la cap: cine își apără corpul își lasă capul liber (Hoost). Doar cât de sus îți permite mobilitatea, fără să forțezi: un body kick curat bate un high kick smucit.',
  },
  {
    id: 'kb-check-cross', name: 'Check – Cross', seq: ['Check', 'Cross'], call: 'Check, cross', cat: 'counter', kb: BASE,
    note: 'El dă low kick, tu îl oprești cu tibia, pui piciorul jos în față și răspunzi cu cross-ul înainte să-și revină. O apărare fără răspuns îl lasă să încerce din nou.',
  },
  {
    id: 'kb-check-teep', name: 'Check – Teep', seq: ['Check', 'Lead Teep'], call: 'Check, teep', cat: 'counter', kb: BASE,
    note: 'Piciorul cu care ai blocat e deja sus: îl împingi direct în teep și îl trimiți înapoi la distanța ta. Pentru un om înalt e contra ideală, fiindcă îți ia înapoi spațiul imediat.',
  },
  {
    id: 'kb-low-on-step', name: 'Low Kick on His Step', seq: ['Read his step', 'Rear Low Kick'], call: 'On his step, low kick', cat: 'counter', kb: TALL,
    note: 'Când pășește spre tine, greutatea lui e pe piciorul din față: atunci aterizează low kick-ul, exact pe pasul lui. În shadow îți imaginezi intrarea lui; cu un partener, exersați momentul.',
  },
  {
    id: 'kb-teep-on-entry', name: 'Teep on His Entry, Reset', seq: ['Read his step', 'Lead Teep', 'Reset stance'], call: 'He steps in, teep, reset', cat: 'defense', kb: TALL,
    note: 'Exercițiul de bază pentru un om înalt: când intră, teep la piept sau la șold, apoi îți refaci poziția. Nu-l lași să ajungă la distanța lui.',
  },
  {
    id: 'kb-lean-knee', name: 'Lean Back – Knee', seq: ['Lean back', 'Rear Knee', 'Step back'], call: 'Lean back, knee', cat: 'counter', kb: SCHILT,
    note: 'Ce făcea Schilt când adversarul ajungea aproape: își scotea capul din linie lăsându-se pe spate și aducea genunchiul în același timp. Nu rămâi pe spate: după genunchi faci un pas înapoi sau în lateral și revii în gardă.',
  },
  {
    id: 'kb-circle-teep', name: 'Circle Out – Teep', seq: ['Circle out', 'Lead Teep'], call: 'Circle, teep', cat: 'footwork', kb: SCHILT,
    note: 'Când te presează, nu te retragi în linie dreaptă: așa ajungi la corzi, unde lungimea ta nu mai contează. Asta încerca Peter Aerts împotriva lui Schilt. Ieși în cerc, apoi dai teep când vine după tine.',
  },
  {
    id: 'kb-clinch-knee', name: 'Clinch: Stand Tall – Knee – Out', seq: ['Clinch (stand tall)', 'Rear Knee', 'Frame', 'Lead Teep'], call: 'Clinch, knee, out', cat: 'defense', kb: TALL,
    note: 'În clinci stai drept, deasupra lui, și îi controlezi capul. Un genunchi la corp sau la coapsă, apoi antebrațele pe umerii lui: faci spațiu și ieși cu un teep. În kickboxing (regulile K-1 și Glory) clinciul e scurt: o lovitură, apoi separarea.',
  },
];

/** Alex Hanma's boxing combinations and the long-range boxing set built for a tall boxer. */
const BOX: Combo[] = [
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
    id: 'jab-step-in', name: 'Step In – Jab – Step Out', seq: ['Step in', 'Jab', 'Step out'], call: 'Step in, jab, step out', cat: 'footwork',
    note: 'Intri cu un pas mic, lovești jabul exact când piciorul din față aterizează, ieși imediat. Distanța dintre tălpi rămâne aceeași.',
  },
  {
    id: 'jab-circle', name: 'Jab – Circle Left / Right', seq: ['Jab', 'Circle left', 'Jab', 'Circle right'], call: 'Jab, circle left. Jab, circle right', cat: 'footwork',
    note: 'După fiecare jab te muți în cerc în jurul țintei. Spre stânga pleacă piciorul stâng primul, spre dreapta cel drept. Nu încrucișa picioarele.',
  },
  {
    id: 'double-jab-back', name: 'Double Jab – Step Back – Jab', seq: ['Jab', 'Jab', 'Step back', 'Jab'], call: 'Double jab, step back, jab', cat: 'footwork',
    note: 'Două jaburi intrând, un pas înapoi când el vine după tine, și încă un jab din retragere. Ține-l mereu la capătul jabului.',
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
    id: 'fake-jab-cross', name: 'Fake Jab, Step In, Cross', seq: ['Fake jab', 'Step forward', 'Cross'], call: 'Fake jab, step, cross', cat: 'combo',
    note: 'Fentezi jabul, iar cât reacționează el faci pasul înainte și închei cu cross-ul. Alex: pasul se face curat, nu sărit.',
    vid: '7549274300688239894', src: 'Dangerous combination',
  },
  {
    id: 'shift-upper-hook', name: 'Jab, Shift, Uppercut – Hook × 2, Cross', seq: ['Jab', 'Shift', 'Uppercut', 'Hook', 'Uppercut', 'Hook', 'Cross'], call: 'Jab. Shift. Uppercut, hook, uppercut, hook, cross', cat: 'power',
    note: 'La mănuși, cu partenerul: jab, schimbi garda (shift), apoi două perechi uppercut–croșeu și închei cu cross.',
    vid: '7285796202854075681', src: 'This combination hurts',
  },
  {
    id: 'body-hooks-finish', name: '1-2, Hooks, Body Hooks, Head Hooks', seq: ['Jab', 'Cross', 'Lead Hook', 'Right Hook', 'Hook (body)', 'Hook (body)', 'Hook (head)', 'Hook (head)'], call: 'Jab, cross, hook, hook. Body hooks. Finish with hooks to the head', cat: 'power',
    note: 'Un 1-2, două croșee, cobori cu croșee la corp și închei cu croșee la cap. Alex o arată de mai multe ori la sac.',
    vid: '7288785089415171361', src: 'This combination hurts',
  },
  {
    id: 'body-uppers', name: 'Jab – Jab, Body Hook – Uppercut × 2', seq: ['Jab', 'Jab', 'Left Hook (body)', 'Left Uppercut', 'Right Hook (body)', 'Right Uppercut'], call: 'Jab, jab, left body hook, left uppercut, right body hook, right uppercut', cat: 'combo',
    note: 'Două jaburi, apoi pe fiecare parte un croșeu la corp urmat de uppercut cu aceeași mână.',
    vid: '7517693577250573590', src: 'Learn this deadly combination',
  },
  {
    id: 'double-onetwo', name: '2 × Jab – Cross, Hook Head – Hook Body', seq: ['Jab', 'Cross', 'Jab', 'Cross', 'Lead Hook (head)', 'Lead Hook (body)'], call: 'Jab, cross, jab, cross, hook head, hook body', cat: 'combo',
    note: 'Dublezi 1-2-ul ca să-l ții în gardă, apoi croșeul de stânga la cap și același braț coboară la corp.',
    vid: '7231261639784336667', src: 'Strong combination',
  },
  {
    id: 'cross-hook-upper', name: 'Cross – Left Hook – Uppercut – Left Hook', seq: ['Cross', 'Left Hook', 'Uppercut', 'Left Hook'], call: 'Cross, left hook, uppercut, left hook', cat: 'combo',
    note: 'Alex arată întâi greșit (lovituri din brațe, fără rotație) și apoi corect: fiecare pereche vine din rotația șoldului.',
    vid: '7239815908552690970', src: 'This combination hurts',
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
    note: 'Când adversarul se aruncă cu o lovitură largă, cobori sub ea îndoind genunchii (Alex îi marchează cu roșu) și urci imediat cu dreapta la cap. Mâna cealaltă stă la bărbie. La 2 m, nu cobori capul sub linia centurii lui: e regulă în box și te expune.',
    vid: '7698054696329596193', src: 'Monster KO',
  },
  {
    id: 'off-ropes', name: 'Off the Ropes', seq: ['Pivot off', 'Right Hook', 'Left Hook'], call: 'Pivot off, right hook, left hook', cat: 'power',
    note: 'Când atingi peretele sau corzile, ieși cu un pivot sau un pas lateral spre centru, apoi două croșee. Nu te împingi din corzi: în box e o folosire neregulamentară a lor. Cel mai bine nu ajungi deloc acolo.',
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
  // Long-range combinations for a tall boxer: they keep the reach advantage and leave on an angle.
  {
    id: 'one-two-angle', name: 'Jab – Cross – Step Out at an Angle', seq: ['Jab', 'Cross', 'Step out at an angle'], call: 'Jab, cross, step out', cat: 'footwork',
    note: 'Două lovituri drepte de la distanță lungă, apoi un pas pe diagonală, în afara liniei lui. Nu rămâi în fața lui după cross.',
  },
  {
    id: 'double-jab-cross-exit', name: 'Double Jab – Cross – Lateral Exit', seq: ['Jab', 'Jab', 'Cross', 'Step to the side'], call: 'Double jab, cross, step to the side', cat: 'footwork',
    note: 'Primul jab măsoară distanța, al doilea o câștigă, crossul vine pe toată lungimea brațului. Ieși lateral înainte să răspundă.',
  },
  {
    id: 'jab-feint-cross', name: 'Jab – Feint – Cross – Reposition', seq: ['Jab', 'Feint', 'Cross', 'Step back'], call: 'Jab, feint, cross, step back', cat: 'combo',
    note: 'Jabul îl ține la distanță, fenta îl face să reacționeze, crossul intră în spațiul liber. Un pas înapoi și ești din nou la capătul jabului.',
  },
  {
    id: 'one-two-hook-pivot', name: 'Jab – Cross – Lead Hook – Pivot Out', seq: ['Jab', 'Cross', 'Lead Hook', 'Pivot out'], call: 'Jab, cross, hook, pivot', cat: 'power',
    note: 'Croșeul doar dacă crossul te-a adus în distanță. Pivotezi pe piciorul din față și ieși din linie cu garda sus.',
  },
  {
    id: 'jab-reset-reenter', name: 'Jab – Step Back – Jab – Cross', seq: ['Jab', 'Step back', 'Jab', 'Cross'], call: 'Jab, step back. Jab, cross', cat: 'footwork',
    note: 'Lovești, ieși din distanță când vine spre tine, apoi reintri cu un 1-2 drept. Controlezi tu momentul schimbului.',
  },
  {
    id: 'jab-body-cross', name: 'Jab Body – Cross Head – Step Out', seq: ['Jab (body)', 'Cross (head)', 'Step out'], call: 'Jab body, cross head, step out', cat: 'combo',
    note: 'Cobori din genunchi pentru jabul la corp, nu din spate, urci cu crossul la cap și ieși. Schimbi nivelul fără să intri aproape.',
  },
  {
    id: 'one-two-pivot-cross', name: 'Jab – Cross – Pivot – Cross', seq: ['Jab', 'Cross', 'Pivot out', 'Cross'], call: 'Jab, cross, pivot, cross', cat: 'power',
    note: 'După 1-2 pivotezi într-un unghi nou și tragi crossul din nou, cu toată greutatea transferată de pe piciorul din spate.',
  },
  {
    id: 'step-jab-cross-back', name: 'Step In – Jab – Cross – Step Back', seq: ['Step in', 'Jab', 'Cross', 'Step back'], call: 'Step in, jab, cross, step back', cat: 'footwork',
    note: 'Intri exact cât trebuie ca să ajungi cu crossul, apoi ieși pe același drum. Lucrezi la distanța ta, nu la a lui.',
  },
  // Getting out when a shorter opponent gets inside: not to fight there, to leave and reset the range.
  {
    id: 'clinch-exit', name: 'Frame – Pivot Out – Jab', seq: ['Frame (lead forearm)', 'Pivot out', 'Jab', 'Step back'], call: 'Frame, pivot, jab', cat: 'defense',
    note: 'Când intră peste tine: un contact scurt și ușor cu antebrațul din față pe umărul lui, doar cât să-l oprești o clipă, fără să împingi și fără să lovești cu antebrațul. Pivotezi pe piciorul din față și ieși; jabul îl oprește să te urmărească.',
  },
  {
    id: 'corner-exit', name: 'Corner Exit: Slip – Pivot – Step to the Side', seq: ['Slip', 'Pivot out', 'Step to the side', 'Jab'], call: 'Slip, pivot, step to the side, jab', cat: 'defense',
    note: 'Cu spatele la colț sau la corzi: te eschivezi, pivotezi și ieși lateral spre centru. Ajungi tu în unghi, el rămâne cu fața la colț.',
  },
  {
    id: 'catch-step-jab', name: 'Catch – Step Back – Jab – Cross', seq: ['Catch (rear hand)', 'Step back', 'Jab', 'Cross'], call: 'Catch, step back, jab, cross', cat: 'counter',
    note: 'Prinzi jabul lui în palma din spate, un pas înapoi ca să fie din nou la capătul brațului tău, apoi 1-2 lung înainte să reintre.',
  },
];

export const COMBOS: Combo[] = [...KB, ...BOX];

export const CAT_NAMES: Record<ComboCat, string> = {
  kicks: 'Picioare și genunchi',
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

/** Agility ladder drills, the Thursday alternative to the jump rope. */
export const LADDER_MOVES = [
  { name: 'One Foot In', call: 'One foot in', note: 'Un picior în fiecare pătrat, pe vârfuri, brațele în gardă.' },
  { name: 'Two Feet In', call: 'Two feet in', note: 'Ambele picioare în fiecare pătrat, contacte scurte cu solul.' },
  { name: 'Lateral Shuffle', call: 'Lateral shuffle', note: 'Lateral, două picioare în fiecare pătrat; nu încrucișa picioarele, ca în ring.' },
  { name: 'In-In-Out-Out', call: 'In, in, out, out', note: 'Intri cu ambele picioare, ieși lateral cu ambele. Ritm constant.' },
  { name: 'Icky Shuffle', call: 'Icky shuffle', note: 'In-in-out pe diagonală, alternând partea. Privirea înainte, nu în jos.' },
  { name: 'Boxer Step In-Out', call: 'Boxer in and out', note: 'În gardă, pas înainte în pătrat și înapoi, ca la intrarea și ieșirea din distanță.' },
];

/** A leg technique: a kick, a teep, a knee or a check (a fake teep is not one). */
const LEG = /Kick|Teep|Knee|^Check$/;
export const legStrike = (s: string): boolean => LEG.test(s);
export const usesLegs = (c: Combo): boolean => c.seq.some(legStrike);

const byIds = (ids: string[]): Combo[] => ids.map((id) => COMBOS.find((c) => c.id === id)).filter((c): c is Combo => !!c);

// What the caller uses in each block. The focus of each block still follows the e-book (plan page 16): Monday shadow
// "jabs & footwork", Monday bag "movement & punches", Tuesday easy shadow "slow and clean moves", Thursday shadow
// "combinations", Thursday bag "angle changes & power", Friday easy shadow "distance work", each one now in kickboxing.
// For a fighter from TALL_CM up: long weapons first, the kick at the end of the punches, knees and checks for the
// shorter man who comes in, and exits on a circle.
const KB_FOCUS_TALL: Record<string, string[]> = {
  jab: ['jab', 'double-jab', 'kb-teep', 'kb-jab-teep', 'kb-jab-inside', 'kb-teep-on-entry', 'kb-circle-teep', 'jab-step-in', 'jab-out', 'double-jab-back', 'kb-inside', 'pull-counter'],
  move: ['kb-12-low', 'kb-jab-teep', 'kb-low', 'kb-teep', 'kb-inside-cross', 'kb-double-jab-low', 'kb-12-teep', 'one-two-angle', 'kb-check-cross', 'kb-jab-knee', 'step-jab-cross-back'],
  slow: ['kb-teep', 'kb-low', 'kb-check', 'kb-knee', 'kb-body', 'kb-inside', 'kb-jab-teep', 'kb-12-low', 'kb-rear-teep', 'one-two'],
  combo: ['kb-12-low', 'kb-123-low', 'kb-hook-body', 'kb-cross-lbody', 'kb-fake-teep-low', 'kb-double-jab-low', 'kb-inside-cross', 'kb-12-teep', 'kb-jab-knee', 'kb-check-cross', 'kb-check-teep', 'jab-feint-cross'],
  power: ['kb-123-low', 'kb-hook-body', 'kb-cross-lbody', 'kb-hoost-chain', 'kb-12-low', 'kb-body', 'kb-low', 'kb-knee', 'kb-jab-knee', 'kb-double-jab-low', 'kb-body-high', 'one-two-hook-pivot'],
  distance: ['jab', 'kb-teep', 'kb-jab-teep', 'kb-teep-on-entry', 'kb-low-on-step', 'kb-circle-teep', 'kb-lean-knee', 'kb-check-teep', 'pull-counter', 'double-jab-back', 'kb-inside', 'kb-clinch-knee'],
};

/** Under TALL_CM the same sets, with a little inside work where the block allows it. */
const KB_FOCUS: Record<string, string[]> = {
  ...KB_FOCUS_TALL,
  combo: [...KB_FOCUS_TALL.combo, 'body-head', 'liver'],
  power: [...KB_FOCUS_TALL.power, 'four-punch', 'liver-cross'],
};

// The boxing sets from before the switch to kickboxing: the caller falls back to them when the knee says no kicks.
const BOX_FOCUS: Record<string, string[]> = {
  jab: ['jab', 'double-jab', 'one-two', 'jab-out', 'jab-step-in', 'jab-circle', 'double-jab-back', 'ghost-step', 'beginner-defense', 'pull-counter'],
  move: ['jab-step-in', 'jab-out', 'one-two-angle', 'double-jab-cross-exit', 'jab-circle', 'fake-jab-cross', 'step-overhand', 'check-hook', 'combo-of-day', 'body-head'],
  slow: ['jab', 'one-two', 'jab-cross-hook', 'simple-body', 'guard-reset', 'jab-upper-roll', 'liver', 'peekaboo', 'alphabet'],
  combo: ['liver', 'double-onetwo', 'four-punch', 'cross-hook-upper', 'jab-feint-cross', 'one-two-hook-pivot', 'jab-upper-roll', 'favorite', 'combo-of-day', 'liver-setup', 'feint-liver', 'body-head', 'body-body-head', 'tyson-huh', 'tyson-slip'],
  power: ['angle-finish', 'one-two-pivot-cross', 'one-two-hook-pivot', 'combo-of-day', 'check-hook', 'step-overhand', 'ko-combo', 'liver-move', 'tyson-killer', 'peekaboo-killer', 'gazelle', 'body-hooks-finish', 'liver-cross'],
  distance: ['jab', 'double-jab', 'jab-out', 'double-jab-back', 'pull-counter', 'ghost-step', 'one-two', 'fake-jab-cross', 'jab-reset-reenter', 'hook-setup'],
};

/** From this height up the caller uses the tall sets: long range first, few inside exchanges. */
export const TALL_CM = 190;

/** Combinations that need a close-range exchange; a tall fighter gets them only where the focus calls for them. */
export const INSIDE = new Set([
  'tyson-huh', 'tyson-slip', 'tyson-uppercuts', 'tyson-body-head', 'tyson-switch', 'tyson-killer', 'peekaboo-killer', 'peekaboo',
  'close-range', 'off-ropes', 'body-hooks-finish', 'body-uppers', 'shift-upper-hook', 'gazelle', 'hooks-liver', 'liver-cross', 'tap-uppercut', 'cross-hook-upper',
]);

// Same boxing focus per block, built for a tall boxer (around 2 m): jab-led, straight punches, distance kept or
// retaken with the feet, angle exits after the combination. Hooks and uppercuts stay where the distance allows them.
const BOX_FOCUS_TALL: Record<string, string[]> = {
  jab: ['jab', 'double-jab', 'jab-out', 'jab-step-in', 'jab-circle', 'double-jab-back', 'one-two-angle', 'step-jab-cross-back', 'ghost-step', 'pull-counter'],
  move: ['one-two-angle', 'double-jab-cross-exit', 'step-jab-cross-back', 'jab-step-in', 'jab-out', 'jab-reset-reenter', 'jab-circle', 'fake-jab-cross', 'check-hook', 'one-two-hook-pivot'],
  slow: ['jab', 'double-jab', 'one-two', 'one-two-angle', 'jab-body-cross', 'jab-cross-hook', 'guard-reset', 'beginner-defense', 'pull-counter'],
  combo: ['double-jab-cross-exit', 'jab-feint-cross', 'one-two-angle', 'one-two-hook-pivot', 'jab-body-cross', 'double-onetwo', 'fake-jab-cross', 'jab-reset-reenter', 'hook-setup', 'combo-of-day', 'four-punch', 'liver-setup'],
  power: ['one-two-pivot-cross', 'one-two-hook-pivot', 'angle-finish', 'double-jab-cross-exit', 'combo-of-day', 'step-overhand', 'check-hook', 'ko-combo', 'liver-move', 'pull-counter', 'liver-cross'],
  distance: ['jab', 'double-jab', 'double-jab-back', 'jab-out', 'jab-reset-reenter', 'step-jab-cross-back', 'pull-counter', 'ghost-step', 'one-two-angle', 'fake-jab-cross'],
};

/**
 * The order in which the material is learned, one new item a week: the kicking basics first, one at a time, each
 * paired with what it opens; the long chains and the high kick last. Item 0 is the 1-2 the user already knows, so
 * the first kickboxing week (2026-11-02) reviews it while the teep is new. The boxing order follows.
 */
const KB_LEARN = [
  'one-two', 'kb-teep', 'kb-low', 'kb-check', 'kb-jab-teep', 'kb-12-low', 'kb-knee', 'kb-teep-on-entry', 'kb-inside', 'kb-check-cross',
  'kb-body', 'kb-jab-knee', 'kb-123-low', 'kb-low-on-step', 'kb-circle-teep', 'kb-check-teep', 'kb-hook-body', 'kb-double-jab-low',
  'kb-jab-inside', 'kb-lean-knee', 'kb-inside-cross', 'kb-fake-teep-low', 'kb-cross-lbody', 'kb-12-teep', 'kb-clinch-knee', 'kb-rear-teep',
  'kb-hoost-chain', 'kb-body-high',
];

/** The boxing learning orders from before, now after the kickboxing material. */
const BOX_LEARN = [
  'one-two', 'jab-cross-hook', 'double-jab', 'jab-out', 'simple-body', 'body-head', 'beginner-defense', 'guard-reset',
  'body-body-head', 'liver', 'double-onetwo', 'fake-jab-cross', 'jab-upper-roll', 'four-punch', 'cross-hook-upper', 'body-uppers', 'pull-counter', 'step-overhand', 'check-hook', 'hook-setup',
  'favorite', 'combo-of-day', 'tyson-huh', 'tyson-slip', 'peekaboo', 'alphabet', 'tyson-uppercuts', 'tyson-body-head',
  'tyson-switch', 'peekaboo-killer', 'liver-setup', 'feint-liver', 'liver-cross', 'liver-move', 'ko-combo', 'tap-uppercut',
  'duck-counter', 'off-ropes', 'angle-finish', 'close-range', 'body-hooks-finish', 'shift-upper-hook', 'hooks-liver', 'gazelle', 'tyson-killer', 'ghost-step',
];
const FIRST_WEEK = '2026-10-26';

const BOX_LEARN_TALL = [
  'double-jab', 'jab-step-in', 'jab-out', 'one-two', 'catch-step-jab', 'one-two-angle', 'double-jab-back', 'jab-circle', 'step-jab-cross-back',
  'guard-reset', 'jab-body-cross', 'pull-counter', 'jab-reset-reenter', 'double-jab-cross-exit', 'jab-cross-hook', 'one-two-hook-pivot',
  'corner-exit', 'clinch-exit', 'check-hook', 'jab-feint-cross', 'liver-setup',
];

/** The learning order: kickboxing first, then the boxing order (the long-range one for a tall fighter, without inside fighting). */
export function learnOrder(heightCm = 0): Combo[] {
  const tall = heightCm >= TALL_CM;
  const ids = [...KB_LEARN, ...(tall ? BOX_LEARN_TALL : BOX_LEARN).filter((id) => !KB_LEARN.includes(id))];
  return [...byIds(ids), ...COMBOS.filter((c) => !ids.includes(c.id) && c.id !== 'jab' && !(tall && INSIDE.has(c.id)))];
}

/** Week number in the learning plan (0 = the week the app got this feature). */
export function learnWeek(today = dayKey()): number {
  return Math.max(0, Math.floor(daysBetween(FIRST_WEEK, weekStart(today)) / 7));
}

/**
 * The week's pair: one new combination, and last week's one to review. One new item a week, so it gets enough
 * repetitions to stick; the list cycles once it is done.
 */
export function weekCombos(week = learnWeek(), heightCm = 0): Combo[] {
  const all = learnOrder(heightCm);
  const i = week % all.length;
  return [all[i], all[(i - 1 + all.length) % all.length]];
}

/** The last `n` combinations of the plan up to this week, newest first. */
export function recentCombos(n: number, week = learnWeek(), heightCm = 0): Combo[] {
  const all = learnOrder(heightCm);
  return Array.from({ length: Math.min(n, all.length) }, (_, k) => all[(week - k + all.length * 4) % all.length]);
}

export interface RoundTheme {
  name: string;
  cue: string;
  combos: Combo[];
}

interface ThemeDef {
  name: string;
  cue: string;
  pick: (c: Combo) => boolean;
}

// ---------- kickboxing themes ----------

const KB_MOVE = /Step|Pivot|Circle|Move|Slip|Pull|Lean|Ghost|Frame|Catch|Push off|Read|Reset|Clinch|Fake/;
const isMove = (s: string): boolean => KB_MOVE.test(s);
const LONG = /^(Jab|Lead Teep|Rear Teep)/;
const KICKS = /Kick|Teep/;
const KNEE = /Knee/;
const PUNCHES = /Jab|Cross|Hook|Uppercut|Overhand|Straight/;
/** The last strike of a combination (moves and checks left out). */
const lastStrike = (c: Combo): string => [...c.seq].reverse().find((s) => !isMove(s) && s !== 'Check') ?? '';

/** Check, teep and distance: the defensive round a tall fighter gets in every block. */
const KB_DEFENSE = ['kb-check-cross', 'kb-check-teep', 'kb-teep-on-entry', 'kb-low-on-step', 'kb-circle-teep', 'kb-lean-knee', 'kb-clinch-knee', 'pull-counter', 'double-jab-back', 'clinch-exit', 'corner-exit'];

const KB_THEMES: Record<string, ThemeDef> = {
  long: { name: 'Jab și teep', cue: 'Doar armele lungi: jab simplu, dublu, la corp, și teep-ul care îl ține afară.', pick: (c) => c.seq.some((s) => LONG.test(s)) && c.seq.every((s) => isMove(s) || LONG.test(s)) },
  kicks: { name: 'Lovituri de picior', cue: 'Teep, low kick, body kick: pivot pe vârf, călcâiul spre țintă, apoi revii imediat în gardă.', pick: (c) => c.seq.some((s) => KICKS.test(s)) },
  dutch: { name: 'Pumni, apoi piciorul', cue: 'Stil olandez: pumnii pregătesc, piciorul închide. După kick ieși în unghi.', pick: (c) => c.seq.some((s) => PUNCHES.test(s)) && KICKS.test(lastStrike(c)) },
  knees: { name: 'Genunchi la intrare', cue: 'Când intră sau se apleacă: genunchiul din spate, stai înalt, capul puțin pe spate.', pick: (c) => c.seq.some((s) => KNEE.test(s)) },
  defense: { name: 'Check, teep și distanță', cue: 'Check la low kick și răspuns imediat; teep când intră; ieși în cerc, nu înapoi în linie dreaptă.', pick: (c) => KB_DEFENSE.includes(c.id) },
};

const KB_THEMES_BY_FOCUS: Record<string, string[]> = {
  jab: ['long', 'kicks', 'defense'],
  move: ['dutch', 'kicks', 'long', 'defense'],
  power: ['dutch', 'knees', 'kicks', 'defense'],
  distance: ['long', 'defense', 'knees'],
};

// ---------- boxing themes (the no-kick fallback) ----------

const POWER_PUNCH = /Hook|Uppercut|Overhand|Gazelle/;
const PUNCH = /Cross|Hook|Uppercut|Overhand|Body|Straight|Right|Left|Gazelle|Tap/;
const MOVE = /Step|Pivot|Circle|Move|Slip|Pull|Lean|Ghost|Frame|Catch|Push off/;

/** Defensive distance work: leave the pocket, retake the range. Tall boxers get a round of it in every boxing block. */
const BOX_DEFENSE = ['pull-counter', 'double-jab-back', 'jab-reset-reenter', 'check-hook', 'clinch-exit', 'corner-exit', 'catch-step-jab', 'beginner-defense'];

const BOX_THEMES: Record<string, ThemeDef> = {
  jab: { name: 'Doar jab', cue: 'Doar mâna din față: simplu, dublu, la corp, din mișcare.', pick: (c) => c.seq.some((s) => /Jab/.test(s)) && !c.seq.some((s) => PUNCH.test(s)) },
  straight: { name: 'Drepte și ieșire', cue: 'Jab și cross pe toată distanța, apoi ieși din linie.', pick: (c) => c.seq.some((s) => /Cross/.test(s)) && !c.seq.some((s) => POWER_PUNCH.test(s)) && c.seq.some((s) => MOVE.test(s)) },
  power: { name: 'Putere și unghi', cue: 'Greutatea transferată, apoi pivot sau pas lateral.', pick: (c) => c.seq.some((s) => POWER_PUNCH.test(s) || /Pivot/.test(s)) },
  defense: { name: 'Apărare la distanță', cue: 'Ieși din buzunar, reiei distanța, contrezi de la capătul jabului.', pick: (c) => BOX_DEFENSE.includes(c.id) },
  free: { name: 'Combinații libere', cue: 'Tot ce ai lucrat, legat, cu ieșire la final.', pick: () => true },
};

const BOX_THEMES_BY_FOCUS: Record<string, string[]> = {
  jab: ['jab', 'straight', 'defense'],
  move: ['straight', 'jab', 'power', 'defense'],
  combo: ['straight', 'power', 'free'],
  power: ['straight', 'power', 'defense'],
  distance: ['jab', 'defense', 'straight'],
};

/**
 * Thursday's "focus on combinations" is where new material is learned: round 1 only the new combination (blocked),
 * round 2 the new one with last week's (serial), round 3 the last four mixed (random), as in Porter & Magill's
 * blocked-to-random progression.
 */
function learningThemes(heightCm: number): RoundTheme[] {
  const [fresh, prev] = weekCombos(learnWeek(), heightCm);
  return [
    { name: 'Combinația nouă', cue: `Doar ${fresh.name}, repetată curat, de la lent la ritm.`, combos: [fresh] },
    { name: 'Nouă și cea de săptămâna trecută', cue: 'Le alternezi; fiecare cu ieșirea ei.', combos: [fresh, prev] },
    { name: 'Ultimele patru', cue: 'Amestecate: alegi ce se potrivește distanței.', combos: recentCombos(4, learnWeek(), heightCm) },
  ];
}

function themesFrom(defs: Record<string, ThemeDef>, keys: string[], focus: string, pool: Combo[], extra: Combo[], tall: boolean): RoundTheme[] {
  return (tall ? keys : keys.filter((k) => k !== 'defense' || focus === 'jab' || focus === 'distance'))
    .map((k) => {
      const d = defs[k];
      const src = k === 'defense' ? extra : pool;
      return { name: d.name, cue: d.cue, combos: src.filter(d.pick) };
    })
    .filter((t) => t.combos.length >= 2);
}

/**
 * One theme per round, cycling: round r uses themes[(r - 1) % length]. Themes with fewer than 2 combos are dropped.
 * kicks = false (a sore knee): boxing themes on the boxing sets, and Thursday's learning rounds become boxing rounds.
 */
export function roundThemes(focus: string | undefined, heightCm = 0, kicks = true): RoundTheme[] {
  const tall = heightCm >= TALL_CM;
  const f = focus ?? '';
  if (!kicks) {
    if (f === 'combo') return [{ name: 'Combinații de box', cue: 'Azi fără lovituri de picior: genunchiul are nevoie de pauză.', combos: focusCombos('combo', heightCm, false) }];
    const keys = BOX_THEMES_BY_FOCUS[f];
    if (!keys) return [];
    const extra = COMBOS.filter((c) => BOX_DEFENSE.includes(c.id) && (tall || !['clinch-exit', 'corner-exit'].includes(c.id)));
    return themesFrom(BOX_THEMES, keys, f, focusCombos(f, heightCm, false), extra, tall);
  }
  if (f === 'combo') return learningThemes(heightCm);
  const keys = KB_THEMES_BY_FOCUS[f];
  if (!keys) return [];
  const extra = COMBOS.filter((c) => KB_DEFENSE.includes(c.id) && (tall || !['clinch-exit', 'corner-exit', 'kb-clinch-knee'].includes(c.id)));
  return themesFrom(KB_THEMES, keys, f, focusCombos(f, heightCm), extra, tall);
}

/**
 * heightCm: the fighter's height from the profile; tall fighters get the long-range sets.
 * kicks = false when the last Leg Day's knee note was bad: the boxing sets, no kicks, no knees, no checks.
 */
export function focusCombos(focus: string | undefined, heightCm = 0, kicks = true): Combo[] {
  const tall = heightCm >= TALL_CM;
  if (!kicks) return byIds((tall ? BOX_FOCUS_TALL : BOX_FOCUS)[focus === 'week' || !focus ? 'combo' : focus] ?? []);
  const week = weekCombos(learnWeek(), heightCm);
  if (focus === 'week') return week;
  const list = byIds((tall ? KB_FOCUS_TALL : KB_FOCUS)[focus ?? ''] ?? []);
  // "focus on combinations": the combinations of the week are called there too, so they stick
  return focus === 'combo' ? [...week, ...list.filter((c) => !week.includes(c))] : list;
}

export function tiktokUrl(vid: string): string {
  return `https://www.tiktok.com/@alexhanma___/video/${vid}`;
}

export const FOCUS_LINE: Record<string, string> = {
  week: 'Combinațiile săptămânii',
  jab: 'Jab, Teep & Footwork',
  move: 'Strikes & Movement',
  combo: 'Combinations',
  power: 'Dutch Combinations & Power',
  slow: 'Slow, Clean Technique',
  distance: 'Distance Work',
  rope: 'Joc de picioare ușor',
  ladder: 'Pași rapizi și preciși',
  legs: '',
};
