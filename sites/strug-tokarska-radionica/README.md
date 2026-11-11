# STRUG — tokarska radionica · koncept web stranice

Koncept stranice za **izmišljenu** tokarsku radionicu (CNC tokarenje, kružno brušenje, glodanje, navoji).
Raspored i ritam sekcija prate zadani referentni dizajn (sirovi, „neuljepšani” industrijski izgled: papirna podloga s mrežom, tanke crne linije okvira, signalna narančasta). Sve arhitektonske sheme iz reference zamijenjene su **novim tehničkim shemama tokarenja i brušenja**.

## Brand

| | |
|---|---|
| Naziv | **STRUG** (strug = tokarski stroj) |
| Boje | papir `#ecebe4`, tinta `#141414`, sivi grafit `#55534d`, signalna narančasta `#ff4a1c` |
| Fontovi | **Archivo** u uskom rezu (wdth 72 %, 800) za naslove — grotesk koji podsjeća na natpise na strojevima i pločicama; **IBM Plex Mono** za oznake, kote, G-kod i nalog — kao natpisno polje na radioničkom crtežu. Oba s podrškom za č ć đ š ž. |
| Ilustracije | 14 SVG shema u `assets/img/sheme/`, generiranih skriptom `tools/generiraj_sheme.py` |

## Sheme

| Datoteka | Sadržaj |
|---|---|
| `01-cnc-tokarilica.svg` | Bočni pogled CNC tokarilice: vreteno, stezna glava, stupnjevani obradak, revolver, konjić, SHIP, kote i pozicije 1–7 |
| `02-vratilo.svg` | Aksonometrijsko stupnjevano vratilo s navojem, prirubnicom i utorom za klin, ispred narančastog kruga |
| `ikona-*.svg` | Izometrijske ikone: tokarenje, brušenje, glodanje, navoji |
| `03-prirubnica-crtez.svg` | Radionički crtež prirubnice DN100: nacrt, presjek A–A s šrafurom, kote, GD&T, Ra, kontrolne točke K1–K6, sastavnica |
| `04-putanja-alata.svg` | CNC putanja alata: gruba obrada G71 (isprekidano) i fina G70, pločica CNMG, nul-točka W0 |
| `05`–`08-proces-*.svg` | Analiza nacrta, zahvat noža (f, ap, vc), kružno brušenje (vs, vw, ae, iskre, SHIP), završna kontrola s dijagramom odstupanja |
| `09-teska-tokarilica.svg` | Teška tokarilica s čovjekom u mjerilu, narančasti krug i stup |
| `10-stezna-glava.svg` | Nacrt stezne glave s tri čeljusti |

Nakon izmjene skripte sheme se ponovno generiraju s `python3 tools/generiraj_sheme.py`.

## Sekcije

Zaglavlje · hero sa shemom tokarilice i legendom · uvod (vratilo + klijenti) · četiri usluge · izjava s mjernom letvom · radionički crtež · CNC putanja + G-kod · praćenje radnog naloga (mjerni izvještaj) · proces u 4 koraka · industrije (harmonika) · upit · podnožje s velikim šrafiranim logotipom.

Statični HTML, CSS i malo JS-a (izbornik, pojavljivanje, harmonika), bez vanjskih biblioteka. Poštuje se `prefers-reduced-motion`.
