# Generator videa za TikTok / Reels

Iz bilo koje web stranice radi vertikalni video **1080×1920, 60 fps**. Stranica se glatko skrola u zaobljenoj kartici na sredini ekrana, iza nje je pozadina preko cijelog ekrana, a ispod je glazba. Format je isti kao u referentnom videu:

- kartica zauzima ~88 % širine i stoji na sredini visine, sa zaobljenim rubovima i mekom sjenom,
- svaki skrol staje točno na vrhu sekcije, a u pauzi miš prijeđe preko elemenata da se pokrenu hover animacije (kursor se vidi u videu),
- prvo se ~2 s drži hero, zatim slijedi 5–7 mirnih skrolova s pauzom na svakoj sekciji, a na kraju se drži footer,
- ukupno traje ~22 s, a glazba se na kraju stiša.

## Što treba

- Node.js 18+, `ffmpeg` i Playwright (`npm i playwright` pa `npx playwright install chromium`)

## Korištenje

Prvo u rootu repozitorija pokreni lokalni server:

```bash
python3 -m http.server 8080
```

Zatim napravi video:

```bash
node video-generator/make-video.mjs --url http://localhost:8080/sites/zdd-zagreb/ --title "Redizajn #1 · zadi.hr" --bg pozadina.mp4 --music pjesma.mp3 --out zdd.mp4
```

| Opcija | Što radi |
|---|---|
| `--url` | Stranica (http adresa ili lokalni `.html`). **Obavezno.** |
| `--bg` | Pozadinski video ili slika. Bez nje se koristi zamućeni hero same stranice. |
| `--music` | Glazba (mp3/m4a/wav). |
| `--title` | Naslov iznad kartice, npr. `"Redizajn #3 · konzum.hr"`. |
| `--disclaimer` | Sitni tekst ispod kartice. Zadano je „Neslužbeni koncept redizajna“, a `""` ga isključuje. |
| `--duration` | Ciljano trajanje (zadano 22 s). |
| `--sections` | Točno ove sekcije, ovim redom (CSS selektori), npr. `".intro,.winter,.menus,footer"`. |
| `--skip` | Preskoči ove sekcije, npr. `".crew"`. |
| `--no-hover` | Ne prelazi mišem preko elemenata. Zadano miš u svakoj pauzi prijeđe preko elemenata s `:hover` efektom. |
| `--no-cursor` | Ne crtaj kursor u videu. |
| `--max-scroll` | Koliko px duboko skrolati, za kraći video koji pokazuje samo vrh stranice. |
| `--width`/`--height` | Veličina preglednika (zadano 1600×1000). |

## Savjeti za izgled kao u referenci

- **Pozadina čini pola dojma.** U referenci je pozadina tematski video (magla nad zelenom liticom za „green tech“ stranicu). Za svaku tvrtku izaberi pozadinu iz njezinog svijeta: more za turizam, polje za prehranu, grad za logistiku. Možeš je generirati u OpenHiggsfieldu (vještina `open-higgsfield`, npr. *„slow aerial drone shot, misty Adriatic coastline, cinematic, 9:16“*) ili uzeti besplatnu s Pexelsa ili Mixkita.
- **Glazbu dodaj u TikToku ili Instagramu.** Trending zvuk iz aplikacije donosi više pregleda od vlastite datoteke. U tom slučaju izostavi `--music`.
- **Hero je kuka.** Prve 2 sekunde moraju izgledati sjajno. Na redizajnu neka bude 3D element, video ili velika tipografija.
- **Uvijek označi koncept** („Neslužbeni koncept redizajna“) i ne sugeriraj da je tvrtka tvoj klijent.
