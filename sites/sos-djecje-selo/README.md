# SOS Dječje selo Hrvatska · koncept web stranice

Koncept dizajna za SOS Dječje selo Hrvatska (sela u Lekeniku i Ladimirevcima). Struktura sekcija prati referentni dizajn humanitarne organizacije (tamnozelena + topla podloga, velike zaobljene fotografije, kampanjske kartice, val fotografija, donacijski obrazac, FAQ, tri panela "uključi se"), a sadržaj, tipografija, animacije i detalji izrađeni su iznova.

Dvije stranice:

- `index.html` – početna
- `tvrtke.html` – **Tvrtke prijatelji** (B2B: porezne olakšice, kalkulator, modeli suradnje, upit)

## Brand (koncept)

| | |
|---|---|
| Boje | bor `#123a2c`, tamni bor `#0b261d`, mahovina `#2f5d47`, papir `#f6f2e9`, suncokret `#f3b63f` (samo za akcije, aluzija na Slavoniju) |
| Grafikon | `#1c7a52`, `#e0a52e`, `#b8603f` (provjereno za daltonizam; žuta uvijek uz vidljivu oznaku i legendu) |
| Fontovi | Fraunces (naslovi), Figtree (tekst), Google Fonts s podrškom za č ć đ š ž |
| Znak | kućica sa srcem (privremeni znak, zamijeniti službenim logotipom) |
| Fotografije | Pexels i Unsplash (besplatne licence), lokalno u `assets/img/` |

## Početna: sekcije i animacije

1. **Zaglavlje**: prozirno nad herojem, postaje "staklo" nakon heroja, skriva se pri skrolanju prema dolje. Mobilni izbornik.
2. **Hero**: naslov izlazi iz maske red po red, riječ *dom* dobiva ručno iscrtanu crtu, fotografija se lagano odzumira, plutajuća kartica sela.
3. **Uvod**: rečenica se "puni" riječ po riječ dok skrolate, parallax kolaž, brojači (170 djece, 31 obitelj, 130+ zemalja).
4. **Četiri načela** (SOS mama, braća i sestre, SOS kuća, SOS selo): prikvačene kartice koje se slažu jedna na drugu, trake se pune.
5. **Naša sela**: tabovi Lekenik / Ladimirevci s klizačem, vremenska crta 1949. / 1993. / 1997.
6. **Programi**: obiteljska skrb, jačanje obitelji, podrška mladima.
7. **Priče o uspjehu**: četiri mlade osobe koje su odrasle u SOS selu (fakultet, obrt, posao, mentor). Tabovi s fotografijama, citat, životni put po godinama koji završava ciljem („Danas: …”).
8. **Val galerija**: dvije trake fotografija plove po sinusoidi i ubrzavaju sa skrolanjem.
9. **Donacija – materijalizacija i widget**:
   - lista „što kupuje”: 10 € školski pribor i knjige · 25 € topli obroci i sport · 50 € psihološka podrška i instrukcije; odabrani iznos istakne odgovarajuću stavku
   - **Mjesečno** je zadani odabir (oznaka „preporučeno”), uz Jednokratno
   - gumbi 10 € / 25 € / 50 € + **Drugi iznos** (polje za unos, minimalno 2 €)
   - rečenica učinka uživo: „Vaših 35 € mjesečno osigurava …”, godišnji iznos i dio koji ide izravno djeci
   - načini plaćanja: kartica, **Apple Pay / Google Pay**, **KEKS Pay**, **2D barkod (HUB3)** koji se generira na ekranu i skenira m-bankingom
10. **Financijska transparentnost**: segmentirani grafikon raspodjele (88 % djeci, 8 % programi, 4 % administracija) s tooltipom i legendom, preračun „Od vaših X €: …” povezan s widgetom, linkovi na revidirana godišnja izvješća i Registar neprofitnih organizacija.
11. **FAQ**, **Uključi se** (panel „Tvrtke prijatelji” vodi na podstranicu), **podnožje**.

## Tvrtke prijatelji (`tvrtke.html`)

1. **Hero** s porukom o porezno priznatoj donaciji do 2 % prihoda.
2. **Porezna olakšica**: sažetak čl. 7. Zakona o porezu na dobit (darovanja do 2 % prihoda prethodne godine), uvjeti, napomena da nije porezni savjet, kartice 2 % / 10 % / 18 %.
3. **Kalkulator**: prihod prethodne godine + planirana donacija (polje i klizač) → gornja granica, stopa poreza na dobit (10 % do 1 mil. €, 18 % iznad), porezna ušteda, stvarni trošak, traka trošak/ušteda, upozorenje iznad 2 %, materijalizacija („školski pribor za N djece”).
4. **Modeli suradnje**: jednokratna donacija, Tvrtka prijatelj (godišnje), strateški partner.
5. **Više od novca**: donacije u naravi, volonterski dani, prakse i mentorstvo, donacije zaposlenika.
6. **Postupak** u 4 koraka, **obrazac za upit** (demo), **pitanja tvrtki**.

## HUB3 2D barkod

Generira se u pregledniku knjižnicom bwip-js (PDF417, 9 stupaca, razina ispravka 4, ISO-8859-2), učitava se tek kad korisnik odabere barkod. Podaci su u objektu `CFG` na vrhu `assets/js/main.js`. Barkod je provjeren dekodiranjem (zxing): ispravno čita iznos, IBAN, model, poziv na broj, šifru namjene `CHAR` i opis s dijakriticima.

**Prije objave obavezno:** u `CFG` upisati pravi IBAN (sada je postavljen **ogledni IBAN** iz HUB3 primjera), adresu primatelja i po želji pravilo za poziv na broj.

## Prije objave provjeriti

- Brojke: 170 djece u 31 SOS obitelji odnose se na 2018. godinu; Lekenik 1993., Ladimirevci izgrađeni 1995. i u radu od 1997., 15 kuća u Lekeniku.
- **Raspodjela 88 / 8 / 4 % je primjer iz briefa.** Zamijeniti brojkama iz revidiranog izvješća (`CFG.split` u JS-u i tekst u sekciji Transparentnost). Linkovi na izvješća su `#`.
- **Priče o uspjehu su ogledne** (imena, godine, citati, stock fotografije). Zamijeniti stvarnim pričama uz pisanu suglasnost.
- Iznosi i opisi u modelima suradnje za tvrtke su prijedlog.
- Porezni sažetak je informativan; potvrditi s računovođom udruge.
- Plaćanje karticom, Apple/Google Pay i KEKS Pay su UI demo: za stvarni rad treba payment gateway (npr. CorvusPay, WSPay, Monri) i KEKS Pay ugovor. Boja KEKS gumba je privremena; uskladiti s pravilima brenda.
- Kontakt, IBAN i linkovi društvenih mreža su rezervirana mjesta u uglatim zagradama.
- Fotografije su stock fotografije, a ne djeca iz sela.

## Tehnologija

Statični HTML, CSS i JS. GSAP 3.13 + ScrollTrigger i Lenis 1.1 s CDN-a, bwip-js 4.5.1 (lijeno učitavanje) za HUB3 barkod.
