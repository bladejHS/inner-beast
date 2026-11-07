# Inner Beast

Aplicație personală (PWA) pentru programul „Unleash Your Inner Beast”, refăcut pentru un atlet complet: forță, putere, viteză, rezistență, mobilitate și box. Zi de zi, cu timere și tracking. Nutriția nu e inclusă.

- **Azi**: misiunea zilei cu un singur buton de start, săptămâna, blocurile, rutina de 28 de zile, somnul, de ce-ul tău.
- **Plan**: săptămâna, ciclul de 4 săptămâni în care ești (A forță și bază aerobă, B putere și viteză, C capacitate; a 4-a ușoară, cu teste) și principiile cărții verificate.
- **Lupte**: timere pe runde, punch-out (14 × 3 s la maxim, 10 s ușor), combinațiile lui Alex Hanma strigate în timpul rundelor, loviturile de bază și tabul Alex.
- **Minte**: Breathwork Lab, Wim Hof, 4-7-8, dușul alternativ, mobilitate, Discipline Challenges, jurnalul victoriilor și capitolele cărții, cu notele „Ce spun studiile”.
- **Progres**: săptămâna, testele (CMJ, flotări, tracțiuni, 2,4 km și altele), provocările, boxul, calistenia, aerobul, somnul, pașii, istoricul.

Datele stau doar pe telefon (localStorage); din Setări se poate descărca o copie.

## Dezvoltare

```sh
npm install
npm test        # logica: plan, cicluri, timere, GPS, progresie
npm run build   # tsc + vite + service worker
npm run icons   # regenerează iconițele din geometria ghearelor
npm run photos  # fundalul de start, titlul și pozele zilelor, din PNG-urile de pe Desktop
```

Publicată pe GitHub Pages la fiecare push pe `main`.

Surse: e-book-ul „Unleash Your Inner Beast” (Alex), TikTok [@alexhanma___](https://www.tiktok.com/@alexhanma___), Instagram [@alexhanma_](https://www.instagram.com/alexhanma_/), metoda Wim Hof, iar pentru plan și design studiile din cercetarea din 7 noiembrie 2026. Font: Archivo, de Omnibus-Type (SIL OFL 1.1).
