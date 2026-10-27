// How each exercise is done, step by step (Romanian). Names stay in English, as everywhere in the app.
// Workout exercises are keyed by their id in workouts.ts; everything else (routine moves, timer blocks,
// punches) by its display name. VAR_NOTES says what changes in a given variation.

export interface How {
  steps: string[];
  /** The mistake to watch for. */
  mistake?: string;
}

export const HOW: Record<string, How> = {
  // ---------- Push Training ----------
  explosive: {
    steps: [
      'Poziție de flotare: palmele puțin mai late decât umerii, corpul o linie dreaptă, fesierii și abdomenul strânși.',
      'Cobori controlat, în 1–2 secunde, până când pieptul e la un pumn de sol.',
      'Împingi cât de tare și de repede poți, ca mâinile să se desprindă de sol.',
      'Aterizezi moale, cu coatele ușor îndoite, și intri direct în repetarea următoare.',
    ],
    mistake: 'Să faci repetări lente când obosești. Când viteza scade, seria s-a terminat.',
  },
  pushups: {
    steps: [
      'Palmele sub umeri sau puțin mai late, degetele înainte.',
      'Strângi fesierii și abdomenul: corpul rămâne drept din cap până în călcâie.',
      'Cobori cu coatele la aproximativ 45° față de corp până când pieptul aproape atinge solul.',
      'Împingi solul de sub tine și expiri, până la brațe întinse.',
    ],
    mistake: 'Șoldurile căzute sau ridicate și coatele deschise la 90°, care încarcă umerii.',
  },
  dips: {
    steps: [
      'Te sprijini pe bare cu brațele întinse, umerii jos, departe de urechi.',
      'Te apleci ușor în față și cobori controlat până când cotul ajunge la 90°.',
      'Împingi înapoi sus până la brațe întinse, fără să blochezi brusc coatele.',
    ],
    mistake: 'Să cobori prea mult cu umerii ridicați spre urechi: așa se încarcă articulația umărului.',
  },
  pike: {
    steps: [
      'Din poziția de flotare urci șoldurile sus, corpul face un V întors.',
      'Mâinile la lățimea umerilor, privirea spre picioare.',
      'Îndoi coatele și cobori capul spre un punct aflat în fața mâinilor (formezi un triunghi cu palmele).',
      'Împingi înapoi pe aceeași linie. Toată munca o fac umerii.',
    ],
    mistake: 'Să cobori capul între mâini, ca la o flotare normală: pierzi lucrul pe umeri.',
  },
  diamond: {
    steps: [
      'Pui mâinile sub piept, cu degetele mari și arătătoarele atingându-se în formă de romb.',
      'Corpul drept, ca la flotarea clasică.',
      'Cobori cu coatele lipite de corp, până când pieptul atinge mâinile.',
      'Împingi din triceps până la brațe întinse.',
    ],
    mistake: 'Coatele care fug în lateral. Dacă doare încheietura, depărtează puțin mâinile.',
  },
  hollow: {
    steps: [
      'Întins pe spate, brațele întinse peste cap, picioarele întinse.',
      'Lipești zona lombară de sol, apoi ridici umerii și picioarele câțiva centimetri.',
      'Corpul face o „banană” ușoară. Ții poziția și respiri scurt, fără să lași spatele să se dezlipească.',
    ],
    mistake: 'Spatele care se arcuiește. Dacă se dezlipește de sol, ridică picioarele mai sus sau îndoaie genunchii.',
  },
  burnout: {
    steps: [
      'Flotări clasice, cu forma corectă, una după alta.',
      'Te poți opri câteva secunde sus, cu brațele întinse, dar nu te pui în genunchi.',
      'Seria se termină când nu mai poți face o repetare corectă. Notezi numărul.',
    ],
  },

  // ---------- Pull Training ----------
  emom: {
    steps: [
      'Te prinzi de bară cu palmele în față, puțin mai larg decât umerii.',
      'Pornești din atârnare cu brațele întinse: întâi tragi umerii în jos, apoi coatele spre coaste.',
      'Urci până când bărbia trece de bară, apoi cobori controlat până la brațe întinse.',
      'La începutul fiecărui minut faci repetările stabilite. Ce rămâne din minut e pauză.',
    ],
    mistake: 'Balansul și jumătățile de repetare. Fiecare tracțiune începe cu brațele întinse.',
  },
  chin: {
    steps: [
      'Prinzi bara cu palmele spre tine, la lățimea umerilor.',
      'Din atârnare completă tragi umerii jos, apoi pieptul spre bară.',
      'Bărbia trece de bară, ții o clipă, cobori lent până la brațe întinse.',
    ],
    mistake: 'Să lovești din picioare ca să urci. Ține picioarele liniștite, ușor în fața corpului.',
  },
  rows: {
    steps: [
      'Te așezi sub o bară sau o masă solidă și o prinzi cu brațele întinse.',
      'Corpul drept, călcâiele pe sol, fesierii strânși.',
      'Tragi pieptul spre bară, strângând omoplații unul spre altul.',
      'Cobori controlat până la brațe întinse.',
    ],
    mistake: 'Șoldurile care cad. Cu cât corpul e mai orizontal, cu atât e mai greu.',
  },
  ytw: {
    steps: [
      'La TRX: ții mânerele cu brațele întinse în față și te lași pe spate, corpul drept ca o scândură. Cu banda: o prinzi în față, la nivelul pieptului.',
      'Y: te tragi sus deschizând brațele întinse în diagonală, deasupra capului. Ții o secundă, revii. 5 repetări.',
      'T: te tragi sus deschizând brațele lateral, strângând omoplații. 5 repetări.',
      'W: tragi coatele înapoi și în jos, pe lângă corp, palmele spre exterior. 5 repetări.',
    ],
    mistake: 'Să îndoi coatele și să tragi din biceps. Brațele rămân întinse; mișcarea vine din umeri și omoplați. Începe cu corpul aproape vertical.',
  },
  curls: {
    steps: [
      'Stai drept, coatele lipite de corp.',
      'Ridici greutatea (sau tragi banda) îndoind doar cotul, palmele una spre alta la hammer curls.',
      'Strângi sus o clipă, apoi cobori lent până la brațe aproape întinse.',
    ],
    mistake: 'Balansul din trunchi. Dacă te legeni, greutatea e prea mare.',
  },
  face: {
    steps: [
      'Ții banda (sau prosopul) în fața ta, la nivelul pieptului sau al feței, cu brațele întinse.',
      'Tragi spre față cu coatele sus, desfăcând mâinile în lateral.',
      'Strângi spatele umerilor și omoplații o secundă, apoi revii controlat.',
    ],
    mistake: 'Să tragi cu umerii ridicați spre urechi. Umerii rămân jos.',
  },
  trxrow: {
    steps: [
      'Ții mânerele TRX, picioarele în față, și te lași pe spate cu brațele întinse. Corpul drept, fesierii strânși.',
      'Tragi pieptul spre mâini, coatele pe lângă corp, și strângi omoplații.',
      'Cobori controlat până la brațe întinse.',
      'Mai greu: picioarele mai în față (corpul mai orizontal). Mai ușor: un pas înapoi.',
    ],
    mistake: 'Șoldurile care cad și umerii ridicați spre urechi.',
  },
  core: {
    steps: [
      'Atârni de bară cu brațele întinse și umerii activi, corpul nemișcat.',
      'Ridici genunchii (sau picioarele întinse) rulând bazinul în sus, din abdomen.',
      'Cobori lent, fără să lași corpul să se balanseze.',
    ],
    mistake: 'Elanul. Dacă începi să te legeni, oprește-te în atârnare și pornește din nou.',
  },
  hang: {
    steps: [
      'Prinzi bara cu toată palma, degetele mari în jurul barei.',
      'Atârni cu brațele întinse, corpul relaxat, respiri calm.',
      'Ții cât poți și notezi secundele.',
    ],
  },

  // ---------- Leg Day ----------
  lunges: {
    steps: [
      'Stai drept, picioarele la lățimea șoldurilor, mâinile pe șolduri sau în gardă.',
      'Faci un pas lung și cobori până când genunchiul din spate aproape atinge solul.',
      'Genunchiul din față rămâne deasupra gleznei, trunchiul drept.',
      'Împingi din călcâiul din față și revii. 15 pe un picior, apoi 15 pe celălalt.',
    ],
    mistake: 'Genunchiul din față care cade spre interior sau trece mult de vârful piciorului.',
  },
  calf: {
    steps: [
      'Stai cu vârfurile pe o treaptă, călcâiele în aer, te ții ușor de perete.',
      'Urci pe vârfuri cât de sus poți și ții o secundă.',
      'Cobori lent sub nivelul treptei, ca să se întindă gamba.',
    ],
  },
  cossack: {
    steps: [
      'Picioarele foarte depărtate, vârfurile ușor spre exterior.',
      'Te lași pe un picior, îndoind genunchiul, cu celălalt picior întins pe călcâi.',
      'Pieptul sus, călcâiul piciorului îndoit pe sol. Revii prin centru și treci pe partea cealaltă.',
    ],
  },

  // ---------- timer blocks ----------
  'Shadow Boxing': {
    steps: [
      'Poziția de luptă: piciorul stâng în față (dreptaci), tălpile la lățimea umerilor, genunchii ușor îndoiți.',
      'Garda sus: pumnii la bărbie, coatele pe lângă corp, bărbia jos.',
      'Lovești aerul pe toată distanța, cu brațul întins complet, și aduci mâna imediat înapoi în gardă.',
      'Te miști între lovituri: pași mici, fără să încrucișezi picioarele, plus eschive și schimbări de unghi.',
      'Ascultă combinațiile strigate de aplicație și leagă-le de mișcare.',
    ],
    mistake: 'Să lovești pe jumătate și să stai pe loc. Alex: fiecare pumn pe toată distanța, relaxat până la impact.',
  },
  'Easy Shadow Boxing': {
    steps: [
      'Aceeași poziție de luptă, dar la jumătate de viteză.',
      'Fiecare lovitură curată, întinsă complet, cu rotația șoldului și a umărului.',
      'Verifici unde rămâi descoperit și cum îți muți greutatea. Respiri calm, ca la recuperare.',
    ],
  },
  'Heavy Bag Training': {
    steps: [
      'Bandaje și mănuși. Te așezi la o lungime de braț de sac, în gardă.',
      'Lovești cu tot corpul: împingi din picior, rotești șoldul și umărul, pumnul strâns doar la impact.',
      'După fiecare combinație ieși din linie sau schimbi unghiul, nu rămâi în fața sacului.',
      'Expiri scurt la fiecare lovitură și aduci mâna înapoi la bărbie.',
    ],
    mistake: 'Să împingi sacul în loc să-l pocnești și să lași garda jos după pumn.',
  },
  'Jumping Rope': {
    steps: [
      'Coarda reglată: cu un picior pe mijlocul ei, mânerele ajung la subsuoară.',
      'Coatele lângă corp; rotești coarda din încheieturi, nu din umeri.',
      'Sari pe vârfuri, doar 1–2 cm de la sol, genunchii moi.',
      'Începi cu Basic Bounce, apoi treci prin mișcările strigate (Boxer Step, Side to Side, High Knees).',
    ],
    mistake: 'Să sari prea sus și pe călcâie: obosești repede și te doare tibia.',
  },
  'Wall Sit': {
    steps: [
      'Spatele lipit de perete, picioarele la un pas în fața peretelui, la lățimea șoldurilor.',
      'Aluneci în jos până când genunchii fac 90°, coapsele paralele cu solul.',
      'Genunchii deasupra gleznelor, greutatea pe călcâie, mâinile pe piept sau în gardă.',
      'Ții poziția tot minutul și respiri constant.',
    ],
    mistake: 'Să-ți sprijini mâinile pe coapse. Lasă picioarele să facă toată munca.',
  },
  'Jumping Squats': {
    steps: [
      'Picioarele la lățimea umerilor, vârfurile ușor în afară.',
      'Cobori într-o genuflexiune cu pieptul sus.',
      'Explodezi în sus cât de sus poți, cu brațele ajutând mișcarea.',
      'Aterizezi moale pe toată talpa, cu genunchii îndoiți, și intri direct în următoarea.',
    ],
    mistake: 'Aterizarea cu picioarele întinse sau cu genunchii căzuți spre interior.',
  },
  'Pull-ups': {
    steps: [
      'Priza puțin mai largă decât umerii, palmele în față.',
      'Din brațe întinse tragi umerii jos, apoi bărbia peste bară.',
      'Cobori controlat până la brațe întinse. Dacă nu ai bară, faci Inverted Rows sub o masă solidă.',
    ],
  },
  'Push-ups': {
    steps: [
      'Palmele sub umeri, corpul drept din cap până în călcâie.',
      'Pieptul coboară aproape de sol, coatele la aproximativ 45°.',
      'Împingi până la brațe întinse. Dacă e prea greu, cu mâinile pe un scaun.',
    ],
  },
  Squats: {
    steps: [
      'Picioarele la lățimea umerilor, vârfurile ușor în afară.',
      'Împingi șoldurile înapoi și cobori până când coapsele trec de paralel, cu pieptul sus.',
      'Genunchii urmăresc vârfurile picioarelor. Urci împingând prin toată talpa.',
    ],
  },
  Jogging: {
    steps: [
      'Începi foarte ușor, aproape în ritm de mers, primele 3–4 minute.',
      'Pași scurți și dese, talpa aterizează sub corp, nu în fața lui.',
      'Respiri pe nas cât poți; dacă nu mai poți vorbi în propoziții, încetinește.',
      'Crești viteza încet și constant spre final.',
    ],
  },
  'Cold & Warm Showers': {
    steps: [
      'Începi cu apă caldă, cât să te uzi complet.',
      'Treci pe rece 1 minut: întâi picioarele și brațele, apoi pieptul, spatele și ceafa.',
      'Respiri lent, pe nas, cu expirații lungi. Nu-ți ține respirația și nu sări de pe loc.',
      'Revii pe cald 1 minut și repeți rundele. Poți termina pe rece.',
    ],
    mistake: 'Să intri în panică și să respiri sacadat. Frigul se controlează din respirație.',
  },
  'Walk (10K Steps)': {
    steps: [
      'Mers vioi, de preferat prin natură, fără telefonul în mână.',
      'Spatele drept, brațele se mișcă liber.',
      'Poți împărți pașii în mai multe plimbări pe zi.',
    ],
  },

  // ---------- routines ----------
  'Jumping Jacks': { steps: ['Sari depărtând picioarele și ridicând brațele deasupra capului.', 'Sari înapoi cu picioarele apropiate și brațele pe lângă corp.', 'Ritm constant, pe vârfuri.'] },
  'Arm Circles': { steps: ['Brațele întinse lateral, relaxate.', 'Cercuri mici care cresc treptat până la cercuri mari.', 'Jumătate din timp înainte, jumătate înapoi.'] },
  'Shoulder Rolls': { steps: ['Brațele atârnă relaxat pe lângă corp.', 'Ridici umerii spre urechi, îi duci înapoi și îi cobori într-un cerc amplu.', 'Apoi schimbi sensul.'] },
  'Shoulder Dislocates': { steps: ['Ții un prosop sau o bandă cu mâinile foarte depărtate, brațele întinse în față.', 'Ridici brațele întinse peste cap și le duci în spate cât merge fără durere.', 'Revii pe același drum. Cu timpul apropii mâinile.'], mistake: 'Să îndoi coatele ca să treci. Mai bine depărtezi mâinile.' },
  'Scapular Push-ups': { steps: ['Poziție de flotare cu brațele întinse.', 'Fără să îndoi coatele, lași pieptul să coboare între umeri (omoplații se apropie).', 'Apoi împingi solul și rotunjești ușor spatele de sus (omoplații se depărtează).'] },
  'Scapular Pulls': { steps: ['Atârni de bară cu brațele întinse.', 'Fără să îndoi coatele, tragi umerii în jos, departe de urechi: corpul urcă 2–3 cm.', 'Revii lent în atârnare.'] },
  'Cross-body Shoulder Stretch': { steps: ['Duci un braț întins peste piept.', 'Cu mâna cealaltă îl tragi ușor de deasupra cotului spre corp.', 'Umărul rămâne jos. Ții, apoi schimbi brațul.'] },
  'Doorway Chest Stretch': { steps: ['Pui antebrațul pe tocul ușii, cotul la înălțimea umărului.', 'Pășești înainte cu piciorul de aceeași parte până simți întinderea în piept.', 'Respiri lent și ții.'] },
  'Lat Stretch': { steps: ['Te prinzi cu o mână de tocul ușii, la nivelul pieptului.', 'Duci șoldurile în spate și în lateral, cu brațul întins.', 'Simți întinderea pe lateralul spatelui. Apoi partea cealaltă.'] },
  'Overhead Triceps Stretch': { steps: ['Ridici un braț, îndoi cotul și cobori palma pe spate.', 'Cu mâna cealaltă împingi ușor cotul în jos și înapoi.', 'Capul drept. Ții, apoi schimbi.'] },
  'Wrist Circles': { steps: ['Împletești degetele sau ții pumnii relaxați.', 'Cercuri ample cu încheieturile, în ambele sensuri.', 'La final, palmele pe sol cu degetele spre tine și te lași ușor înapoi.'] },
  'Neck Mobility': { steps: ['Înclini lent capul spre un umăr, apoi spre celălalt.', 'Bărbia spre piept, apoi privirea înainte.', 'Fără rotiri bruște și fără să forțezi.'] },
  'Cat-Cow': { steps: ['În patru labe: mâinile sub umeri, genunchii sub șolduri.', 'Inspiri: burta coboară, pieptul și privirea urcă.', 'Expiri: rotunjești spatele spre tavan, bărbia spre piept.'] },
  'Thoracic Rotations': { steps: ['În patru labe, pui o mână la ceafă.', 'Rotești trunchiul și deschizi cotul spre tavan, urmărindu-l cu privirea.', 'Cobori cotul spre mâna de pe sol. Apoi partea cealaltă.'] },
  "World's Greatest Stretch": { steps: ['Fandare adâncă înainte, mâinile pe sol în interiorul piciorului din față.', 'Cobori cotul de aceeași parte spre glezna din față.', 'Rotești brațul spre tavan și urmărești mâna cu privirea.', 'Revii și schimbi piciorul la jumătate.'] },
  'Hip Flexor Stretch': { steps: ['Genunchiul din spate pe sol (pe un prosop), piciorul din față la 90°.', 'Strângi fesierul din spate și împingi șoldul ușor înainte.', 'Trunchiul drept, simți întinderea în fața coapsei din spate.'] },
  'Hamstring Stretch': { steps: ['Stai cu picioarele întinse, depărtate la lățimea șoldurilor.', 'Cobori din șolduri cu spatele drept, mâinile spre glezne.', 'Te oprești unde simți întinderea în spatele coapselor și respiri.'] },
  'Deep Squat Hold': { steps: ['Picioarele puțin mai late decât umerii, vârfurile ușor în afară.', 'Cobori cât de jos poți, călcâiele rămân pe sol.', 'Coatele împing genunchii în afară, pieptul sus. Dacă îți fug călcâiele, ține-te de ceva în față.'] },
  'Leg Swings (front-back)': { steps: ['Te ții de perete cu o mână.', 'Balansezi piciorul liber înainte și înapoi, relaxat, cu amplitudine care crește.', 'Trunchiul rămâne drept. La jumătate schimbi piciorul.'] },
  'Leg Swings (side)': { steps: ['Fața spre perete, te ții cu ambele mâini.', 'Balansezi piciorul lateral, prin fața corpului, dintr-o parte în alta.', 'La jumătate schimbi piciorul.'] },
  'Leg Swings': { steps: ['Te ții de perete cu o mână.', 'Balansezi piciorul înainte și înapoi, tot mai amplu.', 'La jumătate schimbi piciorul.'] },
  'Hip Circles': { steps: ['Mâinile pe șolduri, picioarele la lățimea umerilor.', 'Faci cercuri mari cu bazinul, ca un hula-hoop.', 'Jumătate din timp într-un sens, apoi în celălalt.'] },
  '90/90 Hip Switches': { steps: ['Așezat pe sol, un genunchi îndoit la 90° în față, celălalt la 90° în lateral.', 'Pieptul sus, mâinile pe sol în spate dacă ai nevoie.', 'Rotești ambii genunchi pe partea cealaltă, fără să ridici tălpile. Lent, dintr-o parte în alta.'] },
  'Pigeon Stretch': { steps: ['Din patru labe aduci un genunchi în față, cu gamba pe diagonală sub corp.', 'Piciorul din spate se întinde drept înapoi.', 'Bazinul drept, cobori pieptul spre sol și respiri adânc. La jumătate schimbi.'] },
  'Couch Stretch': { steps: ['Genunchiul din spate lângă perete, laba piciorului sus pe perete.', 'Piciorul din față înainte, cu talpa pe sol.', 'Ridici trunchiul și strângi fesierul: se întind coapsa și flexorii șoldului. Intri treptat.'] },
  'Lizard Stretch': { steps: ['Fandare adâncă, cu genunchiul din spate pe sol.', 'Ambele mâini în interiorul piciorului din față.', 'Cobori șoldurile, eventual pe antebrațe. Respiri și ții.'] },
  'Frog Stretch': { steps: ['În patru labe, depărtezi genunchii cât de larg poți, tălpile în lateral.', 'Coborî pe antebrațe.', 'Împingi lent șoldurile în spate până simți interiorul coapselor.'] },
  'Cossack Squats': { steps: ['Picioarele foarte depărtate.', 'Te lași pe un picior, celălalt rămâne întins cu vârful în sus.', 'Te muți lent dintr-o parte în alta, cu pieptul sus.'] },
  'Dagestan Hip Shifts': { steps: ['Picioarele foarte depărtate și întinse, mâinile pe sol în față, șoldurile sus.', 'Muți greutatea într-o parte, îndoind adânc acel genunchi; celălalt picior rămâne întins.', 'Treci prin mijloc pe partea cealaltă și continui să alternezi, ca în rutina „Dagestan” arătată de Alex.'] },
  'Straddle Sink': { steps: ['Picioarele foarte depărtate, mâinile pe sol în față.', 'Lași șoldurile să coboare spre sol, cu pieptul înainte.', 'Respiri și cobori puțin la fiecare expirație.'] },
  'Seated Hamstring Stretch': { steps: ['Așezat, picioarele întinse în față, lipite.', 'Te apleci din șolduri cu spatele drept, mâinile spre tălpi.', 'Nu tragi de tine: lași greutatea să te coboare la fiecare expirație.'] },
  'Butterfly Stretch': { steps: ['Așezat, tălpile lipite, călcâiele aproape de corp.', 'Ții gleznele și lași genunchii să cadă spre sol.', 'Spatele drept; poți apăsa ușor genunchii cu coatele.'] },
  'Calf Stretch': { steps: ['Mâinile pe perete, un picior în spate, întins.', 'Călcâiul din spate rămâne pe sol, vârful înainte.', 'Te apleci spre perete până simți gamba. La jumătate schimbi.'] },
  'Thread the Needle': { steps: ['În patru labe.', 'Strecori un braț pe sub corp, spre partea cealaltă, și cobori umărul spre sol.', 'Apoi deschizi același braț spre tavan. Lent, apoi partea cealaltă.'] },
  'Open Book Stretch': { steps: ['Întins pe o parte, genunchii îndoiți la 90°, brațele întinse în față, palmă pe palmă.', 'Deschizi brațul de sus ca pe o carte, până pe partea cealaltă, urmărindu-l cu privirea.', 'Genunchii rămân lipiți. Revii, apoi partea cealaltă.'] },
  "Child's Pose": { steps: ['În genunchi, te așezi pe călcâie.', 'Întinzi brațele înainte pe sol și lași fruntea jos.', 'Respiri adânc în spate.'] },
  'Cobra Stretch': { steps: ['Pe burtă, palmele sub umeri.', 'Împingi pieptul în sus, șoldurile rămân pe sol.', 'Umerii jos, privirea înainte. Respiri și ții.'] },
  'Sleeper Stretch': { steps: ['Întins pe o parte, brațul de jos în față, cotul la 90°.', 'Cu mâna cealaltă împingi ușor palma de jos spre sol.', 'Fără durere: e o întindere fină pentru spatele umărului. La jumătate schimbi.'] },
  'Neck Stretch': { steps: ['Duci urechea spre umăr.', 'Umărul opus coboară; poți pune mâna pe cap pentru o presiune foarte ușoară.', 'Ții, apoi partea cealaltă.'] },
  'Torso Twists': { steps: ['Picioarele la lățimea umerilor, genunchii moi.', 'Rotești trunchiul dintr-o parte în alta, brațele libere se lovesc ușor de corp.', 'Lași călcâiul din spate să pivoteze.'] },
  'Wrist & Ankle Circles': { steps: ['Cercuri ample cu încheieturile, în ambele sensuri.', 'Apoi, pe un picior, cercuri cu glezna celuilalt picior.', 'Schimbi piciorul la jumătate.'] },
  'Loose Shadow Boxing': { steps: ['Garda sus, relaxat.', 'Pumni ușori, cu brațul întins complet.', 'Treci treptat de la lejer la tare, cum face Alex.'] },
  'Jabs with Slips & Pulls': { steps: ['Din gardă, jab pe toată distanța.', 'Imediat o eschivă: slip lateral sau pull (te lași pe piciorul din spate).', 'Încă un jab și tot așa, un minut.'] },
  'Two Steps Forward, Two Back': { steps: ['Doi pași mici înainte: împingi din piciorul din spate.', 'Doi pași înapoi: împingi din piciorul din față.', 'Garda sus, picioarele nu se încrucișează.'] },
  'Four Straight Punches': { steps: ['Jab, cross, jab, cross, pe toată distanța.', 'Mâna revine la bărbie după fiecare.', 'Scurt respiro în gardă și din nou.'] },
  'Zig-Zag Slips': { steps: ['Garda peek-a-boo: mănușile la obraji, coatele strânse.', 'Faci slip stânga, pas mic înainte în diagonală, slip dreapta, pas în cealaltă diagonală.', 'Mișcarea vine din genunchi și șolduri, privirea rămâne înainte.'] },
  Weaves: { steps: ['Garda lipită de față, genunchii îndoiți.', 'Cobori din genunchi și treci cu capul într-un U pe sub o lovitură imaginară.', 'Urci pe partea cealaltă și repeți, ritmic.'] },
  'Slip-Roll Uppercut': { steps: ['Slip într-o parte.', 'Roll pe sub, în U, până pe partea cealaltă.', 'Când urci, arunci uppercut cu mâna din partea în care ai ajuns.'] },
  'Weave + Hook': { steps: ['Weave în U pe sub lovitură.', 'Când urci, arunci croșeul din partea respectivă, rotind șoldul.', 'Revii în gardă și repeți pe partea cealaltă.'] },
  'Slip In Slip Out': { steps: ['Pas înainte cu un slip (intri în distanță).', 'Pas înapoi cu un slip pe partea cealaltă (ieși).', 'Garda nu pleacă de la față.'] },
  'Leg Switch': { steps: ['Din gardă, un salt mic pe loc.', 'În aer schimbi piciorul din față.', 'Aterizezi echilibrat, gata de lovit, și schimbi înapoi.'] },
  'Twist 180 + Punching': { steps: ['Din gardă, pivotezi pe vârfuri și te întorci 180°.', 'Lovești imediat 2–3 pumni în noua direcție.', 'Pivotezi înapoi și repeți.'] },
  'Seated Leg Raises': { steps: ['Așezat, mâinile pe sol în spate, trunchiul ușor înclinat.', 'Ridici picioarele întinse până la nivelul ochilor.', 'Cobori fără să atingi solul.'] },
  'Touch Your Foot': { steps: ['Întins pe spate sau în V.', 'Ridici trunchiul și un picior și atingi laba piciorului cu mâna opusă.', 'Alternezi părțile, fără pauză.'] },
  'Ball Twists': { steps: ['Așezat, picioarele ridicate sau pe sol, trunchiul înclinat înapoi.', 'Ții mingea la piept și rotești trunchiul stânga-dreapta.', 'Mișcarea vine din abdomen, nu din brațe.'] },
  'Ball Sit-up Press': { steps: ['Pe spate, mingea la piept.', 'Urci din abdomen până la așezat.', 'Sus împingi mingea peste cap, apoi cobori controlat.'] },
  'Leg Raises with Ball': { steps: ['Pe spate sau sprijinit în mâini, mingea strânsă între tălpi.', 'Ridici picioarele întinse cu mingea.', 'Cobori lent fără să atingi solul.'] },
  'Legs Over Ball': { steps: ['Așezat, sprijinit în mâini, mingea pe sol lângă un șold.', 'Ridici picioarele lipite și le treci peste minge pe partea cealaltă.', 'Înapoi și tot așa, fără să atingi solul cu tălpile.'] },
  Plank: { steps: ['Pe antebrațe, coatele sub umeri.', 'Corpul drept din cap până în călcâie, fesierii și abdomenul strânși.', 'Respiri constant și ții.'] },
  'High Plank': { steps: ['Pe palme, brațele întinse, mâinile sub umeri.', 'Corpul drept, fără să lași șoldurile să cadă.', 'Ții și respiri.'] },
  'Seated Weight Hold': { steps: ['Așezat, trunchiul ușor înclinat, picioarele ridicate.', 'Ții greutatea la piept, apoi o împingi peste cap și înapoi.', 'Abdomenul rămâne strâns tot minutul.'] },
  'Wide Stance Hold': { steps: ['Picioarele mult mai late decât umerii, vârfurile ușor în afară.', 'Cobori șoldurile, spatele drept, mâinile în față.', 'Ții un minut, ca încălzire.'] },
  'Side-to-Side Shifts': { steps: ['Din poziția largă, muți greutatea pe un picior, îndoindu-l.', 'Celălalt picior rămâne întins.', 'Treci dintr-o parte în alta, tot mai relaxat.'] },
  'Middle Split Lean': { steps: ['Intri în sfoară laterală doar cât poți fără durere.', 'Te sprijini în mâini și apleci trunchiul înainte, spatele drept.', 'Ții 2 minute și respiri adânc: la fiecare expirație cobori puțin.'] },
  'Split Push-up Hold': { steps: ['Din sfoară, pui mâinile pe sol în față.', 'Împingi în mâini și ridici bazinul de pe sol, picioarele rămân depărtate.', 'Ții un minut. Alex: așa câștigi și forță în poziție, nu doar flexibilitate.'] },
  'Gazelle Punch': {
    steps: [
      'Îl pregătești cu o lovitură sau o fentă.',
      'Faci slip pe partea mâinii din față și cobori adânc din genunchi: asta e încărcarea.',
      'Explodezi înainte și în sus din picioare și duci croșeul cu tot corpul.',
    ],
    mistake: 'Să sari din picioare întinse. Forța vine din genunchii îndoiți și din împingere.',
  },
  'Check Hook': {
    steps: [
      'Adversarul intră peste tine.',
      'Arunci croșeul de stânga și în același timp pivotezi pe vârful piciorului din față.',
      'Piciorul din spate se rotește în afara liniei lui: ajungi lateral, gata să ataci din alt unghi.',
    ],
  },
  'Middle Split Reach': { steps: ['Așezat în sfoară laterală, cât de larg poți fără durere, mâinile pe sol în față.', 'Întinzi o mână cât mai departe înainte, cu pieptul spre sol, apoi pe cealaltă.', 'Împingi înapoi din mâini și repeți lent.'] },
  'Straddle Side Bend': { steps: ['Din sfoara laterală (sau picioarele larg depărtate), te întorci spre un picior.', 'Duci ambele mâini spre laba piciorului și cobori trunchiul peste el.', 'Ții, apoi treci pe celălalt picior.'] },
  'Straddle Dive': { steps: ['Picioarele foarte depărtate, mâinile pe sol în față, șoldurile sus.', 'Duci pieptul înainte și în jos printre mâini, ca într-o flotare „Hindu”.', 'Lași bazinul să coboare spre sol și termini cu brațele întinse și pieptul sus. Împingi înapoi și repeți.'] },

  // ---------- punches & movement (Lupte) ----------
  Jab: {
    steps: [
      'Din gardă, mâna din față pleacă drept spre țintă, pe cel mai scurt drum.',
      'Rotești pumnul la final (palma spre sol) și ridici umărul ca să-ți acopere bărbia.',
      'Mâna din spate rămâne lipită de față.',
      'Brațul se întinde complet și revine imediat pe același drum, în gardă.',
    ],
    mistake: 'Jab doar din braț și pe jumătate de distanță. În video-ul lui Alex asta înseamnă cam 18% din putere.',
  },
  Cross: {
    steps: [
      'Pleacă din piciorul din spate: călcâiul se ridică și pivotezi pe vârf.',
      'Șoldul și umărul din spate se rotesc înainte, pumnul merge drept spre țintă.',
      'Mâna din față revine la bărbie în timpul loviturii.',
      'Aduci pumnul înapoi la fel de repede cum a plecat.',
    ],
  },
  Hook: {
    steps: [
      'Cotul se ridică la înălțimea pumnului, brațul îndoit la aproximativ 90°.',
      'Rotești șoldul și piciorul de aceeași parte; brațul doar urmează rotația.',
      'Lovitura e scurtă și compactă, nu largă.',
      'Mâna cealaltă stă la bărbie, apoi revii în gardă.',
      'Pregătește-l: croșeul aruncat singur, de departe, se vede. Alex îl pune după un jab.',
    ],
    mistake: 'Croșeul larg, „de pe Lună”: se vede venind și te descoperă. În video-ul lui Alex, croșeul larg ajunge la 43% din putere, cel compact la 96%.',
  },
  Uppercut: {
    steps: [
      'Cobori puțin din genunchi, pe partea loviturii.',
      'Împingi din picioare și ridici pumnul de jos în sus, cu palma spre tine.',
      'Cotul rămâne aproape de corp; lovitura vine din picioare și șold.',
      'Revii imediat în gardă.',
    ],
    mistake: 'Să-l armezi larg, drept în picioare, cu mâna coborâtă: Alex arată că așa se vede de departe. Pleacă scurt, din gardă, după ce cobori din genunchi.',
  },
  Overhand: {
    steps: [
      'Cobori puțin și muți capul de pe linia de atac.',
      'Mâna din spate vine într-un arc de sus, peste garda adversarului.',
      'Rotești tot corpul în lovitură și termini cu greutatea pe piciorul din față.',
    ],
  },
  'Slip & Roll': {
    steps: [
      'Slip: rotești ușor trunchiul și muți capul cu câțiva centimetri în lateral, cât să treacă pumnul.',
      'Roll (bob & weave): cobori din genunchi, treci cu capul pe sub lovitură într-un U și urci pe partea cealaltă.',
      'Garda rămâne lipită de față, privirea pe adversar.',
    ],
    mistake: 'Să te apleci din spate în loc să cobori din genunchi.',
  },
  'Footwork': {
    steps: [
      'Înainte: împingi din piciorul din spate, piciorul din față face pasul.',
      'Înapoi: împingi din piciorul din față, piciorul din spate face pasul.',
      'Lateral: piciorul dinspre direcția de mers pleacă primul. Nu încrucișezi niciodată picioarele.',
      'Pași mici, pe vârfuri, distanța dintre tălpi rămâne aceeași.',
    ],
  },
};

