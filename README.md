# Projekti

Zbirka demo web stranica. Svaka stranica je u svojoj mapi unutar `sites/`, s vlastitim `index.html` i svim potrebnim datotekama. Sve putanje su relativne, pa se svaka mapa može otvoriti ili objaviti zasebno.

| Stranica | Mapa | Opis |
|---|---|---|
| Poliklinika Lipa | [`sites/poliklinika-lipa/`](sites/poliklinika-lipa/) | Koncept landing stranice za izmišljenu privatnu polikliniku u Zagrebu: GSAP i Lenis animacije, prikvačeni tabovi, carousel, responzivno. |
| Fuga atelier | [`sites/fuga-atelier/`](sites/fuga-atelier/) | Koncept stranice za premium keramičara koji radi od obale do Zagreba: uredničke sekcije, pinned poglavlje, karta rute, slider materijala, upit. |
| SOS Dječje selo Hrvatska | [`sites/sos-djecje-selo/`](sites/sos-djecje-selo/) | Koncept stranice za neprofitnu udrugu sa selima u Lekeniku i Ladimirevcima: slaganje kartica četiriju načela, tabovi sela, carousel priča, galerija na valu, donacijski obrazac, GSAP i Lenis. |
| Zagrebačko dijabetičko društvo | [`sites/zdd-zagreb/`](sites/zdd-zagreb/) | Koncept redizajna zadi.hr po uzoru na zadani referentni dizajn: hero s fotografijom s Obiteljskog kampa, brojke u pločicama, bento pogodnosti članstva, tabovi pet klubova, carousel za članove, citati obitelji, novosti. Stvarni sadržaj i brand ZDD-a. |
| Autoservis Kovač | [`sites/autoservis-kovac/`](sites/autoservis-kovac/) | Novi dizajn za autoservis u Zagrebu po referentnom videu (svijetli editorial stil, tamnoplave sekcije, serifni naslovi), usmjeren na zakazivanje: brzi termin u heroju, rezervacija iz svake usluge i cjenika, obrazac u 3 koraka, mobilna traka Nazovi / Naruči. |
| Kolnik Logistika | [`sites/kolnik-logistika/`](sites/kolnik-logistika/) | Landing stranica za gradsku dostavu i međunarodnu špediciju iz Svete Nedelje (HR/SL/SR), s GSAP animacijama. |
| Autoservis Kovač (izvorni demo) | [`sites/autoservis-kovac-demo/`](sites/autoservis-kovac-demo/) | Prva verzija stranice autoservisa u Zagrebu: tamni industrijski stil, usluge, odabir marke, cjenik, obrazac za narudžbu, recenzije. |
| IRONGATE Gym | [`sites/irongate-gym/`](sites/irongate-gym/) | Demo stranica teretane u Zagrebu. |
| Villa Lunare | [`sites/villa-lunare-hvar/`](sites/villa-lunare-hvar/) | Demo stranica boutique hotela na Hvaru. |
| Atelier Noir | [`sites/atelier-noir-salon/`](sites/atelier-noir-salon/) | Demo stranica frizerskog salona u Zagrebu. |
| Stolarija Vidović | [`sites/stolarija-vidovic/`](sites/stolarija-vidovic/) | Obiteljska stolarija iz Samobora od 1994.: kuhinje, ormari i namještaj po mjeri, upit za ponudu. |
| Dentalna ordinacija Matić | [`sites/ordinacija-matic/`](sites/ordinacija-matic/) | Demo stranica stomatološke ordinacije u Zagrebu. |

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
- <http://localhost:8080/sites/autoservis-kovac/>
- <http://localhost:8080/sites/autoservis-kovac-demo/>
- <http://localhost:8080/sites/irongate-gym/>
- <http://localhost:8080/sites/villa-lunare-hvar/>
- <http://localhost:8080/sites/atelier-noir-salon/>
- <http://localhost:8080/sites/stolarija-vidovic/>
- <http://localhost:8080/sites/ordinacija-matic/>

## Izvorne grane

Stranice su izvorno nastale na granama `claude/gifted-wright-vmcn6z` (Poliklinika Lipa) i `claude/charming-johnson-uecznx` (Kolnik Logistika).

Stranice `autoservis-kovac-demo`, `irongate-gym`, `villa-lunare-hvar`, `atelier-noir-salon`, `stolarija-vidovic` i `ordinacija-matic` prenesene su iz repozitorija `nabadac/Webstranice-Vi-e-industrija` (commit `14fe46f`), bez izmjena sadržaja.
