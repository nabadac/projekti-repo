# Poliklinika Lipa — koncept web stranice

Konceptualni dizajn landing stranice za **izmišljenu** privatnu polikliniku u Zagrebu, izrađen za prikaz osobnih vještina (portfolio).
Struktura, ritam sekcija i motion obrasci inspirirani su stranicom amperos.com, a brand, tekstovi, boje, tipografija, ilustracije i UI kartice izrađeni su iznova.

## Brand

| | |
|---|---|
| Naziv | Poliklinika **Lipa** (lipa — simbol mira i zdravlja) |
| Boje | borova zelena `#0c1f1a`, šumska `#123a2f`, krem `#fbfaf6`, lipa-limeta `#d5e86f`, menta `#a6dbc6`, marelica `#f1a481`, lila `#c7b7f0` |
| Fontovi | Newsreader (naslovi), Instrument Sans (tekst), Allura (potpisi) — Google Fonts, s podrškom za č ć đ š ž |
| Fotografije | Unsplash (besplatna licenca), s halftone teksturom i duotone filtrom |

## Sekcije i animacije

1. **Zaglavlje** — mijenja boju ovisno o temi sekcije ispod, skriva se pri skrolanju prema dolje, mobilni izbornik preko cijelog zaslona.
2. **Hero** — intro animacija (otkrivanje okvira, zoom slike, redci naslova izlaze iz maske), ticker s vijestima, parallax, partneri u beskonačnom marquee-u.
3. **Usluge** — četiri značajke s UI karticama koje se animiraju pri ulasku u vidno polje (redci, složene kartice, brojač, koraci workflowa).
4. **Statistika** — brojke koje se „vrte” znamenku po znamenku, sinkronizirane s karticama koje se mogu povlačiti (drag/swipe).
5. **Iskustva pacijenata** — slider s otkrivanjem fotografije, redcima citata i potpisom.
6. **„Medicina s ljudskim licem”** — riječi naslova se boje dok skrolate; pinned sekcija s četiri taba i kolažima od poderanog papira.
7. **Koraci** — harmonika s automatskim napredovanjem i progress trakom (pauzira na hover i izvan ekrana).
8. **Bento** — nadzorna ploča s animiranim grafovima i brojačima, tablica termina, integracije.
9. **CTA i podnožje** — veliki logotip s parallaxom i poderanim rubom.

Tema stranice (tamna → svijetla) mijenja se glatko tijekom skrolanja. Poštuje se `prefers-reduced-motion`.

## Tehnologija

- Čisti HTML, CSS i JavaScript, bez build koraka
- [GSAP 3 + ScrollTrigger](https://gsap.com/) za scroll animacije
- [Lenis](https://github.com/darkroomengineering/lenis) za glatko skrolanje

## Pokretanje

Otvorite `index.html` u pregledniku ili pokrenite lokalni server:

```bash
python3 -m http.server 8080
```

i otvorite <http://localhost:8080>.

---

*Poliklinika Lipa ne postoji. Sva imena, osobe, adrese i podaci na stranici su fiktivni.*
