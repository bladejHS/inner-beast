// Advice from Alex Hanma's channel (TikTok @alexhanma___, Instagram @alexhanma_), condensed in Romanian.

export interface TipCard {
  id: string;
  title: string;
  points: string[];
  /** TikTok video id, or an Instagram post code prefixed with "ig:". */
  src?: string;
  srcTitle?: string;
  /** Optional link to a tool in the app. */
  tool?: 'daily' | 'pull';
}

export const ALEX_FIGHT: TipCard[] = [
  {
    id: 'mistakes', title: '5 greșeli la sac', src: '7658361650487037216', srcTitle: '5 mistakes 90% of boxers make',
    points: [
      'Te încarci prea mult înainte de lovitură, iar adversarul o vede venind.',
      'Lași garda jos după fiecare pumn.',
      'Lovești doar din brațe, nu cu tot corpul.',
      'Stai prea drept și abia îți miști picioarele.',
      'Dai fiecare pumn cu toată puterea, în loc de precizie și control.',
    ],
  },
  {
    id: 'power', title: 'Cum arată un pumn puternic', src: 'ig:Demjz7ru6Ix', srcTitle: '10 semne ale unui pumn puternic',
    points: [
      'Ești relaxat până în momentul impactului. Mușchii explodează doar atunci.',
      'Pumnul pocnește, nu împinge: lovești și aduci mâna imediat înapoi.',
      'Tot corpul lucrează ca unul: tălpi, picioare, șolduri, umeri.',
      'Forță fără elan: o lovitură scurtă și seacă ajunge.',
      'Lovești tare și din mișcare: cu pas înapoi, lateral sau schimbând unghiul.',
      'Croșeul are forță și de aproape, din rotație.',
      'Timing: pumnul ajunge când adversarul nu se așteaptă.',
    ],
  },
  {
    id: 'speed', title: 'Cum devii mai rapid', src: '7675488426048703777', srcTitle: 'Wie werde ich schneller?',
    points: [
      'Shadow boxing cu bazele, până la refuz. Lovești pe toată distanța, nu pe jumătate sau pe trei sferturi.',
      'Shadow boxing controlat: stai pe loc și verifici unde ești descoperit, cum îți muți greutatea, cum legi picioarele, trunchiul și brațele.',
      'Antrenament atletic: pe el ar trebui să fie oricum focusul.',
      'Forță ca un atlet, nu ca un culturist: picioare și core mai puternice, plus mobilitate.',
      'Învață întâi să întinzi brațul complet. Abia apoi lovești lung și relaxat, de la lejer la tare.',
    ],
  },
  {
    id: 'strength', title: 'Forța nu te face lent', src: '7691406826620931360', srcTitle: 'Mythos: Krafttraining macht langsam',
    points: [
      'Bazele perfect: un jab curat și lung, croșee scurte, totul minimalist. Fără serii de zece lovituri, care se contrează ușor.',
      'Antrenamentul atletic te învață să folosești picioarele, core-ul și umerii și să-ți transferi greutatea.',
      'Calistenie sau greutăți nu contează. Contează intensitatea.',
      'Devino mai puternic, nu doar mai greu: squats, pull-ups și exerciții compuse.',
      'Antrenează și viteza: sărituri, sprinturi, aruncări explozive cu mingea medicinală, mobilitate.',
      'Contează forța raportată la greutatea ta. Alex e mai rapid la 88 kg decât era la 75 kg, pentru că folosește picioarele și core-ul.',
      'Antrenează nu doar câtă forță produci, ci și cât de repede o produci.',
    ],
  },
  {
    id: 'pillars', title: 'Pilonii progresului', src: '7693645369535679776', srcTitle: 'Ist das natty?',
    points: [
      'Somn, antrenament dur și multă regenerare. Regenerarea e la fel de importantă ca antrenamentul.',
      'Antrenează-te intens și nu repeta la nesfârșit același antrenament, cu aceleași greșeli.',
      'Variază intensitatea și introdu din când în când o săptămână cu volum mai mare.',
      'Ține stresul sub control și rămâi constant. Un antrenor bun îți ajustează programul.',
      'Genetica nu e o scuză: dacă respecți bazele, rezultatele vin.',
    ],
  },
  {
    id: 'riley', title: 'Antrenamentul „Simon Riley”', src: '7319897665938951457', srcTitle: 'Hardcore Combat workout',
    points: [
      '10 runde × 3 minute de shadow boxing, garda sus, ritm ridicat.',
      '40 de Superman Push-ups: împingi atât de tare încât mâinile și picioarele se desprind de sol.',
      '150 de Clap Push-ups, împărțite în câte serii ai nevoie.',
      'Aterizezi moale, cu coatele ușor îndoite, ca să-ți protejezi încheieturile.',
      'Variantele explozive le găsești în ziua de push, la Explosive Push-ups.',
    ],
  },
  {
    id: 'mobility', title: 'Mobilitate în fiecare zi', src: '7693615437489229089', srcTitle: 'Explosiver werden', tool: 'daily',
    points: [
      '10–15 minute pe zi, de exemplu cercuri cu brațele, ca să rămâi mobil și rapid.',
      'Când pui masă musculară, te poți „scurta”. Mobilitatea previne asta.',
      'Exemplul lui e Conor McGregor: mobilitatea lui arată ciudat, dar îl face rapid și elastic.',
      'Merge împreună cu atletismul, boxul și forța.',
    ],
  },
  {
    id: 'rear', title: 'Umerii din spate', src: '7660845220430384417', srcTitle: 'Rücken Training', tool: 'pull',
    points: [
      'Luptătorii ajung des cu umerii aduși în față, „umeri de boxer”.',
      'Alex antrenează mereu umărul posterior: TRX 4 × 5-5-5 și umăr posterior 4 × 10–12.',
      'În aplicație le găsești în ziua de pull: Y-T-W Raises și Face Pulls.',
    ],
  },
  {
    id: 'street', title: 'Autoapărare: calm și gardă', src: '7687655156787301665', srcTitle: 'Never get too emotional',
    points: [
      'Nu te lăsa luat de emoții într-o situație tensionată. Cine se agită lovește haotic.',
      'Garda sus, în poziție de luptă: cine stă în gardă e pregătit, cine stă cu mâinile jos nu.',
      'Dacă ești atacat: întâi blochezi, apoi răspunzi.',
      'Ringul și strada sunt lucruri complet diferite, spune Alex.',
    ],
  },
  {
    id: 'street2', title: 'Autoapărare: pleacă, blochează, gardă', src: '7686905759724014881', srcTitle: 'Street self defense',
    points: [
      'Dacă poți pleca dintr-o situație periculoasă, pleacă. Nu te apropia și nu-l provoca.',
      'Blocaj: ridici brațul cu palma pe cap, antebrațul îți acoperă lateralul capului, cotul rămâne îndreptat înainte.',
      'Din blocaj, fără să cobori brațul, intri cu cotul. E interzis în box: exersează-l doar controlat, pe sac sau manechin.',
      'Nu te baza pe lovituri la corp pe stradă: dacă nu-l opresc, te copleșește. Fără gardă nu ai cu ce să te aperi.',
      'După fiecare atac revii imediat în poziția de luptă, cu garda sus.',
    ],
  },
];

