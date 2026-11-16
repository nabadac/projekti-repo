#!/usr/bin/env node
// Izrađuje vertikalni (9:16) TikTok/Reels video: web stranica se skrola u
// zaobljenoj "kartici" na sredini, preko pozadinskog videa ili slike.
//
//   node make-video.mjs --url http://localhost:8080/sites/fuga-atelier/ --bg pozadina.mp4 --music pjesma.mp3
//
// Svi parametri: node make-video.mjs --help

import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HELP = `
Opcije:
  --url <adresa|datoteka>   Stranica za snimanje (http(s):// ili lokalni .html)   [obavezno]
  --out <datoteka.mp4>      Izlaz (zadano: video.mp4)
  --bg <video|slika>        Pozadina preko cijelog ekrana. Bez nje: meka siva magla.
  --music <audio>           Glazba (skraćuje se na trajanje videa, s fade-outom)
  --duration <s>            Ciljano trajanje u sekundama (zadano: 22)
  --title <tekst>           Naslov iznad kartice, npr. "Redizajn #1 · fuga.hr"
  --disclaimer <tekst>      Sitni tekst ispod kartice (zadano: "Neslužbeni koncept redizajna"; "" isključuje)
  --width <px> --height <px>  Veličina preglednika (zadano: 1600x1000)
  --hold <s>                Pauza na vrhu stranice prije prvog skrola (zadano: 2.2)
  --max-scroll <px>         Koliko duboko skrolati (zadano: cijela stranica)
  --npm-dir <mapa>          Mapa s node_modules: zahtjevi za cdn.jsdelivr.net/npm/... i
                            unpkg.com/... poslužuju se lokalno (kad je CDN blokiran)
  --keep                    Zadrži privremene datoteke
`;

function parseArgs(argv) {
  const a = { out: 'video.mp4', duration: 22, width: 1600, height: 1000, hold: 2.2,
    disclaimer: 'Neslužbeni koncept redizajna' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--help' || k === '-h') { console.log(HELP); process.exit(0); }
    if (k === '--keep') { a.keep = true; continue; }
    if (!k.startsWith('--')) throw new Error(`Nepoznat argument: ${k}`);
    const v = argv[++i];
    if (v === undefined) throw new Error(`Nedostaje vrijednost za ${k}`);
    a[k.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v;
  }
  for (const n of ['duration', 'width', 'height', 'hold', 'maxScroll'])
    if (a[n] !== undefined) a[n] = Number(a[n]);
  if (!a.url) { console.log(HELP); throw new Error('--url je obavezan'); }
  return a;
}

function ff(args, label) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`ffmpeg nije uspio (${label})`);
}

// require() nalazi i lokalni (npm i) i globalno instalirani Playwright
const { chromium } = createRequire(import.meta.url)('playwright');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 1080, H = 1920, FPS = 60;

