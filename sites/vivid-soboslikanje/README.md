# Vivid soboslikanje · rekonstrukcija web stranice

Neslužbena rekonstrukcija stranice [soboslikanjevivid.hr](https://www.soboslikanjevivid.hr/) (Forever Green d.o.o., Zagreb). Sadržaj, kontakti, logotip, referenca i fotografije radova preuzeti su s izvorne stranice. Unsplash fotografije (besplatna licenca) koriste se samo za atmosferu u heroju i sekciji predaha, ne u galeriji radova.

## Smjer

Skandinavski minimalizam: topla bijela (`#f5f3ee`), lan (`#ebe7df`), tinta (`#1b2230`) i tamnoplava iz logotipa (`#003060`) kao jedini naglasak. Fontovi Familjen Grotesk (naslovi) i Hanken Grotesk (tekst).

## Sekcije

1. **Hero**: naslov izlazi iz maske, a tamnoplavi „valjak” prelazi preko fotografije i nanosi je (clip-path + transform, isti easing).
2. **O nama**: tekst s izvorne stranice i tri prednosti.
3. **Usluge**: strojno/ručno soboslikanje, gletanje, knauf i dekorativne tehnike; fotografija se mijenja s odabranom uslugom.
4. **Proces**: četiri koraka od poziva do čistog prostora.
5. **Galerija radova**: 17 stvarnih fotografija, filter (View Transitions) i lightbox (tipkovnica, prevlačenje).
6. **Tim**: obiteljska fotografija tima, uloge i recenzija s Trebam.hr.
7. **Ponuda**: obrazac s provjerom polja koji priprema e-poruku za info@soboslikanjevivid.hr; kontakti i društvene mreže.

Animacije pri skrolanju okidaju se jednom. Poštuje se `prefers-reduced-motion` (ostaju samo blagi prijelazi prozirnosti), a bez JavaScripta sav sadržaj je vidljiv.

## Tehnologija

Statični HTML, CSS i JS bez build koraka. Lenis 1.1.13 s CDN-a za glatko skrolanje (stranica radi i bez njega).
