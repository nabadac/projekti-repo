# Fuga — atelier keramike · koncept web stranice

Konceptualni dizajn stranice za **izmišljeni** premium keramičarski atelier koji radi od obale do Zagreba (Dubrovnik, Split, otoci, Šibenik, Zadar, Kvarner, Zagreb).
Struktura i ritam sekcija inspirirani su uredničkim, „luxury” pristupom stranice spykercars.com (velike fotografije, numerirana poglavlja, horizontalni slider, newsletter/upit preko fotografije). Brand, tekstovi, boje, tipografija i sadržaj izrađeni su iznova.

## Brand

| | |
|---|---|
| Naziv | **Fuga** (fuga je spoj među pločicama, detalj po kojem se prepoznaje majstor) |
| Boje | ugljen `#0f0e0c`, kost `#ece6dc`, papir `#f1ece4`, pijesak `#d9c7a7`, bronca `#a8865a`, kamen `#9b9284` |
| Fontovi | Bodoni Moda (naslovi), Manrope (tekst), Google Fonts s podrškom za č ć đ š ž |
| Fotografije | Unsplash (besplatna licenca) |

## Sekcije

1. **Zaglavlje**: prozirno nad herojem, dobiva pozadinu pri skrolanju i skriva se pri skrolanju prema dolje. Na mobitelu je izbornik preko cijelog zaslona.
2. **Hero**: fotografija preko cijelog zaslona, naslov koji izlazi iz maske, koordinate obale i Zagreba.
3. **Izrada**: tri uredničke cjeline (podloga, veliki formati, fuga) s parallax fotografijama i tehničkim podacima.
4. **Poglavlje I**: prikvačena sekcija u kojoj se okvir fotografije širi do punog ekrana, zatim brojači.
5. **Traka projekata**: beskonačni marquee s realizacijama, koji pauzira kad je miš iznad njega.
6. **Od obale do Zagreba**: apstraktna karta ruta koja se iscrtava skrolanjem, sinkronizirana s popisom gradova.
7. **Materijali**: horizontalni slider (povlačenje mišem, strelice, tipkovnica) s okvirnim cijenama ugradnje.
8. **Od upita do ključa**: postupak u četiri koraka.
9. **Dnevnik radilišta**: kartice projekata.
10. **Upit**: obrazac preko fotografije (demo, ništa se ne šalje).
11. **Podnožje**: studiji Zagreb i Split, kontakti, društvene mreže, veliki obrisni logotip.

Poštuje se `prefers-reduced-motion`. Bez GSAP-a stranica i dalje radi, samo bez animacija.

## Tehnologija

Statični HTML, CSS i JS. GSAP 3.13 + ScrollTrigger i Lenis 1.1 učitavaju se s CDN-a.
