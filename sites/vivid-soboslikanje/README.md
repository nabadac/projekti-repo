# Vivid soboslikanje · rekonstrukcija web stranice

Neslužbena rekonstrukcija stranice [soboslikanjevivid.hr](https://www.soboslikanjevivid.hr/) (Forever Green d.o.o., Zagreb). Sadržaj, kontakti, logotip, referenca i fotografije radova preuzeti su s izvorne stranice. Unsplash fotografija (besplatna licenca) koristi se samo kao ilustracija stana, nikad u galeriji radova.

## Smjer: traka i folija

Stranica je pripremljeno radilište. Sadržaj čeka ispod mliječne zaštitne folije koju drži plava maskirna traka. Traka se odlijepi, folija spadne i ostane gotov zid. Time se pokazuje da firma radi uredno, umjesto da se to samo tvrdi.

| | |
|---|---|
| Boje | zid `#f6f6f3`, tamnoplava iz logotipa `#003060` (cijele sekcije), duboka plava `#00223f`, plava traka `#6fa8e2`, tinta `#0d1b2e` |
| Fontovi | Archivo (široki rez 125 % za naslove, kao "VIVID" i natpis na radnim majicama), Kalam (natpisi markerom na traci) |
| Materijali | tekstura valjka (SVG šum), folija (backdrop-filter + nabori), traka s nazubljenim rubovima (SVG maska), fotografije zalijepljene trakom |

## Sekcije

1. **Hero**: "Zid gotov. Pod čist.", poziv i ponuda; fotografija s radilišta je pod folijom, a traka se odlijepi i folija spadne.
2. **Traka** preko cijele širine s uslugama.
3. **O nama** i tri prednosti.
4. **Što radimo** na tamnoplavom zidu, uz fotografije zalijepljene trakom.
5. **Dom ili dućan**: dvije vrste klijenata, svaka s fotografijom pod folijom koja se skida pri skrolanju.
6. **S naših radilišta**: 16 stvarnih fotografija zalijepljenih na zid, filter (View Transitions) i lightbox.
7. **Kako radimo** u četiri koraka na trakama.
8. **Tim**: fotografija ekipe, uloge i recenzija s Trebam.hr.
9. **Upit za ponudu**: list zalijepljen na tamnoplavi zid; obrazac priprema e-poruku za info@soboslikanjevivid.hr.

Poštuje se `prefers-reduced-motion` (folija samo izblijedi, traka miruje). Bez JavaScripta sav sadržaj je vidljiv, bez folije.

## Tehnologija

Statični HTML, CSS i JS bez build koraka. Lenis 1.1.13 s CDN-a za glatko skrolanje (stranica radi i bez njega).
