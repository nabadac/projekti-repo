# Projekti

Zbirka demo web stranica. Svaka stranica je u svojoj mapi unutar `sites/`, s vlastitim `index.html` i svim potrebnim datotekama. Sve putanje su relativne, pa se svaka mapa može otvoriti ili objaviti zasebno.

| Stranica | Mapa | Opis |
|---|---|---|
| Poliklinika Lipa | [`sites/poliklinika-lipa/`](sites/poliklinika-lipa/) | Koncept landing stranice za izmišljenu privatnu polikliniku u Zagrebu: GSAP i Lenis animacije, prikvačeni tabovi, carousel, responzivno. |
| Kolnik Logistika | [`sites/kolnik-logistika/`](sites/kolnik-logistika/) | Landing stranica za gradsku dostavu i međunarodnu špediciju iz Svete Nedelje (HR/SL/SR), s GSAP animacijama. |

## Lokalni pregled

U rootu repozitorija pokrenite:

```bash
python3 -m http.server 8080
```

i otvorite:

- <http://localhost:8080/sites/poliklinika-lipa/>
- <http://localhost:8080/sites/kolnik-logistika/>

## Izvorne grane

Stranice su izvorno nastale na granama `claude/gifted-wright-vmcn6z` (Poliklinika Lipa) i `claude/charming-johnson-uecznx` (Kolnik Logistika).
