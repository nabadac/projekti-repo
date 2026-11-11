# Stolarija Vidović · redizajn (v2)

Redizajn stranice `stolarija-vidovic.html` iz repozitorija `nabadac/Webstranice-Vi-e-industrija`, po uzoru na zadani referentni dizajn: fotografski hero s pločicama detalja, bento usluga, niz tamnih kartica, panel s izjavom, slider recenzija, CTA preko fotografije i tamni footer s velikim natpisom.

Priča, tekstovi recenzija, kontakti, SV žig i forma preuzeti su iz originala. Nove su samo kratke opisne rečenice uz usluge.

## Smjer

- **Podloga**: topla neutralna, off-white `#F5F2EC`, krem `#ECE5D8` i ugljen `#1F1C19`. Tako orah, hrast i javor na fotografijama dolaze do izražaja.
- **Naglasci**: hrast `#C8A06A` i javor `#E8CB95`.
- **Fontovi**: naslovi u **Fraunces**, tekst u **Bricolage Grotesque** (iz originalnog branda). Oba podržavaju č ć đ š ž.
- **Ponuda je uvijek blizu**:
  - gumb u headeru
  - gumb na svakoj usluzi, koji u formi unaprijed odabere vrstu projekta
  - kartica na kraju niza vrijednosti
  - plutajući gumb „Zatražite ponudu” koji je stalno vidljiv i skriva se tek kod forme
  - pločica u footeru

## Sekcije i animacije

1. **Header**: logo, navigacija u „pilulici” s označenom aktivnom sekcijom, tamni gumb za ponudu. Pri skrolanju dobiva svijetlu podlogu, a skriva se kad se skrola prema dolje.
2. **Hero**: fotografija preko cijelog ekrana koja se pri ulasku smanjuje i ima parallax. Retci naslova izlaze iz maske. Četiri pločice (radionica, utor i čep, ručna obrada, drvo) mijenjaju pozadinu klikom ili same svakih 6 s, s trakom napretka.
3. **Naša priča**: tekst, oznake „Gdje radimo”, glavna fotografija i makro detalj koji pluta, žig koji se vrti, pločice s brojkama koje se odbrojavaju.
4. **Usluge (bento)**: pet usluga (kuhinje, ormari, namještaj, stepenice i interijeri, poslovni prostor) sa staklenim karticama, primjerom projekta i gumbom za ponudu. Kartice se otkrivaju, a fotografije imaju parallax.
5. **Vrijednosti**: četiri tamne kartice s makro fotografijama i kartica za ponudu. Na desktopu se niz pomiče vodoravno dok se skrola (pin), a na mobitelu se lista prstom.
6. **Traka usluga**: marquee koji ubrzava prema brzini skrola.
7. **Izjava**: fotografija i topli panel u kojem se riječi „Ne radimo brzo. Radimo dobro…” pale skrolanjem.
8. **Kako radimo**: fotografija i četiri koraka koji se redom ističu dok se skrola.
9. **Recenzije**: slider sa strelicama.
10. **Prostori**: mreža fotografija cijelih prostora i radionice s otkrivanjem.
11. **Upit**: tamni blok preko fotografije, kontakti i forma s plutajućim oznakama i izborom vrste projekta. Netlify Forms je ostao kao u originalu.
12. **Footer**: tamni, s pločicom za ponudu i beskonačnim natpisom „Vidović®”.

Poštuje se `prefers-reduced-motion`. Bez GSAP-a sav je sadržaj odmah vidljiv, a pločice heroja, slider i forma rade i dalje.

## Fotografije (Pexels, besplatna licenca)

Sve su preuzete i pregledane. Pravi makro lastinog repa na Pexelsu nismo našli. Unsplash pretraga traži provjeru da posjetitelj nije bot, pa iz nje nije uzeta nijedna fotografija. Za objavu je najbolje snimiti prave radove i spojeve stolarije.

| Mjesto | Pexels |
|---|---|
| Hero / pozadina upita | [Hand Carved Decorative Wooden Panels in Workshop](https://www.pexels.com/photo/hand-carved-decorative-wooden-panels-in-workshop-19208266/) |
| Utor i čep (makro) | [Focused artisan making hole on plank with hammer and chisel](https://www.pexels.com/photo/focused-artisan-making-hole-on-plank-with-hammer-and-chisel-5974283/) |
| Ručna završna obrada (makro) | [Professional artisan varnishing wooden detail in workshop](https://www.pexels.com/photo/professional-artisan-varnishing-wooden-detail-in-workshop-5974350/) |
| Struktura drva (makro) | [Macro Shot of Wooden Planks](https://www.pexels.com/photo/macro-shot-of-wooden-planks-326333/) |
| Dlijeto i strugotine (makro) | [Carpenter hammering nail in workshop](https://www.pexels.com/photo/carpenter-hammering-nail-in-workshop-5974343/) |
| Ručni alati (makro) | [Carpentry with professionals tools on table](https://www.pexels.com/photo/carpentry-with-professionals-tools-on-table-5711901/) |
| Naša priča | [Carpenter Working on a Piece of Wood](https://www.pexels.com/photo/carpenter-working-on-a-piece-of-wood-6790977/) |
| Kuhinje | [Wooden Design Cabinet Kitchen](https://www.pexels.com/photo/wooden-design-cabinet-kitchen-3847520/) |
| Ormari | [Photo of Walk in Closet](https://www.pexels.com/photo/photo-of-walk-in-closet-6670657/) |
| Namještaj | [Cozy Dining Room with Wooden Furniture](https://www.pexels.com/photo/cozy-dining-room-with-wooden-furniture-and-natural-light-37184165/) |
| Stepenice | [Brown Wooden Staircase With Glass Railing](https://www.pexels.com/photo/brown-wooden-staircase-with-glass-railing-8134804/) |
| Poslovni prostor | [Warm Cozy Reception Area with Wooden Decor](https://www.pexels.com/photo/warm-cozy-reception-area-with-wooden-decor-31771715/) |
| Izjava | [A Person using a Wood Planer](https://www.pexels.com/photo/a-person-using-a-wood-planer-7109995/) |
| Kako radimo | [Man Hold Wood Planer](https://www.pexels.com/photo/man-hold-wood-planer-374861/) |
| Prostori | [Modern interior of comfortable living room](https://www.pexels.com/photo/modern-interior-of-comfortable-living-room-6180674/), [Modern Kitchen with Classic Furniture](https://www.pexels.com/photo/modern-kitchen-with-classic-furniture-12119223/), [Books on Shelves in a Living Room](https://www.pexels.com/photo/books-on-shelves-in-a-living-room-18657158/) |

## Što još treba zamijeniti

- Fotografije pravim radovima stolarije.
- Kontakti: telefon `091 234 5678`, adresa `Bobovica 00` i OIB `00000000000` preuzeti su iz originala i još su ogledni.

## Tehnologija

Statični HTML, CSS i JS. GSAP 3.12.5 + ScrollTrigger (cdnjs) i Lenis 1.1.20 (unpkg).