// ---------- 1. Snimanje stranice (CDP screencast = oštre sličice) ----------
async function record(a, tmp) {
  const url = /^https?:|^file:/.test(a.url) ? a.url : pathToFileURL(path.resolve(a.url)).href;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: a.width, height: a.height } });

  if (a.npmDir) {
    const nm = path.resolve(a.npmDir, 'node_modules');
    await page.route(/^https:\/\/(cdn\.jsdelivr\.net\/npm|unpkg\.com)\//, async (route) => {
      const m = new URL(route.request().url()).pathname.replace(/^\/npm\//, '/').match(/^\/((?:@[^/]+\/)?[^@/]+)(?:@[^/]+)?\/(.+)$/);
      const file = m && path.join(nm, m[1], m[2]);
      if (file && fs.existsSync(file)) return route.fulfill({ path: file });
      return route.continue();
    });
  }

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await sleep(1500); // pusti intro animacije da se smire

  const frames = [];
  const dir = path.join(tmp, 'frames');
  fs.mkdirSync(dir);
  const cdp = await page.context().newCDPSession(page);
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = path.join(dir, `${String(frames.length).padStart(5, '0')}.jpg`);
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    frames.push({ f, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  // Stranica se odmah vrati na vrh i pokrene screencast
  await page.mouse.move(a.width / 2, a.height / 2);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: a.width, maxHeight: a.height, everyNthFrame: 1 });

  // Plan skrolanja: N koraka po ~85% visine, ravnomjerno raspoređeno kroz trajanje
  const total = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight);
  const depth = Math.max(0, Math.min(total, a.maxScroll ?? total));
  const moveS = 1.1;
  const endHold = 1.6;
  // Broj koraka tako da svaki (skrol + pauza) traje barem ~2.6 s; duga stranica = veći koraci
  const maxSteps = Math.max(1, Math.floor((a.duration - a.hold - endHold + 1.5) / 2.6));
  const steps = Math.max(1, Math.min(maxSteps, Math.ceil(depth / (a.height * 0.85))));
  const stepPx = depth / steps;
  const hold = Math.max(0.6, (a.duration - a.hold - endHold - steps * moveS) / Math.max(1, steps - 1));
  const start = Date.now();

  await sleep(a.hold * 1000);
  let done = 0;
  for (let s = 0; s < steps; s++) {
    const target = Math.round((s + 1) * stepPx);
    const dist = target - done;
    // Kotačić miša s ease-in-out po stvarnom vremenu — radi i s Lenisom/GSAP ScrollTriggerom
    const t0 = Date.now();
    let sent = 0;
    for (;;) {
      const p = Math.min(1, (Date.now() - t0) / (moveS * 1000));
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const want = Math.round(dist * eased);
      if (want !== sent) await page.mouse.wheel(0, want - sent);
      sent = want;
      if (p >= 1) break;
      await sleep(12);
    }
    done = target;
    await sleep((s === steps - 1 ? endHold : hold) * 1000);
  }
  // zadnja sličica do kraja
  const recorded = (Date.now() - start) / 1000;
  await cdp.send('Page.stopScreencast');
  await sleep(200);
  await browser.close();
  if (frames.length < 2) throw new Error('Screencast nije uhvatio sličice');

  // concat lista s trajanjem svake sličice (stranica šalje sličice samo kad se nešto promijeni)
  const t0 = frames[0].t;
  const endT = t0 + recorded;
  const list = frames.map((fr, i) => {
    const next = i + 1 < frames.length ? frames[i + 1].t : endT;
    return `file '${fr.f}'\nduration ${Math.max(0.001, next - fr.t).toFixed(4)}`;
  }).join('\n') + `\nfile '${frames.at(-1).f}'\n`;
  fs.writeFileSync(path.join(tmp, 'frames.txt'), list);
  const site = path.join(tmp, 'site.mp4');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'frames.txt'),
    '-vf', `fps=${FPS},scale=${a.width}:${a.height}:flags=lanczos,format=yuv420p`,
    '-c:v', 'libx264', '-crf', '14', '-preset', 'veryfast', site], 'sastavljanje snimke');
  return { site, seconds: recorded };
}

