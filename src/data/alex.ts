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
      'Lumea face o pauză după ce o atingi, chiar și la contact ușor. Sacul și mănușile sună greu.',
      'Lovești tare și din poziții incomode: echilibrul, timingul și rotația duc forța oriunde.',
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
    id: 'guard-high', title: 'Garda sus, mereu', src: '7651603862721170720', srcTitle: 'Kampfsport Schwurbel',
    points: [
      'Cu mâinile jos îți lași ficatul și capul descoperite. Un adversar bun fentează jos și lovește sus, sau invers.',
      'Ține garda sus: de acolo blochezi tot, ieși, faci roll sau intri.',
      'Cine are mâinile sus are mai mult control și lovește mai repede.',
    ],
  },
  {
    id: 'controlled', title: 'Lovituri controlate', src: '7688788415181032736', srcTitle: 'Dangerous punches',
    points: [
      'Nu arunca lovituri sălbatice, necontrolate: te lasă descoperit.',
      'Lovește controlat, „bărbie la bărbie”, și gândește-te la apărare la fiecare pumn.',
    ],
  },
  {
    id: 'details', title: 'Detalii care contează', src: '7555572452215033110', srcTitle: 'How to throw jab + cross effectively',
    points: [
      'La jab scoți capul de pe linia de mijloc. Încarci puțin piciorul, uppercut-ul pleacă scurt, apoi înapoi în gardă.',
      'Croșeul de stânga se încarcă: greutatea trece pe partea din față înainte să-l arunci, nu doar din braț.',
      'Stilul Tyson: poziție joasă, genunchii îndoiți tot timpul.',
      'Semn că cineva nu știe box: face shadow boxing cu mâinile deschise.',
      'Cea mai periculoasă lovitură, după Alex: overhand-ul.',
      'Exercițiu de reacție cu un partener: când te atinge, răspunzi imediat cu lovituri. Întâi lent, apoi tot mai repede.',
    ],
  },
  {
    id: 'fast', title: 'Cum lovești rapid', src: '7263867244814355744', srcTitle: 'How to punch fast',
    points: [
      'Nu-ți încărca pumnul înainte (telegraphing): te încetinește mult și se vede.',
      'Lovește direct de unde e mâna și rotește-te odată cu pumnul.',
    ],
  },
  {
    id: 'taller', title: 'Contra unui adversar mai înalt', src: '7226460257298500890', srcTitle: 'How you fight against taller opponents',
    points: [
      'Greșit: să stai drept și să întinzi mâna după el sau să sari spre capul lui.',
      'Corect: rămâi jos, cu genunchii îndoiți și garda strânsă, intri în distanță scurtă.',
      'Acolo lucrezi corpul, croșeele și uppercut-urile, apoi ieși din nou.',
    ],
  },
  {
    id: 'zero', title: 'Dacă aș începe de la zero', src: '7608696726022589718', srcTitle: 'Das würde ich tun wenn ich bei null anfangen würde',
    points: [
      'Renunță la seriile rapide de pumni în shadow boxing. Lucrează pe distanțe lungi, realiste, cu lovituri simple și transfer de greutate.',
      'Ce faci în shadow boxing iei cu tine în sparring.',
      'Antrenează coordonarea mână-ochi, ca să simți distanța.',
      'Ia regenerarea în serios: 4 antrenamente grele pe săptămână, restul ușoare sau pauză.',
    ],
  },
  {
    id: 'shadow-fix', title: 'Shadow boxing corect', src: '7640175509539720480', srcTitle: 'Schattenboxen korrigiert',
    points: [
      'Combinațiile sălbatice te lasă pe linia adversarului: așa ajungi KO.',
      'Stai curat: bărbia jos, mâna din față întinsă spre el, relaxat. De la lejer la tare.',
      'Întâi lovituri simple: jab și revii cu mâna sus.',
      'După cross ieși din linia loviturii, apoi croșeu și ieși din nou. Capul nu stă niciodată pe loc.',
    ],
  },
  {
    id: 'shoulders', title: 'Niciodată umeri obosiți', src: '7638703811749481760', srcTitle: 'Nie wieder müde Schultern',
    points: [
      'Nu face shadow boxing cu gantere sau benzi: te învață lovituri pe jumătate sau pe trei sferturi.',
      'Mobilitatea e cheia.',
      'Lucrează bazele: garda sus, bărbia jos, distanțe lungi și curate.',
      'Nu tot timpul tare: învață să fii relaxat, apoi tare. Mâinile sus devin un obicei.',
    ],
  },
  {
    id: 'diagonal', title: 'Fără pas pe diagonală', src: '7599662960541224214', srcTitle: 'Nie wieder Diagonalgang',
    points: [
      'Pasul în care încrucișezi picioarele te lasă fără bază și fără apărare.',
      'Învață întâi bazele: jab, cross, uppercut, croșeu.',
      'Apoi combinații curate, cu roll-uri și mișcare.',
    ],
  },
  {
    id: 'calm', title: 'Calm și distanță lungă', src: '7647626593703136545', srcTitle: 'Warum Talahon Boxen nicht funktioniert',
    points: [
      'Boxerul agitat lovește haotic, pe jumătate de distanță, și n-are simțul distanței.',
      'Pe el îl contrezi ușor dacă rămâi calm.',
      'Indiferent de nivel, Alex le cere tuturor același lucru: distanțe lungi.',
    ],
  },
  {
    id: 'sparring', title: 'Sparringul greu te strică', src: '7450914363428474135', srcTitle: 'Warum hartes Sparring kontraproduktiv ist',
    points: [
      'Alex avea o accidentare la două săptămâni: capsulă ruptă, deget fisurat, nasul spart.',
      'Când a trecut pe sparring tehnic, a progresat enorm.',
      'Regula profesioniștilor: o zi la 80%, o zi la 60%. Așa rămâi sănătos pe termen lung.',
      'Antrenează-te tare, dar inteligent și tehnic.',
    ],
  },
  {
    id: 'home', title: 'Mai bun în box, de acasă', src: '7569680634222857494', srcTitle: 'How to get better in boxing',
    points: [
      'Poziția de luptă: mâinile sus, bărbia jos, mâna din față înainte.',
      'Lovești și eviți lovituri: cross, apoi step hook (croșeu cu pas lateral).',
      'Roll, roll, check hook și ieși.',
      'Controlează loviturile și distanța.',
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
      'Punctele cele mai sensibile, pe care ți le aperi: bărbia și maxilarul, gâtul, ficatul.',
    ],
  },
];