export const ALEX_MIND: TipCard[] = [
  {
    id: 'discipline', title: 'Disciplină peste motivație', src: 'ig:profile', srcTitle: 'Instagram @alexhanma_',
    points: ['Nu renunța doar pentru că e greu.', 'Sală, luptă și creștere reală.'],
  },
  {
    id: 'suffer', title: 'Cele două feluri de suferință', src: '7690255912002440481', srcTitle: 'Hol dir das, was du endlich möchtest',
    points: [
      'Suferi oricum: fie pentru că nu faci nimic, fie pentru că faci ceva.',
      'Când faci, înveți enorm și te simți bine.',
      'Ce faci mereu devine rutină, iar rutina devine disciplină de fier.',
      'Ești responsabil pentru viața ta, chiar și când alții nu și-au ținut cuvântul.',
    ],
  },
  {
    id: 'you', title: 'Cea mai mare problemă ești tu', src: '7691418229834550560', srcTitle: 'Wichtige Message',
    points: [
      'Tu decizi cum reacționezi la ce ți se întâmplă.',
      'Învață să spui nu, inclusiv ție.',
      'Nu-i lăsa pe alții să-ți controleze viața.',
      'Rămâi în mișcare: stagnarea îți taie energia.',
      'Corp, minte și suflet în echilibru. Gândurile creează realitatea.',
    ],
  },
  {
    id: 'doubt', title: 'Scapă de îndoieli', src: '7693901604990307616', srcTitle: 'Selbstzweifel loswerden',
    points: [
      'Întreabă-te de unde vin: oamenii din jur, copilăria, frica.',
      'Intră în frică și fă ceva care te întărește.',
      'Nu-ți fie frică să pierzi. Nimic nu iese perfect.',
      'Nu mai analiza totul. Fă-te prieten cu tine însuți.',
    ],
  },
  {
    id: 'time', title: 'Ia-ți timpul', src: '7693867370934226209', srcTitle: '2 Minuten, die du hören musst',
    points: [
      'Cu cât faci mai mult, cu atât unii vor să te vadă jos.',
      'Ține-te departe de haos și dramă ca să ai claritate.',
      'Uneori durează ani până merge. Nu e grav că ai nevoie de timp.',
    ],
  },
  {
    id: 'courage', title: 'Fă ceva ce cere curaj', src: '7690131134025420064', srcTitle: 'Macht was, wo man Eier braucht',
    points: ['Nu te antrena doar ca să arăți bine.', 'Pentru Alex, curajul e în sparring cu profesioniști.'],
  },
  {
    id: 'nobody', title: 'Nimănui nu-i pasă. Muncește mai mult', src: '7687707357983296801', srcTitle: 'Nobody cares. Work harder.',
    points: [
      'Obosit, trist, singur, fără bani, speriat, demotivat: nu sunt scuze.',
      'Continuă să te antrenezi și să muncești, mai ales în zilele astea.',
    ],
  },
  {
    id: 'slow', title: 'Încet, dar fără oprire', src: '7693240332053466400', srcTitle: 'It does not matter how slowly you go',
    points: ['Nu contează cât de încet avansezi, atâta timp cât nu te oprești.', 'Consecvența bate viteza.'],
  },
  {
    id: 'fearless', title: 'Devino fără frică', src: '7688768918667676961', srcTitle: 'Angstfrei werden in 1:30 Minuten',
    points: [
      'Trebuie să duci lupta cu tine însuți. Nimeni nu o duce în locul tău.',
      'Ia decizii independent de ceilalți. E normal să-ți faci timp pentru antrenament.',
      'Dacă faci doar ce vor alții, nu ce simți, ajungi să te frângi.',
      'Pe cei care nu te susțin lasă-i deoparte și mergi până la capăt.',
    ],
  },
  {
    id: 'balance', title: 'Corp, minte și suflet', src: '7695137765058432288', srcTitle: 'Emotionale Intelligenz',
    points: [
      'Forța mentală și emocională vine doar din munca pe tine, cu corpul, mintea și sufletul în echilibru.',
      'Dacă tu dai totul și celălalt doar critică și trage în jos, dezechilibrul e al lui, nu al tău.',
      'Nu-i lăsa pe oamenii negativi să te doboare.',
    ],
  },
  {
    id: 'joy', title: 'Fă ce te împlinește', src: '7698057905131638049', srcTitle: 'Warum?',
    points: [
      'Nu trebuie să te justifici: unii își repară mașinile, alții fac balet, el boxează.',
      'Fă mai mult din ce te împlinește. Ce nu te împlinește, lasă-l.',
      'Mișcarea îți face bine, și fizic, și mental.',
    ],
  },
  {
    id: 'pain', title: 'Durerea e doar o senzație', src: '7663128666758548769', srcTitle: 'Pain is just a feeling',
    points: ['Abilitățile impresionante, ca sfoara laterală a lui Alex, cer timp și răbdare.', 'Mergi constant, puțin câte puțin. Rutina Dagestan o găsești la Unelte.'],
  },
  {
    id: 'practice', title: 'Practica bate teoria', src: '7660845220430384417', srcTitle: 'Rücken Training',
    points: ['Urmează oameni și antrenori care fac, nu doar care vorbesc.'],
  },
];

/** Short reminders shown during rest between boxing rounds. */
export const REST_TIPS = [
  'Garda sus după fiecare pumn.',
  'Nu te încărca înainte de lovitură.',
  'Lovește cu tot corpul, nu doar din brațe.',
  'Picioarele în mișcare, genunchii ușor îndoiți.',
  'Precizie și control, nu doar putere.',
  'Relaxat până la impact, apoi explodezi.',
  'Pumnul pocnește și revine, nu împinge.',
  'Lovește pe toată distanța.',
  'Croșee scurte, rotația vine din șold.',
  'Expiri scurt la fiecare lovitură.',
  'Jabul pe toată distanța, umărul urcă la bărbie.',
  'Cobori din genunchi, nu din spate.',
  'După combinație ieși din linie sau schimbă unghiul.',
  'Întâi corpul, apoi capul.',
];

export function srcUrl(src: string | undefined): string | null {
  if (!src) return null;
  if (src === 'ig:profile') return 'https://www.instagram.com/alexhanma_/';
  if (src.startsWith('ig:')) return `https://www.instagram.com/reel/${src.slice(3)}/`;
  return `https://www.tiktok.com/@alexhanma___/video/${src}`;
}