/** What changes in a specific variation of a workout exercise. */
export const VAR_NOTES: Record<string, string> = {
  'Incline Explosive Push-ups': 'Mâinile pe o bancă sau pe pervaz. Mai ușor, aceeași explozie.',
  'Clap Push-ups': 'Împingi destul de tare cât să bați din palme în aer înainte să aterizezi.',
  'Superman Push-ups': 'Varianta din antrenamentul arătat de Alex: împingi atât de tare încât și mâinile, și picioarele se desprind de sol, corpul se întinde în aer, apoi aterizezi controlat.',
  'Incline Push-ups': 'Mâinile pe o bancă sau o masă. Cu cât e mai sus, cu atât e mai ușor.',
  'Decline Push-ups': 'Picioarele pe un scaun: mai multă greutate pe umeri și pe partea de sus a pieptului.',
  'Archer Push-ups': 'Mâinile foarte depărtate. Cobori spre o mână, celălalt braț rămâne întins. Alternezi părțile.',
  'Pseudo Planche Push-ups': 'Mâinile la nivelul taliei, degetele spre picioare, corpul înclinat în față peste mâini.',
  'Bench Dips': 'Mâinile pe marginea unei bănci în spatele tău, picioarele în față. Cu genunchii îndoiți e mai ușor.',
  'Negative Dips': 'Sari sau urci sus pe bare și cobori cât de lent poți, 3–5 secunde.',
  'Parallel Bar Dips': 'Varianta completă, pe bare paralele.',
  'Weighted Dips': 'Cu un rucsac încărcat sau o centură cu greutăți.',
  'Elevated Pike Push-ups': 'Picioarele pe o bancă, corpul mai vertical: mai multă greutate pe umeri.',
  'Wall Handstand Push-up Negatives': 'Urci în stând pe mâini cu picioarele pe perete și cobori capul spre sol cât de lent poți.',
  'Wall Handstand Push-ups': 'Stând pe mâini cu fața sau spatele la perete, cobori capul spre sol și împingi înapoi.',
  'Incline Diamond Push-ups': 'Mâinile în romb pe o bancă.',
  'Decline Diamond Push-ups': 'Picioarele pe un scaun, mâinile în romb.',
  'Tuck Hollow Hold': 'Genunchii la piept, doar umerii ridicați.',
  'Hollow Body Rocks': 'Din poziția hollow te legeni înainte și înapoi fără să pierzi forma.',
  'Negative Pull-ups': 'Sari cu bărbia peste bară și cobori cât de lent poți, 3–5 secunde.',
  'Band-assisted Pull-ups': 'O bandă elastică prinsă de bară, sub genunchi sau sub talpă, te ajută la urcare.',
  'Weighted Pull-ups': 'Cu un rucsac încărcat sau o centură cu greutăți.',
  'Negative Chin-ups': 'Urci sau sari sus și cobori cât de lent poți.',
  'Band-assisted Chin-ups': 'Cu bandă elastică sub genunchi sau sub talpă.',
  'Weighted Chin-ups': 'Cu greutate în rucsac sau pe centură.',
  'Inverted Rows (high bar)': 'Bara mai sus, corpul mai vertical: mai ușor.',
  'Feet-elevated Inverted Rows': 'Picioarele pe un scaun, corpul orizontal: mai greu.',
  'Archer Rows': 'Tragi spre o mână, celălalt braț rămâne întins lateral.',
  'Band Y-T-W Raises': 'În picioare, cu banda prinsă în față, la nivelul pieptului.',
  'TRX Y-T-W Raises': 'Ca Alex: ții mânerele TRX, te lași pe spate cu corpul drept și te tragi sus din brațele întinse în Y, T și W.',
  'Bodyweight Biceps Curls': 'Sub o bară joasă, cu palmele spre tine: tragi doar din coate, corpul rămâne drept.',
  'Band Hammer Curls': 'Calci pe bandă și tragi cu palmele una spre alta.',
  'Dumbbell Hammer Curls': 'Ganterele cu palmele una spre alta, 4 × 10–12 ca la Alex.',
  'TRX Face Pulls': 'Ții mânerele, te lași pe spate și tragi mâinile spre frunte cu coatele sus, ca la face pulls cu banda.',
  'TRX Rear Delt Flys': 'Brațele aproape întinse, le deschizi lateral (ca un T) și strângi spatele umerilor.',
  'TRX Rows (upright)': 'Corpul aproape vertical: varianta ușoară.',
  'TRX Rows (feet elevated)': 'Picioarele pe un scaun, corpul orizontal: cel mai greu.',
  'TRX Single-arm Rows': 'Un singur mâner, celălalt braț liber; nu lăsa trunchiul să se rotească.',
  'Band Pull-Aparts': 'Ții banda întinsă în față, la nivelul umerilor, și o desfaci până la piept strângând omoplații.',
  'Band Face Pulls': 'Banda prinsă la înălțimea feței: tragi spre față cu coatele sus.',
  'Lying Leg Raises': 'Pe spate, mâinile sub fese, ridici picioarele întinse până la vertical și cobori fără să atingi solul.',
  'Hanging Leg Raises': 'Picioarele întinse, până la orizontală sau mai sus.',
  'Toes-to-Bar': 'Duci vârfurile picioarelor până la bară, controlat.',
  'Active Hang': 'Umerii trași în jos, departe de urechi, pe toată durata.',
  'One-arm Assisted Hang': 'O mână pe bară, cealaltă doar sprijină ușor (pe bară sau pe un prosop).',
  'Reverse Lunges': 'Pasul se face înapoi: mai ușor pentru genunchi.',
  'Forward Lunges': 'Pasul se face înainte și împingi înapoi în poziția de start.',
  'Walking Lunges': 'Înaintezi cu fiecare pas, alternând picioarele.',
  'Weighted Walking Lunges': 'Cu ganterele în mâini sau un rucsac încărcat.',
  'Single-leg Calf Raises': 'Pe un singur picior, celălalt ridicat.',
  'Assisted Cossack Squats': 'Te ții de ceva în față și cobori doar cât poți cu călcâiul pe sol.',
};
