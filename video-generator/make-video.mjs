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
  --sections <sel,sel,…>    Točno ove sekcije, ovim redom (CSS selektori, npr. ".intro,.winter,footer")
  --skip <sel,sel,…>        Preskoči ove sekcije (CSS selektori, npr. ".crew")
  --no-hover                Ne prelazi mišem preko elemenata u pauzama
  --no-cursor               Ne crtaj kursor u videu
  --npm-dir <mapa>          Mapa s node_modules: zahtjevi za cdn.jsdelivr.net/npm/... i
                            unpkg.com/... poslužuju se lokalno (kad je CDN blokiran)
  --keep                    Zadrži privremene datoteke
`;

function parseArgs(argv) {
  const a = { out: 'video.mp4', duration: 22, width: 1600, height: 1000, hold: 2.2, hover: true, cursor: true,
    disclaimer: 'Neslužbeni koncept redizajna' };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--help' || k === '-h') { console.log(HELP); process.exit(0); }
    if (k === '--keep') { a.keep = true; continue; }
    if (k === '--no-hover') { a.hover = false; continue; }
    if (k === '--no-cursor') { a.cursor = false; continue; }
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

// Kursor nacrtan u stranici (headless screencast ne prikazuje pravi kursor)
const CURSOR_SCRIPT = `(() => {
  const arrow = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 28 28"><path d="M5 3l16 9.5-7 1.6 4.2 8.4-3.3 1.6-4.2-8.4L5 21z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const hand = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 28 28"><path d="M10 13V5.5a1.8 1.8 0 013.6 0V12l.1-1.6a1.8 1.8 0 013.5.2v1.6a1.8 1.8 0 013.4.4v1.4a1.8 1.8 0 013.4.6V19c0 3.6-2.6 6-6.2 6h-1.6c-2.3 0-3.9-.9-5.2-2.6L6 17.5a1.8 1.8 0 012.7-2.3L10 16.6z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const add = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div');
    c.id = '__cur';
    c.style.cssText = 'position:fixed;left:0;top:0;width:48px;height:48px;z-index:2147483647;pointer-events:none;will-change:transform;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));transform:translate(-100px,-100px)';
    c.innerHTML = arrow;
    document.documentElement.appendChild(c);
    let isHand = false;
    addEventListener('mousemove', (e) => {
      const h = !!e.target.closest?.('a,button,[role=button],label,summary,select,input,[onclick]');
      if (h !== isHand) { isHand = h; c.innerHTML = h ? hand : arrow; }
      c.style.transform = h ? 'translate(' + (e.clientX - 20) + 'px,' + (e.clientY - 7) + 'px)' : 'translate(' + (e.clientX - 8) + 'px,' + (e.clientY - 5) + 'px)';
    }, { passive: true, capture: true });
  };
  if (document.documentElement) add(); else addEventListener('DOMContentLoaded', add);
  addEventListener('DOMContentLoaded', add);
})();`;

// Izvršava se u stranici: do n točaka iznad vidljivih elemenata koji imaju :hover pravilo
function pickHoverTargets(n) {
  const sels = new Set();
  const walk = (rules) => { for (const r of rules) {
    if (r.cssRules && !r.selectorText) { try { walk(r.cssRules); } catch {} continue; }
    if (r.selectorText?.includes(':hover')) for (const part of r.selectorText.split(',')) {
      const base = part.split(':hover')[0].trim().replace(/[>+~]\s*$/, '').trim();
      if (base) sels.add(base);
    }
  } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch {} }
  const vw = innerWidth, vh = innerHeight;
  const ok = (el) => {
    if (el.closest('header, nav, #__cur')) return false;
    const r = el.getBoundingClientRect();
    return r.width * r.height > 1500 && r.left >= 0 && r.right <= vw && r.top >= vh * 0.1 && r.bottom <= vh - 10;
  };
  let els = [];
  for (const q of sels) { try { els.push(...document.querySelectorAll(q)); } catch {} }
  els = [...new Set(els)].filter(ok);
  if (!els.length) els = [...document.querySelectorAll('a, button, img, figure, li, article')].filter(ok);
  // najmanji (najkonkretniji) elementi, razmaknuti barem 140 px, redom lijevo→desno, gore→dolje
  els.sort((x, y) => { const a = x.getBoundingClientRect(), b = y.getBoundingClientRect(); return a.width * a.height - b.width * b.height; });
  const pts = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const p = [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
    if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 140)) pts.push(p);
  }
  pts.sort((p, q) => (Math.abs(p[1] - q[1]) < 80 ? p[0] - q[0] : p[1] - q[1]));
  if (pts.length <= n) return pts;
  return Array.from({ length: n }, (_, i) => pts[Math.floor(i * pts.length / n)]);
}

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

  if (a.cursor) await page.addInitScript(CURSOR_SCRIPT);
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
  // Miš: glatki pokreti po stvarnom vremenu (stranica vidi hover, kursor se crta u videu)
  let mx = a.width * 0.62, my = a.height * 0.58;
  await page.mouse.move(mx, my);
  const glide = async (x, y, ms) => {
    const x0 = mx, y0 = my, t0 = Date.now();
    for (;;) {
      const p = Math.min(1, (Date.now() - t0) / ms);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      mx = x0 + (x - x0) * e; my = y0 + (y - y0) * e;
      await page.mouse.move(mx, my);
      if (p >= 1) break;
      await sleep(14);
    }
  };
  // U pauzi pređi mišem preko elemenata vidljive sekcije koji imaju :hover efekt
  const hoverFor = async (ms) => {
    const end = Date.now() + ms;
    if (!a.hover || ms < 900) return sleep(ms);
    const n = Math.max(1, Math.min(4, Math.floor(ms / 1000)));
    const pts = await page.evaluate(pickHoverTargets, n);
    for (const [x, y] of pts) {
      const left = end - Date.now();
      if (left < 500) break;
      await glide(x, y, Math.min(650, left * 0.45));
      await sleep(Math.max(0, Math.min(500, (end - Date.now()) / Math.max(1, pts.length))));
    }
    // makni miš u prazan dio da se hover ugasi prije skrola
    if (end - Date.now() > 400) await glide(a.width * 0.94, my, 350);
    await sleep(Math.max(0, end - Date.now()));
  };
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: a.width, maxHeight: a.height, everyNthFrame: 1 });

  // Plan skrolanja: N koraka po ~85% visine, ravnomjerno raspoređeno kroz trajanje
  const total = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight);
  const depth = Math.max(0, Math.min(total, a.maxScroll ?? total));
  const moveS = 1.1;
  const endHold = 1.6;
  // Broj koraka tako da svaki (skrol + pauza) traje barem ~2.6 s
  const maxSteps = Math.max(1, Math.floor((a.duration - a.hold - endHold + 1.5) / 2.6));
  // Skrol se zaustavlja točno na vrhu sekcije (section/footer/djeca od main i body),
  // da u kadru ne ostane komad prethodne sekcije. Kod duge stranice neke se sekcije preskaču.
  const steps = await page.evaluate(({ depth, maxSteps, sections, skip }) => {
    const vh = innerHeight, vw = innerWidth;
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    if (sections) { // točan popis, točan redoslijed
      window.__snap = sections.map((q) => document.querySelector(q)).filter(Boolean);
      return window.__snap.length;
    }
    const cands = [...new Set(document.querySelectorAll('section, footer, main > *, body > *'))]
      .filter((el) => !(skip && skip.some((q) => el.matches(q))))
      .filter((el) => { const r = el.getBoundingClientRect(); return r.height >= vh * 0.3 && r.width >= vw * 0.6; })
      .map((el) => ({ el, t: Math.min(depth, top(el)) }))
      .filter((c) => c.t > vh * 0.25)
      .sort((x, y) => x.t - y.t);
    const uniq = [];
    for (const c of cands) if (!uniq.length || c.t - uniq.at(-1).t > vh * 0.25) uniq.push(c);
    let chosen = uniq;
    if (uniq.length > maxSteps) // ravnomjerno, uvijek sa zadnjom (kraj stranice)
      chosen = Array.from({ length: maxSteps }, (_, i) => uniq[Math.round((i + 1) * uniq.length / maxSteps) - 1]);
    window.__snap = chosen.map((c) => c.el);
    return chosen.length;
  }, { depth, maxSteps, sections: a.sections?.split(',').map((x) => x.trim()).filter(Boolean),
    skip: a.skip?.split(',').map((x) => x.trim()).filter(Boolean) });
  if (a.sections && !steps) throw new Error(`Nijedan selektor iz --sections nije pronađen: ${a.sections}`);
  // Bez prepoznatih sekcija: ravnomjerni koraci po ~85% visine
  const fallbackSteps = Math.max(1, Math.min(maxSteps, Math.ceil(depth / (a.height * 0.85))));
  const nSteps = steps || fallbackSteps;
  const targetAt = async (s) => steps
    ? page.evaluate(({ s, depth }) => Math.round(Math.min(depth, window.__snap[s].getBoundingClientRect().top + scrollY)), { s, depth })
    : Math.round((s + 1) * depth / nSteps);
  const hold = Math.max(0.6, (a.duration - a.hold - endHold - nSteps * moveS) / Math.max(1, nSteps - 1));
  const start = Date.now();

  await hoverFor(a.hold * 1000);
  for (let s = 0; s < nSteps; s++) {
    const target = await targetAt(s); // mjeri se uživo (lazy slike mogu pomaknuti raspored)
    const dist = target - await page.evaluate(() => scrollY);
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
    // dotjeraj ako je stranica (smooth scroll, Lenis, lazy sadržaj) stala malo pored cilja
    await sleep(250);
    const off = (await targetAt(s)) - await page.evaluate(() => scrollY);
    if (Math.abs(off) > 2) await page.mouse.wheel(0, off);
    await hoverFor((s === nSteps - 1 ? endHold : hold) * 1000 - 250);
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
