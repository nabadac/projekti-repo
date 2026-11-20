# TikTok workflow: nova stranica → video → raspored → TikTok inbox

Kad na `main` stigne nova stranica (novi `sites/<mapa>/index.html`), GitHub Actions sam:

1. **snimi video** u stilu iz `video-generator/` (1080×1920, 60 fps, ~22 s): stranica se skrola u zaobljenoj kartici, s naslovom „Redizajn #N · Ime” i natpisom „Neslužbeni koncept redizajna”,
2. **spremi ga** kao GitHub izdanje `tiktok-<mapa>` (Releases) i kao artefakt workflowa za brzi pregled,
3. **zakaže ga** u prvi slobodan termin u `tiktok/raspored.json`: **utorak, četvrtak ili subota u 18:00** po Zagrebu,
4. **u terminu ga pošalje u tvoj TikTok inbox kao skicu.** Na mobitelu stiže obavijest, a ti dodaš trending zvuk, zalijepiš opis (nalazi se u sažetku workflowa i u izdanju) i objaviš.

Skica, a ne izravna objava: TikTok dopušta javnu objavu preko API-ja tek aplikacijama koje prođu njihov pregled, a trending zvuk ionako dodaješ u aplikaciji.

| Datoteka | Što radi |
|---|---|
| `.github/workflows/tiktok-video.yml` | Na push u `sites/**` na `main`: snimanje, izdanje, zakazivanje. Ručno: *Actions → TikTok video za novu stranicu → Run workflow* s popisom mapa |
| `.github/workflows/tiktok-objava.yml` | Svaki sat (u :07) šalje videe čiji je termin došao |
| `tiktok/raspored.json` | Termini i red čekanja. Stanja: `čeka`, `poslano`, `greška` (nakon 3 neuspjela pokušaja) |
| `tiktok/snimi.mjs`, `zakazi.mjs`, `objavi.mjs` | Koraci workflowa, mogu se pokrenuti i lokalno |
| `tiktok/prijava.mjs` | Jednokratna TikTok prijava za refresh token |

## Jednokratno postavljanje (otprilike 20 minuta)

### 1. TikTok developer aplikacija

1. Prijavi se na <https://developers.tiktok.com/> i napravi aplikaciju (*Manage apps → Connect an app*).
2. Dodaj proizvode **Login Kit** i **Content Posting API** (u Content Posting API-ju uključi **Upload**, *Direct Post* ne treba).
3. Scopes: `user.info.basic` i `video.upload`.
4. Pod Login Kit → **Redirect URI** upiši adresu koju kontroliraš, npr. `https://nabadac.github.io/projekti-repo/` (stranica ne mora ništa raditi, služi samo za preuzimanje `code` iz adresne trake).
5. Dok aplikacija nije odobrena, radi u **Sandboxu**: pod *Sandbox → Target users* dodaj svoj TikTok račun. Za trajni rad pošalji aplikaciju na pregled (*Submit for review*).

### 2. Refresh token

Na svom računalu, u rootu repozitorija:

```bash
export TIKTOK_CLIENT_KEY=... TIKTOK_CLIENT_SECRET=... TIKTOK_REDIRECT_URI=https://nabadac.github.io/projekti-repo/
```

```bash
node tiktok/prijava.mjs
```

Otvori ispisanu poveznicu, prijavi se i odobri pristup. TikTok te vrati na redirect adresu, pa kopiraj **cijelu adresu** iz adresne trake (kod brzo istječe):

```bash
node tiktok/prijava.mjs "https://nabadac.github.io/projekti-repo/?code=...&state=..."
```

Ispisani refresh token vrijedi 365 dana.

### 3. GitHub tajne

*Settings → Secrets and variables → Actions → New repository secret*:

| Tajna | Vrijednost |
|---|---|
| `TIKTOK_CLIENT_KEY` | Client key aplikacije |
| `TIKTOK_CLIENT_SECRET` | Client secret aplikacije |
| `TIKTOK_REFRESH_TOKEN` | Token iz koraka 2 |
| `GH_SECRETS_TOKEN` *(neobavezno)* | Fine-grained token s pravom *Secrets: read and write* na ovaj repo. Ako TikTok izda novi refresh token, workflow ga tada sam spremi |

Bez tajni snimanje i zakazivanje rade normalno, a samo slanje u terminu javi grešku i video ostaje u rasporedu.

### 4. Dopuštenja za Actions

*Settings → Actions → General → Workflow permissions* → **Read and write permissions** (workflow sprema raspored na `main` i radi izdanja).

## Prilagodba po stranici: `sites/<mapa>/video.json`

Sve je neobavezno. Datoteku dodaj **prije** nego što stranica stigne na `main`:

```json
{
  "naslov": "Redizajn #5 · batak.hr",
  "opis": "Batak u novom ruhu 🔥 ...\n\n#webdizajn #redizajn",
  "disclaimer": "Koncept web stranice",
  "pozadina": "sites/batak/assets/video/zar.mp4",
  "glazba": "",
  "sekcije": ".intro,.winter,.menus,footer",
  "preskoci": ".crew",
  "trajanje": 22
}
```

- `disclaimer`: za izmišljene tvrtke stavi npr. „Koncept web stranice”. Zadano je „Neslužbeni koncept redizajna”.
- `sekcije` / `preskoci`: CSS selektori sekcija kroz koje video prolazi, ili koje preskače.
- Glazbu je bolje dodati u TikToku (trending zvuk), pa je `glazba` obično prazna.

## Česti zadaci

- **Ponovno snimi video** (npr. nakon popravka stranice): *Actions → TikTok video za novu stranicu → Run workflow*, upiši `batak`. Ako stari još nije poslan, zamijeni ga, a ako je već poslan, novi dobiva sljedeći slobodan termin.
- **Snimi videe za postojeće stranice:** isto, upiši više mapa odjednom: `zdd-zagreb,fuga-atelier,villa-lunare-hvar`. Svaka dobiva svoj termin.
- **Promijeni termine:** uredi `termini` u `tiktok/raspored.json` (`dani`: 0 = nedjelja … 6 = subota, `vrijeme`, `zona`). Već zakazani videi zadržavaju svoje termine dok im ručno ne promijeniš `termin`.
- **Pošalji odmah:** u `raspored.json` postavi `termin` videa na prošlo vrijeme, pa pokreni *TikTok objava po rasporedu → Run workflow*.
- **Lokalni test snimanja:** `python3 -m http.server 8080` pa `node tiktok/snimi.mjs batak` (video je u `tiktok/out/`).

GitHubov sat za zakazane workflowe zna kasniti 5 do 30 minuta, pa skica stiže oko 18:10.
