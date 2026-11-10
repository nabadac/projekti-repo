# Stolarija Vidović · redizajn

Redizajn stranice `stolarija-vidovic.html` iz repozitorija `nabadac/Webstranice-Vi-e-industrija`.
**Priča, tekstovi i brand ostali su isti** (boje orah / papir / hrast / šumsko zelena, SV žig, kontakti, forma).

**Fontovi:** naslovi su u **Fraunces Bold (700)**, pisani velikim slovima. To je topli serif s mekim klinastim serifima koji podsjeća na stare drvene tiskarske slogove i žigove utisnute u drvo. Tekst, citati i kurziv su u **EB Garamondu**, pa je i „rukama” u naslovu u EB Garamond kurzivu. Bricolage Grotesque (naziv obrta) i Spline Sans Mono (male oznake) ostali su iz originala. Svi fontovi podržavaju č ć đ š ž.
Promijenjeni su raspored i kretanje, po uzoru na zadanu referencu: tamni pojas s velikim serifnim naslovom, široka fotografija preko ruba, izmjenični redovi „fotografija + kartica + tonirani blok”, tamni blok za upit preko fotografije i footer s pločicom u boji hrasta.

## Sekcije i animacije

1. **Loader**: SV žig se iscrta, zatim se zastor podigne.
2. **Header**: pojavi se odozgo, dobiva pozadinu pri skrolanju i skriva se kad se skrola prema dolje. Gumbi su „magnetski”.
3. **Hero**: retci naslova izlaze iz maske, fotografija se otkriva odozdo i ima parallax, žig se vrti sa skrolom.
4. **Brojke**: odbrojavanje 30+, 1200+, 4.
5. **Traka usluga**: beskonačni marquee koji ubrzava i mijenja smjer prema brzini skrola.
6. **Naša priča**: red s fotografijom i karticom, tonirani blok klizi, oznaka SV se iscrta, riječi naslova izlaze iz maske. Ispod su četiri vrijednosti.
7. **Radovi**: pet izmjeničnih redova (lijevo / desno). Gumb „Zatražite ponudu” na svakom radu unaprijed odabere vrstu projekta u formi.
8. **Kako radimo**: linija se iscrtava skrolom i pali korake redom (na mobitelu je okomita).
9. **Riječ klijenata**: kartice ulaze s 3D nagibom, zvjezdice se pale redom, a kartice se naginju prema mišu.
10. **Upit**: pozadinska fotografija ima parallax, polja forme imaju plutajuće oznake, a nakon slanja se iscrta kvačica. Netlify Forms ostao je kao u originalu.
11. **Footer**: pločica „Zatražite ponudu” i veliki natpis „Vidović” koji izlazi odozdo.
12. Traka napretka čitanja na vrhu i ljepljiva traka s gumbom za upit pri dnu ekrana.

Poštuje se `prefers-reduced-motion`. Ako se GSAP ne učita, sav sadržaj je odmah vidljiv bez animacija.

## Što još treba zamijeniti

- **Fotografije**: u kodu su Unsplash poveznice (označene s `ZAMIJENI`). Ako se neka fotografija ne učita, ostaje drvena tekstura iz originala. Za pravu objavu stavite fotografije radova same stolarije.
- **Kontakti**: telefon `091 234 5678`, adresa `Bobovica 00` i OIB `00000000000` preuzeti su iz originala i još su ogledni.

## Tehnologija

Statični HTML, CSS i JS. GSAP 3.12.5 + ScrollTrigger (cdnjs) i Lenis 1.1.20 (unpkg).