/** Whole sessions Alex shows on his channel, with the numbers written on screen. */
export const ALEX_WORKOUTS: TipCard[] = [
  {
    id: 'w-gym-box', title: 'Box la sală', src: '7597868920707648770', srcTitle: 'Gutes Box-Workout zum Nachmachen',
    points: ['Lucru exploziv la sac: 6 × 1 minut.', 'Mâini grele la sac: 4 × 3 minute.', 'Shadow boxing 2 × 3 minute, focus pe viteză.', 'Shadow boxing 2 × 3 minute, focus pe transferul de greutate.', 'Reflex ball 5 minute, ca să te liniștești.'],
  },
  {
    id: 'w-power', title: '2 antrenamente pentru pumni puternici', src: '7373002304427019552', srcTitle: '2 workouts for powerful punches',
    points: ['La sac, 100% putere: 30 de secunde × 8.', 'Explosive Push-ups: 5 serii de câte 40.'],
  },
  {
    id: 'w-speed', title: 'Pumni mai rapizi', src: '7365216002692451616', srcTitle: 'Schneller & explosiver schlagen',
    points: ['Shadow boxing cât de rapid poți: 8 × 30 de secunde, rotind șoldul și trunchiul la fiecare pumn.', 'Pumni cu bandă elastică (Theraband) prinsă în spate: 12 × 20, ambele brațe, rapid și exploziv.', 'Șoldul și picioarele se rotesc exploziv odată cu pumnul.', 'Shadow boxing 6 × 3 minute: repetițiile sunt cheia.', 'În clip mai apare shadow boxing cu gantere de 1 kg; mai târziu Alex a spus că nu le mai recomandă.'],
  },
  {
    id: 'w-home-ksk', title: 'Circuit acasă („KSK”)', src: '7351764744166018337', srcTitle: 'KSK Training für zuhause',
    points: ['Mike Tyson Push-ups, Slips, Plank Ups, Knee Jumps (din genunchi în picioare), Jackknife Sit-ups sau Leg Raises.', 'Varianta ușoară: 20 / 30 / 20 / 10 / 20, 5 runde.', 'Varianta grea: 80 / 60 / 100 / 100 / 60, 10 runde, 30 de secunde pauză între exerciții.'],
  },
  {
    id: 'w-hardcore', title: 'Hardcore Boxing Homeworkout', src: '7261665042796481818', srcTitle: 'Hardcore Boxing Homeworkout',
    points: ['Doar lovituri drepte: 30 s × 4.', 'Croșee la corp: 30 s × 5.', '30 de burpees.', '20 de Jumping Push-ups.', '5 Superman Push-ups.', '3 runde × 3 minute de box.', 'Pauză 15 secunde între serii (în altă variantă, 30 de secunde).'],
  },
  {
    id: 'w-explosive', title: 'Metode pentru pumni explozivi', src: '7559669199602306326', srcTitle: 'Training methods for hard punches',
    points: ['Shadow boxing 3 × 3 minute, cu combinații explozive.', 'Rotații cu un baston (sau o coadă de mătură) pe umeri: 2 × 2 minute.', 'Același baston, câte 1 minut pe fiecare parte.', 'Priză și antebrațe cu kettlebell-ul: 12 × 4.'],
  },
  {
    id: 'w-strength-home', title: 'Forță acasă pentru pumni grei', src: '7289557453757320480', srcTitle: 'Homeworkout for boxing',
    points: ['Flotări până la epuizare.', 'Wide Push-ups 10 × 4.', 'Diamond Push-ups 5 × 4.', 'Shadow boxing 4 × 3 minute, „lasă-l să curgă”.', 'Finisher 20 × 2.'],
  },
  {
    id: 'w-calories', title: 'Ardere rapidă', src: '7319534539477486881', srcTitle: 'Try this workout to burn calories',
    points: ['Sărituri din genuflexiune: 5 × 10.', 'Stând pe mâini: 3 × 10 secunde (la perete, dacă ai nevoie).', 'Shadow boxing 8 × 30 de secunde, cât de rapid poți.'],
  },
  {
    id: 'w-camp', title: 'O zi de cantonament', src: '7302590385921002785', srcTitle: 'Trainings Vlog in Spain',
    points: ['6 runde de sparring tehnic.', '3 runde la mănuși (pads).', '8 runde la sacul greu.'],
  },
  {
    id: 'w-challenges', title: 'Provocările lui Alex la flotări', src: '7238310144264785178', srcTitle: 'Give me 800 push ups',
    points: ['800 de flotări „la micul dejun”: 350, apoi 200, apoi 150, apoi ultimele 100.', 'După 12 runde de box, 400 de flotări în serii de câte 50.', 'Provocarea pe niveluri: 11 variante de flotări, de la cele ușoare până la flotări în stând pe mâini. Vezi la ce nivel ești.', 'Nu sunt pentru început: crește treptat.'],
  },
  {
    id: 'w-outdoor', title: 'Box afară', src: '7348839246762921248', srcTitle: 'Box Training für draußen',
    points: ['Shadow boxing 6 × 3 minute.', '100 de sărituri pe ladă.', 'Shadow boxing 4 × 3 minute.', '30 de Superman Push-ups.', '100 de fandări.', '50 de burpees.'],
  },
  {
    id: 'w-home-combat', title: 'Sporturi de luptă acasă', src: '7351038367666081056', srcTitle: 'Kampfsport Training für zuhause',
    points: ['Shadow boxing 6 × 3 minute.', '200 de flotări (în serii de câte 20).', '100 de flotări cu shoulder taps.', '50 de burpees.', '100 de sărituri.', 'Shadow boxing ușor 3 × 3 minute.'],
  },
  {
    id: 'w-easter', title: 'Antrenamentul de Paște', src: '7352885183068015905', srcTitle: 'Ostermontag Training',
    points: ['Shadow boxing 10 × 3 minute.', 'Coardă 5 × 3 minute.', '100 de fandări.', '200 de flotări.', '50 de burpees.', '50 de sărituri cu schimbarea picioarelor.', '50 de Squat Uppercuts.'],
  },
  {
    id: 'w-gym-day', title: 'O zi la sală cu Alex', src: '7355882260605717793', srcTitle: 'Übersicht über mein Training',
    points: ['Coardă 5 × 3 minute.', 'Shadow boxing 12 × 3 minute.', '100 de burpees dintr-o bucată.', '200 de flotări: 50 / 50 / 50 / 50.', '20 de minute de canotaj.', '15 minute de abdomen și core.', 'La final: 160 de tracțiuni, în serii de câte 20.'],
  },
  {
    id: 'w-hybrid', title: 'Hybrid Athlete Workout', src: '7372964246277164320', srcTitle: 'Niemals aufgeben',
    points: ['Coardă 5 × 3 minute.', 'Shadow boxing 6 × 3 minute.', 'Sparring tehnic 6 × 3 minute.', '30 de burpees (Alex le face cu salt pe spate) și 100 de burpees normale.', '100 de sărituri cu schimbarea picioarelor și 100 de sărituri normale.', 'Apoi stretching în sfoară laterală.'],
  },
  {
    id: 'w-calis', title: 'Calistenie în parc', src: '7345936078953614624', srcTitle: 'Calisthenic workout',
    points: ['Tracțiuni 4 × 12.', 'Muscle-ups 5 × 4.', 'Stând pe mâini 15 secunde × 4.'],
  },
  {
    id: 'w-chest', title: 'Piept acasă („German KSK”)', src: '7325069479652674849', srcTitle: 'German KSK chest workout',
    points: ['50 Push-ups × 10.', '30 Diamond Push-ups × 5.', '50 Wide Push-ups × 5.', '30 Pike Push-ups × 5.', '20 Triceps Push-ups × 5.', '40 Incline Push-ups × 4.', '30 Decline Push-ups × 4.', 'Volum foarte mare: împarte-l și crește treptat.'],
  },
  {
    id: 'w-ladder', title: 'Scara de burpees', src: '7320990541158698272', srcTitle: 'Brutales Homeworkout für die Brust',
    points: ['Burpee cu 1 flotare, apoi cu 2, 3 … până la 10 flotări: asta e o rundă.', '10 runde = 100 de burpees și 550 de flotări. Lui Alex i-a luat 29:47.', 'Începe cu 2–3 runde.'],
  },
  {
    id: 'w-pushups', title: '3 variante de flotări', src: '7321400071952665889', srcTitle: '3 Varianten für Liegestütze',
    points: ['Diamond Push-ups: triceps, cu amplitudine mai mare.', 'Pike Push-ups: umerii, și față, și spate.', 'Decline Push-ups: picioarele sus, umărul din față și pieptul de sus.', 'Le găsești pe toate în ziua de push, ca variante.'],
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
    id: 'rule40', title: 'Regula de 40%', src: '7493216412970913046', srcTitle: 'Disziplin halten',
    points: [
      'Totul e obicei. Observă-te: când ajungi acasă și te pui jos, corpul intră în modul de odihnă.',
      'Când simți că nu mai ai chef, ești abia la 40%. Mai ai mult potențial.',
      'Nu-ți da timp să te gândești: pleacă direct la antrenament și adună momentum.',
      'Emoțiile nu contează în momentul ăla. Exact atunci te ridici și dai tot.',
    ],
  },
  {
    id: 'identity', title: 'Schimbă-ți identitatea', src: '7650200120440392993', srcTitle: 'Ändere dein Mindset',
    points: [
      'Poți dezvolta abilități extreme, dar gândurile și identitatea de acum te blochează.',
      'Dacă vrei să fii boxer, adoptă identitatea unui boxer și lasă vechiul tu în urmă.',
      'Ego-ul vrea să știe totul mai bine și să respingă ce ți-ar folosi.',
      'Devino observatorul tău: vezi rutinele care nu te duc înainte și schimbă-le.',
    ],
  },
  {
    id: 'mental', title: 'De ce te antrenezi', src: '7486062049320029462', srcTitle: 'Wie wichtig ist mentale Gesundheit?',
    points: [
      'Antrenamentul e pentru starea mentală. Sportul e ceva ce nu poți păcăli.',
      'Alex a fost și el slab mental și frânt.',
      'E mult mai bine să fii un atlet dur decât frânt și bolnav.',
    ],
  },
  {
    id: 'choose', title: 'Îți alegi viața în fiecare zi', src: '7651698723688418592', srcTitle: 'Du entscheidest dich für dein Leben',
    points: [
      'În fiecare zi decizi ce faci, ce gândești, cum acționezi și cum reacționezi.',
      'Cei mai mulți trăiesc în rolul de victimă a vieții.',
      'Nu e grav că nu ești încă destul de bun. Grav e să stai pe loc.',
      'Sarcina ta: să fii mai bun decât ieri, într-o transformare continuă.',
    ],
  },
  {
    id: 'constant', title: 'Constant, după ce trece euforia', src: '7635619617402064161', srcTitle: 'Handle konstant',
    points: [
      'Începi ceva nou cu euforie și energie. La primele probleme, cei mai mulți renunță și o iau de la capăt cu altceva.',
      'În loc de asta: acționează constant, gândește conștient, crește din identitatea ta.',
      'Greșelile și eșecurile sunt normale. Fac parte din drum.',
    ],
  },
  {
    id: 'emotions', title: 'Emoțiile unui bărbat', src: '7651938763303587105', srcTitle: 'Wichtigste Message heute',
    points: [
      'Mulți bărbați n-au învățat să pună limite și să-și arate emoțiile fără să fie luați în râs.',
      'Emoțiile sunt importante: învață să le reglezi, nu să le ascunzi.',
      'Dacă trebuie să plângi, plângi. Dacă ești furios, procesează și întreabă-te de ce.',
    ],
  },
  {
    id: 'affirm', title: '3 afirmații pentru boxeri', src: '7348481672771325217', srcTitle: '3 Affirmationen für Boxer',
    points: ['Sunt disciplinat.', 'Îmi am emoțiile și sentimentele sub control.', 'Am încredere în abilitățile mele.'],
  },
  {
    id: 'act', title: 'Poartă-te ca cel mai bun', src: '7392634621835496737', srcTitle: 'Um der Beste zu sein',
    points: [
      'Ca să fii cel mai bun trebuie să crezi că ești. Dacă nu ești încă, poartă-te ca și cum ai fi.',
      'Adoptă atitudinea, personalitatea și felul de a gândi al câștigătorilor.',
      'Cu timpul, comportamentul devine obicei și calitățile devin ale tale.',
    ],
  },
  {
    id: 'doit', title: 'Vorbitul nu ajută. Fă-o', src: '7556294020800974102', srcTitle: 'Masked mentality',
    points: [
      'Vorbitul, mai ales cel negativ, nu te duce nicăieri. Contează să faci, indiferent cum te simți.',
      'Alex se simte des slab, dar o face ca și cum i-ar plăcea. După, se simte bine.',
      'Când nu face nimic, mentalitatea îi scade și se simte deprimat. Ne luptăm în fiecare zi.',
    ],
  },
  {
    id: 'fail', title: 'Frica de eșec', src: '7223081043476122885', srcTitle: 'You are close my friend',
    points: [
      'E o situație în care câștigi oricum: fie reușești, fie câștigi experiență.',
      'Nimeni n-a pornit din vârful muntelui. Nici bicicleta n-ai știut-o din prima.',
    ],
  },
  {
    id: 'no-excuses', title: '„Nu am timp” nu există', src: '7372266705063628064', srcTitle: 'Keine Zeit gibts nicht',
    points: [
      'Nu există „n-am timp”, „n-am motivație” sau „sunt prea bătrân pentru sfoară”.',
      'Schimbă-ți gândurile spre pozitiv și zâmbește durerii.',
      'Antrenează-te oriunde: o oră de antrenament concentrat contează mai mult decât locul.',
    ],
  },
  {
    id: 'peers', title: 'Competiție prietenoasă', src: '7375517148669676833', srcTitle: 'Friendly Competition',
    points: [
      'Antrenează-te cu cineva de nivelul tău, cu care să te întreci prietenește.',
      'Dacă ai în jur oameni care fac, energia lor trece și la tine.',
    ],
  },
  {
    id: 'goodman', title: 'Ce înseamnă un om bun', src: '7571532659021581590', srcTitle: 'Find your way',
    points: [
      'Nu devii un om bun când ești bogat, ci când îți găsești drumul spre Dumnezeu și spre tine.',
      'Un om bun e loial, disciplinat și își protejează familia.',
      'Nu te lăuda că ești cel mai bun: undeva sunt oameni care tac și sunt mai buni.',
    ],
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
