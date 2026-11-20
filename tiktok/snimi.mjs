#!/usr/bin/env node
// Snima TikTok video za jednu stranicu pomoću video-generator/make-video.mjs.
//   node tiktok/snimi.mjs <mapa> [--base http://localhost:8080] [--out tiktok/out]
// Postavke po stranici (sve neobavezne) u sites/<mapa>/video.json:
//   { "naslov": "...", "opis": "...", "disclaimer": "...", "pozadina": "sites/x/bg.mp4",
//     "glazba": "...", "sekcije": ".intro,.menus,footer", "preskoci": ".crew", "trajanje": 22 }
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, citajRaspored, izlaz } from './lib.mjs';

const args = process.argv.slice(2);
const mapa = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (!mapa) { console.error('Upotreba: node tiktok/snimi.mjs <mapa>'); process.exit(1); }

const dir = path.join(ROOT, 'sites', mapa);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const cfgPut = path.join(dir, 'video.json');
const cfg = fs.existsSync(cfgPut) ? JSON.parse(fs.readFileSync(cfgPut, 'utf8')) : {};

// Ime iz <title>: dio prije " · ", " | ", " – " ili " - "
const naslovStranice = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? mapa)
  .replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").trim();
const ime = naslovStranice.split(/\s+[·|–—-]\s+/)[0].trim() || mapa;
const redniBroj = citajRaspored().videi.filter((v) => v.status !== 'greška').length + 1;

const naslov = cfg.naslov ?? `Redizajn #${redniBroj} · ${ime}`;
const opis = cfg.opis ?? `${ime}: koncept nove web stranice ✨ Bolje ili lošije od originala? Napiši u komentar 👇\n\n#webdizajn #redizajn #webdevelopment #webdesign #hrvatska`;

const outDir = path.resolve(ROOT, opt('--out', 'tiktok/out'));
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${mapa}.mp4`);
const base = opt('--base', 'http://localhost:8080').replace(/\/$/, '');

const gen = [path.join(ROOT, 'video-generator', 'make-video.mjs'),
  '--url', `${base}/sites/${mapa}/`, '--out', out, '--title', naslov];
if (cfg.disclaimer !== undefined) gen.push('--disclaimer', cfg.disclaimer);
if (cfg.pozadina) gen.push('--bg', path.resolve(ROOT, cfg.pozadina));
if (cfg.glazba) gen.push('--music', path.resolve(ROOT, cfg.glazba));
if (cfg.sekcije) gen.push('--sections', cfg.sekcije);
if (cfg.preskoci) gen.push('--skip', cfg.preskoci);
if (cfg.trajanje) gen.push('--duration', String(cfg.trajanje));

console.log(`▶ ${mapa}: „${naslov}”`);
const r = spawnSync(process.execPath, gen, { stdio: 'inherit', cwd: ROOT });
if (r.status !== 0) process.exit(r.status ?? 1);

fs.writeFileSync(path.join(outDir, `${mapa}.json`), JSON.stringify({ stranica: mapa, naslov, opis }, null, 2));
izlaz('video', out);
