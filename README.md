# Projekti

Zbirka demo web stranica. Svaka stranica je u svojoj mapi unutar `sites/`, s vlastitim `index.html` i svim potrebnim datotekama. Sve putanje su relativne, pa se svaka mapa može otvoriti ili objaviti zasebno.

| Stranica | Mapa | Opis |
|---|---|---|
| Poliklinika Lipa | [`sites/poliklinika-lipa/`](sites/poliklinika-lipa/) | Koncept landing stranice za izmišljenu privatnu polikliniku u Zagrebu: GSAP i Lenis animacije, prikvačeni tabovi, carousel, responzivno. |
| Fuga atelier | [`sites/fuga-atelier/`](sites/fuga-atelier/) | Koncept stranice za premium keramičara koji radi od obale do Zagreba: uredničke sekcije, pinned poglavlje, karta rute, slider materijala, upit. |
| SOS Dječje selo Hrvatska | [`sites/sos-djecje-selo/`](sites/sos-djecje-selo/) | Koncept stranice za neprofitnu udrugu sa selima u Lekeniku i Ladimirevcima: slaganje kartica četiriju načela, tabovi sela, carousel priča, galerija na valu, donacijski obrazac, GSAP i Lenis. |
| Zagrebačko dijabetičko društvo | [`sites/zdd-zagreb/`](sites/zdd-zagreb/) | Koncept redizajna zadi.hr po uzoru na zadani referentni dizajn: hero s fotografijom s Obiteljskog kampa, brojke u pločicama, bento pogodnosti članstva, tabovi pet klubova, carousel za članove, citati obitelji, novosti. Stvarni sadržaj i brand ZDD-a. |
| Kolnik Logistika | [`sites/kolnik-logistika/`](sites/kolnik-logistika/) | Landing stranica za gradsku dostavu i međunarodnu špediciju iz Svete Nedelje (HR/SL/SR), s GSAP animacijama. |
| Stolarija Vidović | [`sites/stolarija-vidovic/`](sites/stolarija-vidovic/) | Redizajn stranice obiteljske stolarije iz Samobora: ista priča i brand, novi raspored s izmjeničnim redovima fotografija i kartica, loader sa žigom, marquee usluga, linija procesa koja se iscrtava skrolom, GSAP i Lenis. |

## Lokalni pregled

U rootu repozitorija pokrenite:

```bash
python3 -m http.server 8080
```

i otvorite:

- <http://localhost:8080/sites/poliklinika-lipa/>
- <http://localhost:8080/sites/kolnik-logistika/>
- <http://localhost:8080/sites/fuga-atelier/>
- <http://localhost:8080/sites/sos-djecje-selo/>
- <http://localhost:8080/sites/zdd-zagreb/>
- <http://localhost:8080/sites/stolarija-vidovic/>

## Izvorne grane

Stranice su izvorno nastale na granama `claude/gifted-wright-vmcn6z` (Poliklinika Lipa) i `claude/charming-johnson-uecznx` (Kolnik Logistika).
