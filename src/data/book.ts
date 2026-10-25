// "Unleash Your Inner Beast" — every chapter except nutrition (VI), retold in Romanian.

export type Para =
  | string
  | { hl: string }
  | { list: string[] }
  | { steps: Array<[string, string]> };

export interface Chapter {
  id: string;
  num: string;
  title: string;
  body: Para[];
  tool?: 'warrior' | 'formula' | 'habit' | 'why' | 'wins' | 'drive' | 'principles' | 'recovery' | 'plan';
}

export const BOOK: Chapter[] = [
  {
    id: 'intro', num: 'I', title: 'Introducere',
    body: [
      { hl: 'Fii atent: asta e tot ce-ți trebuie ca să-ți schimbi viața.' },
      'Dacă ești aici, nu ai timp de jumătăți de măsură. Nu cauți un program de fitness mediocru. Vrei cea mai bună formă a vieții tale.',
      'Nu e vorba de idealuri de frumusețe sau de trenduri. E vorba de fitness maxim, cel care te face mai puternic fizic și mental decât ai fost vreodată.',
      'Nimeni nu-ți promite că va fi ușor. Primești însă uneltele ca să-ți atingi obiectivele.',
      'Ești gata să te depășești? Atunci pornim împreună.',
    ],
  },
  {
    id: 'mental', num: 'II', title: 'Fitness mental: motivația te trădează',
    body: [
      { hl: 'Motivația e cea mai mare minciună care ți s-a spus.' },
      'E bună ca să te apuci de ceva pentru o zi sau două. Dacă vrei să devii cea mai bună versiune a ta, e o fundație fragilă care te va abandona, sigur, mai devreme sau mai târziu. Și atunci rămâi cu nimic.',
      'Gândește-te la un foc. Ca să-l aprinzi, ai nevoie de iască: aia e motivația. Arde repede, dar îți dă impulsul.',
      'Ca să ții focul aprins, ai nevoie de lemne groase și masive. Ele sunt coloana vertebrală a focului. Lemnul ăsta e disciplina ta, și începe în minte.',
      'Nu vorbim despre citate motivaționale. Vorbim despre dominanță mentală brută. Urmează pașii prin care îți transformi mintea într-o armă.',
    ],
  },
  {
    id: 'dominance', num: '1', title: 'Dominanță mai presus de orice', tool: 'formula',
    body: [
      { hl: 'Slăbiciunea nu e altceva decât trădarea potențialului tău.' },
      'Nu există circumstanțe rele, doar minți slabe. Dacă gândești din slăbiciune, se va vedea în tot ce faci.',
      'Fii neînduplecat. Închide ochii și vezi fiecare pas spre succes. Nu e un gând frumos, e realitatea pe care o vei crea. Trebuie să o vezi înainte să existe.',
      'Formula e simplă: gândurile îți formează convingerile, convingerile îți dictează acțiunile, acțiunile aduc schimbări, iar schimbările îți construiesc imaginea de sine.',
    ],
  },
  {
    id: 'warrior', num: '2', title: 'Fii un războinic', tool: 'warrior',
    body: [
      { hl: 'Întreabă-te acum: ești o victimă sau un războinic?' },
      'Nu citi mai departe până nu închizi ochii, nu-ți pui întrebarea și nu-ți răspunzi.',
      'Dacă ai ajuns la concluzia că ești o victimă, lasă totul și fă 20 de flotări ca să-ți revii.',
      'Nu ești o victimă. Ești un războinic. Preia controlul destinului tău. Fiecare eșec e încă un motiv să revii mai puternic. Ești în viața asta ca să domini, așa că poartă-te ca atare.',
      'A fi războinic nu înseamnă să nu fii niciodată trist, să nu te îndoiești sau să nu-ți vină să renunți. Înseamnă să simți exact toate astea și totuși să faci ce e corect și să nu renunți.',
    ],
  },
  {
    id: 'thoughts', num: '3', title: 'Tu ești șeful gândurilor tale',
    body: [
      { hl: 'Gândurile negative sunt paraziții succesului. Când apar, distruge-le. Imediat.' },
      'Tu îți controlezi gândurile, nu invers. Slăbiciunea nu are ce căuta aici.',
      'Gândurile sunt singurul lucru din lume pe care îl controlezi cu adevărat. Nu alegi unde și cum te naști, cât de înalt ești sau dacă mâine te îmbolnăvești. Atunci de ce ai renunța și la ultimul lucru pe care îl controlezi?',
      'Totul pornește din gânduri. Dacă le controlezi, îți stăpânești viața.',
      'Încrederea de neclintit în tine trebuie să fie stânca ta în furtună. Te îndoiești? Îndoiește-te de acțiunile tale, niciodată de tine. Dacă ai îndoieli reale despre ce faci, acceptă-le și schimbă-ți acțiunile, ca să nu mai ai niciun motiv de îndoială.',
    ],
  },
  {
    id: 'routines', num: '4', title: 'Puterea rutinelor', tool: 'habit',
    body: [
      'Ai învățat că nu te poți baza pe motivație și că disciplina e singurul tău aliat. Cum construiești disciplină de fier?',
      { hl: 'Răspunsul e atât de simplu încât nu-l crezi până nu-l aplici: rutinele.' },
      'Rutinele sunt un cod secret pentru disciplină. Disciplina înseamnă să faci ce-ți face bine, fie că ai chef, fie că nu. O rutină e exact același lucru: faci ceva atât de des încât îl faci automat.',
      'Cel mai bun exemplu e spălatul pe dinți. Părinții ți l-au băgat în cap în copilărie și acum îl faci de două ori pe zi fără să te gândești.',
      'Războinicii nu se bazează pe noroc și pe motivație. Au rutine nemiloase. Structurează-ți ziua ca să te programeze pentru succes. Fără excepții: fiecare acțiune îți modelează destinul.',
      'Exercițiul: alege un singur lucru care știi că-ți face bine, atât de simplu încât îl poți face zilnic fără probleme. Sugestia din carte: 50 de flotări pe zi, toate odată sau împărțite pe parcursul zilei. Fă-l în fiecare zi și nu te culca până nu e gata.',
      {
        steps: [
          ['7 zile', 'Observi cât de ușor e.'],
          ['14 zile', 'Nu te mai gândești la el, doar îl faci.'],
          ['21 de zile', 'Ai un obicei și îți va fi greu să nu-l faci.'],
          ['28 de zile', 'Rutina e atât de solidă încât poți adăuga ceva nou și construi alt obicei.'],
        ],
      },
      { hl: 'Cu fiecare obicei bun, subconștientul tău înțelege că devii tot mai disciplinat. Îți schimbi caracterul în bine.' },
    ],
  },
  {
    id: 'killer', num: '5', title: 'Instinctul ucigaș', tool: 'why',
    body: [
      'Fiecare zi e o luptă și ești aici ca să câștigi. Dezvoltă instinctul care te împinge înainte când alții renunță.',
      'Slăbiciunea nu e tolerată: fii gata să dai totul sau fii gata să fii consumat.',
      'Ca să ai instinctul ucigaș îți trebuie un singur lucru: „de ce”-ul tău. De ce nu vrei să fii o victimă? De ce tocmai tu ar trebui să fii un câștigător?',
      { hl: 'Găsește-ți „de ce”-ul și îți vei găsi succesul.' },
    ],
  },
  {
    id: 'pain', num: '6', title: 'Acceptă, îmbrățișează și iubește durerea',
    body: [
      'Durerea e prețul inevitabil al succesului. Accept-o ca tovarăș permanent.',
      'Problema celor 99% care nu sunt unde își doresc e că se tem de durere, o evită cu orice preț și astfel se ascund de propriul succes.',
      'Dacă nu doare, nu ești pe drumul dominației. Cum să meriți să domini viața dacă nu ești dispus să înduri puțină durere?',
      { hl: 'Dacă accepți durerea, te face mai puternic. Dacă o iubești, devine cea mai puternică armă a ta.' },
    ],
  },
  {
    id: 'five', num: '7', title: 'Cei cinci din jurul tău',
    body: [
      'Ești media celor cinci oameni cu care petreci cel mai mult timp. Înconjoară-te de oameni care au aceleași obiective ca tine.',
      'Oricine te încetinește e un dușman al succesului tău, deci al tău. Nu lăsa slăbiciunea să intre, altfel te consumă.',
      'Dacă nu ai în cercul tău oameni ca tine, ai exact două opțiuni:',
      { list: ['Găsește-ți un cerc nou.', 'Devino mai bun și atrage oamenii potriviți.'] },
    ],
  },
  {
    id: 'wins', num: '8', title: 'Reflecția asupra succeselor', tool: 'wins',
    body: [
      'Privește înapoi la victoriile tale, mari și mici. Fiecare pas înainte e un triumf.',
      'Imaginea succeselor tale e combustibilul pentru următoarea victorie. Respiră mirosul triumfului și lasă-l să te ducă în următoarea provocare.',
      { hl: 'Nu uita niciodată cât de departe ai ajuns.' },
      'Iar dacă simți că n-ai progresat, ăsta e semnul că trebuie să schimbi ceva. Acum.',
    ],
  },
  {
    id: 'drive', num: '9', title: 'Motorul suprem', tool: 'drive',
    body: [
      'Imaginează-ți cum ar fi să atingi tot ce ți-ai propus. Cum ai arăta? Ce ar crede despre tine acea fată? Ce ar spune și ce ar gândi cei care au încercat toată viața să te țină jos?',
      'Gândul ăsta nu e doar motivație. E motorul tău suprem atunci când corpul spune că nu mai poate. Te duce mai departe când alții renunță.',
      { hl: 'Fitnessul mental e arma ta. Controlează-l. Stăpânește-l. Fă-l cel mai mare avantaj al tău.' },
      'Drumul spre dominație începe în minte. Fii arhitectul realității tale.',
    ],
  },
  {
    id: 'ready', num: 'III', title: 'Trebuie să fii în formă și gata de luptă',
    body: [
      'Uită-te în jur: trăim într-o lume în care media e norma. Dar tu nu ești aici ca să fii mediocru.',
      'Fitnessul, artele marțiale și nutriția sunt pilonii succesului tău. Nu e vorba doar de un corp arătos, ci de forță, rezistență și capacitatea de a cuceri orice provocare, în orice domeniu al vieții.',
      'Fitnessul îți dă fundația, artele marțiale îți ascut mintea și reflexele, iar nutriția îți dă combustibilul. Împreună te fac de neoprit. (Nutriția nu face parte din aplicația asta.)',
      { hl: 'Uită de mediocritate, e sortită eșecului. Ești aici ca să atingi măreția.' },
      'Nu mai e o opțiune să nu fii în formă și să nu știi să lupți. Lumea e o competiție dură și neiertătoare: dacă nu devii mai bun, vei fi mâncat de viu.',
      'Există oameni care muncesc fără oprire în fiecare zi ca să devină mai buni, mai puternici, mai periculoși. Cum poți accepta să nu progresezi și să depinzi de alții, zi de zi, în fiecare domeniu al vieții?',
    ],
  },
  {
    id: 'fundamentals', num: 'IV', title: 'Bazele fitnessului', tool: 'principles',
    body: [
      'Să vorbim pe față: succesul în fitness nu vine din compromisuri leneșe. E vorba de duritate, determinare și voința de a împinge când ceilalți au renunțat de mult.',
      'De la principiile de antrenament la alegerea exercițiilor și planificarea sesiunilor: aici înveți nu doar să te miști, ci să progresezi cu adevărat. Și află că nimeni nu te va menaja când te minți singur.',
      'E timpul să ieși din zona de confort.',
    ],
  },
  {
    id: 'plan', num: 'IV', title: 'Planul exact', tool: 'plan',
    body: [
      { hl: 'Planul de antrenament care l-a dus pe Alex nu doar la performanța fizică maximă, ci și la o minte și un caracter de nerecunoscut.' },
      'Îl găsești în aplicație, zi cu zi, cu timere și cu tot ce faci notat automat.',
    ],
  },
  {
    id: 'fight', num: 'V', title: 'De ce trebuie să fii gata de luptă',
    body: [
      'Artele marțiale nu sunt o simplă opțiune. Sunt o parte necesară din viața oricărui bărbat.',
      {
        steps: [
          ['Originea masculinității', 'De la începuturile omenirii, bărbații au luptat ca să supraviețuiască, nu pentru glorie sau trofee. E în genele noastre. Omul modern nu se mai bate cu tigri, ci cu propriii demoni, cu provocările și cu competiția. Lupta e felul în care îți eliberezi războinicul interior.'],
          ['Caracter prin duritate', 'Viața te va testa ca să te rupă dacă nu ești pregătit. În artele marțiale înveți să înduri când doare, când ești obosit, când crezi că nu mai poți. Asta te face războinic, în ring și în viață.'],
          ['O încredere pe care o simți', 'Există încrederea pe care o porți la vedere și încrederea pe care o simți. În ring capeți un calm interior pe care nicio haină sau ceas scump nu ți-l poate da. Știi că poți lupta când contează, și asta se vede.'],
          ['Corp și minte în alianță', 'Corpul tău nu e un trofeu prăfuit, e o armă pe care trebuie să o ascuți. Lupta unește forța fizică cu claritatea mentală: devii nu doar în formă, ci invincibil mental.'],
          ['Să te protejezi pe tine și pe ceilalți', 'Pericolele pot apărea oriunde, pe stradă sau în afaceri. E datoria ta să te protejezi pe tine și pe cei dragi. Artele marțiale îți dau abilitatea să rămâi ferm și să acționezi când contează.'],
          ['Un bărbat acționează', 'Un bărbat nu e pasager, e căpitanul vieții lui. Artele marțiale te învață să vezi oportunitățile și să le prinzi. În ring nu e timp de ezitare: acționezi. Același principiu se aplică în viață.'],
        ],
      },
      { hl: 'Să poți lupta nu e o opțiune. E datoria ta.' },
      'Pregătește-te să intri în ringul vieții și să arăți lumii că ești un războinic.',
    ],
  },
  {
    id: 'recovery', num: 'VII', title: 'Nu uita de recuperare', tool: 'recovery',
    body: [
      'Ai mentalitatea potrivită și ai un plan de antrenament de top. Ce lipsește? Recuperarea. Fără ea vei progresa foarte încet.',
      {
        steps: [
          ['Dormi ca un rege', 'Somnul nu e o slăbiciune, e arma ta secretă. Numărul exact de ore diferă de la om la om, dar niciodată sub 7 ore pe noapte.'],
          ['Recuperare la rece', 'Băile de gheață nu sunt un moft. Sunt o forjă pentru corpuri puternice, un sistem imunitar robust și o minte ascuțită.'],
          ['Stretching și mobilitate', 'Flexibilitatea nu strică niciodată, mai ales în artele marțiale, unde e esențială. Stretchingul regulat ajută și recuperarea.'],
          ['Masajul, grija campionilor', 'Nu e obligatoriu, dar ajută. Lasă-ți mușchii să fie frământați și relaxează-te ca un rege, cu condiția să-l fi meritat.'],
          ['Meditație și mindfulness', 'Mintea e la fel de importantă. Meditația înseamnă control asupra minții. Găsește momente de liniște, vizualizează victoriile, fii stăpânul universului tău.'],
        ],
      },
    ],
  },
  {
    id: 'end', num: 'VIII', title: 'Concluzie și ce urmează',
    body: [
      'Dacă ai citit tot și ești acum aici, ești deja înaintea a 90% dintre cei care au primit cartea. Greu de crezut, dar adevărat: cei mai mulți nu reușesc să citească nici 20 de pagini care le-ar putea schimba viața.',
      'Tu ești diferit. Ai ajuns până aici. Acum depinde de tine: ești gata să aplici ce ai învățat?',
      'Doar tu decizi cum va arăta viața ta de acum înainte. Devii, în sfârșit, omul care ți-ai dorit mereu să fii? Sau continui să te uiți la alții cum își stăpânesc viața?',
      'Dacă acum te simți motivat, foarte bine: folosește motivația ca iască și eliberează-ți bestia interioară. Dar nu uita:',
      { hl: 'Motivația te trădează. E timpul să ataci!' },
    ],
  },
];

export const PRINCIPLES = [
  { title: 'Intensitate peste durată', text: 'Antrenamentele intense sunt mai eficiente decât orele întregi de antrenament.' },
  { title: 'Variația e cheia', text: 'Eviți plictiseala schimbând regulat exercițiile.' },
  { title: 'Progresia e obligatorie', text: 'Te îmbunătățești la fiecare antrenament: prin greutate, repetări sau dificultate.' },
];

export const FORMULA = ['Gânduri', 'Convingeri', 'Acțiuni', 'Schimbări', 'Imaginea de sine'];

export const HABIT_STEPS: Array<[number, string]> = [
  [7, 'Observi cât de ușor e.'],
  [14, 'Nu te mai gândești la el, doar îl faci.'],
  [21, 'Ai un obicei și îți va fi greu să nu-l faci.'],
  [28, 'Rutina e solidă: poți adăuga ceva nou.'],
];
