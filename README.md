# Inner Beast

Aplicație personală (PWA) pentru programul „Unleash Your Inner Beast”: planul săptămânal din e-book, zi de zi, cu timere și tracking. Nutriția nu e inclusă.

- **Azi**: sesiunea zilei din plan, rutina de 28 de zile (50 Push-ups), somnul, de ce-ul tău.
- **Plan**: săptămâna ca în carte, cu ce ai bifat.
- **Lupte**: timere pe runde pentru Shadow Boxing, Heavy Bag, Jumping Rope, Wall Sit / Jumping Squats, cu combinațiile lui Alex Hanma strigate în timpul rundelor.
- **Minte**: Wim Hof, respirația 4-7-8, dușul alternativ, mobilitate, jurnalul victoriilor și capitolele cărții.
- **Progres**: săptămâna, totaluri, calistenie, alergări (GPS), retenții, somn, pași, istoric.

Datele stau doar pe telefon (localStorage); din Setări se poate descărca o copie.

## Dezvoltare

```sh
npm install
npm test        # logica: plan, timere, GPS, progresie
npm run build   # tsc + vite + service worker
npm run icons   # regenerează iconițele din geometria ghearelor
```

Publicată pe GitHub Pages la fiecare push pe `main`.

Surse: e-book-ul „Unleash Your Inner Beast” (Alex), TikTok [@alexhanma___](https://www.tiktok.com/@alexhanma___), Instagram [@alexhanma_](https://www.instagram.com/alexhanma_/), metoda Wim Hof. Fonturi: League Spartan și Montserrat (SIL OFL 1.1).