// ---------- 2. Kompozicija 9:16 ----------
function compose(a, tmp, site, seconds) {
  const cardW = 950;
  const cardH = Math.round(cardW * a.height / a.width / 2) * 2;
  const R = 26;
  const cx = (W - cardW) / 2, cy = Math.round((H - cardH) / 2 / 2) * 2;

  // maska zaobljene kartice i sjena (jednom, kao PNG)
  const mask = path.join(tmp, 'mask.png');
  // 255 unutar zaobljenog pravokutnika cw×ch (radijus r) centriranog u platnu, inače 0
  const rr = (cw, ch, r) => `255*lte(pow(max(0,abs(X-W/2)-(${cw / 2 - r})),2)+pow(max(0,abs(Y-H/2)-(${ch / 2 - r})),2),${r * r})`;
  ff(['-f', 'lavfi', '-i', `color=black:s=${cardW}x${cardH}`, '-vf', `format=gray,geq=lum='${rr(cardW, cardH, R)}'`, '-frames:v', '1', mask], 'maska');
  const pad = 80;
  const shadow = path.join(tmp, 'shadow.png');
  ff(['-f', 'lavfi', '-i', `color=black:s=${cardW + pad * 2}x${cardH + pad * 2}`,
    '-vf', `format=rgba,geq=r=0:g=0:b=0:a='0.45*${rr(cardW, cardH, R)}',gblur=sigma=28`,
    '-frames:v', '1', shadow], 'sjena');

  // pozadina
  const inputs = [];
  let bgChain;
  if (a.bg && /\.(png|jpe?g|webp)$/i.test(a.bg)) {
    inputs.push('-loop', '1', '-t', String(seconds), '-i', path.resolve(a.bg));
    // spori Ken Burns zoom
    bgChain = `[0:v]scale=${W * 1.12}:${H * 1.12}:force_original_aspect_ratio=increase,crop=${W * 1.12}:${H * 1.12},crop=${W}:${H}:x='(iw-${W})/2':y='(ih-${H})*(0.15+0.7*t/${seconds})',fps=${FPS}[bg]`;
  } else if (a.bg) {
    inputs.push('-stream_loop', '-1', '-t', String(seconds), '-i', path.resolve(a.bg));
    bgChain = `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS}[bg]`;
  } else {
    // Bez --bg: zamućeni hero same stranice, u boji brenda, sa sporim zoomom
    const still = path.join(tmp, 'still.png');
    ff(['-i', site, '-frames:v', '1', '-vf',
      `scale=${W * 1.15}:${H * 1.15}:force_original_aspect_ratio=increase,crop=${W * 1.15}:${H * 1.15},gblur=sigma=60,eq=brightness=-0.06:saturation=1.15`, still], 'pozadina');
    inputs.push('-loop', '1', '-t', String(seconds), '-i', still);
    bgChain = `[0:v]crop=${W}:${H}:x='(iw-${W})*(0.5+0.4*sin(t/6))':y='(ih-${H})*t/${seconds}',fps=${FPS}[bg]`;
  }
  inputs.push('-i', site, '-i', mask, '-i', shadow);

  const font = '/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf';
  const fontArg = fs.existsSync(font) ? `fontfile='${font}':` : '';
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\u2019").replace(/%/g, '\\%');
  let text = '';
  if (a.title) text += `,drawtext=${fontArg}text='${esc(a.title)}':fontsize=58:fontcolor=white:shadowcolor=black@0.45:shadowy=3:x=(w-tw)/2:y=${cy - 150}:alpha='min(1,t/0.6)'`;
  if (a.disclaimer) text += `,drawtext=${fontArg}text='${esc(a.disclaimer)}':fontsize=30:fontcolor=white@0.85:shadowcolor=black@0.4:shadowy=2:x=(w-tw)/2:y=${cy + cardH + 48}`;

  const filter = [
    bgChain,
    `[1:v]scale=${cardW}:${cardH}:flags=lanczos,format=rgba[s0]`,
    `[2:v]format=gray,loop=-1:1:0[m]`,
    `[s0][m]alphamerge[card]`,
    `[3:v]loop=-1:1:0[sh]`,
    `[bg][sh]overlay=${cx - pad}:${cy - pad + 18}:shortest=1[b1]`,
    `[b1][card]overlay=${cx}:${cy}:shortest=1${text},format=yuv420p[v]`,
  ].join(';');

  const audio = [];
  if (a.music) {
    inputs.push('-i', path.resolve(a.music));
    audio.push('-map', '4:a', '-af', `afade=t=out:st=${Math.max(0, seconds - 1.2)}:d=1.2`, '-c:a', 'aac', '-b:a', '192k');
  } else {
    inputs.push('-f', 'lavfi', '-t', String(seconds), '-i', 'anullsrc=r=44100:cl=stereo');
    audio.push('-map', '4:a', '-c:a', 'aac');
  }
  ff([...inputs, '-filter_complex', filter, '-map', '[v]', ...audio, '-t', String(seconds),
    '-r', String(FPS), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-profile:v', 'high',
    '-movflags', '+faststart', path.resolve(a.out)], 'kompozicija');
}

const a = parseArgs(process.argv.slice(2));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'redizajn-'));
try {
  console.log('▶ Snimam stranicu…');
  const { site, seconds } = await record(a, tmp);
  console.log(`▶ Slažem 9:16 video (${seconds.toFixed(1)} s)…`);
  compose(a, tmp, site, seconds);
  console.log(`✔ Gotovo: ${path.resolve(a.out)}`);
} finally {
  if (!a.keep) fs.rmSync(tmp, { recursive: true, force: true });
  else console.log(`Privremene datoteke: ${tmp}`);
}
