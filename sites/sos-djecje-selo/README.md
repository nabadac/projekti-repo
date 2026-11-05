# SOS Dječje selo Hrvatska · koncept web stranice

Koncept dizajna za SOS Dječje selo Hrvatska (sela u Lekeniku i Ladimirevcima). Struktura sekcija prati referentni dizajn humanitarne organizacije (tamnozelena + topla podloga, velike zaobljene fotografije, kampanjske kartice, val fotografija, donacijski obrazac, FAQ, tri panela "uključi se"), a sadržaj, tipografija, animacije i detalji izrađeni su iznova.

## Brand (koncept)

| | |
|---|---|
| Boje | bor `#123a2c`, tamni bor `#0b261d`, mahovina `#2f5d47`, papir `#f6f2e9`, suncokret `#f3b63f` (samo za akcije, aluzija na Slavoniju) |
| Fontovi | Fraunces (naslovi), Figtree (tekst), Google Fonts s podrškom za č ć đ š ž |
| Znak | kućica sa srcem (privremeni znak, zamijeniti službenim logotipom) |
| Fotografije | Pexels i Unsplash (besplatne licence), lokalno u `assets/img/` |

## Sekcije i animacije

1. **Zaglavlje**: prozirno nad herojem, postaje "staklo" nakon heroja, skriva se pri skrolanju prema dolje. Mobilni izbornik.
2. **Hero**: naslov izlazi iz maske red po red, riječ *dom* dobiva ručno iscrtanu crtu, fotografija se lagano odzumira, plutajuća kartica sela.
3. **Uvod**: rečenica se "puni" riječ po riječ dok skrolate, parallax kolaž, brojači (170 djece, 31 obitelj, 130+ zemalja).
4. **Četiri načela** (SOS mama, braća i sestre, SOS kuća, SOS selo): prikvačene kartice koje se slažu jedna na drugu, trake se pune.
5. **Naša sela**: tabovi Lekenik / Ladimirevci s klizačem, izmjena sadržaja i fotografije, vremenska crta 1949. / 1993. / 1997.
6. **Programi**: obiteljska skrb, jačanje obitelji, podrška mladima.
7. **Priče**: carousel u kojem se aktivna fotografija širi, citat se izmjenjuje (autoplay, pauza na hover).
8. **Val galerija**: dvije trake fotografija plove po sinusoidi u suprotnim smjerovima i ubrzavaju sa skrolanjem.
9. **Donacija**: parallax pozadina, odabir iznosa s opisom učinka, mjesečno / jednokratno (demo, ništa se ne šalje).
10. **FAQ**: harmonika, otvoreno jedno pitanje.
11. **Uključi se**: tri panela koji se šire na hover.
12. **Podnožje**: newsletter, sela, kontakt, beskonačna traka fotografija.

Magnetski gumbi, pulsirajuće srce i točke, `prefers-reduced-motion` je poštovan. Bez GSAP-a stranica i dalje radi.

## Prije objave provjeriti

- Brojke: 170 djece u 31 SOS obitelji odnose se na 2018. godinu; Lekenik 1993., Ladimirevci izgrađeni 1995. i u radu od 1997., 15 kuća u Lekeniku. Provjeriti s udrugom i ažurirati.
- Citati u sekciji Priče i iznosi/učinci donacija su **ogledni tekstovi** i trebaju ih zamijeniti stvarni (uz suglasnost).
- Kontakt, IBAN i linkovi društvenih mreža su rezervirana mjesta u uglatim zagradama.
- Fotografije su stock fotografije, a ne djeca iz sela.

## Tehnologija

Statični HTML, CSS i JS. GSAP 3.13 + ScrollTrigger i Lenis 1.1 s CDN-a.
